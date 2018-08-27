'use strict';

// Deps
var activity = require('./activity');
var request     = require('request');

var MySportsFeeds = require("mysportsfeeds-node");
var msf = new MySportsFeeds("1.2", true);
msf.authenticate("c2791441-c7ce-492e-b5b4-d47ce8", "kf45wxB6");


/*
 * GET home page.
 */
exports.sportsEndPoint = function(req, res){
    /*var deExternalKey = req.body.deExternalKey;
    var keys = req.body.keys;
    var values = req.body.values;
    console.log(deExternalKey);*/

    //var data = msf.getData('nba', '2017-2018-regular', 'player_gamelogs', 'json', {});

    pullSports('nba', '2018-playoff', 'player_gamelogs', 'json?limit=200', "{player: 'stephen-curry'}");

    //console.log('NBA: '+JSON.stringify(data, null, 2));
    //res.send(200, 'Execute');
};

function pullSports(league, season, route, format, params){
    var options = {
        //url: 'https://api.mysportsfeeds.com/v1.2/pull/'+league+'/'+season+'/'+route+'.'+format,
        url: 'https://worldcup.sfg.io/teams/results',
        method: 'GET',
        json: true
    }
    console.log(options);

    request(options, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log('Post to DE successful');
            console.log('Response: '+JSON.stringify(response, null, 2));
            console.log('Body: '+JSON.stringify(body, null, 2));
            response.send(200, 'Execute');
        }else{
            console.log('Post to DE: error');
            console.log(body);
            //response.render(500, 'Error');
        }
    })
    //return res.send(200, 'Execute');
}
/*function pullSports(league, season, route, format, params){
    var options = {
        //url: 'https://api.mysportsfeeds.com/v1.2/pull/'+league+'/'+season+'/'+route+'.'+format,
        url: 'https://api.mysportsfeeds.com/v1.2/pull/nba/2018-playoff/player_gamelogs.json?team=det',
        method: 'GET',
        headers: {
            'Authorization': 'Basic YzI3OTE0NDEtYzdjZS00OTJlLWI1YjQtZDQ3Y2U4OmtmNDV3eEI2'
        },
        json: true
    }
    console.log(options);

    request(options, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log('Post to DE successful');
            console.log('Response: '+JSON.stringify(response, null, 2));
            console.log('Body: '+JSON.stringify(body, null, 2));
            response.send(200, 'Execute');
        }else{
            console.log('Post to DE: error');
            console.log(body);
            //response.render(500, 'Error');
        }
    })
    //return res.send(200, 'Execute');
}*/