const express = require('express');
const morgan = require('morgan');
const { auth, RequiredAuthProp } = require('express-oauth2-jwt-bearer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

//import controllers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const decisionRouter = require('./routes/decisionRoutes');

//middleware to start express
const app = express();

// Enable CORS for frontend - must be before auth middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Auth0 configuration
const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    tokenSigningAlg: 'RS256',
});

// Apply Auth0 middleware to all routes
app.use(jwtCheck);

//security HTTP headers
app.use(helmet());

//global middlewares.. if dev env, make logging verbose
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log("Morgan in development mode")
}

//rate limiter
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use(limiter);

//security, sanitisation and other middlewares
app.use(express.json({ limit: '10kb' })); // limit to 10kb
app.use(mongosanitize()); //sanitize data against NoSQL query injection
app.use(xss()); //sanitize data against XSS attacks
app.use(hpp({ //prevent parameter pollution
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity']
}));
app.use(cookieParser()); //parse cookies
app.use(compression()); //compress response bodies for all requests

//parse urlencoded data
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // limit to 10kb
app.use(express.json());

// Apply routes
app.use('/api/v1/decisions', decisionRouter);

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For SPA: serve index.html for any unknown route (after your API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

//catch unhandles routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;