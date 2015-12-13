/**
 * Created by Sergio on 11/11/2015.
 */
var express = require('express')
    , router = express.Router()
    , api = require('../Inner-Api/redis-Api')
    , util = require('../util');

var title = 'Playlist-Api';
var std = 'Playlist:  ';
//var token = 'tokenForSomeUser';

router.get('/create/:playlistName', function(req, res) {
    var userId = util.getIdByToken(req.headers['authorization']);

    api.createPlaylist(userId, req.params.playlistName, function(err,message){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});
        res.render('index', {userId: userId, title: title, message: std+message});
    });
});

router.get('/add/:playlistName/:idSong', function(req, res) {
    var userId = util.getIdByToken(req.headers['authorization']);

    api.addSongToPlaylist(userId, req.params.playlistName, req.params.idSong, function(err,message){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error' });
        res.render('index', {userId: userId, title: title, message: message });
    });
});



/*
 USE CASE : get all song from playlist

 playlist: :playlistName

 */
router.get('/:playlistName/all', function(req, res) {
        var userId = util.getIdByToken(req.headers['authorization']); 

    api.getSongsPlaylist(userId, req.params.playlistName, function(err, extra){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});
        res.render('index', {userId: userId, title: title, message: 'Playlist: '+req.params.playlistName, extra: extra});
    });
});


/*
* USE CASE : User ask for all owns playlist
* */

router.get('/all', function(req, res){
        var userId = util.getIdByToken(req.headers['authorization']); 

    api.getNamesPlaylist(userId, function(err,names){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});

        res.render('index', {userId: userId, title: title, message: 'PlaylistNames: ', extra: names});
    });
});


router.get('/allDetailed', function(req, res){
    var userId = util.getIdByToken(req.headers['authorization']);

    api.getAllPlaylistDetailed(userId, function(err,message){
        if(err)
            res.render('index', {userId: userId, title: title, message: 'Error'});
        res.render('index', {userId: userId, title: title, message: message});
    });
});

/*
 USE CASE : UserA ask for UserB playlists

 playlist: :playlistName


router.get('/request/:userB/:playlist', function(req, res){
    var userB = req.params.userB;

    //Check permission
    var key = util.getKeyFor(userB,'permissions');
    var permissions;

    client.get(key, function(err, value){
        var playlist = req.params.playlist;
        if(err) {
            console.error(err);
            throw(err);
        }

        permissions = JSON.parse(value);
        console.log(permissions);

        if(permissions==undefined || !permissions.hasOwnProperty(playlist)){
            res.render('index', { title: 'Impossible retrieve permission for '+playlist+' of '+userB });
            console.log('Impossible retrieve permission for '+playlist+' of '+userB);
            return;
        }

        if(permissions[playlist]!=true){
            res.render('index', { title: 'No permission to ask '+playlist+' of '+userB });
            console.log('No permission to ask '+playlist+' of '+userB);
            return;
        }

        var key = util.getKeyFor(userB,'playlist',playlist);
        var playlist = [];

        client.lrange(key, 0, -1, function(err,replies){
            if(err) {
                console.error(err);
                throw(err);
            }

            playlist = replies;
            console.log("History requested of "+userB+" contains "+playlist);
            res.render('index', { title: 'YES' });
        });
    });
});
*/

module.exports = router
