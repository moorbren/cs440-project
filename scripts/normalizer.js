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

normalizer.getNumbers = getNumbers;
normalizer.isCarColor = isCarColor;

module.exports = normalizer;