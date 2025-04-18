const express = require('express');
const morgan = require('morgan');
const { auth, requiresAuth } = require('express-openid-connect');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

//import controllers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const decisionRouter = require('./routes/decisionRoutes');

//middleware to start express
const app = express();

//security HTTP headers
app.use(helmet());

//global middlewares.. if dev env, make logging verbose
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log("Morgan in development mode")
}

//rate limiter
const limiter = rateLimit({
    max: 100,
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

//serving static files
app.use(express.static(`${__dirname}/public`)); // static files in public folder
//parse urlencoded data
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // limit to 10kb

app.use(express.json());

//auth0 config
const oidcConfig = {
    authRequired: process.env.AUTHREQUIRED,
    auth0Logout: process.env.AUTH0LOGOUT,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUERBASEURL,
};

//auth router attaches /login, /logout, and /callback routes to the baseURL.
app.use(auth(oidcConfig));

//TODO might not need long term, using only in auth setup
const path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html')); // Serve about.html
});
app.get('/loginstatus', (req, res) => {
    res.send(req.oidc.isAuthenticated());
});

//applies to all subsequent routes
app.use(requiresAuth());
app.use('/api/v1/decisions', decisionRouter);

//TODO might not need long term, using only in auth setup
app.get('/details', (req, res) => {
    res.send(req.oidc.user);
});

//catch unhandles routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;