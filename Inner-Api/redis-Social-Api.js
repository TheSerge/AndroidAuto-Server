/**
 * Created by Sergio on 04/12/2015.
 */
var  redis = require('redis')
    , redisClient = redis.createClient()
    , util = require('../util');


/**
 *  1. user has a socketId associated? (creator)
 *  1. user has a social:pending associated? (invited)
 *
 * */
function handleOnConnection(userId, socketId, callback){
    console.log('SOCIAL: <<connection>> received');
    console.log('SOCIAL: userId: '+userId+' sock: '+socketId);

    var key = util.getKeyFor(userId,'socketId');
    redisClient.set(key,socketId,function(err){
        if(err)
            callback(err,null);

        discoverSocialId(userId, function(err, data){
            if(err)
                callback(err,null);

            callback(null,data);
            });
        });

}

/**
 * Retrieve the socialID of social playlist that user needs to join in.
 * from social:id  -creator
 * from pending:id -invited
 */
function discoverSocialId(userId, callback){
    var socialId;
    var socialIdpending;
    var role;

    var key = util.getKeyFor(userId,'social');
    redisClient.get(key, function(err, social){
        if(err)
            callback(err,null);

        if(social!=null && social!=undefined) {
            socialId = social;
            role = "creator";
            console.log('SOCIAL: reading db socialId: '+socialId);
            callback(null, {socialId: socialId, role: role});
        }
        else {
            redisClient.lrange('pending:' + userId, 0, -1, function (err, pendings) {
                if (err)
                    callback(err, null);
                else if(pendings==null)
                    callback(null,{socialId : null});
                    else{
                        role = "invited";
                        for (var i = 0; i < pendings.length; i++) {
                            console.log('SOCIAL: reading db pending: ' + pendings[i]);
                        }

                        callback(null, {socialId: pendings, role: role});
                    }
            });
        }
    });
}

function handleVoteSong(socialId, idSong, callback){
    console.log('SOCIAL: <<vote_song>> received');

    //TODO if song & if social exist

    var key = 'social:'+socialId+':songs';
    console.log('SOCIAL: doing operation for key: '+key + ' with idsong: '+idSong);

    redisClient.zadd(key, 'xx', 1,  idSong, function(err, response){
        if(err)
            callback(err,null);

        redisClient.zrangebyscore(key,'-inf','+inf', function(err, songs){
            if(err)
                callback(err,null);

            callback(null,songs.reverse());
        });
    });

}

function updatingSocialAndPendingEntry(userId, socialId){
    var key = util.getKeyFor(userId, 'social');

    redisClient.set(key, socialId, function(err){
        redisClient.del('pending:'+userId, function(err, value){
            if(value==1) {
                console.log('SOCIAL: deleted pending entry');
            }

        })
    })

}

/**
 * Update value for user:social:socketId
 *
 * Return: old value of social playlist. Need socket.leave
 *         'ok' if no existing previously social
 */
function handleJoin(userId, socialId, callback){
    console.log('SOCIAL: <<join_room>> received');

    var key = util.getKeyFor(userId, 'social');
    redisClient.get(key, function(err, value){
        if(err) {
            callback(err, null);
            return;
        }

        if(value!=socialId)
            callback(null,false);

        callback(null,true);

        /*
        var key = util.getKeyFor(userId,'socketId');

        redisClient.set(key, socketId, function(err){
            if(err)
                callback(err,null);

            console.log('SOCIAL: db user:social:socketId updated.. new value: '+socketId + ' setted in handleJoin');
            callback(null,ret);
        })*/
    });

}

function handleLeave(userId, socialId, callback){
    var key = util.getKeyFor(userId, 'social');
    redisClient.get(key, function(err, sId){
        if(err)
            callback(err,null)

        if(sId==null) {
            console.log('user is registered for no one social');
            callback('user is registered for no one social', null);
            return;
        }

        if(sId!=socialId) {
            console.log('required del for social:'+socialId+' while user:'+userId+' is registered for another social(ID:'+sId+')');
            callback('required del for social:'+socialId+' while user:'+userId+' is registered for another social(ID:'+sId+')',null);
            return;
        }
        redisClient.del(key, function(err,value){
            if(err)
                callback(err,null);
            if(value==1) {
                console.log('Deleted from DB userId:social')
                callback(null,'ok');
            }
        })
    })
}

function addFriend(socialId, idInvited, callback){
    //if(alreday has a social -> pending)

    var key = util.getKeyFor(idInvited, 'social');
    redisClient.get(key, function(err, old_social){
        if(err)
            callback(err,null);
        else {
            if (socialId == old_social) {
                console.log('User: ' + idInvited + ' already partecipating to social: ' + socialId);
                callback('User: ' + idInvited + ' already partecipating to social: ' + socialId, null)
            }
            else {
                redisClient.lpush('pending:' + idInvited, socialId, function (err, ok) {
                    if (err)
                        callback(err, null);
                    else {
                        console.log('pending:' + idInvited + '  UPDATED!!! (value: ' + socialId + ')');
                        callback(null, ok);
                    }
                })
            }
        }
    })
}



module.exports.updatingSocialAndPendingEntry = updatingSocialAndPendingEntry
module.exports.handleOnConnection = handleOnConnection
module.exports.handleVoteSong     = handleVoteSong
module.exports.handleJoin         = handleJoin
module.exports.handleLeave        = handleLeave

module.exports.addFriend          = addFriend

