const z = require('zod');
const ApiError = require('../errors/ApiError');

const productSchema = z.object({
    name: z
        .string()
        .min(1, 'Product name should not be empty'),

    category: z
        .string()
        .min(1, 'Category should not be empty'),

    price: z
        .number()
        .positive('Price should be greater than 0')
        .max(100000, 'Price cannot exceed 100000'),

    stock: z
        .int('Stock should be an integer')
        .nonnegative('Stock cannot be negative')
        .max(100, 'Stock cannot exceed 100')
});

const validateProduct = (req, res, next) => {
    //const {product} = req.body;

    const result = productSchema.safeParse(req.body);

    if (!result.success) {
        // return res.status(400).json();
        throw new ApiError(
            'Product validation failed',
            400,
            {
                status: 'VALIDATION_ERROR',
                errors: result.error.issues
            }
        );
    }

    req.body = result.data;

    next();
}

module.exports = {
    validateProduct
}