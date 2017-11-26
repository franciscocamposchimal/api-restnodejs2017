'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://FrankoCampos:ceciyfranko1308@ds113566.mlab.com:13566/zoo',{ useMongoClient: true})
    .then(() => {
          console.log('Conexión satisfactoria..');
          app.listen(port,() =>{
              console.log("Server local con node y express corriendo...");
          });
    })
    .catch(err => console.log(err));