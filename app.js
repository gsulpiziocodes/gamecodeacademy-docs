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

const ACCESS_COOKIE = 'gca_unlock';
const ACCESS_COOKIE_VALUE = 'verified';
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
            res.cookie(ACCESS_COOKIE, ACCESS_COOKIE_VALUE, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                signed: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                path: '/'
            });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.write('{}');
            res.end();
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
    const unlockCookie = req.signedCookies ? req.signedCookies[ACCESS_COOKIE] : null;
    if (unlockCookie === ACCESS_COOKIE_VALUE) {
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
