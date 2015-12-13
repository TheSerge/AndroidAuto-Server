/**
 * Created by Sergio on 11/11/2015.
 */
var express = require('express')
    , router = express.Router()
    , util = require('../util.js')
    , api = require('../Inner-Api/redis-Api.js');

var title = 'History-Api';
var std = 'History:  ';

//var token = 'tokenForSomeUser';

router.post('/add/:idSong', function(req, res) {
     var userId = req.session.id

    api.addSong(userId,req.params.idSong, function(err,message){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error' });
        res.render('index', {userId: userId, title: title, message: message });
    })
});

router.get('/all', function(req, res) {
    var userId = util.getIdByToken(req.headers['authorization']);

    api.getAllHistorySongs(userId, function(err, extra){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error' });
        res.render('index', {userId: userId, title: title, message: 'History songs', extra: extra });
    });
});

router.get('/recent', function(req, res) {
    var userId = req.session.id

    api.getRecentSongs(userId, function(err,extra){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error' });
        res.render('index', {userId: userId, title: title, message: 'History recent songs', extra: extra });
    });
});

module.exports = router;
