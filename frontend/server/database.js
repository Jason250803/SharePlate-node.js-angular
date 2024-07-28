var mysql =require("mysql2/promise");

const mysqlpool=mysql.createPool({
    host:'localhost',
    database :'project_db',
    user:'root',
    password:'root'
})
//for testing db connection
module.exports=mysqlpool;
      
    