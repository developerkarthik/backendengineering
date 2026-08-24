const ApiError = require('../errors/ApiError');
const productRepository = require('../repositories/product.repository');

const fetchPaginationData = async (filters, page, limit,) => {
    
    const total = await productRepository.getTotalCount(filters);
    const DEFAULT_LIMIT = 20;
    const MIN_LIMIT = 1;
    const MAX_LIMIT = 100;

    //let validPage = Math.max(1, Math.min(page, totalPages)); // Should maintain the CONST for page & limit default 
    let validLimit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit ?? DEFAULT_LIMIT));
    const totalPages = Math.ceil(total/validLimit);
    const offset = (page - 1) * validLimit;
    
    return {
        total,
        totalPages,
        limit: validLimit,
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

const fetchProductById = async (productId) => {
    return await productRepository.fetchProductById(productId);
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
    // const existingProduct = await productRepository.fetchProductById(productId);
    // if(!existingProduct || existingProduct.length === 0){
    //     throw new ApiError("Product doesn't exist.", 404);
    // }
    return await productRepository.updateProductById(productId, payload);
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