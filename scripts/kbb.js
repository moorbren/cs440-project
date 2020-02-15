const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var normalizer = require('./normalizer');
var extractor = require('./extractor');

var baseUrl = 'https://www.kbb.com/cars-for-sale/all/corvallis-or-97330?searchRadius=0&zip=97330&marketExtension=include&sortBy=relevance&numRecords=29';
var counterParam = 'firstRecord';
var maxCounter = 10;


var table = undefined;
function dumpData(responseText){
    var dom = new JSDOM(responseText);
    var document = dom.window.document;

    var carObjs = new Array();
    var carElements = document.querySelectorAll('.item-card-content');
    for(var x = 0; x < carElements.length; x++){
        var carEl = carElements[x];

        var carObject = new Object();
        carObject.name = carEl.getElementsByTagName('h2')[0].textContent;
        carObject.price = normalizer.getNumbers(carEl.querySelector('.first-price').textContent);
        
        //FIELDS PAST THIS POINT CAN BE EMPTY
        var carBody = carEl.querySelector('.item-card-specifications');
        try{
            carObject.milage = normalizer.getNumbers(carBody.querySelector('.text-bold').textContent);
        }catch(e){};

        console.log('CAR: title=' + carObject.name + ' | price=' + carObject.price + ' | milage=' + carObject.milage);
    }    
}

extractor.requestData(baseUrl, counterParam, maxCounter, dumpData);

