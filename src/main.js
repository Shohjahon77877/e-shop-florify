import express from 'express';
import config from './config/configs.js'
import { connectDB } from './db/index.js';
import AdminRouter from './routes/admin.routes.js';
import CategoryRouter from './routes/category.routes.js';
import ProductRouter from './routes/product.routes.js';
import SalesmanRouter from './routes/salesman.routes.js';
import ClientRouter from './routes/client.routes.js';
import { createSuperAdmin } from './db/create-superadmin.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());

await connectDB();
await createSuperAdmin();

app.use(cookieParser());

app.use('/admin', AdminRouter);
app.use('/category', CategoryRouter);
app.use('/product', ProductRouter);
app.use('/salesman', SalesmanRouter);
app.use('/client', ClientRouter)

app.use((error, _, res, req) => {
    if (error) {
        const statusCode = error.status ? error.status : 500;
        const message = error.message ? error.message : 'Internal server error';
        return res.status(statusCode).json({
            statusCode,
            message
        })
    }
})

app.listen(config.PORT, () => console.log('Server is running on port', +config.PORT));