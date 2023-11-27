const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  timeout: 300000,
  connectTimeout: 60000
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

connection.on('error', (err) => {
  console.log("error nih", err)
})

module.exports = connection;

// var mysql   = require("mysql");
// const dbConfig = require("../config/db.config");

// var pool = mysql.createPool({
//     connectionLimit : 10,
//     host: dbConfig.HOST,
//     port: dbConfig.PORT,
//     user: dbConfig.USER,
//     password: dbConfig.PASSWORD,
//     database: dbConfig.DB,
// });


// var DB = (function () {

//     function _query(query, params, callback) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 connection.release();
//                 console.log(err)
//                 callback(null, err);
//                 throw err;
//             }

//             connection.query(query, params, function (err, rows) {
//                 connection.release();
//                 if (!err) {
//                     callback(null, rows);
//                 }
//                 else {
//                   console.log(err)
//                     callback(err, null);
//                 }

//             });

//             connection.on('error', function (err) {
//                 console.log(err)
//                 connection.release();
//                 callback(err, null);
//                 throw err;
//             });
            
//         });
//     };

//     return {
//         query: _query
//     };
// })();

// module.exports = DB;