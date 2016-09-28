/* globals Notification, MessageChannel, clients, self, _ */

var port;
var endpoint;
// var self = window.self;

self.addEventListener( 'push', function( event ) {

    var obj;
    
    console.log('we got a push', event);
    fireNotification( obj, event );
    return;
    
    // obj = event.data.json();

    if ( obj.action === 'subscribe' || obj.action === 'unsubscribe' ) {

        fireNotification( obj, event );
        // port.postMessage( obj );
    } else if ( obj.action === 'init' || obj.action === 'chatMsg' ) {

        // port.postMessage( obj );
    }
});

self.addEventListener( 'notificationclick', function( evt ) {

    evt.notification.close();
    
    console.log('notification clicked:', location);
    
    evt.waitUntil(clients.matchAll({
        type: 'window'
    }).then(function( evt ) {
        
        console.log('clients.matchAll', evt);

        // var p = location.pathname.split( '/' );
        // p.pop();
        // p = location.protocol + '//' + location.hostname + ( location.port ? ':' + location.port : '' ) + p.join( '/' ) + '/';
        // for ( var i = 0; i < evt.length; i++ ) {

        //     var c = evt[i];
        //     if ( ( ( c.url == p ) || ( c.url == p + 'index.html' ) ) && ( 'focus' in c ) ) {

        //         return c.focus();
        //     }
        // }
        // if ( clients.openWindow )
        //     return clients.openWindow( './' );
    }));
});

self.addEventListener( 'notificationclose', function( evt ) {

    console.log('notification closed');
});

self.onmessage = function( e ) {
    
    var data;

    // console.log( 'sw onMessage', e );
    
    data = e.data ? JSON.parse(e.data): '',
    port = e.ports[0];
    
    if(!data || !data.type) {
        return;
    }
    
    if(data.type === 'endpoint') {
        
        endpoint = data.msg;

        console.log( 'endpoint', endpoint );
    }
    
    if(data.type === 'msg') {
        
        port.postMessage( 'i got your message: ' + data.msg );
    }
}

function fireNotification( obj, event ) {

    var body;
    var title = 'Subscription change';
    // body = obj.name + ' has ' + obj.action + 'd.';
    var icon = 'img/push-icon.png';
    var tag = 'push';
    
    body = 'You\'ve got a push dude.'

    event.waitUntil( self.registration.showNotification( title, {
        body: body,
        icon: icon,
        tag: tag
    }) );
}
