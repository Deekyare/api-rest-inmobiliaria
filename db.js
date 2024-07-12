const mysql = require("mysql");


const connection = mysql.createConnection({
  host: "mysql-deekyare.alwaysdata.net",
  user: "deekyare",
  password: process.env.DB_PASSWORD,
  database: "deekyare_inmoflex",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting", err);
    return;
  }
  console.log("connected");
});

// Funcion de utilidad que nos permite usar async / await
const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, result, fields) => {
      if (error) reject(error);
      resolve(result);
    });
  });
};   

module.exports = { connection, executeQuery };
