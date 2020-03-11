const fs = require('fs');
const path = require('path');

/**
 * Discovers handlebar views to prevent non-existant page rendering. 
 * @param {*} path 
 */
exports.discoverViews = function(dirPath){
    var hashTable = new Object();

    //looping through all files in the directory from the path.
    //if they contain a .hbs extension, we add it to the view hashtable
    fs.readdirSync(path.join(__basedir, dirPath)).filter(function (fileName, index, arr){
        if(arr[index].search('.hbs') == arr[index].length - 4){
            hashTable[arr[index]] = true; //seeding the hashtable

        return true;
        }

        return false;
    });

    return hashTable;
}

/**
 * This requires all javascript files in the given folder.
 * NOTE: Paths must be relative to the 'src' folder.
 *  
 */
exports.requireFolder = function(dirPath){
    var allRequired = new Array();

    fs.readdirSync(path.join(__basedir, dirPath)).filter(function (fileName, index, arr){
        //arr is the array of src files in this directory, index is the current index, 
        if(fileName.search('.js') == fileName.length - 3){
            allRequired.push(require(path.join(__basedir, dirPath, fileName)));
            return true;
        }

        return false;
    });

    return allRequired;
}

//copy pasted from stack overflow
exports.escapeSQL = function (str) {
    if(str == undefined || str == "") return str;

    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
            default:
                return char;
        }
    });
}