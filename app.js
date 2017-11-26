'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Rutas
var user_routes = require('./routes/user');
var animal_routes = require('./routes/animal');

//middleware de body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//configurar CORS y headers
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method");
    res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//rutas body-parser
app.use('/api', user_routes);
app.use('/api', animal_routes);

module.exports = app;