// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// init Spotify API wrapper

var SpotifyWebApi = require('spotify-web-api-node');

var redirectUri = 'https://spotify-easyauth.glitch.me/callback';
var tokenExpirationEpoch;

var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : redirectUri
});

// spotifyApi.clientCredentialsGrant()
//   .then(function(data) {
//     console.log('The access token expires in ' + data.body['expires_in']);
//     console.log('The access token is ' + data.body['access_token']);

//     // Save the access token so that it's used in future calls
//     spotifyApi.setAccessToken(data.body['access_token']);
//   }, function(err) {
//     console.log('Something went wrong when retrieving an access token', err.message);
//   });


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/authorize", function (request, response) {
  var scopesArray = request.query.scopes.split(',');
  var authorizeURL = spotifyApi.createAuthorizeURL(scopesArray);
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.redirect(authorizeURL);
});

app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  
  response.sendFile(__dirname + '/views/index.html');
  
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data) {

    // Set the access token and refresh token
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);

    // Save the amount of seconds until the access token expired
    tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
    console.log('Retrieved token. It expires in ' + Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');
  }, function(err) {
    console.log('Something went wrong when retrieving the access token!', err.message);
  });
});

app.get("/search", function (request, response) {
  let query = request.query.query;
  
  console.log(request)
  
  if(request.query.context) {
    if(request.query.context == 'artist') {
      query = 'artist:' + request.query.query;
    }
    if(request.query.context == 'track') {
      query = 'track:' + request.query.query;
    }
  }
  spotifyApi.searchTracks(query)
  .then(function(data) {
    console.log(data.body);
    response.send(data.body);
  }, function(err) {
    console.log(err)
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
