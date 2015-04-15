var connect = require('connect');
var serveStatic = require('serve-static');

var MarketStream = require("zaif-market-stream").MarketStream;
var pair = 'mona_jpy';

var ms = new MarketStream(pair);
ms.on("depth", function(now, old){
    broadcast('depth', now);
    console.log(now);
})
ms.on("lastprice", function(now, old){
    broadcast('lastprice', now);
    console.log(now);
})
ms.on("trades", function(now, old){
    console.log(now.map(function(v){return [v.tid, v.price, v.amount]}));
    console.log(old.map(function(v){return [v.tid, v.price, v.amount]}));
})
var sockets = {};
var uniqid = 0;
var broadcast = function(key, data){
    for(var id in sockets){
        sockets[id].emit('message', JSON.stringify({key:key, data:data}));
    }
};
ms.start().then(function(){
    var httpServer = connect()
        .use(serveStatic(__dirname + '/webroot'))
        .listen(9999);
    var io = require('socket.io').listen(httpServer);
    io.sockets.on('connection', function (client) {
        var id = ++uniqid;
        sockets[id] = client;

        var obj = {
            depth:ms.depth(),
            lastprice:ms.lastPrice(),
        };
        for(var key in obj){
            sockets[id].emit('message', JSON.stringify({key:key, data:obj[key]}));
        }

        client.on('message', function(message){
        });
        client.on('disconnect', function(err) {
            delete sockets[id];
        });
    });
})

