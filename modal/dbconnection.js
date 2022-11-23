let mysql=require("mysql") //mysql e bağlanmak için bağlantı oluşturuyoruz
let con=mysql.createConnection({
    host     : 'localhost',
    database : 'elektroniksepeti',
    user     : 'root',
    password : '123',
});

con.connect((err)=>{
    con.query("use elektroniksepeti")
    if(err){
        console.log(err)
    }
    else{
    }
})
module.exports=con;