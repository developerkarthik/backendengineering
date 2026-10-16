const redisClient = require('../config/redis');

const getProductCache = async (cacheKey) => {
    return await redisClient.get(cacheKey);
}

const createProductCache = async (cacheKey, result) => {
    return await redisClient.set(cacheKey, JSON.stringify(result), {
        EX: 300
    });
}

const deleteProductCache = async (cacheKey) => {
    return await redisClient.del(cacheKey);
}

module.exports = {
    getProductCache,
    createProductCache,
    deleteProductCache
}