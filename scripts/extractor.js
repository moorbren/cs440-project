//var jsdom = require('jsdom');
//const {JSDOM} = jsdom;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
var extractor = new Object();

const axios = require("axios");

var completionTable = new Object();

async function requestURL(url, counterMax, parseData, outFile){
    const result = await axios.get(url);
    completionTable[outFile].completed += 1;

    var objs = parseData(result.data);
    completionTable[outFile].objects = completionTable[outFile].objects.concat(objs);

    var x = completionTable[outFile].completed;
    console.log(`Completed request ${x}/${counterMax}: ` + ((x/counterMax)*100).toFixed(2) + '%');

    if(x == counterMax){
        dumpDataAsCSV(completionTable[outFile].objects, outFile);
        completionTable[outFile] = undefined;
        console.log('Download complete!')
    }
}


function requestData(baseUrl, queryCounterId, counterMax, counterMultiplier=1, parseData, outFile='out.csv'){
    completionTable[outFile] = {completed: 0, objects: new Array()};

    for(var x = 0; x < counterMax; x++){
        var newUrl = baseUrl + '&' + queryCounterId + '=' + (x*counterMultiplier);

        requestURL(newUrl, counterMax, parseData, outFile);
    }

}


/**
 * Take an array of objects of similar structure and convert it to a CSV.
 * @source     https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 * @modifiedBy sators
 * @param      {Array}  options.data            Array of data
 * @param      {String} options.columnDelimiter Column separator, defaults to ","
 * @param      {String} options.lineDelimiter   Line break, defaults to "\n"
 * @return     {String}                         CSV
 */
function objectArrToCSV(data = null, columnDelimiter = ",", lineDelimiter = "\n") {
	let result, ctr, keys

	if (data === null || !data.length) {
		return null
	}

    //added this bit to find a row with the most columns
    var longestIndex = 0, biggestValue = 0; 
    for(var x = 0; x < Math.min(1000, data.length); x++){
        if(Object.keys(data[x]).length > biggestValue){
            longestIndex = x; 
            biggestValue = Object.keys(data[x]).length;
        }
    }
    keys = Object.keys(data[longestIndex]);

	result = ""
	result += keys.join(columnDelimiter)
	result += lineDelimiter

	data.forEach(item => {
		ctr = 0
		keys.forEach(key => {
			if (ctr > 0) {
				result += columnDelimiter
			}

			result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key]
			ctr++
		})
		result += lineDelimiter
	})

	return result
}

/**
 * Saves the given array of objects as a CSV file. 
 * 
 * @param {Array} objectArray 
 * @param {string} filepath The path to the file. EX: ./local/file.csv, file.csv, /home/username/file.csv
 */
async function dumpDataAsCSV(objectArray, filepath){
    var textOut = objectArrToCSV(objectArray);

    fs.writeFile(filepath, textOut, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log(objectArray.length + " rows saved at: " + filepath);
    });    
}

extractor.dumpDataAsCSV = dumpDataAsCSV;
extractor.requestData = requestData;

module.exports = extractor;