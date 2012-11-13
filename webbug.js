/**
 * Web Bug
 */
var http = require('http'),
    url = require('url'),
    databaseUrl = "localhost:27017/mydb", // "username:password@example.com/mydb"
    collections = ["users"],
    db = require("mongojs").connect(databaseUrl, collections);

/**
 * Main Server
 */
http.createServer(function (req, res) {

    var requestURL = url.parse(req.url, true)['pathname'],
        counter = 0,
        ip = req.connection.remoteAddress;

    if (requestURL == '/t') {

        console.log('Web Bug Request');

        var imgHex = '47494638396101000100800000dbdfef00000021f90401000000002c00000000010001000002024401003b';
        var imgBinary = new Buffer(imgHex, 'hex');

        res.writeHead(200, {'Content-Type':'image/gif' });

        // Setting and clearing an interval
        var size = imgBinary.length, start = new Date();

        var interval = setInterval(function () {
            var byte = imgBinary.slice(counter, counter + 1);
            res.write(byte, 'hex');
            counter++;
            console.log('step:' + counter + '/' + size);
            if (counter >= size) {
                clearInterval(interval);
                //req.connection.emit('close');
                req.connection.removeListener('close', endLog);
                res.end();
                console.log('Image Done.');
                logData(req, ip, start);
            }
        }, 250);

        // When connection closed (e.g. closing the browser)
        req.connection.addListener('close', endLog = function () {
            clearInterval(interval);
            res.end();
            console.log('User Closed Connection.');
            logData(req, ip, start);
        });

    } else {

        console.log('Bad Request.');
        res.writeHead(404, {'Content-Type':'text/plain' });
        res.end('Bad Request!');

    }

}).listen(8080);

console.log('Web Bug Server Started on localhost:8080');

/**
 * Function to Log Data to DB
 */
logData = function (req, ip, start) {

    // Init
    var end = Date.now(),
        tm = end - start, // time in milliseconds
        id = url.parse(req.url, true)['query']['id'],
        ua = req.headers['user-agent'];

    // Do logging
    db.users.save({'tm':tm, 'id':id, 'ip':ip, 'ua':ua}, function (err, saved) {
        if (err || !saved) {
            console.log('User not saved: ' + err);
        } else {
            console.log('Logged: time: ' + tm + 'ms id: ' + id + ' ip: ' + ip + ' user-agent: ' + ua);
        }
    });

}

