const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { UserQuestions } = require("../models/index");
const { Op } = require("sequelize");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enhanced model configuration for better comprehension
const modelConfig = {
    model: "gemini-1.5-pro",
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
    }
};

// Load website content
const websiteContent = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "websiteContent.json"), "utf-8"));

// Format chat history for context
const formatChatHistory = (history) => {
    if (!history || history.length === 0) return "You haven't had any previous conversations yet.";

    const formattedChats = history.map(chat => {
        const timestamp = new Date(chat.timestamp || chat.createdAt).toLocaleString();
        return `Time: ${timestamp}
Your Question: ${chat.question}
My Response: ${chat.answer}`;
    });

    return formattedChats.join('\n\n---\n\n');
};

// Analyze chat history for patterns and preferences
const analyzeChatHistory = (history) => {
    if (!history || history.length === 0) return {};

    const analysis = {
        topicsDiscussed: new Set(),
        servicesInterested: new Set(),
        previousQueries: new Set(),
        lastInteraction: null,
        queryPatterns: []
    };

    history.forEach(chat => {
        // Store the complete interaction for context
        analysis.queryPatterns.push({
            query: chat.question,
            response: chat.answer,
            timestamp: chat.timestamp || chat.createdAt
        });

        analysis.previousQueries.add(chat.question);
        analysis.lastInteraction = chat.timestamp || chat.createdAt;
    });

    return {
        previousQueries: Array.from(analysis.previousQueries),
        lastInteraction: analysis.lastInteraction,
        totalInteractions: history.length,
        queryPatterns: analysis.queryPatterns
    };
};

// Smarter history query detection
const isHistoryRelatedQuery = (query) => {
    // Let the AI model determine if this is a history-related query through the prompt
    // Rather than using keyword matching
    return false;
};

// Smarter content processing
const processWebsiteContent = (content) => {
    // If content is an array of objects (structured)
    if (Array.isArray(content)) {
        return content.map(section => {
            // If it's a plain text section
            if (typeof section === 'string') {
                return { content: section };
            }
            return section;
        });
    }
    // If content is just a string (unstructured)
    if (typeof content === 'string') {
        return [{ content }];
    }
    return content;
};

// Smart content analyzer
const analyzeContent = (content) => {
    const processedContent = processWebsiteContent(content);
    const contentAnalysis = {
        topics: new Set(),
        keywords: new Set(),
        services: new Set(),
        prices: new Map(),
        contacts: new Map(),
        rawContent: []
    };

    processedContent.forEach(section => {
        const text = typeof section === 'string' ? section : JSON.stringify(section);
        contentAnalysis.rawContent.push(text);

        // Extract structured data patterns
        const priceMatches = text.match(/(?:Rs\.|₹|INR)\s*[\d,]+/gi);
        const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        const phoneMatches = text.match(/(?:\+\d{1,3}[-.\s]?)?\d{3,}[-.\s]?\d{3,}[-.\s]?\d{3,}/g);
        const urlMatches = text.match(/https?:\/\/[^\s]+|\/[a-zA-Z0-9-_\/]+/g);

        // Store extracted data with full context
        if (priceMatches) {
            priceMatches.forEach(price => {
                const context = text.substring(Math.max(0, text.indexOf(price) - 100),
                    text.indexOf(price) + price.length + 100);
                contentAnalysis.prices.set(price, context);
            });
        }

        if (emailMatches) emailMatches.forEach(email => contentAnalysis.contacts.set('email', email));
        if (phoneMatches) phoneMatches.forEach(phone => contentAnalysis.contacts.set('phone', phone));
        if (urlMatches) urlMatches.forEach(url => contentAnalysis.contacts.set('url', url));
    });

    return {
        rawContent: contentAnalysis.rawContent,
        prices: Object.fromEntries(contentAnalysis.prices),
        contacts: Object.fromEntries(contentAnalysis.contacts)
    };
};

// Enhanced content formatter for AI
const formatContentForAI = (content) => {
    const processedContent = processWebsiteContent(content);
    const analysis = analyzeContent(content);

    let formattedContent = `Website Information:\n\n`;

    // Add analyzed information
    if (analysis.contacts.email) {
        formattedContent += `Contact Email: ${analysis.contacts.email}\n`;
    }
    if (analysis.contacts.phone) {
        formattedContent += `Contact Phone: ${analysis.contacts.phone}\n`;
    }

    // Add main content sections
    processedContent.forEach(section => {
        if (typeof section === 'string') {
            formattedContent += `${section}\n\n`;
        } else {
            formattedContent += `${section.topic || 'Information'}:\n${section.content || JSON.stringify(section)}\n\n`;
        }
    });

    return formattedContent;
};

// Get recent chat history
const getRecentChatHistory = async (userId, limit = 5) => {
    if (!userId) return null;

    try {
        const history = await UserQuestions.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: limit
        });
        return history.reverse();
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return null;
    }
};

// Add this new function
const createHistoryResponse = (userName, history, analysis) => {
    if (!history || history.length === 0) {
        return `Hi ${userName}! This appears to be our first conversation. How can I help you today?`;
    }

    const lastInteraction = new Date(analysis.lastInteraction).toLocaleString();
    const topics = analysis.servicesInterested.join(', ');

    return `Hi ${userName}! Let me summarize your previous interactions:

- We've had ${analysis.totalInteractions} conversations in total
- Your last interaction was on ${lastInteraction}
${topics ? `- You've shown interest in: ${topics}` : ''}

Here are your recent conversations:

${formatChatHistory(history)}

Is there anything specific from our previous discussions you'd like to know more about?`;
};

// Enhanced prompt engineering
const createEnhancedPrompt = (userName, userMessage, websiteContent, userContext) => {
    return `
    You are an intelligent AI assistant for our website, chatting with ${userName}. You have access to our website content and the user's chat history.

    Core Capabilities:
    1. Understand and respond to user queries naturally
    2. Provide accurate information from our content
    3. Remember and reference previous conversations
    4. Identify user interests and patterns
    5. Suggest relevant services and information
    6. Handle complex queries about pricing, services, and support
    7. Maintain conversation context and flow

    Website Content:
    ${websiteContent}

    ${userContext ? `User Context:
    Previous Interactions: ${userContext.totalInteractions}
    Last Interaction: ${new Date(userContext.lastInteraction).toLocaleString()}
    
    Recent Conversations:
    ${userContext.formattedHistory}` : 'New User - No Previous History'}

    Current Query: ${userMessage}

    Instructions:
    1. Analyze the query context and intent
    2. Consider previous interactions if available
    3. Provide relevant, accurate information
    4. Be conversational and engaging
    5. Include specific details when available
    6. Suggest related information when appropriate
    7. End with a relevant follow-up question

    Please provide a comprehensive response:`;
};

// Main chat handler
exports.getWebsiteContent = async (req, res) => {
    const { usermessage, userInfo } = req.body;
    const userName = userInfo?.name || 'there';
    const userId = userInfo?.id;

    if (!usermessage) {
        return res.status(400).json({
            success: false,
            message: "User message is required"
        });
    }

    try {
        // Get user's chat history and website content
        const recentHistory = await getRecentChatHistory(userId);
        const historyAnalysis = analyzeChatHistory(recentHistory);
        const formattedHistory = formatChatHistory(recentHistory);

        const websiteContent = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "websiteContent.json"), "utf-8"));
        const contentAnalysis = analyzeContent(websiteContent);

        // Create enhanced prompt
        const prompt = createEnhancedPrompt(
            userName,
            usermessage,
            formatContentForAI(websiteContent),
            userId ? {
                ...historyAnalysis,
                formattedHistory
            } : null
        );

        // Get AI response
        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Save interaction
        if (userId) {
            await UserQuestions.create({
                question: usermessage,
                answer: aiResponse,
                userId: userId,
                timestamp: new Date()
            }).catch(err => console.error('Database save error:', err));
        }

        return res.status(200).json({
            success: true,
            message: aiResponse,
            model: modelConfig.model,
            userInfo: userInfo || null,
            hasHistory: !!recentHistory?.length
        });

    } catch (error) {
        console.error("Error:", error);

        const errorResponse = `I apologize ${userName}, I'm experiencing a technical issue at the moment. Please try asking your question again, or you can reach out to our support team directly for immediate assistance.`;

        if (userId) {
            await UserQuestions.create({
                question: usermessage,
                answer: errorResponse,
                userId: userId,
                timestamp: new Date(),
                error: error.message
            }).catch(err => console.error('Database save error:', err));
        }

        return res.status(200).json({
            success: true,
            message: errorResponse,
            isError: true,
            shouldRetry: true
        });
    }
};

// Get chat history with enhanced analysis
exports.getUserChatHistory = async (req, res) => {
    const { userId } = req.params;
    const { limit, offset } = req.query;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    try {
        const chatHistory = await UserQuestions.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : 0
        });

        const analysis = analyzeChatHistory(chatHistory);

        return res.status(200).json({
            success: true,
            data: chatHistory,
            analysis: {
                totalInteractions: analysis.totalInteractions,
                servicesInterested: analysis.servicesInterested,
                lastInteraction: analysis.lastInteraction
            }
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch chat history"
        });
    }
};