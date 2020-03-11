const mysql = require('mysql');

/**
 * Handle all of the resources we need to clean up. In this case, we just need 
 * to close the database connection.
 * 
 * @param {Express.Request} req the request object passed to our middleware
 */
exports.close = function(req) {
    if (req.db) {
      req.db.end();
      req.db = undefined;
    }
}


/**
 * Create a database connection. This is our middleware function that will
 * initialize a new connection to our MySQL database on every request.
 */
const config = require('../config.js');
exports.connectDb = function(req, res, next) {
  let connection = mysql.createConnection(config);
  connection.connect(function(err){
    if(err){
      console.log('Database error: ' + err);
      exports.close(connection);
    }
  });

  req.db = connection;
  next();
}