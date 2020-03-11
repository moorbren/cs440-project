const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var normalizer = require('./normalizer');
var extractor = require('./extractor');


function parseData(responseText, columns){
    var dom = new JSDOM(responseText);
    var document = dom.window.document;

    var carObjects = new Array();
    var carElements = document.querySelector('[data-test="allVehicleListings"]').querySelectorAll('.vehicle-card-body');
    for(var x = 0, n=carElements.length; x < n; x++){
        var carEl = carElements[x];
        var carObject = new Object();
        try{        
            carObject.name = carEl.querySelector('.vehicle-card-year').textContent + ' ' + carEl.querySelector('.vehicle-header-make-model').textContent;
            carObject.price = normalizer.getNumbers(carEl.querySelector('[data-test="vehicleCardPricingBlockPrice"]').textContent);
        }catch(e){continue;}
        
        try{    carObject.mileage = normalizer.getNumbers(carEl.querySelector('.d-flex.margin-top-2_5.border-top.padding-top-2_5.w-100.justify-content-between'))
        }catch(e){}
        
        try{    carObject.color = carEl.querySelector('[data-test="vehicleCardColors"]').textContent.split(',')[0].replace(' exterior', '');
        }catch(e){}
        
        try{    carObject.extra_info = carEl.querySelector('[data-test="vehicleCardTrim"]').textContent;
        }catch(e){}

        carObjects.push(carObject);
    }

    return carObjects;
}


var options = {
    url: "https://www.truecar.com/used-cars-for-sale/listings/location-",
    outputPath: 'data/truecar.csv',
    scrapeData: parseData,

    columns: ['name', 'price', 'color', 'extra_info', 'mileage'], //IMPORTANT: These must be exact. 
    counterParameter: 'page',
    numPages: 999999,
    counterMult: 1, 
    requestDelay: 600,

    zipcodes: true, 
    zipcodeParameter: 'zip',
    searchRadius: 45,
    radiusParameter: 'searchRadius'
}

extractor.requestDataFromQueryURL(options);