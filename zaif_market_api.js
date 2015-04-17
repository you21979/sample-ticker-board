var ZMS = require('zaif-market-stream');
var Promise = require('bluebird');
var http = require('http');
var url = require('url');
var ms = {
    mona_jpy: new ZMS.MarketStream('mona_jpy'),
    btc_jpy: new ZMS.MarketStream('btc_jpy'),
    mona_btc: new ZMS.MarketStream('mona_btc'),
};
Promise.all(Object.keys(ms).map(function(key){
    return ms[key].start()
})).then(function(){
    serverstart(ms);
})

var serverstart = function(ms){
    http.createServer(function (request, response) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        var urlinfo = url.parse( request.url , true );
        switch(urlinfo.pathname){
        case '/depth':
            if( 'pair' in urlinfo.query ){
                response.write(JSON.stringify(ms[urlinfo.query.pair.toLowerCase()].depth()));
                response.end();
            }
            break;
        case '/lastupdate':
            if( 'pair' in urlinfo.query ){
                response.write(JSON.stringify(ms[urlinfo.query.pair.toLowerCase()].lastUpdate()));
                response.end();
            }
            break;
        case '/history':
            if( 'pair' in urlinfo.query ){
                response.write(JSON.stringify(ms[urlinfo.query.pair.toLowerCase()].trades()));
                response.end();
            }
            break;
        default:
            response.end();
            break;
        }
    }).listen(8080);
}
