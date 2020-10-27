/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); 
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { isBuffer } = require('util');

var client_id = '7e4bbfa46d574eeebd4502f2e93ea3bd';
var client_secret = '6535cace540d4c42ad05d95b418eb633'; 
var redirect_uri = 'http://localhost:8080/callback';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-library-modify user-library-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        getSavedTracks(res, body.access_token)
      } 
      
      else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

function getSavedTracks(res, access_token) {
  var options = {
    url: 'https://api.spotify.com/v1/me/tracks?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      
      var responseStr = ''
      var tracksFilled = 0
      
      var tracks = []
      tracks.length = body.total

      for(var i = 0; i < body.items.length; i++) {
        tracks[i] = body.items[i].track
      }

      tracksFilled = body.items.length
      console.log(tracksFilled + ' / ' + body.total)
      
      if(tracksFilled < 50) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write(createResponse(tracks));
        res.end()
      }

      else {
        for(var offset = 50; offset < body.total; offset += 50) {
          var options = {
            url: 'https://api.spotify.com/v1/me/tracks?limit=50&offset=' + offset,
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
        
          request.get(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
              for(var i = 0; i < body.items.length; i++) {
                tracks[i + body.offset] = body.items[i].track
              }
              
              
              tracksFilled += body.items.length
              console.log(tracksFilled + ' / ' + body.total)

              if(tracksFilled == body.total) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write(createResponse(tracks));
                res.end()
              }
            }
          });
        }
      }
    }
  });
}

function createResponse(tracks) {
  var response = ''
  for(var i = 0; i < tracks.length; i++) {
    var artistStr = ''
    for(var artist of tracks[i].artists) {
      artistStr += artist.name + ', '
    }

    response += i + ': ' + tracks[i].name + ' - ' + 
                artistStr.substring(0, artistStr.length - 2) +
                ' (' + tracks[i].id + ')' + 
                '\n'
  }

  return response
}

console.log('Listening on 8080');
app.listen(8080);
