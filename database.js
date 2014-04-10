var express = require('express');
var crypto = require('crypto');

var app = express();

app.use(express.bodyParser());

var database = [
    {
        pseudo: 'pseudo',
        old_pseudo: null,
        shared_key: 'shared',
        MAK: 'mkey12345'
    }
];

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

app.get('/query', function (req, res, next) {
    var tag_message = req.body;

    var K_enctb = null, K_mactb = null, i, pseudo;
    for (i = 0; i < database.length; i++) {
        var tag = database[i];
        // Check to see if it matches the old value
        if (tag.old_pseudo) {
            // Compute local c_0
            var shasum = crypto.createHash('sha256');
            shasum.update(tag.old_pseudo);
            shasum.update(tag_message.N_r.toString());
            shasum.update(tag_message.N_t.toString());
            var c_0 = shasum.digest('base64');

            if (c_0 == tag_message.c_0) {
                K_enctb = tag.shared_key;
                K_mactb = tag.MAK;
                pseudo = tag.old_pseudo;
                break;
            }
        }

        // Check to see if it matches the new value (compute c_0)
        var shasum = crypto.createHash('sha256');
        shasum.update(tag.pseudo);
        shasum.update(tag_message.N_r.toString());
        shasum.update(tag_message.N_t.toString());
        var c_0 = shasum.digest('base64');

        if (c_0 == tag_message.c_0) {
            K_enctb = tag.shared_key;
            K_mactb = tag.MAK;
            pseudo = tag.pseudo;
            break;
        }
    }

    if (K_enctb && K_mactb) {
        // Decipher tag
        var tag_id = decrypt(K_enctb, tag_message.c_1);

        // Calculate local c_1
        var c_1 = encrypt(K_enctb, [tag_message.N_t.toString(), tag_message.N_r.toString(), tag_id]);

        // Calculate local c_2
        var hmac = crypto.createHmac('sha256', K_mactb);
        hmac.update(c_1);
        var c_2 = hmac.digest('base64');

        if (c_2 == tag_message.c_2) {
            // Calculate c_3 and c_4 to send back to reader
            var c_3 = encrypt(K_enctb, [tag_message.N_r.toString(), tag_message.N_t.toString()]);
            var hmac_c_4 = crypto.createHmac('sha256', K_mactb);
            hmac_c_4.update(c_3);
            var c_4 = hmac_c_4.digest('base64');

            // Update pseudonyms
            database[i].old_pseudo = pseudo;
            var shasum = crypto.createHash('sha256');
            console.log(pseudo);
            shasum.update(pseudo);
            database[i].pseudo = shasum.digest('base64');

            res.json({
                c_3: c_3,
                c_4: c_4
            });
        } else {
            console.log('MAC does not match')
            res.send(403);
        }
    } else {
        console.log('not found in database')
        res.send(403);
    }
});

app.listen(3001, 'localhost', function () {
    console.log('Listening on port 3001');
});