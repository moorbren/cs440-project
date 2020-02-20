const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var normalizer = require('./normalizer');
var extractor = require('./extractor');

var baseUrl = 'https://www.kbb.com/cars-for-sale/all/corvallis-or-97330?searchRadius=0&zip=97330&marketExtension=include&sortBy=relevance&numRecords=25';
var counterParam = 'firstRecord';
var maxCounter = 1000/25;
var counterMult = 25;


function parseData(responseText){
    var dom = new JSDOM(responseText);
    var document = dom.window.document;

    var carObjects = new Array();
    var carElements = document.querySelectorAll('.item-card-content');
    for(var x = 0; x < carElements.length; x++){
        var carEl = carElements[x];

        var carObject = new Object();
        try{ //if it can't even pass this, then skip this car
            carObject.name = carEl.getElementsByTagName('h2')[0].textContent;
            carObject.price = normalizer.getNumbers(carEl.querySelector('.first-price').textContent);
            
            //FIELDS PAST THIS POINT CAN BE EMPTY
            var listingBody = carEl.querySelector('.item-card-specifications');
            var listingFooter = carEl.querySelector('.listing-footer');
            
            try{
                //attributes have a hidden subtext that describes what kind of data it stores
                var carAttributes = listingBody.querySelectorAll('li');
                var attributes = ["color", "mpg", "drive type", "engine"];

                carAttributes.forEach(function(element){
                    for(var x = 0; x < attributes.length; x++){
                        var attribute = attributes[x];
                        var elContent = element.textContent.toLowerCase()

                        if(elContent.includes(attribute)){
                            carObject[attribute] = elContent;
                            carObject[attribute] = carObject[attribute].replace(attribute + ': ', '');

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


//the extractor calls dump data after every 
extractor.requestData(baseUrl, counterParam, maxCounter, counterMult, parseData, 'kbb.csv');