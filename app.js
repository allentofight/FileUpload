var formidable = require('formidable'),
    util = require('util'),
    crypto = require('crypto');
var mkdirp = require('mkdirp');

var express = require('express');
var app = express();

var path = require('path');
var staticAsset = require('static-asset');
app.use(staticAsset(__dirname + "/public/"));

var fs = require('fs');
var url = require('url');
// var bodyParser = require('body-parser');
// app.use(bodyParser.json());

var server = app.listen(5000, function() {
    console.log("Express is running on port 5000");
});

app.get('/version', function(req, res) {
    // var isDebug = req.query.isDebug;
    // isDebug = 0;
    var owner = req.query.owner || '';
    var length = owner.length;
    if (length > 0){
        owner += '/';
    }

    var relativePath = '/public/uploaded/' + owner + 'dy_ther2.hex';
    console.log("relativePath = "+relativePath);
    var filePath = path.join(__dirname, '/public/uploaded/dy_ther2.hex');

    if (fs.existsSync(filePath)) {
        var hexFile = fs.readFileSync(filePath);
        var localeETag = crypto.createHash('md5').update(hexFile).digest('hex');
        console.log('localeETag = ' + localeETag);
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'ETag': localeETag
        });
        res.end();
    } else {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end();
    }
})

app.get('/uploaded/:id/dy_ther2.hex', function(req, res) {
    var owner = req.params.id;
    console.log(owner);
    var filePath = path.join(__dirname, '/public/uploaded/' + owner + '/dy_ther2.hex');
    var hexFile = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'text/x-ihex'
    });
    res.end(hexFile, 'binary');
});

app.get('/uploaded/dy_ther2.hex', function(req, res) {
    var filePath = path.join(__dirname, '/public/uploaded/dy_ther2.hex');
    var hexFile = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'text/x-ihex'
    });
    res.end(hexFile, 'binary');
});

app.post('/upload', function(req, res) {
    // var version = req.body.version;
    var form = new formidable.IncomingForm({
        uploadDir: __dirname + '/public/uploaded'
    });
    console.log("prepare upload...");
    form.parse(req, function(err, fields, files) {
        // console.log("files.upload.path = " + files.upload.path);
        var version = fields.version;
        var member = fields.member;
        console.log("member = " + member);

        var filePath = path.join(__dirname, '/public/uploaded/' + member);
        mkdirp.sync(filePath);

        var finalPath = filePath + "/dy_ther2.hex";
        console.log("finalPath = " + finalPath);
        console.log("files.upload.path = " + files.upload.path);
        fs.rename(files.upload.path, finalPath, function(error) {
            if (error) {
                fs.unlink(finalPath);
                fs.rename(files.upload.path, finalPath);
            }
        });
        // file.path = form.uploadDir + "/" + files.upload.name;
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received upload:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
});

app.get('/upload', function(req, res) {
    var filePath = path.join(__dirname, '/public/html/index.html');
    res.sendFile(filePath);
});
