var normalizer = new Object();

/**
 * Removes everything except numbers from a string. 
 * @param {string} string 
 */
function getNumbers(string){
    return string.replace(/\D/g,'');
}

normalizer.getNumbers = getNumbers;

module.exports = normalizer;