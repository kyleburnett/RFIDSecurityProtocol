var express = require('express');
var crypto = require('crypto');

var app = express();

app.use(express.bodyParser());

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
    return msg[msg.length-1];
}

var master_key = 'master12345';

var database = [
    {
        id: 'reader123',
        pass: 'secret'
    }
];
var K_enc = 'AaBbCcDdEe';
var K_mac = '1234567890';

app.get('/authenticate', function (req, res, next) {
    var reader_message = req.body;

    var found_reader = null;
    for (var i = 0; i < database.length; i++) {
        var reader = database[i];
        // Compute local c_alpha
        var shasum = crypto.createHash('sha256');
        shasum.update(reader.id);
        var c_alpha = shasum.digest('base64');

        if (c_alpha == reader_message.c_alpha) {
            found_reader = reader;
            break;
        }
    }

    if (found_reader) {
        // Compute local versions of c_beta and c_gammma
        var pass = decrypt(K_enc, reader_message.c_beta);

        var c_beta = encrypt(K_enc, [pass]);

        var hmac = crypto.createHmac('sha256', K_mac);
        hmac.update(c_beta);
        var c_gamma = hmac.digest('base64');

        if (c_gamma == reader_message.c_gamma && pass == found_reader.pass) {
            // Send back access key with time
            var time = (new Date()).toISOString();

            var access = encrypt(master_key, [master_key, time]);

            res.json({
                access: access
            })
        }
    }
});

app.listen(3002, 'localhost', function () {
    console.log('Listening on port 3002');
});