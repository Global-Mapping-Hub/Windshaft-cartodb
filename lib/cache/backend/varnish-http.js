'use strict';

var http = require('http');

function VarnishHttpCacheBackend (host, port) {
    this.host = host;
    this.port = port;
}

module.exports = VarnishHttpCacheBackend;

/**
 * @param cacheObject should respond to `key() -> String` method
 * @param {Function} callback
 */
VarnishHttpCacheBackend.prototype.invalidate = function (cacheObject, callback) {
    var req = http.request({
        method: 'PURGE',
        hostname: this.host,
        port: this.port,
        path: '/key',
        headers: {
            'Invalidation-Match': '\\b' + cacheObject.key() + '\\b'
        }
    }, function (response) {
        response.resume();
        if (response.statusCode !== 204) {
            return callback(new Error('Unable to invalidate Varnish object'));
        }
        return callback(null);
    });

    req.on('error', function () {
        callback(new Error('Unable to invalidate Varnish object'));
    });
    req.end();
};
