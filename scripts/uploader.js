const fs = require('fs');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs440_group08',
    password: 'dtQETpUHNs6L',
    database: 'cs440_group08'
  });
  

var content = fs.readFileSync('./data/000_FINAL.csv').toString(); //000_FINAL
var lines = content.split('\n');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


connection.connect((error) => {
    if (error) {
        console.error(error);
    } else {

        //connection.query('SET GLOBAL connect_timeout=288000')
        //connection.query('SET GLOBAL wait_timeout=288000')
        //connection.query('SET GLOBAL interactive_timeout=288000')

        async function queryLoop(){//needs to be async so we can wait
            console.log('connected to the database, building queries.')
            for(var x = 6670891; x < lines.length; x+=21000){
                    //name,year,price,color,mileage
                                                //name,year,price,color,mileage (CSV)
                let query = 'INSERT INTO ALL_CARS (name,year,price,mileage,color,new) VALUES ? ';
                var cars = new Array();
                for(var y = 0; y < 21000; y++){
                    if(!lines[x+y]){
                        break;
                    }
    
                    cars.push(lines[x+y].split(','))
                    if(cars[y][1] != "NULL") cars[y][1] = parseInt(cars[y][1])
                    if(cars[y][2] != "NULL") cars[y][2] = parseInt(cars[y][2])
    
                    var t = cars[y][3] + "";
                    if(cars[y][4] != "NULL"){
                        cars[y][3] = parseInt(cars[y][4])
                    } else{
                        cars[y][3] = (cars[y][4])
                    }
                    cars[y][4] = t;
                    cars[y].push("NULL"); //6 items now, all the correct type (string, int, int, int, string, NULL)
                    //var lines = lines[x+y].split(',')
                    //query += `("${values[0]}",${values[1]},${values[2]},${values[4]},"${values[3]}", NULL),`;
                }
    
                connection.query(query, [cars] ,function(error,results,fields){
                    //if (error) throw error;
                    if(error) console.log(error)
                    if(results) console.log('Inserted ' + results.affectedRows + ' rows');
                    
                });

                await sleep(1000);
            }

            
        }

        queryLoop();
    }

    
});
  