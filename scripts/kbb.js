var extractor = require('./extractor');

var baseUrl = 'https://www.kbb.com/cars-for-sale/all/corvallis-or-97330?searchRadius=0&zip=97330&marketExtension=include&sortBy=relevance&numRecords=29';
var counterParam = 'firstRecord';
var maxCounter = 5;


var table = undefined;
function dumpData(responseText){
    console.log(responseText);

    //var document = new JSDOM(responseText);
    
}

extractor.requestData(baseUrl, counterParam, maxCounter, dumpData);

