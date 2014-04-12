var express = require('express');
var request = require('request');
var crypto = require('crypto');

var app = express();

var MAX_INT = 4294967295;
var id = 'reader123';
var pass = 'secret';
var K_enc = 'AaBbCcDdEe';
var K_mac = '1234567890';

function encrypt(key, arr){
    var buf = new Buffer(key, 'binary');
    var cipher = crypto.createCipher('aes192', buf);
    msg = [];
    for (var i = 0; i < arr.length; i++) {
        msg.push(cipher.update(":" + arr[i], "binary", "base64"));
    }
    msg.push(cipher.final("base64"));
    return msg.join('');
}

// Compute hash of user, encrypt password, and compute and send MAC
var shasum = crypto.createHash('sha256');
shasum.update(id);
var c_alpha = shasum.digest('base64');

var c_beta = encrypt(K_enc, [pass]);

var hmac = crypto.createHmac('sha256', K_mac);
hmac.update(c_beta);
var c_gamma = hmac.digest('base64');

var cert_options = {
    uri: 'http://localhost:3002/authenticate',
    method: 'GET',
    json: {
        c_alpha: c_alpha,
        c_beta: c_beta,
        c_gamma: c_gamma
    }
}

console.log("Start");
request(cert_options, function (error, response, body) {
    if (error) console.log(error);
    else if (response.statusCode == 200) {
        var r = Math.floor(Math.random() * MAX_INT);

        var tag_options = {
            uri: 'http://localhost:3000/query/' + r,
            method: 'GET',
            json: {
                access: body.access
            }
        };
        request(tag_options, function (error, response, body) {
            if (error) console.log(error);
            else if (response.statusCode == 200) {
                var post_data = body;
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
    } else {
        console.log('Reader query failed: ' + response.statusCode);
    }
});