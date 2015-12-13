/**
 * Created by Sergio on 25/11/2015.
 */
var  util = require('../util')
    , api = require('../Inner-Api/redis-Social-Api.js');

var title = 'Event-Api';
var std = 'Event:  ';

//l'evento connection avviene quando un utente richiede di partecipare ad una social playlist.
//la richiesta esplicita di invito verso un altro utente equivale alla creazione di una social playlist
//se l'utente al momento non ha attiva nessuna social playlist, si da via alla magia..

module.exports  = function(io){
    io.on('connection', function (socket) {
        var userId = socket.handshake.session.id;

        //set user:userId:socketId and
        //retrieve socialId from user:userId:social or pending:userId stored now in 'data'
        api.handleOnConnection(userId, socket.id, function(err,data){
            //TODO if(err) boooooh

            if(data.socialId==null){
                    console.log('no action started')
                    return;
                }

            socket.emit('need_join', data);
            console.log('SOCIAL: emitted \'need_join\'  for room: ' + data.socialId + ' at user: ' + userId);

            socket.on('join_room', function(data){

                //check if data.socialId is equal to user:social
                api.handleJoin(userId, data.socialId, function(err,ok) {
                    //TODO if(err) booooh
                    if (ok == false) {
                        //TODO if(err) booooh
                        socket.leave(data.socialId);
                    }
                    else {
                        socket.join(data.socialId, function () {
                            console.log('SOCIAL: userId: ' + userId + ' joined room: ' + data.socialId);

                            socket.broadcast.to(data.socialId).emit('joined', {
                                socialId: data.socialId,
                                userId: socket.handshake.session.id
                            })
                            console.log('SOCIAL: emitted \'joined\' in broadcast for room: ' + data.socialId);

                            //save social in user:userId:social and delete if existing pending:userId
                            api.updatingSocialAndPendingEntry(userId, data.socialId);
                        });
                    }
                });
            });
        });

        socket.on('vote_song', function (data) {

            api.handleVoteSong(data.socialId, data.song, function(err, songs){
                //TODO if(err) boooh

                io.sockets.in(data.socialId).emit('rank_updated',{
                    message: 'song :'+data.song + ' has been updated',
                    songs: songs
                });
                console.log('SOCIAL: emitted \'rank_updated\' in broadcast for room: '+data.socialId);
            })

        });

        socket.on('leave_room', function (data) {
            console.log('SOCIAL: <<leave_room>> received');
            api.handleLeave(userId, data.socialId, function(err,ok){
                //TODO if(err) boooog
                if(ok=='ok') {
                    socket.leave(data.socialId);
                    io.sockets.in(data.socialId).emit('message',{
                        message: 'The user '+userId+' leaves the room'
                    });
                    console.log('SOCIAL: emitted \'message\' in broadcast for room: '+data.socialId);
                    console.log('SOCIAL: <<leave_room>> done!');
                }
            });
         });

        socket.on('add_friend', function (data) {
            console.log('SOCIAL: <<add_friend>> received');
            if(io.rooms.indexOf(data.socialId)>-1) {
                api.addFriend(userId, data.socialId, function (err, ok) {
                    //TODO if(err) booooh
                    if (ok == 'ok') {
                        socket.leave(data.socialId);
                        console.log('SOCIAL: <<leave_room>> done!');
                    }
                });
            }
        });
    });
}
