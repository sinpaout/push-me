/* globals Notification, MessageChannel, clients, _ */
/* jshint unused: false */

var app = app || {};

$(function(){
    
    var isPushEnabled, tmpl;
    var isPushEnabled = false;
    
    var subBtn = document.querySelector( '.subscribe' );
    var msgBtn = document.querySelector( '.sendMsg' );
    var msgTbx = document.querySelector( '.msg' );
    
    var nameForm = document.querySelector( '#form' );
    var nameInput = document.querySelector( '#name-input' );
    
    tmpl = app.tmpl = {};
    
    Notification.requestPermission();

    main();
    
    function main() {
        var msg, sw;
        
        prepareTemplates();
        
        nameForm.onsubmit = function( e ) {

            e.preventDefault();
        };
    
        // nameInput.value = 'Bob';
        
        console.log('doc is ready.')
    
        subBtn.addEventListener( 'click', function() {
    
            if ( isPushEnabled ) {
    
                unsubscribe();
            } else {
    
                subscribe();
            }
        });
        
        msgBtn.addEventListener( 'click', function() {

            msg = document.querySelector('.msg').value;
        
            if(msg === '') {
                return;
            }

            if(sw) {
                
                sendMsg(msg);
            } else {
                
                navigator.serviceWorker.ready.then(function( reg ) {
                    
                    sw = reg.active;
                    sendMsg(msg);
                });
            }
        });
        
        // 通知
        $(document).on('click', 'button.push', function(evt){
            
            var info, interval, $msg;
            
            info = getInfo($(this).closest('li.userItem'));
            interval = $(this).siblings('.interval').val();
            $msg = $(this).siblings('.msg');
            
            // push request
            
            $msg.finish().show();
            
            if(interval == 0) {
                
                $msg.text('即通知します。');
            } else {
                
                $msg.text(interval + ' 秒後に通知します。');
            }
            
            $msg.fadeOut(2000);
            
            info.interval = interval;
            
            $.post('users/push', info).then(function(result) {
                
                console.log('push request successful.');
            }).fail(function(){
                
                $msg.finish().show().text('通知が失敗しました。').fadeOut(2000);
            });
        });
        
        if ( Notification.permission === 'denied' || !('PushManager' in window) || !('serviceWorker' in navigator) ) {
    
            console.log( 'The user has blocked notifications or PushManager not supported.' );
        } else {
            navigator.serviceWorker.register( 'sw.js' ).then(function( reg ) {
                
                getEndpoint().then(function(endpoint){
                    
                    console.log('getEndpoint', endpoint);
                    
                    if(endpoint) {
                        
                        $.get('users').then(function(users, status, xhr){
                            
                            users.forEach(function(v){
                                
                                if(v.endpoint === endpoint) {
                                
                                    nameInput.value = v.userName;
                                }
                            });
                        });
                    }
                    
                    updateStatus(!!endpoint);
                });
            });
        }
        
        createUserList();
        
        function sendMsg(msg) {
            
            var channel;
            
            channel = new MessageChannel();
            channel.port1.onmessage = function( e ) {
    
                console.log( 'port 1 on message', e );
            };

            sw.postMessage( JSON.stringify({type: 'msg', msg: msg}), [channel.port2]);
        }
    }
    
    function createUserList() {
        
        var $ul;
        
        $.get('users').then(function(users, status, xhr){
            
            $ul = $('div.subscribers').children('ul').first();
            $ul.empty();
            
            users.forEach(function(v){
                
                $ul.append(tmpl.userItem({
                    user: v
                }));
            });
        });
    }
    
    function updateStatus(isSubscribe){
        
        // subBtn.disabled = !isSubscribe;
        subBtn.textContent = isSubscribe ? 'Logout': 'Login';
        isPushEnabled = isSubscribe;
        
        nameInput.disabled = false;
        
        if(isSubscribe){
            nameInput.disabled = true;
        }
    }

    function saveEndpoint(userName, endpoint){
        
        $.post('users/endpoint', {
            userName: userName, 
            endpoint: endpoint
        });
    }
    
    function deleteEndpoint(userName, endpoint){
        
        $.ajax('users/endpoint', {
            method: 'DELETE',
            data: {
                userName: userName,
                endpoint: endpoint
            }
        });
    }

    function getEndpoint() {
        
        return getSubscription().then(function( subscription ) {
    
            if ( !subscription ) {

                return null;
            }

            return subscription.endpoint;
        });
    }
    
    function getSubscription() {
        return navigator.serviceWorker.ready.then(function( reg ) {
            
            return reg.pushManager.getSubscription();
        });
    }

    function msgToSW(reg, postData) {
        var channel, sw;
        
        channel = new MessageChannel();
        sw = reg.active;
        sw.postMessage( JSON.stringify(postData), [channel.port2]);
    }
    
    function subscribe() {
    
        var endpoint, userName;
        
        userName = $.trim(nameInput.value);
        
        if(!userName) {
            return;
        }
        
        updateStatus(true);
    
        navigator.serviceWorker.ready.then(function( reg ) {
    
            reg.pushManager.subscribe({
                    userVisibleOnly: true
            }).then(function( subscription ) {
    
                // The subscription was successful
                endpoint = subscription.endpoint;
                saveEndpoint(userName, endpoint);
                
                console.log('subscription successful', endpoint.split('/').pop());
                createUserList();
            })
            .catch(function( e ) {
                
                updateStatus(false);
            });
        });
    }
    
    function unsubscribe() {
        
        var userName;
        userName = nameInput.value;
    
        updateStatus(false);
        
        getSubscription().then(function( subscription ) {

            var endpoint = subscription.endpoint;

            if ( !subscription ) {

                return;
            }

            subscription.unsubscribe().then(function( successful ) {
                
                console.log('unsubscript successful');
                deleteEndpoint(userName, endpoint);
                createUserList();
            }).catch(function( e ) {

                console.log( 'Unsubscription error: ', e );
            });
        }).catch(function( e ) {

            console.log( 'Error thrown while unsubscribing from ' +
            'push messaging.', e );
        });
    }
    
    function prepareTemplates(){
        
        var tn, t, $s;

        $('script[type="text/template"]').each(function(){
            
            $s = $(this);
            tn = $s.data('tmpl-name');
            
            if(!tn){
                return true;
            }
            
            t = $s.html().replace(/([\f\r\n\t\v])/ig, '').replace(/[ ]+/ig, ' ');
            
            tmpl[tn] = _.template(t);
        });
    }
    
    function getInfo(ele){
        
        var $i, $v, info = {};
        
        $i = $(ele).find('.info');
        
        $i.children().each(function(i, v){
            
            $v = $(v);
            
            // set first class name as key
            info[$v.attr('class').split(' ').shift()] = $v.text();
        });
        
        return info;
    }
});


