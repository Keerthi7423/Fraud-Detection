const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cookieParser());

// Apply CORS at the gateway level
app.use(cors({
  origin: ['http://localhost:5173', 'https://d1ir3ognrpz0l7.cloudfront.net', 'http://d1ir3ognrpz0l7.cloudfront.net'], // Your frontend URL
  credentials: true
}));

// Cookie to Bearer Token translation middleware
app.use((req, res, next) => {
  if (req.cookies && req.cookies.token) {
    req.headers['authorization'] = `Bearer ${req.cookies.token}`;
  }
  next();
});

// Proxy rules
app.use(createProxyMiddleware({
  pathFilter: '/auth',
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true
}));

app.use(createProxyMiddleware({
  pathFilter: '/transactions',
  target: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true
}));

app.use(createProxyMiddleware({
  pathFilter: '/audit',
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
