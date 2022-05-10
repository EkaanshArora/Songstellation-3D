var express = require('express');
var dotenv = require('dotenv')
dotenv.config({})
var app = express();
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');
var redirectUri = 'http://' + process.env.PROJECT_NAME + '/callback';
var spotifyApi = new SpotifyWebApi({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	redirectUri: redirectUri
});

app.use(express.static('public'));

app.get("/", function (request, response) {
	response.sendFile(__dirname + '/views/index.html');
});

app.get("/test", function (request, response) {
	response.sendFile(__dirname + '/views/test.html');
});

app.get("/authorize", function (request, response) {
	var scopesArray = ["user-top-read"]
	var authorizeURL = spotifyApi.createAuthorizeURL(scopesArray);
	response.redirect(authorizeURL);
});

// Exchange Authorization Code for an Access Token
app.get("/callback", async function (request, response) {
	var authorizationCode = request.query.code;
	// Check if gone direct to the callback URL
	if (!authorizationCode) {
		response.redirect('/');
	} else {
		spotifyApi.authorizationCodeGrant(authorizationCode).then(data => {
			response.render(__dirname + '/views/callback.html', { access: data.body['access_token'], refresh: data.body['refresh_token'] });
		}).catch(e => {
			console.log(e)
			response.redirect('/authorize');
		})
	}
});

var listener = app.listen(process.env.PORT || 9000, function () {
	console.log('Your app is listening on port ' + listener.address().port);
});