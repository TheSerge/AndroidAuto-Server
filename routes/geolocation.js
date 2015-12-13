/**
 * Created by Sergio on 16/11/2015.
 */
var express = require('express')
    , router = express.Router()
    , util = require('../util.js')
    , api = require('../Inner-Api/redis-Api.js');

var title = 'Geolocation-Api';
var std = 'Position:  ';

//var token = 'tokenForSomeUser';

router.get('/', function(req,res){
    var userId = util.getIdByToken(req.headers['authorization']);

    api.getGeo(userId, function(err, geo){
        if(err)
            res.render('index', {userId: userId, title: title , message: 'Error'});
        else
            res.render('index', {userId: userId, title: title , message: std+geo});

    });
});

router.get('/set', function(req,res){
    var userId = util.getIdByToken(req.headers['authorization']);
    var geo = util.createRandomPosition();
    //var geo = {longitude: req.body.longitude, latitude: req.body.latitude}

    api.setGeo(userId, geo, function(err, ok) {
        if (err)
            res.render('index', {userId: userId, title: title, message: 'Error'});
        else
            res.render('index', {userId: userId, title: title, message: std + JSON.stringify(geo)});
    });
});
module.exports = router;