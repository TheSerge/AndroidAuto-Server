var util        = require('util');
var dateformat  = require('dateformat');
var model   = module.exports;
var mysql = require('mysql');
var config = require('config');
var pool = mysql.createPool(config.get("oauth_mysql"));


model.getAccessToken = function(bearerToken, callback){     //callback(error, accessToken)
    pool.getConnection(function(err,connection){
        if(err){
            console.log(err);
            callback(err, null);
        } else {
            var query = 'SELECT accessToken, clientId, expires, userId FROM oauth_access_tokens WHERE accessToken =\''+bearerToken+'\';';
            connection.query(query, function(err, res){
                connection.release();
                if ( err ) {
                    console.log(err);
                    callback(err, null);
                } else if ( res && res[0] ){
                    callback(null, {
                        accessToken: res[0].accessToken,
                        clientId: res[0].clientId,
                        expires: res[0].expires,
                        userId: res[0].userId
                    });
                } else {
                    callback(null, false)
                }
            });
        }
    });
}

model.getClient = function (clientId, clientSecret, callback) {
    console.log('getClient -> '+clientId+', '+clientSecret);
    pool.getConnection(function(err,connection) {
        if ( err ) {
            console.log(err);
            callback(err, null);
        } else {
            var query = 'SELECT clientId, clientSecret FROM oauth_clients WHERE clientId = \''+clientId+'\';';
            connection.query(query, function (err, res){
                connection.release();
                if ( err ) {
                    console.log(err);
                    callback(err, null);
                } else if ( res && res[0] ){
                    console.log('getClient query no err and res is ok, '+util.inspect(res[0]));
                    if (clientSecret !== null && res[0].clientSecret !== clientSecret) {
                        callback(new Error('wrong clientSecret'), null);
                    } else {
                        callback(null, {
                            clientId: res[0].clientId
                            //,clientSecret: res[0].clientSecret
                        });
                    }
                } else{
                    callback(null, false);
                }
            });
        }
    });
}


model.grantTypeAllowed = function(clientId, grantType, callback){
    console.log('grantTypeAllowed -> '+clientId+', '+grantType);
    if ( grantType === 'password' || grantType === 'refresh_token' )
        callback(null, true);
    else
        callback(null, false);
}

model.saveAccessToken = function (accessToken, clientId, expires, userId, callback) {
    console.log('saveAccessToken -> '+accessToken+', '+clientId+', '+expires+', '+util.inspect(userId));
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            //console.log('saveAccessToken old expires -> '+expires);
            var day=dateformat(expires, "UTC:yyyy-mm-dd HH:MM:ss");
            //console.log('saveAccessToken new expires -> '+day);
            var _userId = (userId.email ? userId.email : (userId.id?userId.id:''));
            var query = 'INSERT INTO oauth_access_tokens(accessToken, clientId, userId, expires) VALUES(\'' + accessToken +'\', \'' + clientId +'\', \''+ _userId +'\', \''+ day +'\');'

            connection.query(query, function (err, res) {
                connection.release();
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    (res && res.insertId) ? callback(null, res) : callback(new Error());
                }
            });
        }
    });
}



model.getUser = function(username, password, callback) {
    console.log('getUser -> '+username+', '+password);
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            var query = 'SELECT * FROM users WHERE username = \'' + username + '\' AND password = \'' + password + '\';';
            connection.query(query, function (err, res) {
                connection.release();
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (res && res[0]) {
                    console.log('getUser res -> \n'+util.inspect(res[0]));
                    callback(null, {
                        'id':           res[0].email,
                        'username':     res[0].username,
                        'password':     res[0].password,
                        'firstname':    res[0].firstname,
                        'lastname':     res[0].lastname,
                        'email':        res[0].email
                    });
                } else {
                    console.log('getUser res is null');
                    callback(null, false)
                }
            });
        }
    });
}

model.saveRefreshToken = function (refreshToken, clientId, expires, userId, callback) {
    console.log('saveRefreshToken -> '+refreshToken+', '+clientId+', '+expires+', '+util.inspect(userId));
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            var day=dateformat(expires, "UTC:yyyy-mm-dd HH:MM:ss");
            var _userId = (userId.email ? userId.email : (userId.id?userId.id:''));
            var query = 'INSERT INTO oauth_refresh_tokens(refreshToken, clientId, userId, expires) VALUES(\'' + refreshToken +'\', \'' + clientId +'\', \''+ _userId +'\', \''+ day +'\');'
            console.log('saveRefreshToken query -> '+query);
            connection.query(query, function (err, res) {
                connection.release();
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    (res && res.insertId ) ? callback(null) : callback(new Error());
                }
            });
        }
    });
}

model.getRefreshToken = function(bearerToken, callback){
    console.log('getRefreshToken -> '+bearerToken);
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            var query = 'SELECT refreshToken, clientId, expires, userId FROM oauth_refresh_tokens WHERE refreshToken = \''+ bearerToken +'\';'
            connection.query(query, function (err, res) {
                connection.release();
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else{
                    ( res && res[0] ) ? callback(null, res[0]) : callback(new Error(), null);
                }
            });
        }
    });
}