/*
 7 - Region Nordjylland
 8 - Frederikshavn
 12 - Region Hovedstaden
 14 - København K
 15 - København
 18 - København S
 23 - Københanv N
 */

function parseSearchOptions(searchOptions) {
    var defaultQuery = require("./defaults/search-default.json");

	searchOptions = searchOptions || {};

	for (var field in searchOptions) {
		if (searchOptions.hasOwnProperty(field) && field !== "custom") {
			defaultQuery[field] = searchOptions[field];
		}
	}

    return defaultQuery;
}

module.exports = {
	parse: parseSearchOptions
};