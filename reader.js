var express = require('express');
var request = require('request');

var app = express();

var MAX_INT = 4294967295;

var r = Math.floor(Math.random() * MAX_INT);

console.log("Start");
request('http://localhost:3000/query/' + r, function (error, response, body) {
    if (error) console.log(error);
    else if (response.statusCode == 200) {
        var post_data = JSON.parse(body);
        post_data.N_r = r;

        var options = {
            uri: 'http://localhost:3001/query',
            method: 'GET',
            json: post_data
        };

        request(options, function (error, response, body) {
            if (error) console.log(error);
            else if (response.statusCode == 200) {
                var auth_data = body;

                var auth_options = {
                    uri: 'http://localhost:3000/authenticate',
                    method: 'GET',
                    json: auth_data
                };

                request(auth_options, function (error, response, body) {
                    if (error) console.log(error);
                    else if (response.statusCode == 200) {
                        console.log('success');
                    } else {
                        console.log('Authentication failed: ' + response.statusCode);
                    }
                })
            } else {
                console.log('Database query failed: ' + response.statusCode);
            }
        });
    } else {
        console.log('Tag query failed: ' + response.statusCode);
    }
});