const express = require('express');
const pool = require('./config/db');
const productRouter = require('./routes/product.routes');
const errorHandler = require('./middleware/errors.middleware');
const orderRouter = require('./routes/order.routes');
const authRouter = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.routes');
const { validateCsrfToken } = require('./middleware/csrf.middleware');
const validateOrigin = require('./middleware/origin.middleware');

const app = express();

app.use(express.json());
app.use(cookieParser());


app.disable('x-powered-by');

app.use((req, res, next) => {
    // prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Control how much referral information is shared
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Basic Content Security Policy (Adjust directives based on your needs)
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self';")

    // Disable XSS auditor (superseded, but often included for older browsers)
    res.setHeader('X-XSS-Protection', '0');

    // Cross-Origin Policies
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    
    if(req.method === 'OPTIONS'){
        return res.status(204).end()
    }
    next();
});
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'root call'
    });
});
app.use('/auth', authRouter);

app.use(validateOrigin);
app.use(validateCsrfToken);


app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter);


app.use('/api/users', userRouter);

app.use(errorHandler);

async function startServer(){
    try{    
        const dbconnect = await pool.query("SELECT 1");
        console.log("DB connected successfully!");

        app.listen(8000, ()  => {
            console.log("Express application is listening on 8000");
        })
    }catch(error){
        console.log("Error: " + error);
        process.exit(1);
    }
}

startServer();

