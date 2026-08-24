const z = require('zod');
const ApiError = require('../errors/ApiError');

const filterSchema = z.object({
    category: z.string().toLowerCase().optional(),
    minPrice: z.coerce.number().positive('Minimum price should be greater than 0').optional(),
    maxPrice: z.coerce.number().positive('Maximum price should be greater than 0').optional()
});


const validateSorting = (req, res, next) => {
    const allowedSort = ['id', 'price', 'name'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortOrder = req.query.sortOrder?.toUpperCase() || 'ASC';
    const sortBy = req.query.sortBy || 'id';

    if(!allowedOrder.includes(sortOrder)){
        throw new ApiError('Sort order is not valid, It should be ASC/DESC', 400);
    }

    if(!allowedSort.includes(sortBy)) {
        throw new ApiError('Sort query params is not valid', 400);
    }

    req.validSortOrder = sortOrder;
    req.validSortBy = sortBy;

    next();

}
const validateFilters = (req, res, next) => {
    const result = filterSchema.safeParse(req.query);

    if (!result.success) {
        throw new ApiError('Filter Validation Errors', 400, {
            status: 'VALIDATION_ERROR',
            errors: result.error.issues
        })
    }

    if (result.data.minPrice !== undefined 
        && result.data.maxPrice !== undefined 
        && result.data.minPrice > result.data.maxPrice) {
        throw new ApiError('Filter Validation Errors', 400, {
            status: 'VALIDATION_ERROR',
            errors: [
                { message: 'Minimum price should not exceed the Maximum price' }
            ]
        })
    }

    req.validatedFilters = result.data;


    next();
}


module.exports = {
    validateFilters,
    validateSorting
}