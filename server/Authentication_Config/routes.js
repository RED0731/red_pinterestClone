// main authentication router
const isLoggedIn = require('./isloggedin');

const authRoutes = (app, passport) => {
// wether a user is logged in or not json data will show up on the profile page
  app.get('/auth/profile', isLoggedIn, (req, res) => {
    const headerObject = req.headers; // need for ip
    let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    ip = (ip === '::1') ? 'local' : ip;
    res.json({
      authenticated: true,
      userip: ip,
      username: req.user.twitter.username,
      displayname: req.user.twitter.displayName, // only expose username and displayname
    });
  });

  // guest login path -- fake authentication to provide
  // semi/persistence instaed of doing it on client side
  app.get('/auth/guest', (req, res) => {
    const headerObject = req.headers; // need for ip
    let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    ip = (ip === '::1') ? 'local' : ip;
    res.json({
      authenticated: false,
      userip: ip,
      username: 'Guest',
      displayname: 'Guest',
    });
  });
  // route for logging out
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // =====================================
  // TWITTER ROUTES ======================
  // =====================================
  // route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after twitter has authenticated the user, just go back to home in my case
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/',
    }));
};

module.exports = authRoutes;
