var express = require('express');
var crypto = require('crypto');

var app = express();

var pseudonym = 'pseudo';
var tag_id = 'abcde12345';
var shared_key = 'shared'; // shared authentication key
var MAK = 'mkey12345'; // message authentication key

var MAX_INT = 4294967295;

app.get('/query/:rand', function (req, res, next) {
    var c_0, c_1, c_2;
    var N_r = req.params.rand;
    var N_t = Math.floor(Math.random() * MAX_INT);
    var N_r_string = N_r.toString(), N_t_string = N_t.toString();

    var shasum = crypto.createHash('sha256');
    shasum.update(pseudonym);
    shasum.update(N_r_string);
    shasum.update(N_t_string);
    c_0 = shasum.digest('base64');

    var buf = new Buffer(shared_key, 'binary');
    var cipher = crypto.createCipher('aes192', buf);
    cipher.update(N_t_string,'utf8');
    cipher.update(N_r_string,'utf8');
    cipher.update(tag_id,'utf8');
    c_1 = cipher.final('base64');

    var hmac = crypto.createHmac('sha256', MAK);
    hmac.update(c_1);
    c_2 = hmac.digest('base64');

    res.json({
        N_t: N_t,
        c_0: c_0,
        c_1: c_1,
        c_2: c_2
    })
})

app.listen(3000, 'localhost', function () {
    console.log('Listening on port 3000');
})