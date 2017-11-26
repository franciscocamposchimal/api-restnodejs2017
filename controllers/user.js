'use strict'
//modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');

//servicio jwt
var jwt = require('../services/jwt');

//acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando controlador',
        user: req.user
    });
}

function saveUser(req, res){

    //Crear objeto usuario
    var user = new User();

    //Recoger parametros
    var params = req.body;

    if (params.password && params.name && params.surname && params.email){
        //Asignar valores al objeto usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;

            User.findOne({email: user.email.toLowerCase()}, (err, issetUser) =>{
                if(err){
                    res.status(500).send({message: 'Error al comprobar usuario'});
                }else{
                    if(!issetUser){
                        //Cifrar contraseña
                        bcrypt.hash(params.password, null, null, function (err, hash) {
                            user.password = hash;
                            //Guardar usuario
                            user.save((err, userStored) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error al guardar usuario' });
                                } else {
                                    if (!userStored) {
                                        res.status(404).send({ message: 'No se ha registrado el usuario' });
                                    } else {
                                        res.status(200).send({ user: userStored });
                                    }
                                }
                            });
                        });
                    }else{
                        res.status(200).send({
                            message: 'Usuario ya existe!'
                        });
                    }
                }
            });
  }else{
        res.status(200).send({
            message: 'Introduce los datos correctamente'
        });
  }
}

function login(req,res){
    var params = req.body;
    var password = params.password;
    var email = params.email;

            User.findOne({email: email.toLowerCase()}, (err, user) =>{
                if(err){
                    res.status(500).send({message: 'Error al comprobar usuario'});
                }else{
                    if(user){
                        bcrypt.compare(password, user.password, (err,check) => {
                            if(check){

                                if(params.gettoken){
                                    //devolver token
                                    res.status(200).send({
                                        token: jwt.createToken(user)
                                    });
                                }else{
                                    res.status(200).send({ user });
                                }
                                
                            }else{
                                res.status(404).send({
                                    message: 'Contraseña incorrecta'
                                });
                            }
                        });
                         
                    }else{
                            res.status(404).send({
                                message: 'Usuario no existe'
                            });
                    }
                }
            });                 
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({ message: 'Sin auth para actualizar' });
    }

    User.findByIdAndUpdate(userId, update, {new:true},(err, userUpdated) => {
        if(err){
            res.status(500).send({ message: 'Error al actualizar' });
        }else{
            if(!userUpdated){
                res.status(404).send({ message: 'No se ha podido actualizar' });
            }else{
                   res.status(200).send({ user: userUpdated });
            }
        }
    });

}

function uploadImage(req,res) {
    var userId = req.params.id;
    var file_name = 'Sin archivo...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ) {
            if (userId != req.user.sub) {
                return res.status(500).send({ message: 'Sin auth para actualizar' });
            }

            User.findByIdAndUpdate(userId, { image:file_name }, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar' });
                } else {
                    if (!userUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar' });
                    } else {
                        res.status(200).send({ user: userUpdated, image: file_name });
                    }
                }
            });
        }else{
            fs.unlink(file_path, (err) => {
                if (err) {
                    res.status(200).send({ message: "Extension de archivo no valido y no borrado..." });
                }else{
                    res.status(200).send({ message: "Extension de archivo no valido..." });
                }
            });
           
        }

    }else{
         res.status(200).send({ message: "No se logro subir el archivo..." });
    } 
}

function getImageFile(req,res) {
    var imagefile = req.params.imageFile;
    var path_file = './uploads/users/'+imagefile;

    fs.exists(path_file,function (exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({ message: "La imagen no existe..." });
        }
    });
}

function getKeepers(req,res) {
    User.find({ role: 'ROLE_ADMIN' }).exec((err,users) => {
        if(err){
            res.status(500).send({ message: "Error en la peticion..." });
        }else{
            if(!users){
                res.status(404).send({ message: "No hay ningun cuidador..." });
            }else{
                res.status(200).send({ users });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};