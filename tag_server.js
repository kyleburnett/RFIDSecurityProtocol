var express = require('express');
var app = express();

app.get('/query/:rand', function (req, res, next) {
    console.log(req.params.rand);
    res.send(200);
})

app.listen(3000, 'localhost', function () {
    console.log('Listening on port 3000');
})