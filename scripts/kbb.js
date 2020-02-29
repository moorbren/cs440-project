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

    var carElements = document.querySelectorAll('.item-card-content');
    for(var x = 0; x < carElements.length; x++){
        var carEl = carElements[x];

        //IMPORTANT: The below statement makes sure that default values are included in the CSV. 
        //Otherwise, columns may vary in length which could shift values between columns. 
        var carObject = normalizer.initCar(columns); 
        

        try{ //if it can't even past name and price then we can just skip it

            carObject.name = carEl.getElementsByTagName('h2')[0].textContent;
            carObject.price = normalizer.getNumbers(carEl.querySelector('.first-price').textContent);
            
            //FIELDS PAST THIS POINT CAN BE EMPTY
            var listingBody = carEl.querySelector('.item-card-specifications');
            
            try{
                //attributes have a hidden subtext that describes what kind of data it stores
                var carAttributes = listingBody.querySelectorAll('li');
                var attributes = ["color", "mpg", "drive type", "engine"];
                var columnNames = ["color", "mpg", "drive_type", "engine"];

                carAttributes.forEach(function(element){
                    for(var x = 0; x < attributes.length; x++){
                        var attribute = attributes[x];
                        var elContent = element.textContent.toLowerCase()

                        if(elContent.includes(attribute)){
                            carObject[columnNames[x]] = elContent;
                            //hidden subtext is always in the form: 'attribute: ', so we can just get rid of it
                            carObject[columnNames[x]] = carObject[columnNames[x]].replace(attribute + ': ', '');

                            break;
                        }
                    }
                });


            }catch(e) {console.log(e)}

            try{
                //has a decent chance of not existing.
                carObject.mileage = normalizer.getNumbers(listingBody.querySelector('.text-bold').textContent);

            }catch(e){}
            carObjects.push(carObject);

        }catch(e){}

        //console.log('CAR: title=' + carObject.name + ' | price=' + carObject.price + ' | milage=' + carObject.milage);
    }

    return carObjects;
}

var options = {
    url: 'https://www.kbb.com/cars-for-sale/all?marketExtension=include&sortBy=relevance&numRecords=25',
    outputPath: 'data/kbb.csv',
    scrapeData: parseData,

    columns: ['name', 'price', 'color', 'mpg', 'drive_type', 'engine', 'mileage'], //IMPORTANT: These must be exact. 
    counterParameter: 'firstRecord',
    numPages: 1000/25,
    counterMult: 25, 
    requestDelay: 600,

    zipcodes: true, 
    zipcodeParameter: 'zip',
    searchRadius: 45,
    radiusParameter: 'searchRadius'
};

extractor.requestDataFromQueryURL(options);
