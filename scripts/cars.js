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
    var carListings = document.querySelectorAll('.shop-srp-listings__listing-container');

        for(var x = 0; x < carListings.length; x++){
            var carEl = carListings[x];

            //IMPORTANT: The below statement makes sure that default values are included in the CSV. 
            //Otherwise, columns may vary in length which could shift values between columns. 
            var carObject = normalizer.initCar(columns); 
            

            try{ //if it can't even past name and price then we can just skip it

                carObject.name = carEl.querySelector('.listing-row__title').textContent.trim();
                carObject.price = normalizer.getNumbers(carEl.querySelector('.listing-row__price').textContent.trim());
                
                //FIELDS PAST THIS POINT CAN BE EMPTY
                
                try{

                    carObject.color = carEl.querySelector('.listing-row__meta').querySelectorAll('li')[0].textContent.replace('Ext. Color:', '').trim();
                    carObject.transmission = carEl.querySelector('.listing-row__meta').querySelectorAll('li')[2].textContent.replace('Transmission:', '').trim();
                    carObject.drive_type = carEl.querySelector('.listing-row__meta').querySelectorAll('li')[3].textContent.replace('Drivetrain:', '').trim();
                    carObject.condition = carEl.querySelector('.listing-row__stocktype').textContent.trim();

                }catch(e) {}
                
                try{
                    //has a decent chance of not existing.
                    carObject.mileage = normalizer.getNumbers(carEl.querySelector('.listing-row__mileage').textContent.trim());

                }catch(e){}
                carObjects.push(carObject);
            }
            catch(e){ console.log(e + " line: 57")}

            // console.log('CAR: title=' + carObject.name + ' | price=' + carObject.price + ' | color= ' + carObject.color + ' | milage=' + carObject.milage);
        }
    // }

    return carObjects;
}

var options = {
    url: 'https://www.cars.com/for-sale/searchresults.action/?dealerType=all&perPage=100',
    outputPath: 'data/cars.csv',
    scrapeData: parseData,

    columns: ['name', 'drive_type', 'condition',  'price', 'color', 'transmission', 'mileage'], //IMPORTANT: These must be exact. 
    counterParameter: 'page',
    numPages: 10000,
    counterMult: 1, 
    requestDelay: 600,

    zipcodes: true, 
    zipcodeParameter: 'zc',
    searchRadius: 50,
    radiusParameter: 'rd'
    
};

extractor.requestDataFromQueryURL(options);
