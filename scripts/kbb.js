const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var normalizer = require('./normalizer');
var extractor = require('./extractor');

function parseData(responseText){
    var dom = new JSDOM(responseText);
    var document = dom.window.document;

    var carObjects = new Array();
    var carElements = document.querySelectorAll('.item-card-content');
    for(var x = 0; x < carElements.length; x++){
        var carEl = carElements[x];

        var carObject = new Object();
        try{ //if it can't even past name and price then we can just skip it

            carObject.name = carEl.getElementsByTagName('h2')[0].textContent;
            carObject.price = normalizer.getNumbers(carEl.querySelector('.first-price').textContent);
            
            //FIELDS PAST THIS POINT CAN BE EMPTY
            var listingBody = carEl.querySelector('.item-card-specifications');
            var listingFooter = carEl.querySelector('.listing-footer');
            
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
    url: 'https://www.kbb.com/cars-for-sale/all/corvallis-or-97330?zip=97330&marketExtension=include&sortBy=relevance&numRecords=25',
    counterParameter: 'firstRecord',
    numPages: 1000/25,
    counterMult: 25, 
    outputPath: 'data/kbb.csv',
    zipcodes: true, 
    zipcodeParameter: 'zip',
    searchRadius: 50,
    radiusParameter: 'searchRadius',
    scrapeData: parseData,
    requestDelay: 600
};

extractor.requestDataFromQueryURL(options);