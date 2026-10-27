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

const incrementProductViews = (cacheKey) => {
    return redisClient.incr(cacheKey);
}

const createProductUserViews = (productId, userId) => {
    //console.log(productId, userId);
    const key = `product:${productId}:viewers`;
    return redisClient.sAdd(key, [`user:${String(userId)}`])
}

const getProductUserViews = (productId) => {
    const key = `product:${productId}:viewers`;
    return redisClient.sCard(key)
}

module.exports = {
    getProductCache,
    createProductCache,
    deleteProductCache,
    createProductUserViews,
    getProductUserViews
}