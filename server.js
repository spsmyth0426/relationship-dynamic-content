'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');

var app = express();   

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

app.get('/', function(request, response, next) {
  response.render('index.ejs', {
  });
}); 

app.get('/getAsset', function(req, res, next) {
  /**********************/
  // CALL FOR AUTHORIZATION
  /**********************/
  var assetId = req.query.id;
  console.log(assetId);
  function authToken(clientId, clientSecret, assetId){
    var options = {
        url: 'http://auth.exacttargetapis.com/v1/requestToken',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
        form: {'clientId': clientId, 'clientSecret': clientSecret}
    }

    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log('Bearer: Sucess');
            let json = JSON.parse(body);
            console.log(json);
            var accessToken = json.accessToken;
            console.log(accessToken);
            getAsset(accessToken, assetId);
        }else{
            console.log('Auth Error');
            res.json({ message: '<p style="color:red;text-align:center;">Authentication errored, validate clientId & clientSecret are correct.</p>' });
        }
    })
  }

  /**********************/
  // POST DATA
  /**********************/
  function getAsset(accessToken, assetId){
    var optionsAsset = {
        url: 'https://www.exacttargetapis.com/asset/v1/content/assets/'+assetId,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+accessToken
        }
    }
    console.log(optionsAsset);

    request(optionsAsset, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            let jsonAsset = JSON.parse(body);
            var content = jsonAsset.content;
            console.log(content);
            res.json({ message: content });
        }else{
            console.log('Post to DE: error');
            console.log(body);
            res.json({ message: '<p style="color:red;text-align:center;">Content Block Retrieval Error, verify content block exists.</p>' });
        }
    })
  }
  var auth = authToken(process.env.clientId, process.env.clientSecret, assetId);
  
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Shanes Express server listening on port ' + app.get('port'));
});