const DBMSG = require('../config/DBErrorMapping');
const { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } = require('../constant/variables');
const ApiError = require('../errors/ApiError');
const productServices = require('../services/product.services');
const { createFilters } = require('../utils/filters');

const getProducts = async (req, res, next) => {
    try{
        
        const page = req.validPage;
        const limit = req.validLimit;
        const sortBy = req.validSortBy;

        const sortOrder = req.validSortOrder;

        const filters = createFilters(req.validatedFilters);

        const products = await productServices.fetchProducts(filters, page, limit, sortBy, sortOrder);

        res.status(200).json({
            status: 'ok',
            data: products
        });
    }catch(err){
        next(err)
    }
}


const getProductById = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);

        if(Number.isNaN(productId) || productId < 0) {
            throw new ApiError(
                'Product ID is not valid!',
                400,
            );
        }

        const product = await productServices.fetchProductById(productId);

        if(!product){
            throw new ApiError(
                "Product doesn't exists",
                404,
            );
        }
        res.status(200).json({
            status: 'ok',
            data: product
        });
        
    }catch(err){
        next(err);
    }
}

const createProduct = async (req, res, next) => {
    try{
        const result = await productServices.createProduct(req.body);

        res.status(201).json({
            status: 'ok',
            message: 'Product created successfully!',
            data: result
        });
    }catch(error){
        next(error);
    }
}

const updateProductById = async (req, res, next) => {
    try{
        const productId = Number(req.params.id);
        if(!Number.isInteger(productId) || productId < 0) {
            throw new ApiError(
                'Product ID is not valid!',
                400,
            );
        }

        if(Object.keys(req.body).length === 0) {
            throw new ApiError('No valid fields provided to update', 400);
        }

        const result = await productServices.updateProductById(productId, req.body);

        res.status(200).json({
            message: 'Product updated successfully!',
            data: result
        });
    }catch(error){
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    try{
        const productId = Number(req.params.id);

        if(!Number.isInteger(productId) || productId <= 0){
            throw new ApiError('ProductID is not valid', 400);
        }

        await productServices.deleteProduct(productId);

        res.status(204).send();
    }catch(error){
        next(error)
    }
}



module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProductById,
    deleteProduct,
}