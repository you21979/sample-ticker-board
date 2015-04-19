var connect = require('connect');
var serveStatic = require('serve-static');
var moment = require('moment');

var MarketStream = require("zaif-market-stream").MarketStream;
var pair = 'mona_jpy';

var ms = new MarketStream(pair);
ms.on("depth", function(now, old){
    broadcast('depth', ms.lastUpdate(), now);
})
ms.on("lastprice", function(now, old){
    broadcast('lastprice', ms.lastUpdate(), now);
})
ms.on("trades", function(now, old){
    broadcast('trades', ms.lastUpdate(), now);
})
var sockets = {};
var uniqid = 0;
var broadcast = function(key, time, data){
    for(var id in sockets){
        sockets[id].emit('message', JSON.stringify({key:key, lastupdate:time, data:data}));
    }
};
ms.start().then(function(){
    ms.conn.debuglog = function(x){
        console.log([].concat([moment().format('YYYY/MM/DD HH:mm:ss')], x).join(','))
    };
    var httpServer = connect()
        .use(serveStatic(__dirname + '/webroot'))
        .listen(9999);
    var io = require('socket.io').listen(httpServer);
    io.sockets.on('connection', function (client) {
        console.log('incoming client: ' + client.client.conn.remoteAddress);

        var id = ++uniqid;
        sockets[id] = client;

        var obj = {
            depth:ms.depth(),
            lastprice:ms.lastPrice(),
            trades:ms.trades(),
        };
        for(var key in obj){
            sockets[id].emit('message', JSON.stringify({key:key, lastupdate:ms.lastUpdate(), data:obj[key]}));
        }

        client.on('message', function(message){
        });
        client.on('disconnect', function(err) {
            delete sockets[id];
        });
    });
})

