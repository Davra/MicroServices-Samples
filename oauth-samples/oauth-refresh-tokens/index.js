"use strict";

/******************************************************************************
 This is a simple express js microservice which serves-out static content from 
 the public subfolder. All static content be they html files, images etc should
 be placed in public or subfolders for the public dir
 e.g. a common structure looks as follows:
 public
      |_ index.html
      |_ css
           |_style.css
      |_ imgs
           |_ logo.png
      |_ js
          |_ index.js
*/

const express = require('express');
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const axios = require('axios');

const app = express();

var sess = {
  secret: 'keyboard cat',
  cookie: {}
};

app.use(session(sess));

var pp = passport.initialize();
app.use(pp);
var ppSession = passport.session();
app.use(ppSession);

passport.serializeUser(function (user, cb) {
  cb(null, JSON.stringify(user));
});

passport.deserializeUser(function (userSz, cb) {
  try {
    var userObj = JSON.parse(userSz);
    cb(null, userObj);
  }
  catch (err) {
    cb(err);
  }
});

const BASE_URL = "https://pxcpoc.davra.com"; // Change this to your Davra Platform URL
const callbackURL = "http://localhost:8080/mycallback";
const clientID = "D9RBueBd7edHdSL7Zkl8";
const clientSecret = "fGcQuPRVfF2agJkgjlbLQYcmAZt84f9NRLsQq3Kx";

let prodConfig = {
  authorizationURL: BASE_URL + '/oauth/authorize',
  tokenURL: BASE_URL + '/oauth/token',
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: callbackURL,
  passReqToCallback: true
};

passport.use(new OAuth2Strategy(prodConfig,
  function (req, accessToken, refreshToken, profile, cb) {

    console.log("Successfully authorized: %s", accessToken);

    if (req.session) {
      req.session.oauth = { accessToken: accessToken, refreshToken: refreshToken };
    }
    cb(null, { id: profile.id });
  }
));

let staticMW = express.static('public');

app.get("/user.html", (req, res, next) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  else {
    next();
  }
}, staticMW);

app.use(staticMW);

app.get("/user", async (req, res) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/user`, {
      headers: {
        "User-Agent": req.headers["user-agent"],
        Authorization: `Bearer ${req.session.oauth.accessToken}`,
      }
    })
    res.send(response.data);
  } catch (err) {
    res.status(500).send();
  }
});

app.get("/devices", async (req, res) => {

  if (!req.user) {
    res.redirect("/login");
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/v1/devices`, {
      headers: {
        "User-Agent": req.headers["user-agent"],
        Authorization: `Bearer ${req.session.oauth.accessToken}`,
      }
    })
    res.send(response.data)
  } catch (err) {
    res.status(500).send();
  }
});

app.get("/refreshToken", async (req, res) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  const refreshData = new URLSearchParams();
  refreshData.append('grant_type', 'refresh_token');
  refreshData.append('refresh_token', req.session.oauth.refreshToken);
  refreshData.append('client_id', clientID);
  refreshData.append('client_secret', clientSecret);

  try {
    const response = await axios.post(`${BASE_URL}/oauth/token`, refreshData)
    if (req.session) {
      req.session.oauth = { accessToken: response.data.access_token, refreshToken: response.data.refresh_token };
    }
    res.redirect("/user.html");
  } catch (err) {
    req.logout();
    res.redirect("/index.html");
  }

});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect("/index.html");
});

app.get("/login", passport.authenticate("oauth2"), (req, res) => {
  res.redirect("/index.html");
});

app.get('/mycallback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("Callback...got token from Davra Platform");
    res.redirect('/user.html');
  });

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});
