var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var querystring = require('querystring');
var https = require('https');
var http = require('http');
var request = require('request');
var crypto = require('crypto');

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
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

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

app.get("/", function(req, res) {
    res.send('Hello World');  
});

/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
        res.status(200).json(docs);   
    }
  });
});

app.post("/api/contacts", function(req, res) {
      var newContact = req.body;
      newContact.createDate = new Date();

      if (!req.body.name) {
        handleError(res, "Invalid user input", "Must provide a name.", 400);
      }

    /*START EDIT*/
    /**********************/
    // CALL FOR AUTHORIZATION
    /**********************/
    function authToken(email, contact, status, responseId){
        var options = {
            url: 'http://auth.exacttargetapis.com/v1/requestToken',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            form: {'clientId': '8eqcb76xtonbwxnybjsppye3', 'clientSecret': 'CTETpqMb0IBsE9vDu2bwk1sN'}
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log('Bearer: Sucess');
                let json = JSON.parse(body);
                console.log(json);
                var accessToken = json.accessToken;
                postDE(accessToken, email, contact, status, responseId);
            }else{
                console.log('Bearer: Error');
            }
        })
    }
    
    /**********************/
    // POST DATA
    /**********************/
    function postDE(accessToken, email, contact, status, responseId){
        var optionsDE = {
            url: 'https://www.exacttargetapis.com/hub/v1/dataevents/key:Letter_Mail_Response/rows/EmailAddress:'+email,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+accessToken
            },
            form: {'values': {'ContactId': contact, 'Status': 'Confirmed', 'ResponseId': responseId}}
            //body: [ { "keys": { "EmailAddress": email },"values": { "ContactId": contact, "Status": status } } ],
            //json: true
        }
        console.log(optionsDE);

        request(optionsDE, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log('Post to DE successful');
            }else{
                console.log('Post to DE: error');
                console.log(body);
            }
        })
    }
    /*END EDIT*/
    
    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    var email = newContact.inArguments[0].emailAddress;
    var contact = newContact.inArguments[1].contactIdentifier;
    var status = newContact.inArguments[2].status; 
    var responseId = crypto.randomBytes(20).toString('hex');    
    authToken(email, contact, status, responseId);
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {      
      res.status(201).json(doc.ops[0]);
    }
  });
});

var server = app.listen(process.env.PORT || APP_PORT, function() {
  console.log('plaid-walkthrough server listening on port ' + APP_PORT);
});