//middleware
const express = require('express');
//tracing
const morgan = require('morgan');
const { auth, requiresAuth } = require('express-openid-connect');

//TODO might not need long term, using only in auth setup / testing
const path = require('path');

//import controllers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const decisionRouter = require('./routes/decisionRoutes');

//middleware to start express
const app = express();

//if dev env, make logging verbose
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log("Morgan in development mode")
}

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
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html')); // Serve about.html
});

//TODO might not need long term, using only in auth setup
// req.isAuthenticated is provided from the auth router
app.get('/loginstatus', (req, res) => {
    res.send(req.oidc.isAuthenticated());
});

//applies to all subsequent routes
app.use(requiresAuth());

//api routes
//app.use('/api/v1/criteria', criteriaRouter);
app.use('/api/v1/decisions', decisionRouter);

//TODO might not need long term, using only in auth setup
app.get('/details', (req, res) => {
    const x = req.oidc.user
    console.log(x)
    res.send(req.oidc.user);
});

//catch unhandles routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;