"use strict";

/**
 * Module dependencies.
 */
var express = require('express');

var compression = require('compression');

var session = require('express-session');

var bodyParser = require('body-parser');

var logger = require('morgan');

var errorHandler = require('errorhandler');

var lusca = require('lusca');

var dotenv = require('dotenv');

var MongoStore = require('connect-mongo');

var flash = require('express-flash');

var path = require('path');

var mongoose = require('mongoose');

var passport = require('passport');

var sass = require('node-sass-middleware');

var multer = require('multer');

var upload = multer({
  dest: path.join(__dirname, 'uploads')
});
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */

dotenv.config({
  path: '.env.example'
});
/**
 * Controllers (route handlers).
 */

var homeController = require('./controllers/home');

var userController = require('./controllers/user');

var subjectController = require('./controllers/subjects');

var lessonController = require('./controllers/lessons');

var commController = require('./controllers/community');

var apiController = require('./controllers/api');

var contactController = require('./controllers/contact');
/**
 * API keys and Passport configuration.
 */


var passportConfig = require('./config/passport');
/**
 * Create Express server.
 */


var app = express();
/**
 * Connect to MongoDB.
 */

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', function (err) {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});
/**
 * Express configuration.
 */

app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1209600000
  },
  // Two weeks in milliseconds
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function (req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user && req.path !== '/login' && req.path !== '/signup' && !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }

  next();
});
app.use('/', express["static"](path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express["static"](path.join(__dirname, 'node_modules/chart.js/dist'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express["static"](path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express["static"](path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express["static"](path.join(__dirname, 'node_modules/jquery/dist'), {
  maxAge: 31557600000
}));
app.use('/webfonts', express["static"](path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), {
  maxAge: 31557600000
}));
/**
 * Primary app routes.
 */

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
/**
 * NEW - Pascal app routes.
 */

app.get('/subjects', subjectController.getSubjects);
app.get('/lessons', lessonController.getLessons);
app.get('/community', commController.getComm);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/upload', lusca({
  csrf: true
}), apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), lusca({
  csrf: true
}), apiController.postFileUpload);
app.get('/api/google/drive', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
/**
 * OAuth authentication routes. (Sign in)
 */

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
  accessType: 'offline',
  prompt: 'consent'
}));
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});
/**
 * Error Handler.
 */

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use(function (err, req, res) {
    console.error(err);
    res.status(500).send('Server Error');
  });
}
/**
 * Start Express server.
 */


app.listen(app.get('port'), function () {
  console.log("App is running on http://localhost:".concat(app.get('port'), " in ").concat(app.get('env'), " mode"));
  console.log('Press CTRL-C to stop');
});
module.exports = app;