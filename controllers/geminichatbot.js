// 1. Dependencies and initial setup
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { UserQuestions, User } = require("../models/index");
const { Op } = require("sequelize");

// Initialize Gemini API with configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

// 2. Content Processing Helper Functions
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

// 3. Chat History Helper Functions
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

// Add this function before exports.getWebsiteContent
const createPrompt = (userName, userMessage, websiteContent, userContext) => {
    return `You are an AI assistant named Gemini. Please provide a response following these guidelines:
    - Use a friendly, professional tone
    - Start with a greeting addressing ${userName}
    - Keep responses clear and concise
    - Format important information with bullet points
    - Include relevant details from the context when appropriate

User Question: ${userMessage}

Context:
${formatContentForAI(websiteContent)}

${userContext ? `Previous Interaction History:
${formatChatHistory(userContext.history)}` : 'No previous interaction history.'}`;
};

// 4. Main Chat Handler
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
        const model = genAI.getGenerativeModel(modelConfig);

        // Modified category analysis with better error handling
        const categoryPrompt = `Analyze this question and respond with a JSON object containing:
{
    "keywords": ["keyword1", "keyword2"],
    "category": "main category",
    "subCategories": ["sub1", "sub2"],
    "sentiment": "positive/neutral/negative"
}

Question: "${usermessage}"`;

        const categoryAnalysis = await model.generateContent(categoryPrompt);
        let analysis;
        
        try {
            // Clean and parse the response
            const responseText = categoryAnalysis.response.text()
                .replace(/```json/g, '')  // Remove any markdown formatting
                .replace(/```/g, '')      // Remove closing markdown
                .trim();                  // Remove whitespace
            
            // Find the first { and last } to extract valid JSON
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}') + 1;
            const jsonStr = responseText.slice(start, end);
            
            analysis = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            // Fallback analysis
            analysis = {
                keywords: [userMessage.split(' ')[0]],
                category: "general",
                subCategories: [],
                sentiment: "neutral"
            };
        }

        // Get main response
        const result = await model.generateContent(createPrompt(
            userName,
            usermessage,
            websiteContent,
            recentHistory ? {
                history: recentHistory,
                totalInteractions: recentHistory.length,
                lastInteraction: recentHistory[recentHistory.length - 1]?.createdAt
            } : null
        ));

        const aiResponse = result.response.text();

        // Save to database with analysis
        if (userId) {
            await UserQuestions.create({
                question: usermessage,
                answer: aiResponse,
                userId: userId,
                keywords: analysis
            });
        }

        return res.status(200).json({
            success: true,
            message: aiResponse,
            model: modelConfig.model,
            userInfo: userInfo || null,
            hasHistory: !!recentHistory?.length,
            analysis: analysis,
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

// 5. History and Analysis Endpoints
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
            .sort(([, a], [, b]) => b - a)
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
        // Add website content analysis
        const websiteKeywords = new Map();
        websiteContent.forEach(section => {
            if (section.keywords) {
                section.keywords.forEach(keyword => {
                    websiteKeywords.set(keyword, (websiteKeywords.get(keyword) || 0));
                });
            }
        });

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
            topicFrequency: new Map(websiteKeywords), // Initialize with website keywords
            websiteContentMatches: new Map(),
            commonPhrases: new Map(),
            questionTypes: new Map(),
            sentimentAnalysis: {
                positive: 0,
                neutral: 0,
                negative: 0
            }
        };

        usermessages.forEach(chat => {
            // Enhanced keyword analysis
            if (chat.keywords?.topics) {
                chat.keywords.topics.forEach(topic => {
                    keywordAnalysis.topicFrequency.set(
                        topic,
                        (keywordAnalysis.topicFrequency.get(topic) || 0) + 1
                    );
                });
            }

            // Categorize question types
            const questionStart = chat.question.toLowerCase().split(' ')[0];
            if (['what', 'how', 'why', 'when', 'where', 'who'].includes(questionStart)) {
                keywordAnalysis.questionTypes.set(
                    questionStart,
                    (keywordAnalysis.questionTypes.get(questionStart) || 0) + 1
                );
            }

            // Extract common phrases (3-4 word combinations)
            const questionWords = chat.question.toLowerCase().split(/\s+/);
            for (let i = 0; i < questionWords.length - 2; i++) {
                const phrase = questionWords.slice(i, i + 3).join(' ');
                keywordAnalysis.commonPhrases.set(
                    phrase,
                    (keywordAnalysis.commonPhrases.get(phrase) || 0) + 1
                );
            }

            // Basic sentiment analysis based on keywords
            const positiveWords = ['great', 'good', 'excellent', 'help', 'thanks'];
            const negativeWords = ['bad', 'issue', 'problem', 'error', 'wrong'];

            const sentimentWords = chat.question.toLowerCase().split(/\s+/);
            if (sentimentWords.some(word => positiveWords.includes(word))) {
                keywordAnalysis.sentimentAnalysis.positive++;
            } else if (sentimentWords.some(word => negativeWords.includes(word))) {
                keywordAnalysis.sentimentAnalysis.negative++;
            } else {
                keywordAnalysis.sentimentAnalysis.neutral++;
            }

            if (chat.keywords?.category) {
                chat.keywords.category.forEach(category => {
                    keywordAnalysis.byCategory.set(
                        category,
                        (keywordAnalysis.byCategory.get(category) || 0) + 1
                    );
                });
            }

            // Match with website content keywords
            websiteContent.forEach(section => {
                if (section.keywords) {
                    section.keywords.forEach(keyword => {
                        if (chat.question.toLowerCase().includes(keyword.toLowerCase())) {
                            keywordAnalysis.topicFrequency.set(
                                keyword,
                                (keywordAnalysis.topicFrequency.get(keyword) || 0) + 1
                            );

                            // Track which content sections are most referenced
                            keywordAnalysis.websiteContentMatches.set(
                                section.content.substring(0, 50) + "...",
                                (keywordAnalysis.websiteContentMatches.get(section.content.substring(0, 50) + "...") || 0) + 1
                            );
                        }
                    });
                }
            });
        });

        // Get top keywords
        const topKeywords = Array.from(allKeywords.entries())
            .sort(([, a], [, b]) => b - a)
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

        // Enhanced user interaction tracking
        usermessages.forEach(chat => {
            if (chat.userId) {
                // Count interactions per user
                userInteractions.set(
                    chat.userId, 
                    (userInteractions.get(chat.userId) || {
                        count: 0,
                        lastActive: null,
                        topics: new Set(),
                        responses: []
                    })
                );

                const userStats = userInteractions.get(chat.userId);
                userStats.count++;
                userStats.lastActive = chat.timestamp || chat.createdAt;
                
                // Track topics per user
                if (chat.keywords?.topics) {
                    chat.keywords.topics.forEach(topic => {
                        userStats.topics.add(topic);
                    });
                }

                // Track response patterns
                userStats.responses.push({
                    timestamp: chat.timestamp || chat.createdAt,
                    length: chat.answer?.length || 0
                });
            }
        });

        // Enhanced user stats processing
        const enhancedUserStats = Array.from(userInteractions.entries())
            .map(([userId, stats]) => {
                const user = userMap.get(userId);
                return {
                    userId,
                    name: user?.name || 'Unknown',
                    email: user?.email || 'No email provided',
                    totalChats: stats.count,
                    percentage: Math.round((stats.count / timeAnalysis.totalChats) * 100),
                    lastActive: stats.lastActive,
                    topTopics: Array.from(stats.topics).slice(0, 5),
                    averageResponseLength: stats.responses.reduce((acc, r) => acc + r.length, 0) / stats.responses.length
                };
            })
            .sort((a, b) => b.totalChats - a.totalChats);

        // Calculate guest interactions
        const guestMessages = usermessages.filter(m => !m.userId);
        const guestStats = {
            totalGuests: new Set(guestMessages.map(m => m.ip || 'unknown')).size,
            totalGuestMessages: guestMessages.length,
            percentage: Math.round((guestMessages.length / timeAnalysis.totalChats) * 100)
        };

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
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([topic, count]) => ({
                                topic,
                                count,
                                percentage: ((count / timeAnalysis.totalChats) * 100).toFixed(2),
                                isWebsiteContent: websiteKeywords.has(topic)
                            })),
                        websiteContentMatches: Array.from(keywordAnalysis.websiteContentMatches.entries())
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([content, count]) => ({
                                content,
                                count,
                                percentage: ((count / timeAnalysis.totalChats) * 100).toFixed(2)
                            })),
                        categoryDistribution: Object.fromEntries(
                            Array.from(keywordAnalysis.byCategory.entries())
                                .sort(([, a], [, b]) => b - a)
                        ),
                        commonPhrases: Array.from(keywordAnalysis.commonPhrases.entries())
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([phrase, count]) => ({
                                phrase,
                                count,
                                percentage: ((count / timeAnalysis.totalChats) * 100).toFixed(2)
                            })),
                        questionTypes: Object.fromEntries(keywordAnalysis.questionTypes),
                        sentiment: {
                            ...keywordAnalysis.sentimentAnalysis,
                            distribution: {
                                positive: ((keywordAnalysis.sentimentAnalysis.positive / timeAnalysis.totalChats) * 100).toFixed(2),
                                neutral: ((keywordAnalysis.sentimentAnalysis.neutral / timeAnalysis.totalChats) * 100).toFixed(2),
                                negative: ((keywordAnalysis.sentimentAnalysis.negative / timeAnalysis.totalChats) * 100).toFixed(2)
                            }
                        }
                    },
                    userStats: {
                        totalUsers: userInteractions.size,
                        activeUsers: enhancedUserStats.filter(u => 
                            new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length,
                        totalGuests: guestStats.totalGuests,
                        guestPercentage: guestStats.percentage,
                        userInteractions: enhancedUserStats,
                        guestStats: guestStats
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