var express = require('express');
var crypto = require('crypto');

var app = express();

app.use(express.bodyParser());

var pseudonym = 'pseudo';
var tag_id = 'abcde12345';
var shared_key = 'shared'; // shared authentication key (K_enctb)
var MAK = 'mkey12345'; // message authentication key (K_mactb)

var MAX_INT = 4294967295;

// Session nonces
var N_r, N_t;

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

function decrypt(key, el) {
    var buf = new Buffer(key, 'binary');
    var decipher = crypto.createDecipher('aes192', buf);
    var msg = [];
    msg.push(decipher.update(el, "base64", "binary"));
    msg.push(decipher.final("binary"));
    msg = msg.join('');
    msg = msg.split(':');
    msg.shift();
    return msg;
}

app.get('/query/:rand', function (req, res, next) {
    var c_0, c_1, c_2;
    N_r = req.params.rand;
    N_t = Math.floor(Math.random() * MAX_INT);
    var N_r_string = N_r.toString(), N_t_string = N_t.toString();

    var shasum = crypto.createHash('sha256');
    shasum.update(pseudonym);
    shasum.update(N_r_string);
    shasum.update(N_t_string);
    c_0 = shasum.digest('base64');

    c_1 = encrypt(shared_key, [N_t_string, N_r_string, tag_id]);

    var hmac = crypto.createHmac('sha256', MAK);
    hmac.update(c_1);
    c_2 = hmac.digest('base64');

    res.json({
        N_t: N_t,
        c_0: c_0,
        c_1: c_1,
        c_2: c_2
    })
});

app.get('/authenticate', function (req, res, next) {
    var credentials = req.body;
    if (N_t !== null && N_r !== null) {
        // Decrypt c_3
        var mac = decrypt(shared_key, credentials.c_3);

        // Compute local c4
        var N_r_string = N_r.toString(), N_t_string = N_t.toString();
        var c_3 = encrypt(shared_key, [N_r, N_t]);

        var hmac = crypto.createHmac('sha256', MAK);
        hmac.update(c_3);
        c_4 = hmac.digest('base64');

        if (c_4 == credentials.c_4 && (mac[0] == N_t_string || mac[0] == N_r_string) && (mac[1] == N_t_string || mac[1] == N_r_string)) {
            var shasum = crypto.createHash('sha256');
            shasum.update(pseudonym);
            pseudonym = shasum.digest('base64');
            res.send(200);
        } else {
            console.log('incorrect nonces or MAC')
            res.send(403);
        }
    } else {
        console.log('no session present');
        res.send(403);
    }
})

app.listen(3000, 'localhost', function () {
    console.log('Listening on port 3000');
});