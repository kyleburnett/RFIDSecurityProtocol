var express = require('express');
var request = require('request');
var app = express();

var MAX_INT = 4294967295;

app.listen(3001, 'localhost', function () {
    console.log('Listening on port 3001');

    var options = {
        host: 'localhost',
        port: 3000,
        path: '/query',
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };

    var r = Math.floor(Math.random() * MAX_INT);

    console.log("Start");
    request('http://localhost:3000/query/' + r, function (error, response, body) {
        if (error) console.log(error);
        else if (response.statusCode == 200) {
            console.log(body);
        }
    })
})