const router = require('express').Router();
const isLoggedIn = require('./isloggedin');
const ip = require('ip')

const getProfile = (req, res) => {
  const { user } = req;
  const [service] = ['google', 'twitter'].filter(s => user[s] && Boolean(user[s].id));
  res.json({
    authenticated: true,
    userIp: ip.address(),
    username: req.user[service].username,
    userId: req.user[service].id,
    displayname: req.user[service].displayName,
    service,
  });
}

const setGuest = (req, res) => {
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: 'Guest',
    displayname: 'Guest',
  });
}

const logOut = (req, res) => {
  req.logout();
  res.redirect('/');
}

const setAuthRoutes = (app, passport) => {
  app.get('/auth/profile', isLoggedIn, getProfile)
  app.get('/auth/guest', setGuest)
  app.get('/auth/logout', logOut)
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/',
  }))
  app.get('/auth/google/redirect', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/',
  }))
};

module.exports = { setAuthRoutes, getProfile, logOut, setGuest };

