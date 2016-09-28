var usersPath;
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('underscore');
var request = require('request');
var express = require('express');
var router = express.Router();

usersPath = path.join(process.env.APP_DIR, 'data/users.json');

router.get('/', function(req, res, next) {
    
    res.send(loadUsers());
});

// router.post('/endpoint/:id([0-9a-zA-Z]{1,20})', function(req, res, next) {
router.post('/endpoint', function(req, res, next) {
    var data, endpoint, userName, regid;

    data = parseParams(req);
    
    saveUser({
        userName: data.userName,
        endpoint: data.endpoint,
        regid: data.regid
    });
    
    res.end();
});

router.delete('/endpoint', function(req, res, next) {
    var data, endpoint, userName, regid;

    data = parseParams(req);
    
    deleteUser({
        userName: data.userName,
        endpoint: data.endpoint
    });
    
    res.end();
});

router.post('/push', function(req, res, next) {
    var apikey, data, endpoint, userName, regid;
    
    apikey = process.env.GCM_KEY;

    data = req.body || {};
    
    regid = data.regid || data.endpoint.split('/').pop() || '';
    
    if(!regid) {
        
        res.status(400).end();
        return;
    }
    
    console.log('data', Number(data.interval));
    
    setTimeout(function(){
        var options = {};
        
        options.method = 'POST';
        options.url = 'https://android.googleapis.com/gcm/send';
        options.headers = {
            'Authorization':  'key=' + apikey,
            'Content-Type': 'application/json'
        };
        options.body = JSON.stringify({
            to: regid,
            data: {
                msg: 'hello',
                ts: new Date().getTime()
            }
        });
        
        request( options, function( error, response, body ) {
            
            if(error) {
                console.log('error occurred.', error);
                return;
            }
            
            console.log('push request successful ', response.body);
            // console.log('push request successful body ', body);
        });

    }, (data.interval * 1000) || 1);
    
    res.end();
});

function parseParams(req) {
    var data, endpoint, userName, regid;

    data = req.body || {};
    
    return {
        userName: data.userName,
        endpoint: data.endpoint,
        regid: data.endpoint.split('/').pop()
    };
}

function loadUsers() {
    
    var userFiles, data;
    
    userFiles = glob.sync(usersPath);
    
    if(!userFiles.length) {
        
        return [];
    }
    
    data = fs.readFileSync(userFiles[0], 'utf8');
    
    return data ? JSON.parse(data): [];
}

function saveUser(data, opt) {
    
    var users = loadUsers();
    
    users.push(data);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, '    '), 'utf8');
}

function deleteUser(data, opt) {
    
    var users = loadUsers();
    
    // console.log('users', users)
    
    users = _.reject(users, function(v){
        
        if(v.userName === '') {
            return true;
        }
        
        if(data && data.userName) {
            
            return data.userName === v.userName;
        }
        
        if(data && data.regid) {
            
            return data.regid === v.regid;
        }
        
        console.log('v.userName', v)
        
        return v.userName === '';
    });

    fs.writeFileSync(usersPath, JSON.stringify(users, null, '    '), 'utf8');
}

module.exports = router;
