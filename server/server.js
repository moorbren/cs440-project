 
/*********************************
*        MAIN SERVER FILE        *
**********************************
* This is the main server file that runs the whole server.
* A lot of functionality is split up into multiple files in the 'util' and 'routes' directories. */


/*=========================================
  ===GLOBAL DEFINITIONS AND SERVER SETUP===
  =========================================*/

  global.__basedir = __dirname; //finds the base directory of the node project
  const express = require('express');
  const exphbs = require('express-handlebars');
  const path = require('path');
  const mysql = require('mysql');
  const config = require('./config');
  //cookie-parser examples:
  //res.cookie(name_of_cookie, value_of_cookie); //saves a cookie on the client side, where 'res' is the Express response variable
  
  const db = require('./util/db-interface.js');
  const utils = require('./util/utils.js');
  
  const app = express();
  // Configure handlebars
  const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
  });
  
  // Configure the views
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', path.join('views'));
  
  
  // Setup static content serving
  app.use(express.static(path.join('public')));
  console.log(path.join(path.basename(__dirname), 'public'))

  /*=============
    ===ROUTING===
    ============= */
  
  app.use(express.json()); //not sure what this does
  app.use(express.urlencoded({ extended: false }));
  
  app.use((req, res, next) => {
    let conn = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    });
    conn.connect((err) => {
        if (err) return next(err);
        req.db = conn;
        next();
    });
  });
  
  
  /**
   * This is the handler for our main page. The middleware pipeline includes
   * our custom `connectDb()` function that creates our database connection and
   * exposes it as `req.db`.
   */
  app.get('/', db.connectDb, function(req, res) {
    var query = ` SELECT AVG(year) as year_avg, 
                         AVG(mileage) as mileage_avg,
                         AVG(price) as price_avg
                  FROM ALL_CARS;` //this should return nothing for now
    req.db.query(query, function(err, results){
      if(err) return;
      db.close(req);
      console.log(results);
      res.render('home', {results: results[0]});
    })
  
    db.close(req);
  });
  
  app.get('*', function(req, res){
    res.render('404');
  });
  
  
  /*==================
    ===START SERVER===
    ================== */
  
  /**
   * Capture the port configuration for the server. We use the PORT environment
   * variable's value, but if it is not set, we will default to port 3000.
   */
  const port = process.env.PORT || 39761;
  
  /**
   * Start the server.
   */
  app.listen(port, function() {
    console.log('== Server is listening on port', port);
  });
  