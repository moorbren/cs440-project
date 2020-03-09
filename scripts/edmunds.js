const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var normalizer = require('./normalizer');
var extractor = require('./extractor');

/**
 * Parses data from a webpage and returns an array of car objects that will be then be saved to the outputPath.
 * 
 * @param {*} responseText The requested page's HTML.
 * @param {*} columns A list of columns to initialize objects with. This is pulled from the options. 
 */
function parseData(responseText, columns){
    var dom = new JSDOM(responseText);
    var document = dom.window.document;

    var carObjects = new Array();

    var carElements = document.querySelectorAll('.srp-card-info');
    for(var x = 0; x < carElements.length; x++){
        var carEl = carElements[x];

        //IMPORTANT: The below statement makes sure that default values are included in the CSV. 
        //Otherwise, columns may vary in length which could shift values between columns. 
        var carObject = normalizer.initCar(columns); 
        

        try{ //if it can't even past name and price then we can just skip it

            carObject.name = carEl.querySelector('.d-block').textContent;
            carObject.price = normalizer.getNumbers(carEl.querySelector('.srp-card-price').querySelector('.mb-0').textContent);
            
            //FIELDS PAST THIS POINT CAN BE EMPTY
            
            try{
                //attributes have a hidden subtext that describes what kind of data it stores
                var attributes = ["color", "mpg", "drive type", "engine"];
                var columnNames = ["color", "mpg", "drive_type", "engine"];
                carObject.color = carEl.querySelector('.color-swatch').title.replace('Exterior Color: ', '');



            }catch(e) {}

            try{
                //has a decent chance of not existing.
                carObject.mileage = normalizer.getNumbers(carEl.querySelectorAll('.ml-0_25')[2].textContent);

            }catch(e){}
            carObjects.push(carObject);
        }
        catch(e){ console.log(e + " line: 57")}

        // console.log('CAR: title=' + carObject.name + ' | price=' + carObject.price + ' | color= ' + carObject.color + ' | milage=' + carObject.milage);
    }

    return carObjects;
}

var options = {
    url: 'https://www.edmunds.com/inventory/srp.html?inventorytype=used%2Ccpo%2Cnew',
    outputPath: 'data/edmunds.csv',
    scrapeData: parseData,

    columns: ['name', 'price', 'color', 'mileage'], //IMPORTANT: These must be exact. 
    counterParameter: 'pagenumber',
    numPages: 100000,
    counterMult: 1, 
    requestDelay: 600,

    zipcodes: true, 
    zipcodeParameter: 'zip',
    searchRadius: 25,
    radiusParameter: 'radius'
    
};

extractor.requestDataFromQueryURL(options);
