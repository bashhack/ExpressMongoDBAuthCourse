const express = require('express');
const User = require('../models/user');
const mid = require('../middleware');

const router = express.Router();

// GET /
router.get('/', (req, res, next) => {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', mid.requiresLogin, (req, res, next) => {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', (req, res, next) => {
  return res.render('contact', { title: 'Contact' });
});

// GET /register
router.get('/register', mid.loggedOut, (req, res, next) => {
  return res.render('register', { title: 'Sign up' });
});

// POST /register
router.post('/register', (req, res, next) => {
  let err = null;

  if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.confirmPassword) {
      err = new Error('Passwords must match.');
      err.status = 400;
      return next(err);
    }

    // create object with form input
    const userData = {
      email: req.body.email,
      name: req.body.name,
      favoriteBook: req.body.favoriteBook,
      password: req.body.password,
    };

    // use schema's `create` method to insert document into Mongo
    User.create(userData, (error, user) => {
      if (error) {
        return next(error);
      }

      req.session.userId = user._id;
      return res.redirect('/profile');
    });
  } else {
    err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET /login
router.get('/login', mid.loggedOut, (req, res, next) => {
  return res.render('login', { title: 'Log In' });
});

// POST /login
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, (error, user) => {
      if (error || !user) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }

      req.session.userId = user._id;
      return res.redirect('/profile');
    });
  } else {
    let err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /profile
router.get('/profile', (req, res, next) => {
  if (!req.session.userId) {
    let err = new Error('You are not authorized to view this page.');
    err.status = 403;
    return next(err);
  }

  User.findById(req.session.userId)
    .exec((error, user) => {
      if (error) {
        return next(error);
      }
      return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
    });
});

// GET /logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });
  }
});

module.exports = router;
