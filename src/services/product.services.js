const { MIN_PAGE_LIMIT, MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } = require('../constant/variables');
const ApiError = require('../errors/ApiError');
const productRepository = require('../repositories/product.repository');
const redisCacheService = require('../services/redisCache.service');

const fetchPaginationData = async (filters, page, limit) => {
    
    const total = await productRepository.getTotalCount(filters);

    //let validPage = Math.max(1, Math.min(page, totalPages)); // Should maintain the CONST for page & limit default 
    // let validLimit = Math.max(MIN_PAGE_LIMIT, Math.min(MAX_PAGE_LIMIT, limit ?? DEFAULT_PAGE_LIMIT));
    const totalPages = Math.ceil(total/limit);
    const offset = (page - 1) * limit;
    
    return {
        total,
        totalPages,
        limit,
        page
    }
}

const fetchProducts = async (filters, page, limit, sortBy, sortOrder) => {
    const paginationData = await fetchPaginationData(filters, page, limit);
    let products = [];
    if(page <= paginationData.totalPages) {
        products = await productRepository.fetchProducts(filters, paginationData.limit, paginationData.offset, sortBy, sortOrder);
    }
    
    return {
        products,
        pagination:paginationData
    }
}

const inFlightRequests = new Map(); 

const fetchProductById = async (productId) => {
    const cacheKey = `product:${productId}`;

    try{
        const cacheData = await redisCacheService.getProductCache(cacheKey);
        console.log('Cache Data:'+ cacheData);
        if(cacheData){
            return JSON.parse(cacheData);
        }
    }catch(error){
         console.error('Redis cache read failed:', error.message);
    }
    
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    //console.log('Product get..');

    const fetchPromise = (async () => {
        const result =  await productRepository.fetchProductById(productId);
        //console.log('Product get..');
        //console.log(result);
        if(!result){
            return null;
        }

        try {
            await redisCacheService.createProductCache(
            cacheKey,
            result
            );
        } catch (error) {
            console.error('Redis cache write failed:', error.message);
        }
        return result;
    })();

    inFlightRequests.set(cacheKey, fetchPromise);
    
    try {
        return await fetchPromise;
    } finally {
        inFlightRequests.delete(cacheKey);
    }
    
}

const createProduct = async (productData) => {
    const existingProduct = await productRepository.findByNameAndCategory(productData);

    if(existingProduct) {
        throw new ApiError(
            'Product already exists in this category',
            409
        );
    }
    return await productRepository.createNew(productData);
}

const updateProductById = async (productId, payload) => {
    const result = await productRepository.updateProductById(productId, payload);
    console.log(result);

    try{
        const cacheKey = `product:${productId}`;
        const cacheDel = await redisCacheService.deleteProductCache(cacheKey);
        console.log(cacheDel);
        if(!cacheDel){
            console.error('Redis cache is not delete. User may see stale data.');
        }
    }catch(error){
        console.error('Cache invalidation failed', { productId, message: error.message});
    }
    
    return result;
}

const deleteProduct = async (productId) => {
    return await productRepository.deleteProduct(productId);
}

module.exports = {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProductById,
    deleteProduct
}