var util = require('../util.js');
var redis = require('redis');
var redisClient = redis.createClient();

/**
 * CONST
 */
var __playlistNames__  = "playlistNames";


/**
 *  GEOLOCATION
 **/

function getGeo(userId, callback){
    var key = util.getKeyFor(userId,'geo');

    redisClient.get(key, function(err,geo){
        if(err)
            callback(err, null);
        else
            callback(null, geo);
    });
}

function setGeo(userId, geo, callback){
    var key = util.getKeyFor(userId,'geo');

    redisClient.set(key, JSON.stringify(geo), function(err, ok){
        if(err)
            callback(err, null);
        else
            callback(null, ok);
    });
}

/**
 *  PERMISSION
 **/

function getPermission(userId, callback){
    var key = util.getKeyFor(userId,'permission');

    redisClient.get(key, function(err,permission){
        if(err)
            callback(err, null);
        else
            callback(null, permission);
    });
}

function setPermission(userId, permission, callback){
    var key = util.getKeyFor(userId,'permission');

    redisClient.set(key, JSON.stringify(permission), function(err, ok){
        if(err)
            callback(err, null);
        else
            callback(null, ok);
    });
}

/**
 *  PLAYLISTS
 **/
function createPlaylist(userId, playlistName,  callback){
    var message = "";
    var key = util.getKeyFor(userId,'playlist',playlistName + ":info");

    redisClient.exists(key, function(err, exist) {
        if(err)     callback(err, null);
        else {
            if (exist) {
                message = "Invalid name: Playlist \'" + playlistName + "\' already exist.";
                callback(null, message);
            }
            else {
                var playlist = util.createEmptyPlaylist(playlistName);

                redisClient.set(key, JSON.stringify(playlist), function (err, ok) {
                    if (err)    callback(err, null);
                    else {
                        //update list playlist for user
                        var key = util.getKeyFor(userId, __playlistNames__);
                        redisClient.lpush(key, playlistName, function (err, length) {
                            if (err)    callback(err, null);
                            else {
                                message = message.concat(playlistName + ' created. Tot Playlist: #' + length);
                                callback(null, message);
                            }
                        });
                    }
                });
            }
        }
    });
}

function addSongToPlaylist(userId, playlistName, song, callback) {

    var message = "";
    var key = util.getKeyFor(userId, 'playlist', playlistName + ":info");
    redisClient.exists(key, function(err, exist){
        if(err)
            callback(err,null);
        else {
            if (!exist) {
                message = "Impossible add song cause " + playlistName + " doesn't exist.";
                callback(null, message);
            }
            else {
                var key = util.getKeyFor(userId, 'playlist', playlistName);
                redisClient.lrange(key, 0, -1, function (err, songs) {
                    if (err) callback(err, null)
                    else {
                        var already_present = false;
                        for (var i = 0; i < songs.length; i++)
                            if (song == songs[i])
                                already_present = true;

                        if (already_present)
                            callback(null, 'Songs already belong to this playlist');
                        else
                            redisClient.lpush(key, song, function (err, length) {
                                if (err) callback(err, null)
                                else {
                                    message = "Song " + song + " added to " + playlistName + ". Now length of playlist is: " + length;
                                    callback(null, message);
                                }
                            });
                    }
                })
            }
        }
    });
}

function getSongsPlaylist(userId, playlistName, callback) {
    var key = util.getKeyFor(userId,'playlist',playlistName);
    redisClient.exists(key, function(err, exist) {
        if(err)
            callback(err,null);
        else {
            if (!exist) {
                var message = "Impossible to retrieve song: not exist";
                callback(null, message);
            }

            redisClient.lrange(key, 0, -1, function (err, reply) {
                if (err)   callback(err, null);
                else      callback(null, reply);
            });
        }
    });
}

function getNamesPlaylist(userId, callback){
    var key = util.getKeyFor(userId,__playlistNames__);

    redisClient.lrange(key,0,-1, function(err, reply){
        if(err)
            callback(err,null);
        else
            callback(null,reply);
    });
}

var __names= [];
function getAllPlaylistDetailed(userId, callback){
    var count=0;

    getNamesPlaylist(userId, function(err, reply){
        var message = "";
        var details = [[]];
        __names = reply;

        for(var i=0; i<__names.length; i++){

            console.log('working on \''+__names[i]+'\'');

            var key = util.getKeyFor(userId,'playlist', __names[i]);

            redisClient.lrange(key, 0, -1, function(err,songs){
                if(err) {
                    console.log('error in lrange:'+key);
                    callback(err, null);
                }
                else {
                    console.log('-alloc res');
                    details[count] = [songs.length + 1];
                    console.log('-saving name: ' + __names[count]);
                    details[count][0] = __names[count];

                    message = message.concat("Name: " + __names[count]);
                    for (var j = 0; j < songs.length; j++) {
                        console.log('loading singles song for playlist');

                        details[count][j + 1] = songs[j];
                        message = message.concat("<br> -" + songs[j] + "</br>");
                    }

                    count++;
                    console.log('everything gone fine');
                    console.log('count: ' + count + '/' + __names.length);

                    if (count == __names.length) {
                        callback(null, message);
                        __names = [];
                    }
                }
            });
        }
    })
}


/**
 *  SONG
 **/
function addSong(userId, songId, callback){
    var message = "";
    existSong(songId, function(err,exist){

        if(err)     callback(err, null);
        else{
            if (exist) {
                var key = util.getKeyFor(userId, 'playlist', 'history');
                redisClient.lpush(key, songId, function (err, length) {

                    if (err)    callback(err, null);
                    else {
                        message = "Added \'" + songId + "\' to history. Now length is " + length;
                        callback(null, message);
                    }
                });
            }
            else {
                message = "Non existing song"
                callback(null, message)
            }
        }
    })
}

function getAllHistorySongs(userId, callback){
    var key = util.getKeyFor(userId,'playlist','history');

    redisClient.lrange(key, 0, -1, function (err, reply) {
        if(err)
            callback(err,null);
        else {
            console.log(reply);
            callback(null, reply);
        }
    })
}

function getRecentSongs(userId, callback){
    var key = util.getKeyFor(userId,'playlist','history');

    redisClient.lrange(key,0,4, function(err, reply) {
        if(err)
            callback(err,null);
        else {
            console.log(reply);
            callback(null, reply);
        }
    });
}
function existSong(songId, callback){
    //TODO check this code
    /*
    redisClient.exist("songs", function(err,exist){
        if(err)
            callback(err,null)

        callback(null,exist);
    })*/
    callback(null,true);
}

/**
 * SOCIAL
 *
 **/

function createSocialAndInvite(userId, playlistName, idInvited, callback){

    var key = util.getKeyFor(userId,'social');
    var message = "";

    //lo user appartiene gia a qualcosa di social?
    redisClient.exists(key, function(err, exist) {
        if(err)     callback(err, null);
        else {
            if (exist) {
                message = "User: " + userId + " already has a Social Playlist"
                callback(null, message);
            }
            else {

                //lo user sta richiedendo operazioni che includono una playlist valida?
                var key = util.getKeyFor(userId, 'playlist', playlistName);
                redisClient.exists(key, function (err, exist) {
                    if (!exist) {
                        var message = "Playlist Required: " + playlistName + " not exists for user: " + userId;
                        callback(null, message);
                    }
                    else {

                        //how to check if userB exist?
                        //id social playlist incremental
                        var social = util.createDefaultSocialPlaylist(userId, idInvited);
                        console.log("working on a new social playlist with ID: " + social.id)
                        var songs = [];
                        //recuperare le canzoni della playlist che si vuole 'esportare'
                        var key = util.getKeyFor(userId, 'playlist', playlistName);
                        redisClient.lrange(key, 0, -1, function (err, result) {
                            if (err) {
                                callback(err, null);
                                return;
                            }

                            songs = result;

                            var key = util.getKeyFor(userId, 'social');
                            //l' id della playlist social viene salvato nel campo social dell'utente
                            redisClient.set(key, social.id, function (err) {
                                if (err)    callback(err, null);
                                else {
                                    //viene istanziata nel db la social playlsit
                                    redisClient.set('social:' + social.id, JSON.stringify(social), function (err) {
                                        if (err)    callback(err, null);
                                        else {
                                            console.log('TRYING zadd socialId : ' + social.id + ' for song: ' + songs);

                                            var mess = "";
                                            var count_verify = 0;
                                            for (var i = 0; i < songs.length; i++) {
                                                redisClient.zadd('social:' + social.id + ':songs', "1", songs[i], function (err, reply) {
                                                    if (reply == 1)
                                                        count_verify++;
                                                });
                                            }
                                            if (count_verify == songs.length) {
                                                console.log('WELL DONE: Inserted song :[' + mess + '] in social id: ' + social.id);
                                            }
                                            else {
                                                console.log('MAYBE ERROR : not all songs are inserted in right way');
                                            }

                                            //vengono salvate le canzoni della social playlsit
                                            // client.zadd('social:' + social.id+':songs', 1, JSON.stringify(songs), function (err) {
                                            /**
                                             * user:social                  -> no playlist
                                             * user:playlist:playlistname   -> valid
                                             * user:social                  -> id social playlist
                                             * social:id                    -> social playlist
                                             * social:id:songs              -> songs of social playlist
                                             *
                                             */

                                                //si crea il websocket con l'utente che ha effettuateo la richeista
                                                //a UserB si invia una push notification con lo medesemico scopo
                                                //cioe che UserB ottiene una notifica per la partecipazione ad una social playlist
                                                // e può attivare un websocket verso il server, con le informazioni 'esatte'
                                                // come ad esempio la room..cioe'l'id della social playlist'

                                                //simuling
                                            redisClient.set('pending:' + idInvited, social.id, function () {
                                                if (err)    callback(err, null)
                                                else {
                                                    callback(null, social.id);
                                                    console.log('yes fuck yes socialId : ' + playlistName + ' at key: pending:' + idInvited);
                                                }

                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        }
    });
}


/**
 * Set value for social:id:permission
 *
 * Modify are allowed only the userId is the creator or an admin
 */

function updateSocialPermission(userId, permission, callback){

    var key = util.getKeyFor(userId,'social');

    redisClient.get(key, function(err, socialId) {
        if(err)     callback(err, null);
        else {
            if (socialId == null) {
                console.log("requested updated permission but user have none social playlist.");
                callback(err, null);
            }
            else {
                var key = 'social:' + socialId;
                redisClient.get(key, function (err, value) {
                    if (err)    callback(err, null);
                    else {
                        if (value == null) {
                            var message = "Social playlist: " + socialId + " no have default permission setted!!";
                            callback(null, message);
                        }
                        else {
                            var index = value.admins.indexOf(userId);
                            if (value.creator == userId || index > -1) {
                                redisClient.set(key, permission, function (err) {
                                    if (err) {
                                        callback(err, null);
                                    }
                                    else {
                                        var message = "Permission updated";
                                        callback(null, message);
                                    }
                                })
                            }
                            else {
                                var message = "The user doesn't have the required admin skill to modify permissione";
                                callback(null, message);
                            }
                        }
                    }

                });
            }
        }
    });
}


module.exports.getGeo = getGeo;
module.exports.setGeo = setGeo;

module.exports.getPermission = getPermission;
module.exports.setPermission = setPermission;

module.exports.createPlaylist          = createPlaylist;
module.exports.addSongToPlaylist       = addSongToPlaylist;
module.exports.getSongsPlaylist        = getSongsPlaylist;
module.exports.getNamesPlaylist        = getNamesPlaylist;
module.exports.getAllPlaylistDetailed  = getAllPlaylistDetailed;

module.exports.addSong             = addSong;
module.exports.getAllHistorySongs  = getAllHistorySongs;
module.exports.getRecentSongs      = getRecentSongs;

module.exports.createSocialAndInvite  = createSocialAndInvite;
module.exports.updateSocialPermission = updateSocialPermission;
