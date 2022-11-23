const router = require("express").Router();
const con = require("../modal/dbconnection"); //mysql bağlantımızı çağırıyoruz
const bcrypt = require("bcrypt") //şifrelere şifreleme yapmak için kullandığımız eklenti
router.get("/", (req, res) => { // ama sayfaya giderse
  con.query("select u.id,u.urunname,m.markaname,u.urunımage,FORMAT(u.urunprice,2) as para from uruns as u inner join markas as m on u.marka_id=m.id inner join kategoriler as k on u.kategori_id=k.id where k.id=8", (err, result) => { // mobil kategorisindeki urunleri getirmek için kullandığımız sorgu
    con.query("select u.id,u.urunname,m.markaname,u.urunımage,FORMAT(u.urunprice,2) as para from uruns as u inner join markas as m on u.marka_id=m.id inner join kategoriler as k on u.kategori_id=k.id where k.id=7", (err, resultpc) => { // bilgisayar kategorisindeki urunleri getirmek için kullandığımız sorgu
      con.query("select u.id,u.urunname,m.markaname,u.urunımage,FORMAT(u.urunprice,2) as para from uruns as u inner join markas as m on u.marka_id=m.id inner join kategoriler as k on u.kategori_id=k.id where k.id=10", (err, resultbeyaz) => { // beyaz eşya kategorisindeki urunleri getirmek için kullandığımız sorgu

        res.render("index", { result: result, resultpc: resultpc, resultbeyaz: resultbeyaz }); // gönderdiğimiz verileri işliyoruz
      })
    })
  })
  console.log(req.cookies);
});
router.get("/giris", (req, res) => { 
  if (req.cookies.id) { // eğer zaten giriş yaptıysa ana sayfaya gönder
    res.redirect("/")
  }
  else { //eğer yoksa giriş sayfasına yönlendir
    res.render("login");
  }
});
router.get("/kayit", (req, res) => {
  if (req.cookies.id) { // eğer zaten giriş yaptıysa ana sayfaya gönder
    res.redirect("/")
  }
  else {//eğer yoksa sayfasına yönlendir
    res.render("register");
  }
});
router.post("/kayit", (req, res) => {
  const { ad, soyad, email, paas } = req.body;// formdan gelen verileri yakalıyoruz
  bcrypt.hash(paas, 10, (err, hash) => { // şifreyi şfireliyoruz
    let control = "select * from users where email=?"; // e mail zaten kayıtlı mı ?
    con.query(control, [email], (err, resd) => {
      if (resd.length == 0) {// eğer bir data yoksa
        let quer = "INSERT into users (firstname,lastname,email,password) values (?,?,?,?)" // verileri ekle
        con.query(quer, [ad, soyad, email, hash], function (err, rows) {
          if (err) {
            req.session.sessionFlash = { // hata mesaj oluştu
              type: "alert alert-danger",
              message: "Kullanıcı Oluşturulurken Bir Sorun İle Karşılaşıldı"
            }
            res.redirect("/kayit")
          }
          else {
            req.session.sessionFlash = { // eğer başarılı ise mesaj oluştu
              type: "alert alert-success",
              message: "Kullanıcı Oluşturuldu"
            }
            res.redirect("/giris") // ve girişe gönder
          }
        })
      }
      else {
        req.session.sessionFlash = { // eğer kullanıcı varsa çıkacak mesaj
          type: "alert alert-danger",
          message: "Aynı Email de bir kullanıcı var"
        }
        res.redirect("/kayit")
      }
    })

  })
});
router.post("/giris", (req, res) => { // eğer girşe giderse
  const { email, paas } = req.body; // postan gelen verileri yakalıyoruz
  con.query("select * from users where email=?", [email], (err, ress) => { //e mail e göre arat
    if (ress.length >= 1) { // eğer veri varsa
      bcrypt.compare(paas, ress[0].password, function (err, result) { // şifreyi çöz 
        console.log(result)
        if (result) {
          // cookielere kayıt et
          res.cookie("id", ress[0].id) 
          res.cookie("username", ress[0].firstname + " " + ress[0].lastname)
          req.session.sessionFlash = {
            type: "alert alert-success",
            message: "Giriş Yapıldı"
          }
          res.redirect("/")
        }
        else {
          req.session.sessionFlash = {
            type: "alert alert-danger",
            message: "Şifre Yanlış"
          }
          res.redirect("/giris")
        }
      });
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Kullanıcı Bulunamadı"
      }
      res.redirect("/giris")
    }
  })
});
router.get("/cikisyap", async (req, res) => { // çıkış yapaa gitderse 
  if (req.cookies.id || req.cookies.Adminid) { // eğer cookie varsa sil
    res.clearCookie("id");
    res.clearCookie("username");
    res.clearCookie("Adminid");
    res.redirect("/")
  }
  else { // yoksa anasayfaya yönlendir
    res.redirect("/")
  }

})
router.get("/kullanicibilgilerim", (req, res) => { //kullanıcı bilgisi sayfasına girilirse
  if (req.cookies.id) { // id yi yazdır
    const { id } = req.cookies;
    con.query("select * from users where id=?", [id], (err, result) => { // id ye göre sorguyu gönder
      res.render("useroptions", { result: result[0] }); //ve sayfaya kullanıcı bilgilerini gönderiyoruz
    })
  }
  else {
    res.redirect("/giris")
  }

})
router.post("/kullanicibilgilerim", (req, res) => {// eğer kullanıcı güncelle butona tıkladıysa
  const { firstname, lastname, email, paas, hiddenpas } = req.body;
  console.log(paas)
  bcrypt.hash(paas, 10, (err, hash) => {
    let passval;
    if (paas != "") {
      passval = hash;
    }
    else {
      passval = hiddenpas;
    }
    console.log(firstname + " " + lastname + " " + email + " " + req.cookies.id)
    con.query("update users set firstname=?,lastname=?,email=?,password=? where id=?", [firstname, lastname, email, passval, req.cookies.id], function (err) { // kullanıcıyı güncelle
      if (err) {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "Kayıt Edilemedi"
        }
        res.redirect("/kullanicibilgilerim")
      }
      else {
        req.session.sessionFlash = {
          type: "alert alert-success",
          message: "Kayıt Edildi"
        }
        res.redirect("/kullanicibilgilerim")
      }
    })
  })

})
router.get("/iletisim", (req, res) => {
  res.render("iletisim")
})
router.post("/data", (req, res) => { // ajax tan çağırılan verileri çağırmak için
  console.log(req.body.id)
  if (req.cookies.id) {
    con.query("INSERT INTO sepet (user_id,urun_id) VALUES (?,?)", [req.cookies.id, req.body.id], (err) => { // sepete ekle id ye ve gelen ürün datasını gönderiyoruz
      if (err) {
        console.log(err)
      }
    })
    res.json(result = true)
  }
  else {
    res.json(result = false)
  }

})
router.post("/getdat", (req, res) => { // pop up a veri yazdırmak için ajax ile çağırılan fonksyon
  console.log(req.body.id)
  con.query("select u.urunımage,u.id,m.markaname,m.markaImage,u.urunname,u.urunrenk,u.urungaranti,u.urunnot,FORMAT(u.urunprice,2) as urunprice,k.KategoriName from uruns as u inner join markas as m on u.marka_id=m.id inner join kategoriler as k on u.kategori_id=k.id where u.id=?", [req.body.id], (err, result) => { 
    res.json(result);
  })
})
router.get("/arama", (req, res) => { // search için
  con.query("select u.urunımage,u.id,m.markaname,m.markaImage,u.urunname,u.urunrenk,u.urungaranti,u.urunnot,FORMAT(u.urunprice,2) as urunprice from uruns u INNER JOIN kategoriler k on u.kategori_id=k.id INNER JOIN markas m on m.id=u.marka_id WHERE (u.urunname LIKE ?) or (m.markaname LIKE ?) or (k.KategoriName LIKE ?)", [`%${req.query.arama}%`, `%${req.query.arama}%`, `%${req.query.arama}%`], (err, result) => {
    res.render("search", { result: result })
  })
})
router.get("/tumurunler", (req, res) => { 
  con.query("select * from markas", (err, resultmarka) => { // markaları listele
    con.query("select * from kategoriler", (err, resultkategori) => { // kategori listele
      let query = "select u.urunımage,u.id,m.markaname,m.markaImage,u.urunname,u.urunrenk,u.urungaranti,u.urunnot,FORMAT(u.urunprice,2) as urunprice from uruns u INNER JOIN kategoriler k on u.kategori_id=k.id INNER JOIN markas m on m.id=u.marka_id where 1=1";
      if (req.query.urunmarka != "-1") { //eğer ki marka dan boş veri göndrirse direk tümünü al
        if (!isNaN(req.query.urunmarka)) {
          query += " and m.id=" + req.query.urunmarka;
        }
      }
      if (req.query.urunkategori != "-1") { //eğer ki kategori dan boş veri göndrirse direk tümünü al
        if (!isNaN(req.query.urunkategori)) {
          query += " and k.id=" + req.query.urunkategori
        }
      }

      con.query(query, (err, result) => {
        res.render("allurun", { result: result, resultmarka: resultmarka, resultkategori: resultkategori, sonfiltremarka: req.query.urunmarka, sonfiltrekategori: req.query.urunkategori })
      })
    })
  })
})
router.get("/sepetim", (req, res) => { 
  con.query("select ur.id ,s.id as sepetid, ur.urunname,FORMAT(ur.urunprice,2) as price,ur.urunımage , m.markaname , m.markaImage  from uruns ur inner JOIN sepet s on ur.id=s.urun_id INNER JOIN markas m on m.id=ur.marka_id WHERE s.user_id=? order by s.id desc", [req.cookies.id], (err, result) => { //sepetteki ürünleri cookie ye göre çağırıyoruz
    con.query("select FORMAT(sum(u.urunprice),2) as toplamfiyat from uruns u inner join sepet s on u.id=s.urun_id where s.user_id=?", [req.cookies.id], (err, toplammoney) => { // sepetteki ürünlerin tamamının toplamı
      console.log(toplammoney[0])
      res.render("sepet", { result: result,toplammoney:toplammoney[0] })
    })
  })
})
router.get("/sepetsil/:id",(req,res)=>{ 
  con.query("delete from sepet where id=?",[req.params.id],(err)=>{ // sepetten ürün sil
    if(err)
    {
      console.log(err)
    }
    else
    {
      res.redirect("/sepetim")
    }
  })
})
router.get("/sparisitamamla",(req,res)=>{
  res.render("spariscad")
})
router.post("/sparisitamamla",(req,res)=>{
  con.query("select u.id,u.urunprice,s.id as sepetid from sepet s inner join uruns u on s.urun_id=u.id where s.user_id=?",[req.cookies.id],(err,reques)=>{ // sepetteki ürünleri çağırıyoruz
    reques.forEach((e)=>{ // bunları satış tablosuna aktarıyoruz
      con.query("insert into satis (urun_id,user_id,price,added_date) values (?,?,?,NOW())",[e.id,req.cookies.id,e.urunprice])
    })
    con.query("delete from sepet where user_id=?",[req.cookies.id]) // ve sepetteki ürünleri siliyoruz
  })
  res.redirect("/sparislerim")
})
router.get("/sparislerim",(req,res)=>{ //sparişlerim sayfasına gidince satın alınan ürünleri çağırma
  con.query("select u.urunname,u.`urunımage`,s.added_date,s.price from satis s inner join uruns u on s.urun_id=u.id where s.user_id=?",[req.cookies.id],(err,result)=>{
    res.render("sparisler",{result:result})
  })
})
router.get("/urunbilgilendirme",(req,res)=>{
  res.render("urunbilgilendirme");
})
module.exports = router;