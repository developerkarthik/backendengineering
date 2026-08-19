const ApiError = require('../errors/ApiError');
const productRepository = require('../repositories/product.repository');

const fetchProducts = async () => {
    return await productRepository.fetchAllProducts();
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

module.exports = {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProductById
}