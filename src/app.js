const express = require('express');
const pool = require('./config/db');
const productRouter = require('./routes/product.routes');
const errorHandler = require('./middleware/errors.middleware');

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'root call'
    });
});

app.use('/api/products', productRouter)

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

