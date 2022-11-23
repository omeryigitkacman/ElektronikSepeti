const express = require("express");// Express.js modülü / paketi, Node.js tabanlı bir web uygulama sunucu çatısıdır
const expressEjsLayouts = require("express-ejs-layouts"); // ejs sayesinde verileri kullanıcıya yazdımamız için gerekli bir araç
const app = express();// Express.js i kullanıyoruz
const port = 3000; // Portumuzu Belirliyoruz
const bodyParser = require("body-parser"); //formdan gelen post taki verileri tutmak için kullanılır 
const cookieParser = require("cookie-parser"); //cookielerin tutulmasını sağlıyor 
const main = require("./routing/main"); //main.js den gelen express verileini buraya tanımlıyoruz
const admin = require("./routing/admin");// ^
const session=require("express-session");// alet mesajlar için express-session a ihtiyacımız var
const fileUpload = require("express-fileupload") // resim yüklemek silemek için gerekli olan eklenti

app.use(cookieParser());
app.use(express.static("public")); // css javascript ver resimleri kullanmak için bunu kullanıyoruz
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressEjsLayouts);
app.set("view engine", "ejs");// ejs i kullanıyoruz
app.use(fileUpload())
app.use(session({
  secret: "sssssssss",
  resave: false,
  saveUninitialized: true,
}))
app.use((req, res, next) => { // middleware fonksyon her sayfa için çalışır
  const {id ,username,Adminid} = req.cookies //cookiden veri çekiyoruz
  if (id) { // eğerki kullanıcı giriş yapmışsa
      res.app.locals = { // ejs e local olarak veri gönderiyoruz ve ejs de bu veri dizisini kullanıyoruz 
          displayLink: true, // Giriş yap , Kayıt ol navdan kaldırmak için gerekli
          username:username, // kullanıcı adını tüm sayfalarda kullanmak için
          adminlogin:false // admin girişe göre gelecek butonları kapatıyor
        }
  }
  else if(Adminid)  // eğerki admin giriş yaptıysa
  {
    res.app.locals={ 
          displayLink: true,
          username:username,
          adminlogin:true
    }
  }
  else {
      res.app.locals = {
          displayLink: false //
      }
  }
  next()
})
app.use((req, res, next) => {
  res.locals.sessionFlash = req.session.sessionFlash // alertler için 
  delete req.session.sessionFlash // alertin kalıcı olmaması için session u siliyoruz
  next()
})
app.use("/admin", admin); // admin dosyasından gelen verileri kullanarak exportsladığımız veriyi yakalayabiliyoruz
app.use("/", main);// main dosyasından gelen verileri kullanarak exportsladığımız veriyi yakalayabiliyoruz

app.listen(port, () => {//serveri çalıştıracağımız portu belirliyoruz
  console.log("Server Başlatıldı https://localhost:" + port);
});
