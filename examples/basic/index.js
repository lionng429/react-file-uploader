var fs = require('fs');
var express = require('express');
var app = express();
var multiparty = require('connect-multiparty')();
var html = fs.readFileSync('index.html').toString();

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.send(html);
});

app.post('/upload', multiparty, function(req, res) {
    var file = req.files.file;

    fs.unlink(file.path, function(err) {
        res.json({
            success: !err,
            file: file
        });
    });
});

app.listen(3000, function(err) {
    console.log('app is started at port 3000');
});