var normalizer = new Object();

/**
 * Removes everything except numbers from a string. 
 * @param {string} string 
 */
function getNumbers(string){
    return string.replace(/\D/g,''); //regex pulled from the internet
}




var colors = ["aluminum", "beige", "black", "blue", "brown", "bronze", "claret", "copper", "cream", "gold", "gray", "green", "maroon", "metallic", "navy", "orange", "pink", "purple", "red", "rose", "rust", "silver", "tan", "turquoise", "white", "yellow"];

/**
 * Checks if the given string contains a color from a list of car colors.
 * 
 * @param {*} string The string to check if it's a color
 */
function isCarColor(string){
    string = string.toLowerCase();

    colors.forEach(function(color){
        if(string.includes(color)){
            return true;
        }
    });

    return false;
}

/**
 * Creates a car object based on the array of attributes given. 
 * EX. ['color', 'mileage', ...] --> car.color == undefined, car.mileage == undefined, ...
 * 
 * @param {Array<string>} attributes 
 */
function initCar(attributes){
    var car = new Object();
    attributes.forEach(function(attribute){
        car[attribute] = undefined;
    });

    return car;
}

normalizer.initCar = initCar;
normalizer.getNumbers = getNumbers;
normalizer.isCarColor = isCarColor;

module.exports = normalizer;