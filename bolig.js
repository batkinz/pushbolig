/**
 * Search the boligportal.dk API using the criteria
 * specified in config/search.json
 * 
 */
var requestLib = require("request");
var urlLib = require("url");

function request(opts, callback) {
    requestLib(urlLib.format({
        protocol: "http",
        host: "www.boligportal.dk/RAP/ads/",
        query: opts
    }), function(err, response, body) {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(body));
        }
    });
}

module.exports = {
	request: request
};