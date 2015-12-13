/**
 * Created by Sergio on 12/11/2015.
 */
var express = require('express')
    , router = express.Router()
    , util = require('../util.js')
    , api = require('../Inner-Api/redis-Api.js');

var title = 'Permission-Api';
var std = 'Permission:  ';

//var token = 'tokenForSomeUser';

router.get('/', function(req,res){
    var userId = req.session.id;

    api.getPermission(userId, function(err,permission){
        if(err)
            res.render('index', {userId: userId, title: title , message: 'Error'});

        res.render('index', {userId: userId, title: title , message: std+ permission});
    });
});

router.get('/set', function(req,res){
    var userId = util.getIdByToken(req.headers['authorization']);  
    var permission = util.createDefaultPermission();
    //var permission = {permission: req.body.permission}

    api.setPermission(userId, permission, function(err,ok){
        if(err)
            res.render('index', {userId: userId, title: title , message: 'Error'});

        res.render('index', {userId: userId, title: title , message: std+ JSON.stringify(permission)});
    });
});

module.exports = router;

