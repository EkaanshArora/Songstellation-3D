//https://accounts.spotify.com/en/login?continue=https%3A%2F%2Faccounts.spotify.com%2Fauthorize%3Fscope%3Duser-top-read%26response_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A9000%252Fcallback%26client_id%3D3e7fa2f4882e4d29818d4a0c6d5aff40

var express = require('express');
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
		// var dataToSendObj;
		let data = await spotifyApi.authorizationCodeGrant(authorizationCode)
		// spotifyApi.setAccessToken(data.body['access_token']);
		// spotifyApi.setRefreshToken(data.body['refresh_token']);
		response.render(__dirname + '/views/callback.html', { access: data.body['access_token'], refresh: data.body['refresh_token'] });
	}
});

var listener = app.listen(process.env.PORT || 9000, function () {
	console.log('Your app is listening on port ' + listener.address().port);
});