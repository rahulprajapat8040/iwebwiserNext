const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { UserQuestions, User } = require("../models/index");
const { Op } = require("sequelize");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enhanced model configuration for better comprehension
const modelConfig = {
    model: "gemini-1.5-flash",
    generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
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

// Match keywords with user query
const findRelevantContent = (userMessage, websiteContent) => {
    const userWords = userMessage.toLowerCase().split(/\W+/);
    const relevantSections = websiteContent.filter(section => {
        const keywords = section.keywords || [];
        return keywords.some(keyword =>
            userWords.some(word => word.includes(keyword) || keyword.includes(word))
        );
    });

    return relevantSections;
};

// Create AI prompt
const createPrompt = (userName, userMessage, websiteContent, userContext) => {
    // Handle null/undefined userName gracefully
    const safeUserName = userName || 'Guest';
    
    // Find relevant content
    const relevantContent = findRelevantContent(userMessage, websiteContent);

    return `You are an advanced AI assistant with natural conversation abilities. You're chatting with ${safeUserName}.

Key Instructions:
- Provide concise, clear responses
- Use natural formatting like bullet points and numbering when appropriate
- Highlight key information
- Keep responses brief but informative
- Use conversational tone
- Format like a modern chat interface
- use emojis when appropriate
- use list view when appropriate
- use bold when appropriate
- use italic when appropriate
- use underline when appropriate
- use strikethrough when appropriate
- use code when appropriate
- use blockquote when appropriate

Relevant Content:
${JSON.stringify(relevantContent || [])}

${userContext ? `Previous Interactions:
${JSON.stringify(userContext, null, 2)}` : 'New User'}

Query: ${userMessage}

Provide a friendly, well-formatted response that directly addresses the query:`;
};

// Enhanced keyword extraction using AI
const extractKeywords = async (text, model) => {
    const keywordPrompt = `Extract 3-5 meaningful keywords from this text. Return them as a comma-separated list without quotes or special formatting.

Text: "${text}"

Keywords:`;

    try {
        const result = await model.generateContent(keywordPrompt);
        const keywordText = result.response.text().trim();
        // Split by comma and clean up each keyword
        return keywordText.split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);
    } catch (error) {
        console.error("Error extracting keywords:", error);
        return [];
    }
};

// Main chat handler
exports.getWebsiteContent = async (req, res) => {
    const { usermessage, userInfo } = req.body;
    const userName = userInfo?.name || 'Guest';
    const userId = userInfo?.id || null;

    if (!usermessage) {
        return res.status(400).json({
            success: false,
            message: "User message is required"
        });
    }

    try {
        const recentHistory = userId ? await getRecentChatHistory(userId) : null;
        const websiteContent = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "websiteContent.json"), "utf-8"));
        
        const model = genAI.getGenerativeModel(modelConfig);
        
        // Extract meaningful keywords from user's question
        const questionKeywords = await extractKeywords(usermessage, model);

        const prompt = createPrompt(
            userName,
            usermessage,
            websiteContent,
            recentHistory ? {
                history: recentHistory,
                totalInteractions: recentHistory.length,
                lastInteraction: recentHistory[recentHistory.length - 1]?.createdAt
            } : null
        );

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Save to database with improved keyword structure
        if (userId) {
            await UserQuestions.create({
                question: usermessage,
                answer: aiResponse,
                userId: userId,
                timestamp: new Date(),
                keywords: {
                    topics: questionKeywords,
                    category: await categorizeQuestion(usermessage, model)
                }
            }).catch(err => console.error('Database save error:', err));
        }

        return res.status(200).json({
            success: true,
            message: aiResponse,
            model: modelConfig.model,
            userInfo: userInfo || null,
            hasHistory: !!recentHistory?.length,
            keywords: questionKeywords,
            isGuest: !userId
        });

    } catch (error) {
        console.error("Error:", error);
        
        const model = genAI.getGenerativeModel(modelConfig);
        const errorPrompt = `Create a brief, friendly error message for ${userName} about a technical issue.`;
        
        try {
            const errorResult = await model.generateContent(errorPrompt);
            const errorResponse = errorResult.response.text();

            if (userId) {
                await UserQuestions.create({
                    question: usermessage,
                    answer: errorResponse,
                    userId: userId,
                    timestamp: new Date(),
                    error: error.message,
                    keywords: {
                        topics: [],
                        category: ['Error']
                    }
                }).catch(err => console.error('Database save error:', err));
            }

            return res.status(200).json({
                success: true,
                message: errorResponse,
                isError: true,
                shouldRetry: true
            });
        } catch (aiError) {
            return res.status(500).json({
                success: false,
                message: "An unexpected error occurred",
                isError: true
            });
        }
    }
};

// New function to categorize questions
async function categorizeQuestion(question, model) {
    const categoryPrompt = `From the following categories, which best describes this question? Choose only one:
- Technical Support
- Product Information
- Pricing
- Service Inquiry
- General Information
- Other

Question: "${question}"

Category:`;

    try {
        const result = await model.generateContent(categoryPrompt);
        const category = result.response.text().trim();
        return [category.replace(/^[- ]+/, '')]; // Clean up any leading dash or spaces
    } catch (error) {
        console.error("Error categorizing question:", error);
        return ['Other'];
    }
}

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

        // Analyze keywords across all conversations
        const allKeywords = new Map();
        chatHistory.forEach(chat => {
            if (chat.keywords?.combined) {
                chat.keywords.combined.forEach(keyword => {
                    allKeywords.set(keyword, (allKeywords.get(keyword) || 0) + 1);
                });
            }
        });

        // Get top keywords
        const topKeywords = Array.from(allKeywords.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        const analysis = analyzeChatHistory(chatHistory);

        return res.status(200).json({
            success: true,
            data: chatHistory,
            analysis: {
                totalInteractions: analysis.totalInteractions,
                lastInteraction: analysis.lastInteraction,
                topKeywords
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

exports.getAllChat = async (req, res) => {
    try {
        // First, fetch all users to have their details readily available
        const users = await User.findAll({
            attributes: ['id', 'name', 'email']
        });
        const userMap = new Map(users.map(user => [user.id, user]));

        const usermessages = await UserQuestions.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        // Analyze keywords across all conversations
        const allKeywords = new Map();
        const userInteractions = new Map();
        const timeAnalysis = {
            totalChats: usermessages.length,
            firstInteraction: null,
            lastInteraction: null,
            averageResponseLength: 0,
            totalResponseLength: 0
        };

        const keywordAnalysis = {
            byCategory: new Map(),
            topicFrequency: new Map()
        };

        usermessages.forEach(chat => {
            // Keyword analysis
            if (chat.keywords?.topics) {
                chat.keywords.topics.forEach(topic => {
                    keywordAnalysis.topicFrequency.set(
                        topic, 
                        (keywordAnalysis.topicFrequency.get(topic) || 0) + 1
                    );
                });
            }
            if (chat.keywords?.category) {
                chat.keywords.category.forEach(category => {
                    keywordAnalysis.byCategory.set(
                        category,
                        (keywordAnalysis.byCategory.get(category) || 0) + 1
                    );
                });
            }

            // User interaction analysis
            const userId = chat.userId;
            userInteractions.set(userId, (userInteractions.get(userId) || 0) + 1);

            // Time and response analysis
            const timestamp = new Date(chat.timestamp || chat.createdAt);
            if (!timeAnalysis.firstInteraction || timestamp < new Date(timeAnalysis.firstInteraction)) {
                timeAnalysis.firstInteraction = timestamp;
            }
            if (!timeAnalysis.lastInteraction || timestamp > new Date(timeAnalysis.lastInteraction)) {
                timeAnalysis.lastInteraction = timestamp;
            }

            // Response length analysis
            if (chat.answer) {
                timeAnalysis.totalResponseLength += chat.answer.length;
            }
        });

        timeAnalysis.averageResponseLength = Math.round(timeAnalysis.totalResponseLength / usermessages.length);

        // Get top keywords
        const topKeywords = Array.from(allKeywords.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        // Get user interaction stats
        const userStats = Array.from(userInteractions.entries())
            .map(([userId, count]) => ({
                userId,
                totalChats: count,
                percentage: Math.round((count / timeAnalysis.totalChats) * 100)
            }))
            .sort((a, b) => b.totalChats - a.totalChats);

        // Group chats by date
        const chatsByDate = usermessages.reduce((acc, chat) => {
            const date = new Date(chat.timestamp || chat.createdAt).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }

            const user = chat.userId ? userMap.get(chat.userId) : null;
            
            acc[date].push({
                id: chat.id,
                question: chat.question,
                answer: chat.answer,
                keywords: chat.keywords,
                timestamp: chat.timestamp || chat.createdAt,
                user: user ? {
                    id: user.id,
                    name: user.name || 'Unknown',
                    email: user.email || 'No email provided'
                } : {
                    id: null,
                    name: 'Guest',
                    email: null
                }
            });
            return acc;
        }, {});

        return res.status(200).json({ 
            success: true,
            message: "Successfully retrieved all messages",
            data: {
                conversations: chatsByDate,
                analysis: {
                    timeStats: {
                        totalChats: timeAnalysis.totalChats,
                        firstInteraction: timeAnalysis.firstInteraction,
                        lastInteraction: timeAnalysis.lastInteraction,
                        averageResponseLength: timeAnalysis.averageResponseLength
                    },
                    keywordAnalysis: {
                        topTopics: Array.from(keywordAnalysis.topicFrequency.entries())
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                            .map(([topic, count]) => ({ topic, count })),
                        categoryDistribution: Object.fromEntries(keywordAnalysis.byCategory)
                    },
                    userStats: {
                        totalUsers: userInteractions.size,
                        totalGuests: usermessages.filter(m => !m.userId).length,
                        userInteractions: userStats
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};