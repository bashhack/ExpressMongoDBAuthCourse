const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const routes = require('./routes/index');

const app = express();

// use sessions for tracking logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
}));

// make user ID available to templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});

// mongodb connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/bookworm');
const db = mongoose.connection;
// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(`${__dirname}/public`));

// view engine setup
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

// include routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

// listen on port 3000
app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});
