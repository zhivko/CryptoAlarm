'use strict';
var url = require('url');
var http = require('http');
var https = require('https');
var moment = require('moment');
var fs = require('fs');
const readline = require('readline');

loadHystoricalData();

var port = process.env.PORT || 1337;

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

    var file = req.url.substring(1, req.url.length);

    if (req.url.endsWith('index.html')) {
        fs.readFile('index.html', 'utf-8', function (err, data) {
            response.writeHead(200, { 'Content-Type': 'text/html' });

            var chartData = [];
            for (var i = 0; i < 7; i++)
                chartData.push(Math.random() * 50);

            //var result = data.replace('{{chartData}}', JSON.stringify(chartData));
            var result = data.replace('data.csv', 'bybit_data.csv');
            //var result = data;
            response.write(result);
            response.end();
        });
    }
    /*
    else if (req.url.endsWith(file)) {
        fs.readFile(file, 'utf-8', function (err, data) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
        });
    }
    */
}

const server = http.createServer(requestListener);

server.listen(1337, '127.0.0.1');


async function loadHystoricalData() {
    // https://bybit-exchange.github.io/docs/inverse/#t-querykline
    
    var url1 = "https://api.bybit.com/v2/public/kline/list"

    var fs = require('fs');

    /*
    fs.unlink('bybit_data.csv', function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
    });
    fs.writeFile('bybit_data.csv', "", function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
    */
    var d2 = new Date();
    const dayCount = 3;
    var endTime = parseInt(d2.getTime() / 1000);
    var d1 = new Date();
    d1.setDate(d2.getDate() - dayCount);
    var startTime = parseInt(d1.getTime() / 1000);
    var MS_PER_MINUTE = 60000;
    var limitMinutes = 200;

    
    var lastLineStr;
    const readLastLine = require('read-last-line');
    await readLastLine.read('bybit_data.csv', 100000).then(function (lines) {
        lastLineStr = lines;
    }).catch(function (err) {
        console.log(err.message);
    });

    var date = d1;

    while (date < d2) {
        var done = false;
        var dateTime = parseInt(date.getTime() / 1000);
        var requestUrl = url.parse(url.format({
            protocol: 'https',
            hostname: 'api.bybit.com',
            pathname: '/v2/public/kline/list',
            query: {
                symbol: 'BTCUSD',    // https://api.bybit.com/v2/public/tickers
                interval: '1',       // Kline interval(interval) 1 - 1 minute,  3 - 3 minutes,   5 - 5 minutes ... D - 1 day, W - 1 week, M - 1 month
                from: dateTime,     // From timestamp in seconds
                limit: limitMinutes  // Limit for data size, max size is 200. Default as showing 200 pieces of data
            }
        }));

        console.log("Date: " + date + " url:" + requestUrl.protocol + "/" + requestUrl.hostname + "/" + requestUrl.path);

        var req = https.get({
            hostname: requestUrl.hostname,
            path: requestUrl.path,
        }, (res) => {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                // console.log(body);
                const obj = JSON.parse(body);

                if (obj.result != null) {
                    //Date,Open,High,Low,Close,Volume
                    //27-May-14

                    var array = [];
                    for (var i = 0, length = obj.result.length; i < length; i++) {
                        var open_time = new Date(obj.result[i].open_time * 1000);
                        var timeFormatted = moment(open_time).format('DD-MMM-YYYY HH:mm:ss');
                        var line = timeFormatted + "," + obj.result[i].high + "," + obj.result[i].low + "," + obj.result[i].close + "," + obj.result[i].volume + "\r\n";
                        array.push({
                            name: obj.result[i].open_time,
                            value: line
                        });
                    }

                    var sorted = array.sort(function (a, b) {
                        return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)
                    });

                    for (var i = 0, length = sorted.length; i < length; i++) {
                        fs.appendFile('bybit_data.csv', sorted[i].value, 'utf8',
                            function (err) {
                                if (err) throw err;
                            });
                    }

                }
                else {
                    console.log("No historical data from ByBit");
                }
                done = true;
            });
        });
        req.on('error', function (err) {
            console.log("Something went wrong");
            console.log(err);
            done = true;
        });
        while (!done) {
            await sleep(100);
        }
        date = new Date(date.getTime() + limitMinutes * MS_PER_MINUTE);
    }

}

const toTimestamp = (strDate) => {
    const dt = new Date(strDate).getTime();
    return dt / 1000;
}

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}


function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
