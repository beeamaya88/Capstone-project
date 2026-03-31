//import dotenv from 'dotenv';
import "dotenv/config"
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';  
import productRoutes from './routes/product.js';
import userroutes from "./routes/user.js";
import cartRoutes from './routes/cart.js';
import paymentRoutes from './routes/payment.js';  
import orderRoutes from './routes/order.js';
import analyticsRoutes from './routes/analytics.js';      

const app = express();
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use("/user", userroutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/analytics', analyticsRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});