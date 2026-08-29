const z = require('zod');
const ApiError = require('../errors/ApiError');

const orderSchema = new z.object({
      user_id: z.int('User ID must be an integer'),

    billing_address: z
        .string('Billing address is required')
        .trim()
        .min(1, 'Billing address cannot be empty'),

    shipping_address: z
        .string('Shipping address is required')
        .trim()
        .min(1, 'Shipping address cannot be empty'),

    orderItems: z
        .array(
            z.object({
                product_id: z.int('Product ID must be an integer'),
                quantity: z
                    .int('Quantity must be an integer')
                    .positive('Quantity must be greater than 0')
            })
        ).nonempty('Add atleast 1 items.')
});

const validateOrders = (req, res, next) => {
    const result = orderSchema.safeParse(req.body);

    if (!result.success) {
        // return res.status(400).json();
        throw new ApiError(
            'Order validation failed',
            400,
            {
                status: 'VALIDATION_ERROR',
                errors: result.error.issues
            }
        );
    }

    const duplicates = req.body.orderItems.filter((item, index, self) => 
        index !== self.findIndex((t) => t.product_id === item.product_id)
    );

    if(duplicates.length > 0){
        throw new ApiError('Duplicate order items', 400);
    }

    req.body = result.data;

    next();
}

module.exports = {validateOrders};