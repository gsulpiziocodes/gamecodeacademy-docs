let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let codes = require('./codes');
const bodyParser = require('body-parser');
let static = require('node-static');

let private_dir = new(static.Server)(path.join(__dirname, 'private'));
let public_dir = new(static.Server)(path.join(__dirname, 'public'));

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({secret:'5732891djjAA'}));
app.use(cookieParser());
app.use(bodyParser.json());

// Handle code send request
app.use(function (req, res, next) {
    if (req.method !== 'POST') {
        next();
        return;
    }
    let path = req.path;
    if (path === '/verifyCode') {
        const rawCode = req?.body?.code;
        const normalizedCode = rawCode == null ? '' : String(rawCode).trim();

        if (normalizedCode && codes.includes(normalizedCode)) {
            req.session.code = normalizedCode;
            req.session.save(() => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.write('{}');
                res.end();
            });
        } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.write('{}');
            res.end();
        }
    }
});

// Check verification
app.use(function (req, res, next) {
    // check if client is verified
    if (codes.includes(req.session.code)) {
        console.log('Verified')
        //app.use(express.static(path.join(__dirname, 'private')));
        private_dir.serve(req, res);
        console.log(path.join(__dirname, 'private'));
        //next();
    } else {
        //app.use(express.static(path.join(__dirname, 'public')));
        public_dir.serve(req, res);
        //next();
    }
});


module.exports = app;
