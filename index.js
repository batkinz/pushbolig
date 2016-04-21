var db = require("./db");           //Local store to track what has been seen
var push = require("./push")(db);   //Pushbullet library

var searchOptions = require("./config/search.json");
var parser = require("./parser");   //Parses config/search.json into valid options
var bolig = require("./bolig");     //Makes the API request

function getThingToSend() {
    var opts = parser.parse(searchOptions);

    var alreadySentThis = function() {
        // console.log("already sent.");
    };

    var oops = function(mistake) {
        console.error(mistake);
    };

    bolig.request(opts, function(err, results) {
        if (err) {
            return oops(err);
        }
        if (!results.data.properties.collection) {
            oops("Bad API response");
            return;
        }

        results.data.properties.collection.forEach(function(property) {
            if (searchOptions.maxRent) {
                // The API treats any maximum over 14,000 as "no maximum".
                // manually remove anything over the maximum price
                if(property.monthlyPrice > searchOptions.maxRent) {
                    // console.log("removing: " + property.jqt_headline + " ("+property.jqt_economy.rent+")")
                    return;
                }
            }

            var skip = false;
            if (searchOptions.custom) {
                if (typeof searchOptions.custom.maxDaysFromCreation === 'number') {
                    var dateOffset = (24*60*60*1000) * searchOptions.custom.maxDaysFromCreation;
                    var oldestDate = new Date().getTime() - dateOffset;
                    if (oldestDate > property.creationDate * 1000) {
                        return;
                    }
                }
                if (searchOptions.custom.excludedPhrases) {
                    searchOptions.custom.excludedPhrases.forEach(function (word) {
                        if (!skip && property.description.indexOf(word) >= 0) {
                            skip = true;
                        }
                    });
                }
            }
            if (skip) return;

            property.monthlyPrice = property.monthlyPrice || 0;
            property.deposit = property.deposit || 0;
            property.prepaidRent = property.prepaidRent || 0;
            var moveInPrice = property.monthlyPrice + property.deposit + property.prepaidRent;
            var thingToSend = {
                type: "link",
                title: property.monthlyPrice + "kr/md, indfl.: " + moveInPrice + "kr, " + property.city,
                body: "http://www.boligportal.dk" + property.url
            };
            db.isInDB(thingToSend, push.sendThis, alreadySentThis, oops);
        });
    });

}

var timeoutMinutes = (searchOptions && searchOptions.custom && searchOptions.custom.loopIntervalMinutes) ? searchOptions.custom.loopIntervalMinutes : 5;
setImmediate(function loop () {
    console.log("Searching (" + new Date() + ")");
    getThingToSend();
}, timeoutMinutes * 60 * 1000);