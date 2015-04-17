var URL = window.URL || window.webkitURL;
var doc = document;
var socket = null;

function connect(){
//    socket = new WebSocket('ws://' + location.host);
    socket = new io.connect('http://' + location.host);
}
connect();

var update_lastprice = function(key, value){
    var elem = doc.getElementById(key);
    var text = [
        '<table class="ticker">',
        '<th colspan=1>lastprice</th>',
        '<tr>',
            '<td>', value['action'], '</td>',
        '</tr>',
        '<tr>',
            '<td>', value['price'], '</td>',
        '</tr>',
        '</table>',
    ].join('');
    elem.innerHTML = text;
}
var update_depth = function(key, value){
    var elem = doc.getElementById(key);
    var ask = [
            value['asks'].reverse().map(function(v){return [
                '<tr>',
                '<td>', v[1], '</td>','<td>', v[0], '</td><td> </td>',
                '</tr>',
                ''
            ].join('')}).reduce(function(r, v){return r + v}, ""),
        ''
    ].join('');
    var bid = [
            value['bids'].map(function(v){return [
                '<tr>',
                '<td> </td><td>', v[0], '</td>','<td>', v[1], '</td>',
                '</tr>',
                ''
            ].join('')}).reduce(function(r, v){return r + v}, ""),
        ''
    ].join('');

    var text = [
        '<table class="ticker">',
        '<th colspan=1>depth</th>',
        '<tr>',
            '<table>',
            ask,
            bid,
            '</table>',
        '</tr>',
        '</table>',
    ].join('');
    elem.innerHTML = text;
}
// ----------------------------------------
// 初期化
// ----------------------------------------
var initialize = function(){
    socket.on('connect', function(){
        socket.on('disconnect', function() {
            alert('サーバーから切断されました');
        });
        socket.on('message', function(data){
            var obj = JSON.parse(data);
            if(obj.key==="depth")update_depth(obj.key, obj.data);
            if(obj.key==="lastprice")update_lastprice(obj.key, obj.data);
        });
    });
};
(function(){
    initialize();
})();

