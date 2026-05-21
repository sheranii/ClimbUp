const prisma = require('../config/prisma');

/**
 * Log a new match history record in PostgreSQL using Prisma
 */
const createMatchHistoryService = async (data) => {
    const { userId, userName, score, topic, roomCode, timeTaken } = data;
    if (!userId || !userName || score === undefined || !topic || !roomCode || timeTaken === undefined) {
        throw new Error('All match fields are required');
    }

    return await prisma.matchHistory.create({
        data: {
            userId,
            userName,
            score: parseInt(score),
            topic,
            roomCode,
            timeTaken: parseInt(timeTaken)
        }
    });
};

/**
 * Retrieve all match histories for a specific user from PostgreSQL using Prisma
 */
const getMatchHistoriesByUserService = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    return await prisma.matchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Retrieve top matches from PostgreSQL using Prisma for the leaderboard
 */
const getLeaderboardService = async (limit = 10) => {
    return await prisma.matchHistory.findMany({
        orderBy: { score: 'desc' },
        take: parseInt(limit)
    });
};

/**
 * Delete a match history record by ID in PostgreSQL using Prisma
 */
const deleteMatchHistoryService = async (id) => {
    if (!id) {
        throw new Error('Match ID is required');
    }

    // Check if it exists first
    const match = await prisma.matchHistory.findUnique({
        where: { id: parseInt(id) }
    });

    if (!match) {
        throw new Error('Match history record not found');
    }

    return await prisma.matchHistory.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    createMatchHistoryService,
    getMatchHistoriesByUserService,
    getLeaderboardService,
    deleteMatchHistoryService
};
