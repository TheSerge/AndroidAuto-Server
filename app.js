var express      = require('express');
var path         = require('path');
//var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var util         = require('./util.js');

var routes      = require('./routes/index');
var users       = require('./routes/users');
var songs       = require('./routes/songs');
var playlists   = require('./routes/playlists');
var permissions = require('./routes/permissions');
var geolocation = require('./routes/geolocation');
var social      = require('./routes/socialplaylist');
var model       = require('./oauth/model');

var oauthserver = require('oauth2-server');

var config = require('config');

var sharedsession = require("express-socket.io-session");

/*
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});*/



var app = express();
var http = require('http').Server(app);

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var io = require('socket.io')(http);
var event = require('./event/event')(io);

/*
io.use(sharedsession(session, {
  autoSave:true
}));*/

// Use express-session middleware for express
//app.use(session)

app.get('/secret', function(req, res){
    res.sendfile('wsClientApp.html');
});

app.get('/secretClient', function(req, res){
  res.sendfile('clientApp.html');
});

//^!^!^!^!!^!^?!?!?!??!!??!?!?!
/*
app.get('/session', function(req,res){
  req.session.data.user = util.getKeyFor();
})*/



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(express.session({ store: session_store }));
app.use(express.static(path.join(__dirname, 'public')));

app.oauth = oauthserver({
  model: model,
  grants: ['password', 'authorization_code', 'refresh_token'],
  debug: true,
  accessTokenLifetime: 79200//1g
});

app.use('/'+config.version+'/', routes);
app.use('/users',app.oauth.authorise(), users);
app.use('/songs',app.oauth.authorise(), songs);
app.use('/playlists', app.oauth.authorise(), playlists);
app.use('/permissions',app.oauth.authorise(), permissions);
app.use('/geolocation',app.oauth.authorise(), geolocation);
app.use('/socialplaylist',app.oauth.authorise(), social);

app.all('/oauth/token', app.oauth.grant());


/*
app.all('*', requireAuthentication, loadUser);

function requireAuthentication(){
  var auth = req.headers['authorization'];  //token?

  if(!auth) {
    // refuse connection
  }
  else{

  }
}
function loadUser(){
  next();
}*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

