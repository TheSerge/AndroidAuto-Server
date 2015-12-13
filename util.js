/**
 * Created by Sergio on 12/11/2015.
 */
var redis = require('redis');
var client = redis.createClient();

//exports.requireAuthentication(){
//
//}
//var __count = 0;

var getIdByToken = function (token){
    return token.replace("Bearer ", "");
}


var getPermissions = function (key){
    var permissions;
    client.get(key, function(err, value){
        if(err) {
            console.error(err);
            return undefined;
        }
        permissions = JSON.parse(value);
        console.log(permissions);
        return permissions;
    });

}

/*
TEST: funzione prototipo. read DB
lrange senza parametri indici?!
Sostituire con get?!
 */
/*
var getData = function (key){
    var data = undefined;
    client.lrange(key, function(err, reply){
        if(err) {
            console.error(err);
            return undefined;
        }
        data = reply;
        console.log(reply);
        return data;
    });
}*/


var getKeyFor = function(userId, tagName, tagValue){
    if(tagValue==undefined)     return "user:"+userId+":"+tagName;
    else                        return "user:"+userId+":"+tagName+":"+tagValue;
}

var _song = 0;
var createNewSong = function(){
    return _song++;
}

/*
var createDefaultSong = function(){
    var song = {
        title    : "Default",
        album    : "Default",
        artist   : "Default",
        duration : "Default",
        genre    : "Default",
        date     : new Date().getTime(),
        count    : parseInt(Math.random()*100)
    }
    return song;
}*/

var createEmptyPlaylist = function(name){
    var playlist = {
        name  : name,
        date  : new Date().getTime()
    }
    return playlist;
}


var createDefaultPermission = function(){
    var permissions = {
        history     : true,
        playlists   : false,
        geolocation : true
    }

    return permissions;
}

var _social = 0;
var createDefaultSocialPlaylist = function(creator, invited ) {
    var social = {
        id            : _social++,
        creator       : creator,
        admins        : [],
        invited       : [invited],
        participants  : [],

        //users that are no admins what can do?
        addUser     : false,
        addSongs    : true
    }

    return social;
}



var createRandomPosition = function(){
    var geo = {
        longitude  : parseInt(Math.random()*1000000000),
        latitude   : parseInt(Math.random()*1000000000)
    }

    return geo;
}



module.exports.getIdByToken                   = getIdByToken;
module.exports.getPermissions                 = getPermissions;
//module.exports.getData                        = getData;
module.exports.getKeyFor                      = getKeyFor;
//module.exports.createDefaultSong              = createDefaultSong;
module.exports.createNewSong                  = createNewSong;
module.exports.createEmptyPlaylist            = createEmptyPlaylist;
module.exports.createDefaultPermission        = createDefaultPermission;
module.exports.createDefaultSocialPlaylist    = createDefaultSocialPlaylist;
module.exports.createRandomPosition           = createRandomPosition;
