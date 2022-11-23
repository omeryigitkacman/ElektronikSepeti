const express = require("express");
const router = express.Router()
const con = require("../modal/dbconnection");
const bcrypt = require("bcrypt");
const path = require("path"); // dosya yolu için kullanıyoruz
const res = require("express/lib/response");
router.get("/", (req, res) => {
  if (req.cookies.Adminid != null) {
    res.redirect("/admin/anasayfa")
  }
  else {
    if (!req.cookies.id) {
      res.render("adminlogin");
    }
    else {
      res.redirect("/")
    }
  }
})
router.post("/", (req, res) => { 
  const { email, paas } = req.body;
  console.log(email + " " + paas)
  con.query("select * from admin where adminemail=?", [email], (err, ress) => {
    if (ress.length > 0) {// admin kullanıcıyı kontrol ediyoruz sayfasında kontrol yapıyoruz 
      bcrypt.compare(paas, ress[0].adminpassword, function (err, result) {

        if (result) {
          res.cookie("Adminid", ress[0].id)
          res.cookie("username", ress[0].adminusername)
          res.clearCookie("id")
          req.session.sessionFlash = {
            type: "alert alert-success",
            message: "Giriş Yapıldı"
          }
          res.redirect("/admin/anasayfa")
        }
        else {
          req.session.sessionFlash = {
            type: "alert alert-danger",
            message: "Şifre Yanlış"
          }
          res.redirect("/admin")
        }
      });
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Kullanıcı Bulunamadı"
      }
      res.redirect("/admin")
    }
  })
});
router.get("/anasayfa", async (req, res) => { // admin sayafsındaki anasayfada kullanıcıları listeliyoruz
  if (req.cookies.Adminid != null) {
    let qu = await con.query("select * from users order by id desc", (err, result) => {
      res.render("adminindex", { result: result })
    })
  }
  else {
    res.redirect("/")
  }
})
router.get("/kullanicisil/:id", async (req, res) => { // linkten gelen veriye göre kullanıcıyı siliyoruz
  con.query("delete from sepet where user_id=?",[req.params.id])
  con.query("delete from satis where user_id=?",[req.params.id])
  let del = await con.query("delete from users where id=?", [req.params.id], (err) => {
    if (err) {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Kullanıcı Silinemedi"
      }
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "Kullanıcı Silindi"
      }
    }
  })
  res.redirect("/admin/anasayfa")
})
router.get("/kullaniciguncelle/:id", (req, res) => { // linkten gelen veriye göre kullanıcıyı getiriyoruz
  con.query("select * from users where id=?", [req.params.id], (err, result) => {
    console.log(result[0])
    res.render("adminuseroptions", { result: result[0] });
  })
})

router.post("/kullaniciguncelle/:id", (req, res) => { // eğer ki güncelle butonua tıklandıysa veriyi güncelle
  const { firstname, lastname, email, paas, hiddenpas } = req.body;
  console.log(paas)
  bcrypt.hash(paas, 10, (err, hash) => { // tekrardan şifreyi şifrele
    let passval;
    if (paas != "") {
      passval = hash;
    }
    else {
      passval = hiddenpas;
    }
    con.query("update users set firstname=?,lastname=?,email=?,password=? where id=?", [firstname, lastname, email, passval, req.params.id], function (err) { // güncelle
      if (err) {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "Kayıt Edilemedi"
        }
        res.redirect("/admin/kullaniciguncelle/" + req.params.id)
      }
      else {
        req.session.sessionFlash = {
          type: "alert alert-success",
          message: "Kayıt Edildi"
        }
        res.redirect("/admin/kullaniciguncelle/" + req.params.id)
      }
    })
  })
})
router.get("/markaekle", (req, res) => { // marka ekle ekranına yönlendirme
  if (req.cookies.Adminid) {
    res.render("adminmarkaadd")
  }
  else {
    res.redirect("/admin/markalistele")

  }
})
router.post("/markaekle", (req, res) => {
  if (req.cookies.Adminid) {
    const { markaname } = req.body;
    const markaImagePath = req.files.markaImagePath; // formdan gelen fileleri yakalıyoruz
    const ImagePath = path.resolve(__dirname, "../public/markaImages", markaImagePath.name) // veriyi yükleyeceğimiz dosya yolunu  veriyoruz
    con.query("Insert Into markas (markaname,markaImage) values (?,?)", [markaname, `/markaImages/${markaImagePath.name}`], (err) => { // ve ekliyoruz
      if (err) {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "Eklenemedi"
        }
      }
      else {
        markaImagePath.mv(ImagePath)
        req.session.sessionFlash = {
          type: "alert alert-success",
          message: "Eklendi"
        }
      }
    })
    res.redirect("/admin/markalistele")
  }
  else {
    res.redirect("/admin")
  }
})
router.get("/markalistele", (req, res) => { //tüm markaları listele
  if (req.cookies.Adminid) {
    con.query("select * from markas", (err, result) => {
      res.render("adminmarkalar", { result: result })
    })
  }
  else {
  }
})
router.get("/markasil/:id", (req, res) => { 
  con.query("delete from markas where id=?", [req.params.id], (err) => {// gelen linke göre marka id ye göre veriyi silme verisini gönderiyoruz
    if (err) {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Markaya Ait Ürünler Var Bu Marka Silinemez "
      }
      res.redirect("/admin/markalistele")
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "Başarılı Bir Şekilde Silindi"
      }
      res.redirect("/admin/markalistele")
    }
  })
})
router.get("/markaguncelle/:id", (req, res) => {// marka güncelle id ye göre yazdırma
  con.query("select * from markas where id=?", [req.params.id], (err, result) => {
    console.log(result[0])
    res.render("adminmarkaoptions", { result: result[0] });
  })
})
router.post("/markaguncelle/:id", (req, res) => {

  const { markaname,markayedekpath } = req.body;
    var urunlist="";
    var nullcheck=false;

    try
    {
      urunlist = req.files.markaImagePath;
    }
    catch{
      urunlist=markayedekpath;
      nullcheck=true;
    }
  
    if(nullcheck!=true)
    {
      console.log("Çalıştı")
      const ImagePath = path.resolve(__dirname, "../public/markaImages", urunlist.name)
      urunlist.mv(ImagePath);
      urunlist=`/markaImages/${urunlist.name}`
    }

    con.query("update markas set markaname=?,markaImage=? where id=? ", [markaname, urunlist, req.params.id], (err) => {
      if (err) {
        session.sessionFlash = {
          type: "alert alert-danger",
          message: "Değişiklikler Kayıt Edilemedi"
        }
      }
      else {
        req.session.sessionFlash = {
          type: "alert alert-success",
          message: "Değişiklikler Kayıt Edildi"
        }
      }
      res.redirect("/admin/markalistele");

    })
  
})
router.get("/kategorilistele", (req, res) => {
  if (req.cookies.Adminid) {
    con.query("select * from kategoriler", (err, result) => {
      res.render("adminkategorilist", { result: result })
    })
  }
  else {
  }
})
router.get("/kategoriekle", (req, res) => {
  if (req.cookies.Adminid) {
    res.render("adminkategoriadd")
  }
  else {
    res.render("/admin")
  }
})
router.post("/kategoriekle", (req, res) => {
  if (req.cookies.Adminid) {
    con.query("insert into kategoriler (KategoriName) values (?)", [req.body.kategorianame], (err) => {
      if (err) {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "Kategori Eklenirken Bir Hata Oluştu"
        }
        res.redirect("/admin/kategoriekle")
      }
      else {
        req.session.sessionFlash = {
          type: "alert alert-success",
          message: "Değişiklikler Kayıt Edildi"
        }
        res.redirect("/admin/kategorilistele")
      }

    })
  }
  else {
    res.render("/admin")
  }
})
router.get("/kategorisil/:id", async (req, res) => {
  let del = await con.query("delete from kategoriler where id=?", [req.params.id], (err) => {
    if (err) {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Kategoriye ait ürün var kategori silinemez"
      }
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "Kategori Silindi"
      }
    }
  })
  res.redirect("/admin/kategorilistele")
})
router.get("/kategoriguncelle/:id", (req, res) => {
  con.query("select * from kategoriler where id=?", [req.params.id], (err, result) => {
    console.log(result[0])
    res.render("adminkategorioptions", { result: result[0] });
  })
})
router.post("/kategoriguncelle/:id", (req, res) => {
  con.query("update kategoriler set KategoriName=? where id=?", [req.body.kategorianame, req.params.id], (err) => {
    if (err) {
      console.log(err);
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Kategori Güncellenemedi"
      }
    }
    else {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "Kategori Güncellendi"
      }
    }
    res.redirect("/admin/kategorilistele")
  })
})
router.get("/urunekle", (req, res) => {
  if (req.cookies.Adminid) {
    con.query("select * from markas", (err, resultmarka) => {
      if (!err) {
        con.query("select * from kategoriler", (err, resultkategori) => {
          res.render("adminurunadd", { resultmarka: resultmarka, resultkategori: resultkategori });
        })
      }
      else {
        res.redirect("/admin")
      }
    })
  }
})
router.post("/urunekle", (req, res) => {
  const { urunmodel, urunfiyat, urunstock, urunrenk, urunmarka, urunkategori, urunnot, urungaranti } = req.body;
  const urunImagePath = req.files.urunImagePath;
  const ImagePath = path.resolve(__dirname, "../public/urunImages", urunImagePath.name)

  con.query("insert into uruns (urunname,urunprice,urunstock,marka_id,kategori_id,urunımage,urungaranti,urunnot,urunrenk) values (?,?,?,?,?,?,?,?,?)", [urunmodel, urunfiyat, urunstock, urunmarka, urunkategori, `/urunImages/${urunImagePath.name}`, urungaranti, urunnot, urunrenk], (err) => {
    if (err) {
      console.log(err);
    }
    else {
      urunImagePath.mv(ImagePath)
      res.redirect("/admin/urunlist")
    }
  })
})
router.get("/urungucelle/:id", (req, res) => {
  if (req.cookies.Adminid) {
    con.query("select * from markas", (err, resultmarka) => {
      con.query("select * from kategoriler", (err, resultkategori) => {
        con.query("select * from uruns where id=?", [req.params.id], (err, urunsresult) => {
          console.log(urunsresult)
          res.render("adminurunoptions", { resultmarka: resultmarka, resultkategori: resultkategori, urunsresult: urunsresult[0] });
        })
      })
    })
  }
})
router.get("/urunlist", (req, res) => {
  if (req.cookies.Adminid) {
    con.query("select * from uruns order by id desc", (err, result) => {
      res.render("adminurunlist", { result: result });
    })
  }
})
router.get("/urunsil/:id",(req,res)=>{
  if(req.cookies.Adminid){
    con.query(" delete from sepet where urun_id=?",[req.params.id],(errr)=>{
      con.query("delete from uruns where id=? ",[req.params.id],(err)=>{
        if(err){
          console.log(err)
          req.session.sessionFlash = {
            type: "alert alert-danger",
            message: "Kullanıcıların Sepetinde Bu Ürün var Silinemez"
          }
        }
        else
        {
          req.session.sessionFlash = {
            type: "alert alert-success",
            message: "Ürün Silindi"
          }
        }
      })
    })
    
    res.redirect("/admin/urunlist")
  }
})
router.post("/urungucelle/:id", (req, res) => {
  if (req.cookies.Adminid) {

    const { urunmodel, urunfiyat, urunstock, urunrenk, urunmarka, urunkategori, urunnot, urungaranti,urunYedekImage } = req.body;
    var urunlist="";
    var nullcheck=false;
    try
    {
      urunlist = req.files.urunupdateImagePath;
    }
    catch{
      urunlist=urunYedekImage;
      nullcheck=true;
    }
  
    if(nullcheck!=true)
    {
      const ImagePath = path.resolve(__dirname, "../public/urunImages", urunlist.name)
      urunlist.mv(ImagePath);
      urunlist=`/urunImages/${urunlist.name}`
    }
    con.query("update uruns set urunname=?,urunprice=?,urunstock=?,marka_id=?,kategori_id=?,urunımage=?,urungaranti=?,urunnot=?,urunrenk=? where id=?",
    [urunmodel,urunfiyat,urunstock,urunmarka,urunkategori,urunlist,urungaranti,urunnot,urunrenk,req.params.id],(err)=>{
      if(err)
      {
        console.log(err)
        res.redirect("/admin/urungucelle/"+req.params.id)
      } 
      else
      {
        res.redirect("/admin/urunlist")
      }   
    }
    )
  }
})
router.get("/satislar",(req,res)=>{
  con.query("select us.email,s.id, u.urunname,u.`urunımage`,s.added_date,FORMAT(s.price,2) as price  from satis s inner join uruns u on s.urun_id=u.id inner join users us on s.user_id=us.id",(err,result)=>{
    console.log(result);
    res.render("adminsatis",{result:result})
  })
})
router.use(express.static(__dirname + '/public'))
module.exports = router;