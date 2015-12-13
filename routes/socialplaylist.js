/**
 * Created by Sergio on 24/11/2015.
 */
var express = require('express')
    , router = express.Router()
    , util = require('../util.js')
    , api = require('../Inner-Api/redis-Api.js');

var title = 'Social-Api';
var std = 'Social:  ';

//var token = 'tokenForSomeUser';

/*
 USE CASE : Create social playlist if not yet exist one.
            Invite a userB to share a UserA's playlist
 */

router.get('/invite/:idUser/to/:playlistName', function(req, res) {
    var userId = util.getIdByToken(req.headers['authorization']);

    api.createSocialAndInvite(userId, req.params.playlistName, req.params.idUser, function(err,socialId){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});

        res.sendfile('wsClientApp.html');
    })
});



router.get('/add/song/:idSong/to/:idSocial', function(req, res) {
    var userId = util.getIdByToken(req.headers['authorization']);  
    var key = 'social:'+req.params.idSocial;

    client.exists(key, function(err, exist) {
        if (!exist) {
            var title = "Social Playlist not founded for id: "+req.params.idSocial;
            var message = "...";
            res.render('index', {title: title, message: message});
            return;
        }

        //checkpermission
        var key = 'social:'+req.params.idSocial+':songs';
        client.lrange(key,0,-1, function (err, reply) {
            for(var r in reply){
                if(r===req.params.idSong){
                    var title = "Song :"+req.params.idSong+ " already exist in Social Playlist for id: "+req.params.idSocial;
                    var message = "...";
                    res.render('index', {title: title, message: message});
                    return;
                }
            }
            //var key = 'socialplaylist:'+userId+':songs';
            //req.params.idSong
            client.zadd(key, 1, req.params.idSong, function(err, response){
                var title = "Song :"+req.params.idSong+ " added to Social Playlist for id: "+req.params.idSocial;
                var message = "...";

                res.render('index', {title: title, message: message});
                return;

                //TODO: notify user/notify all

            });
        });
    });
});


router.get('/permission/set', function(req, res) {
    //var userId = util.getIdByToken(token);
    var userId = util.getIdByToken(req.headers['authorization']);  

    var permission = req.body.permission;

    api.updateSocialPermission(userId, permission, function(err,ok){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});

        res.render('index', {userId: userId, title: title, message: ok});
    });

});

router.get('/permission/addAdmin/:idUser', function(req, res) {
    //var userId = util.getIdByToken(token);
    var userId = util.getIdByToken(req.headers['authorization']);  

    var key = 'socialplaylist:'+userId;

    client.exists(key, function(err, exist) {
        if (!exist) {
            var title = "Social Playlist not founded for id: " + userId;
            var message = "...";
            res.render('index', {title: title, message: message});
            return;
        }

        var permissions = util.createDefaultSocialPermissions(userId);
        var key = 'socialplaylist:'+userId+':permission';
        client.get(key, function (err, obj) {
            var permission = JSON.parse(obj);
            for(var admin in permission.admins){
                if(admin===req.params.idUser){
                    var title = "Social Playlist id: " + userId + " already has "+req.params.idUser + " for admin";
                    var message = "...";
                    res.render('index', {title: title, message: message});
                    return;
                }

            }
            permission.admins.push(req.params.idUser);


            client.set(key, JSON.stringify(permission), function(err){
                var title = "Social Playlist id: " + userId + " added "+req.params.idUser + " for admin";
                var message = "Permission updated";
                res.render('index', {title: title, message: message});
                return;

                //TODO: notify user

            });
        });
    });
});
/*
router.get('/vote/song/:idSong/to/:idSocial', function(req, res) {

    var userId = util.getIdByToken(token);
    var key = 'socialplaylist:'+req.params.idSocial;

    client.exists(key, function(err, exist) {
        if (!exist) {
            var title = "Social Playlist not founded for id: "+req.params.idSocial;
            var message = "...";
            res.render('index', {title: title, message: message});
            return;
        }

        //checkpermission
        var key = 'socialplaylist:'+userId+':songs';
        client.lrange(key,0,-1, function (err, reply) {
            var found = false;
            for(var r in reply)
                if(r===req.params.idSong)
                    found = true;

            if(found==false){
                var title = "Song :"+req.params.idSong+ " not foung in Social Playlist for id: "+req.params.idSocial;
                var message = "...";
                res.render('index', {title: title, message: message});
                return;
            }

            client.zincrby(key, 1,  req.params.idSong, function(err, response){
                var title = "Song :"+req.params.idSong+ " added to Social Playlist for id: "+req.params.idSocial;
                var message = "...";

                res.render('index', {title: title, message: message});
                return;

                //TODO: notify user/notify all
                //test get ZRANGE 'socialplaylist:'+userId+':songs' 0 -1 WITHSCORES
            });
        });
    });
});
*/


/*
router.get('/add/user/:idUser/to/:idSocial', function(req, res) {

    var userId = util.getIdByToken(token);
    var key = 'socialplaylist:'+req.params.idSocial;

    client.exists(key, function(err, exist) {
        if (!exist) {
            var title = "Social Playlist not founded for id: "+req.params.idSocial;
            var message = "...";
            res.render('index', {title: title, message: message});
            return;
        }

        //checkpermission
        var key = 'socialplaylist:'+userId+':users';
        client.lrange(key,0,-1, function (err, reply) {
            for(var r in reply){
                if(r===req.params.idUser){
                    var title = "User :"+req.params.idUser+ " already exist in Social Playlist for id: "+req.params.idSocial;
                    var message = "...";
                    res.render('index', {title: title, message: message});
                    return;
                }
            }

            client.lpush(key, function(err, length){
                var title = "User :"+req.params.idUser+ " added to Social Playlist for id: "+req.params.idSocial;
                var message = "...";

                res.render('index', {title: title, message: message});
                return;

                //TODO: notify user/notify all
            });
        });
    });
});
*/



module.exports = router
