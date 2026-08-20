const ApiError = require('../errors/ApiError');
const productRepository = require('../repositories/product.repository');

const fetchPaginationData = async (page, limit) => {
    
    const total = await productRepository.getTotalCount();
    const totalPages = Math.ceil(total/limit);

    //let validPage = Math.max(1, Math.min(page, totalPages)); // Should maintain the CONST for page & limit default 
    let validLimit = Math.max(10, Math.min(limit, 30));

    const offset = (page - 1) * validLimit;
    
    return {
        total,
        totalPages,
        limit: validLimit,
        page,
        offset
    }
}

const fetchProducts = async (page, limit) => {
    const paginationData = await fetchPaginationData(page, limit);
    const products = await productRepository.fetchProducts(paginationData.limit, paginationData.offset);
    
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