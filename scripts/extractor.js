//var jsdom = require('jsdom');
//const {JSDOM} = jsdom;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var extractor = new Object();

const axios = require("axios");
async function requestURL(url, outputFunc){
    const result = await axios.get(url);
    outputFunc(result.data);
}



async function requestData(baseUrl, queryCounterId, counterMax, outputFunc){
    for(var x = 0; x < counterMax; x++){
        var newUrl = baseUrl + '&' + queryCounterId + '=' + x;

        requestURL(newUrl, outputFunc);
    }

}

extractor.requestData = requestData;

module.exports = extractor;