'use strict';
var url = require('url');
var http = require('http');
var https = require('https');

loadHystoricalData();


var port = process.env.PORT || 1337;
var fs = require('fs');

const { WebsocketClient } = require('bybit-api');
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const wsConfig = {
    key: API_KEY,
    secret: API_SECRET,

    /*
      The following parameters are optional:
    */

    // defaults to false == testnet. Set to true for livenet.
    livenet: true,

    // NOTE: to listen to multiple markets (spot vs inverse vs linear vs linearfutures) at once, make one WebsocketClient instance per market

    // defaults to inverse:
    // market: 'inverse'
    // market: 'linear'
    // market: 'spot'

    // how long to wait (in ms) before deciding the connection should be terminated & reconnected
    // pongTimeout: 1000,

    // how often to check (in ms) that WS connection is still alive
    pingInterval: 10000,

    // how long to wait before attempting to reconnect (in ms) after connection is closed
    reconnectTimeout: 500,

    // config options sent to RestClient (used for time sync). See RestClient docs.
    // restOptions: { },

    // config for axios used for HTTP requests. E.g for proxy support
    // requestOptions: { }

    // override which URL to use for websocket connections
    wsUrl: 'wss://stream.bytick.com/realtime'
};
const ws = new WebsocketClient(wsConfig);
// subscribe to multiple topics at once
ws.subscribe(['position', 'execution', 'trade']);

// and/or subscribe to individual topics on demand
//ws.subscribe('kline.BTCUSD.1m');

ws.subscribe(['candle', '1', 'BTCUSDT']);
ws.subscribe(['instrument_info', '100ms', 'BTCUSDT']);


// Listen to events coming from websockets. This is the primary data source
ws.on('update', data => {
    console.log('update', data);
});

// Optional: Listen to websocket connection open event (automatic after subscribing to one or more topics)
ws.on('open', ({ wsKey, event }) => {
    console.log('connection open for websocket with ID: ' + wsKey);
});

// Optional: Listen to responses to websocket queries (e.g. the response after subscribing to a topic)
ws.on('response', response => {
    console.log('response', response);
});

// Optional: Listen to connection close event. Unexpected connection closes are automatically reconnected.
ws.on('close', () => {
    console.log('connection closed');
});

// Optional: Listen to raw error events.
// Note: responses to invalid topics are currently only sent in the "response" event.
ws.on('error', err => {
    console.error('ERR', err);
});


const requestListener = function (req, response) {
    if (req.url.endsWith('/')) {
        response.writeHead(302, {
            'Location': 'http://127.0.0.1:1337/index.html'
        });
        response.end();
    }

    if (req.url.endsWith('index.html')) {
        fs.readFile('index.html', 'utf-8', function (err, data) {
            response.writeHead(200, { 'Content-Type': 'text/html' });

            var chartData = [];
            for (var i = 0; i < 7; i++)
                chartData.push(Math.random() * 50);

            //var result = data.replace('{{chartData}}', JSON.stringify(chartData));
            var result = data;
            response.write(result);
            response.end();
        });
    } else if (req.url.endsWith('data.csv')) {
        fs.readFile('data.csv', 'utf-8', function (err, data) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
        });
    }
}

 const server = http.createServer(requestListener);

 server.listen(1337, '127.0.0.1');


function loadHystoricalData() {
    var url1 = "https://api.bybit.com/v2/public/kline/list"

    var d1 = new Date();

    const dayCount = 200;

    var endTime = parseInt(d1.getTime() / 1000);

    var d2 = new Date();
    d2.setDate(d1.getDate() - dayCount);

    var startTime = parseInt(d2.getTime() / 1000);

    const requestUrl = url.parse(url.format({
        protocol: 'https',
        hostname: 'api.bybit.com',
        pathname: '/v2/public/kline/list',
        query: {
            symbol: 'BTCUSD',
            interval: '1',
            from: startTime,
            to: endTime
        }
    }));

    const req = https.get({
        hostname: requestUrl.hostname,
        path: requestUrl.path,
    }, (res) => {

        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            console.log(body);
        });

        console.debug(body);
    })
}

const toTimestamp = (strDate) => {
    const dt = new Date(strDate).getTime();
    return dt / 1000;
}