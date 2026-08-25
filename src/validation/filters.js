const z = require('zod');
const ApiError = require('../errors/ApiError');
const { MAX_PAGE_LIMIT, DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } = require('../constant/variables');

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

const validatePagination = (req, res, next) => {
    const page = Number(req.query.page ?? DEFAULT_PAGE);
    const limit = Number(req.query.limit ?? DEFAULT_PAGE_LIMIT);

    if(!Number.isInteger(page) || !Number.isInteger(limit) || page <= 0){
        throw new ApiError('Invalid page number or limit', 400);
    }

    if(limit <= 0 && limit > MAX_PAGE_LIMIT) {
        throw new ApiError('Limit must be between 1 and 100', 400);
    }

    req.validPage = page;
    req.validLimit = limit;

    next();
}

module.exports = {
    validateFilters,
    validateSorting,
    validatePagination
}