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
var mongodb = require("mongodb");

var CONTACTS_COLLECTION = "instances";

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

// Connect to the database before starting the application server.
var db;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}



app.get('/', function(request, response, next) {
  const { Client } = require('pg');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
  
  response.render('index.ejs', {
  });
}); 

app.get("/instances", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get('/configure', function(request, response, next) {
  response.render('configure.ejs', {
  });
}); 

app.post('/configure', function(request, response, next) {
  var newContact = req.body;
  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
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