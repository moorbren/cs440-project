var fs = require('fs');
var zipcodes = require('zipcodes');
var extractor = new Object();
const axios = require("axios");

/**
 * Take an array of objects of similar structure and convert it to a CSV.
 * @source     https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 * @modifiedBy sators
 * @param      {Array}  options.data            Array of data
 * @param      {String} options.columnDelimiter Column separator, defaults to ","
 * @param      {String} options.lineDelimiter   Line break, defaults to "\n"
 * @return     {String}                         CSV
 */
function objectArrToCSV(data = null, columnDelimiter = ",", lineDelimiter = "\n", includeColumnTitles=false) {
	let result, ctr, keys;

	if (data === null || !data.length) {
		return null;
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

    result = "";
    if(includeColumnTitles){
        result += keys.join(columnDelimiter);
    }

	result += lineDelimiter;

	for (var x = 0; x < data.length; x++){
        var item = data[x];

		ctr = 0;
		keys.forEach(key => {
			if (ctr > 0) {
				result += columnDelimiter;
			}

			result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key];
			ctr++;
        });
        
        if(x+1 != data.length){
            result += lineDelimiter;
        }
	}

	return result;
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
            console.log(err);
            return err;
        }else{
            console.log(objectArray.length + " rows saved at: " + filepath);
        }
    });    
}

async function dumpCars(cars, filepath){
    var textOut = objectArrToCSV(cars); //converts the an object array to a row. 

    fs.appendFile(filepath, textOut, function(err) {
        if(err){
            if(err.errno == -2) { //file doesn't exist
                if(filepath.lastIndexOf('/') != -1){ //if the file includes a directory, we need to try to make them
                    fs.mkdirSync(filepath.replace(filepath.slice(filepath.lastIndexOf('/')), "")); //creating directories excluding the filename
                }

                fs.writeFile(filepath, textOut, function(err) {
                    if(err) {
                        console.log('SEVERE ERROR: Unable to create output file. Please stop script.');
                        return err;
                    }
                });
            } else{
                console.log(err);
                return err;
            }
        }
    });    
}



var completionTable = new Object(); //stores the progress of the requests currently in progress. Uses the file name as a key to store this data. 

/**
 * Downloads the page content of the URL given, calls the parseData function to scrape the data, and stores the car objects until everything is done. 
 * Once all requests have been loaded, it outputs it the requested path. 
 * 
 * @param {*} url 
 * @param {*} optinos
 */
async function requestURL(url, options){
    var err = false;

    //waiting for the page to be downloaded.
    const result = await axios.get(url).catch(function(error){ 
        if(error){
            completionTable[options.outputPath].completed += 1;
            err = true;

            var x = completionTable[options.outputPath].completed;
            if(options.zipcodes){
                console.log(`FAILED request ${x}/${options.numPages*options._numzips}: ` + ((x/(options.numPages *  options._numzips))*100).toFixed(2) + '%'); //printing progress
            }else{
                console.log(`FAILED request ${x}/${options.numPages}: ` + ((x/options.numPages)*100).toFixed(2) + '%'); //printing progress
            }
        }
    }); 
    //if a page COMPLETELY fails to load, that is an issue on their end. 
    //We only want to skip results if there are no cars on a successful page load.
    if(err){ return true;} 
   


    var objs = options.scrapeData(result.data, options.columns); //getting array of all cars on this page. 
    completionTable[options.outputPath].totalObjects += objs.length; //appending the cars from this page to the complete set. 
    

    completionTable[options.outputPath].completed += 1; //page is downloaded, storing it. 
    var x = completionTable[options.outputPath].completed;

    if(options.zipcodes){
        console.log(`Completed request ${x}/${options.numPages*options._numzips}: ` + ((x/(options.numPages *  options._numzips))*100).toFixed(2) + '%'+
            " | TotalCars:" + completionTable[options.outputPath].totalObjects); //printing progress
    }else{
        console.log(`Completed request ${x}/${options.numPages}: ` + ((x/options.numPages)*100).toFixed(2) + '%'+
            " | TotalCars:" + completionTable[options.outputPath].totalObjects); //printing progress
    }

    dumpCars(objs, options.outputPath); //saving this batch of cars to the output in case there is a fault

    if(objs.length > 0){

        return true;
    }else{
        return false;
    }
}

/**
 * Get's a list of zipcodes that don't overlap with each other.
 * 
 * Please use a minimum of ~25. The lower the radius, the longer this takes.
 */
var states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District Of Columbia","Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Palau", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
function getReducedZipcodes(searchRadius){
    //getting a list of all the zipcodes
    var allCodes = new Array();
    for(var x = 0; x < states.length; x++){
        var stateCodes = zipcodes.lookupByState(states[x]);
        for(var y = 0; y < stateCodes.length; y++){
            allCodes.push(stateCodes[y].zip);
        }
    }
    if(!searchRadius){ //if there isn't a search radius, just return all the codes.
        return allCodes;
    }

    var reducedZips = new Array();
    var reducedZipsHT = new Object(); //hash table of zip codes. true means we keep it, no means we do not. 
    //now we need to filter to ones that are overlapping.
    for(var x = 0; x < allCodes.length; x++){
        var zip = allCodes[x];
        if(reducedZipsHT[zip] === undefined){ //this means the zip hasn't been processed yet. 
            //the current zip code is counted as non-overlapping since it was checked first
            reducedZipsHT[zip] = true; 
            reducedZips.push(zip);
            
            //removing all zipcodes within the search radius of the current zip code.
            var overlappingZips = zipcodes.radius(zip, searchRadius);
            for(var y = 0; y < overlappingZips.length; y++){
                reducedZipsHT[overlappingZips[y]] = false; 
            }
        }
    }

    return reducedZips;
}

//==================================================
//=               OPTIONS STRUCTURE                =
//==================================================
/*
    REQUEST DATA FROM QUERY BASED URL
    ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    See kbb.js for an example. 

    options     - {object} A javascript object that contains crucial configuration details specific to the targeted website. 

    options.url                 - {string}      The url that acts as the base to scrape. Should have the '?' included.
    options.counterParameter    - {string}      The query parameter that represents what records are being shown. 
                                                (what page # or how many cars have been offset) ex. page (from above example)

    options.numPages            - {number}      How many pages should be requested. Inputting '40' would request 40 pages.
    options.counterMult         - {number}      The counterParameter will combined with the counter to request the pages. This is a constant that is multiplied with the counter.
    options.scrapeData          - {function}    The function that scrapes the cars from the page and returns an array of car objects (see kbb.js's parse data function.)
    options.outputPath          - {string}      Path of the file to output the data to. Please make this unique (just name it after the domain name). EX. 'data/cargurus.csv'
    options.requestDelay        - {number}      Delay (ms) between sending each request to the website. IN milliseconds.

    [These 4 are only needed if zipcodes==true]
    options.zipcodes            - {boolean}     Whether or not this website uses zipcodes to filter cars. Enabling this will cycle through ALL ZIPCODES (in the US).
    options.zipcodeParameter    - {string}      The query parameter that controls what zipcode is being used to filter results.
    options.searchRadius        - {integer}     Assumed to be MILES. Radius from center of zipcode to filter cars with.
    options.radiusParameter     - {string}      The query parameter that controls the search radius of the zipcode. 
*/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Requests large amounts of data from a website. This should be used if they are using query parameters (ex: example.com/cars?zipcode=97330&page=1)
 * 
 * @param {Object} options Javascript object containing configuration of specific to this website. See above for object structure. 
 * 
 */
async function requestDataFromQueryURL(options){
    completionTable[options.outputPath] = {completed: 0, totalObjects: 0};
    console.log('Beginning scrape process...');
    console.log("Results will be appended to '" + options.outputPath + "'.\n");

    if(options.zipcodes){
        

        console.log('Generating reduced zip codes...');
        var reducedZipcodes = getReducedZipcodes(options.searchRadius);
        console.log('Using ' + reducedZipcodes.length + ' zipcodes of about 41689. Reduced # of zip codes by ' + ((1 - (reducedZipcodes.length/41689))*100).toFixed(2) + '%.');

        console.log('This should take about ' + ((options.requestDelay * options.numPages * reducedZipcodes.length)/(1000*60)).toFixed(1) + ' minutes.\n')

        options._numzips = reducedZipcodes.length; //needed to display meaningful progress since there are a lot of zipcodes.

        for(var x = 0; x < reducedZipcodes.length; x++){
            var customURL = options.url + '&' +  options.zipcodeParameter + '=' + reducedZipcodes[x] + '&' +  options.radiusParameter + '=' + options.searchRadius;
            _requestLoop(customURL, options);
            await sleep(options.requestDelay);
        }

    }else{
        console.log('This should take about ' + ((options.requestDelay * options.numPages)/(1000*60)).toFixed(1) + ' minutes.\n')
        await _requestLoop(options.url, options);
    }
    
    console.log("Process is complete. Results saved to '" + options.outputPath + "'");
}


/**
 * Loops through the given URL base. 
 * 
 * @param {*} url 
 * @param {*} options 
 */
async function _requestLoop(url, options){
    for(var x = 0; x < options.numPages; x++){
        var newUrl = url + '&' + options.counterParameter + '=' + (x * options.counterMult);
        
        var pretime = new Date();
        var requestResult = await requestURL(newUrl, options); //this returns true if request succeeds, false otherwise
        var waitMS = Math.max(options.requestDelay - (new Date().getTime() - pretime.getTime()), 0); //subtracts time it took to request the URL against the request delay.

        if(!requestResult){//if request failed.
            completionTable[options.outputPath].completed += options.numPages - (x+1); //ensuring the skipped requests are counted. 
            return;
        }
        await sleep(waitMS);
    }
}



extractor.dumpDataAsCSV = dumpDataAsCSV;
extractor.requestDataFromQueryURL = requestDataFromQueryURL;

module.exports = extractor;