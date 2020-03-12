const fs = require('fs');
const extractor = require('./extractor');
const normalizer = require('./normalizer');

console.log('Beginning normalize process...');

var finalColumns = ["name", "price", "color", "year", "mileage"] ;
var columnOrder = {
	"name": 0,
	"price": 1,
	"color": 2, 
	"year": 3,
	"mileage": 4,

	//special operations
	"mileage_float": 4, //mileage that contains decimal points (for some strange reason...)

	"name_underlines": 0, //if the name has a bunch of underlines to seperate things

	"mileage_km": 4, //if the mileage is in KM and needs to be converted after extracting the numbers.

	"combo": -1, //combo attributes should be like so 'combo_1_2', where the numbers are the columns to combine, can be more than two columns: 'combo_1_2_3'

	"kbb_style_name" : 0, //the name attribute for KBB style cars include NEW/USED/CERTIFIED the car year and the rest of the car's name

	"truecar_style_name": 0, //the name attribute includes the year, which should be put in it's own column
}

var allCars = new Array();
fs.readdir('./data/', (err, files) => {
	for(var x = 0; x < files.length; x++){
		var file  = files[x];
		if(file == "000_FINAL.csv"){ //skip this FILE OENUTSHNT EO
			return;
		}

		console.log(`Reading file contents: '${file}`);

		var content = fs.readFileSync('./data/' + file).toString();
		console.log('	File contents loaded into memory, processing data...');

		var lines = content.split('\n');
		var columnNames = lines[0].split(',');
		var comboIndices = new Array();

		for(var y = 0; y < columnNames.length; y++){
			if(columnNames[y].substring(0,5) == "combo"){
				var splited = columnNames[y].split('_');
				for(var z = 1; z < splited.length; z++){
					comboIndices.push(parseInt(splited[z]));
				}
			}
		}

		var cars = new Array();
		var completedCars = 0;

		for(var y = 1; y < lines.length; y++){ //skipping first line since that dictates
			if(y % Math.floor(lines.length/20) == 0){ //progress counter
				console.log('	' + ((y*100/lines.length).toFixed(2)) + '% complete.')
			}

			var values = lines[y].split(',');

			var carObj = new Object();
			try{
				for(var z = 0; z < values.length; z++){
					if(columnNames[z] && (columnOrder[columnNames[z]] != undefined || columnNames[z].includes('combo'))){ //if column name one we care about
						if(columnNames[z] == "name"){
							carObj[columnNames[z]] = values[z].replace(/\s+/g,' ').replace('"', '').replace(/(\r\n|\n|\r)/gm,"");

						}else if(columnNames[z] == "price"){
							carObj[columnNames[z]] = normalizer.getNumbers(values[z]);
							if(carObj[columnNames[z]] == ""){
								carObj[columnNames[z]] = "NULL";
							}

						}else if(columnNames[z] == "color"){
							carObj[columnNames[z]] = values[z].replace(/\s+/g,' ').replace('"', '').replace(/(\r\n|\n|\r)/gm,"");
							if(carObj[columnNames[z]] == "undefined" || carObj[columnNames[z]] == ""){
								carObj[columnNames[z]] = "NULL";
							}
							
						}else if(columnNames[z] == "year"){
							carObj[columnNames[z]] = normalizer.getNumbers(values[z]);
							if(carObj[columnNames[z]] == ""){
								carObj[columnNames[z]] = "NULL";
							}
							
						}else if(columnNames[z] == "mileage"){
							carObj[columnNames[z]] = normalizer.getNumbers(values[z]);
							if(carObj[columnNames[z]] == ""){
								carObj[columnNames[z]] = "NULL";
							}
							
						}else if(columnNames[z] == "mileage_float"){
							var new_mileage = Math.round(parseFloat(values[z]));
							carObj.mileage = new_mileage;

						}else if(columnNames[z] == "mileage_km"){
							var mileage_km = Math.round(normalizer.getNumbers(values[z])/1.609); //appx conversion
							carObj.mileage = mileage_km;

						}else if(columnNames[z] == "name_underlines"){
							carObj.name = values[z].replace(/\_+/g,' ').replace(/\s+/g,' ').replace('"', '').replace(/(\r\n|\n|\r)/gm,""); //removes underlines, consective spaces, and quotes

						}else if(columnNames[z] == "kbb_style_name"){
							var nameFragments = values[z].split(' '); //split on space, IND=0 should be removed, and IND=1 is the year, the rest is kept as name.
							carObj.year = normalizer.getNumbers(nameFragments[1]);

							var fullName = nameFragments[2];
							for(var i = 3; i < nameFragments.length; i++){
								fullName += ' ' + nameFragments[i];
							}
							carObj.name = fullName.replace(/(\r\n|\n|\r)/gm,"").replace('"', '');

						}else if(columnNames[z] == "truecar_style_name"){
							var nameFragments = values[z].split(' '); //split on space, IND=0 should be removed, and IND=1 is the year, the rest is kept as name.
							carObj.year = normalizer.getNumbers(nameFragments[0]);

							var fullName = nameFragments[1];
							for(var i = 2; i < nameFragments.length; i++){
								fullName += ' ' + nameFragments[i];
							}
							carObj.name = fullName.replace(/(\r\n|\n|\r)/gm,"").replace('"', '');

						}else if(columnNames[z].includes("combo")){
							var fullName = values[comboIndices[0]]; //just include first one so we can add the spaces we need
							for(var i = 1; i < comboIndices.length; i++){
								fullName += " " + values[comboIndices[i]];
							}

							carObj.name = fullName.replace(/(\r\n|\n|\r)/gm,"").replace('"', '');
						}
						
					}
				}

				var valid = true;
				for(var i = 0; i < finalColumns.length; i++){
					if(carObj[finalColumns[i]] === undefined){
						if(finalColumns[i] == "name"){ //if name isn't included, then we just skip it (should be a couple of these)
							valid = false;
							i = finalColumns.length;
						}
						carObj[finalColumns[i]] = "NULL";
					}
				}
				if(!valid){
					continue;
				}

				cars.push(carObj);
				completedCars++;
			}catch(e) {
				console.log(e);
			}
		}

		allCars = allCars.concat(cars);
		console.log(`	Completed ${completedCars} of ${lines.length} [${(completedCars*100/lines.length).toFixed(2)}%]`);

		console.log('	allcars: ' + allCars.length + '   cars:' + cars.length)
		console.log('	Finished file (' + (x+1) + "/16)\n");

		if(x == 15){
			extractor.dumpDataAsCSV(allCars, 'data/000_FINAL.csv');
			break;
		}
	}
});

