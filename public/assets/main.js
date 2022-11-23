var txtcredychard = document.querySelector(".txtcredychard"); //Kart Numarasını çekeceğimiz inputu tanım
if (txtcredychard != null) {
  var cardval, cardvalnoexSplit;
  txtcredychard.addEventListener("keydown", function (e) {
    cardval = txtcredychard.value; // Burada inputa girilen veriyi her tuşa basıldığında veriyi tutuyoruz 
    cardvalnoexSplit = cardval.replace(/-/gi, '') // burada ise verinin içerisinde önceden eklenmiş olan "-" karakterleri siliyoruz ve gerçek veriye ulaştık
    if (cardvalnoexSplit.length % 4 == 0 && cardval.length > 1 && cardval.length < 19) // burada ise ilk başta gerçek verinin uzunluğu kadar mod alıp kalan sonucu 4 çıkarsa ve "-" yi en başa koymasın diye ve en sonra koymasın diye bir aralık belirledim
      txtcredychard.value += "-"; // eğer tüm koşulları karşılarsa "-" ekle
    if (e.keyCode == 8) // eğer backspaceye basarsa 
      txtcredychard.value = cardval.substring(0, cardval.length) // girilen verinin son kısımını siliyoruz eğer silmezsek 4 e bölünürse sonsuz bir döngüye girerek silmiyor  
  })
}
try 
{
  var navbarsHesabimList = document.querySelector(".list-Hesabim");
  var navbarsHesabimsMenu = document.querySelector(".list-menu");
  var hesabimMenuKapamaIcon = document.querySelector(".hesabimMenuKapamaIcon");
  if (navbarsHesabimList != null && navbarsHesabimsMenu != null && hesabimMenuKapamaIcon != null)
    navbarsHesabimList.addEventListener("mouseenter", () => { //mouse giriş yapma olayında
      navbarsHesabimsMenu.style.transform = "translate(0%, 0%) scale(1)"; // boyutunu büyültüyor
    });
  navbarsHesabimsMenu.addEventListener("mouseleave", () => {
    navbarsHesabimsMenu.style.transform = "translate(0%, 0%) scale(0)"; //boyutunu küçültüyor
  });
  hesabimMenuKapamaIcon.addEventListener("click", () => {
    navbarsHesabimsMenu.style.transform = "translate(0%, 0%) scale(0)";//boyutunu küçültüyor
  });
  var imageinput = document.querySelector(".txtmarkaresim");
  var imgles = document.querySelector(".img-les")
  if (imageinput != null) {
    imageinput.addEventListener("change", () => {
      console.log("im")
      const [file] = imageinput.files
      if (file) {
        imgles.src = URL.createObjectURL(file)
      }
    })
  }
}
catch{

}

var conProductAll = document.querySelectorAll(".con-product-all");
conProductAll.forEach((e) => {
  var productImg = e.querySelector(".product-Img");
  var btnSepeteEkle = e.querySelector(".btn-sepete-ekle");
  var productPrice = e.querySelector(".product-Price");
  e.addEventListener("mouseenter", () => {
    productImg.style.overflow = "hidden";
    productImg.style.transform = "translate(0%, 0%) scale(1.1)";

    productPrice.style.marginBottom = "40px";
  });
  e.addEventListener("mouseleave", () => {
    productImg.style.transform = "translate(0%, 0%) scale(1)";
    productPrice.style.marginBottom = "0px";
  });
});

function ysAjax(url, method, data, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (typeof callback == 'function') {
        callback(this);
      }
    }
  }
  xhr.open(method, url);
  if (method == 'POST' && !(data instanceof FormData)) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.send(data);
}
var toastMixin = Swal.mixin({
  toast: true,
  icon: 'success',
  title: 'General Title',
  animation: false,
  position: 'top-right',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});
function alertt(mes) {
  $('.bd-example-modal-xl').modal('hide')
  toastMixin.fire({
    animation: true,
    title: mes,
    position: 'bottom-end',
  });
}
function addvalat(val) {
  ysAjax("data", "POST", "id=" + val, function (sonuc) {

    console.log(sonuc.responseText)
    if (sonuc.responseText == "false") {

      window.location.href = "http://localhost:3000/giris"
    }
    else {
      alertt("Ürün Sepete Eklendi");
    }
  });
}
let imgurun = document.querySelector(".imgurunimg")
let urunname = document.querySelector(".urun-name")
let markaımg = document.querySelector(".imgmarkaimg")
let txtmarka = document.querySelector(".txtmarka")
let txtrenk = document.querySelector(".txtrenk")
let txtgaranti = document.querySelector(".txtgaranti")
let txturunprop = document.querySelector(".txturunprop")
let txturunprice = document.querySelector(".txturunprice")
let txtkategori = document.querySelector(".txtkategori")
let txtids = document.querySelector(".txtids")
let tosa = document.querySelector(".tosa")
function getdetails(val) {
  ysAjax("getdat", "POST", "id=" + val, function (sonuc) {
    let data = JSON.parse(sonuc.responseText)[0];
    console.log(data)
    txtids.value=data.id;
    imgurun.src=data.urunımage;
    urunname.innerHTML=data.urunname;
    markaımg.src=data.markaImage;
    txtmarka.innerHTML=data.markaname;
    txtrenk.innerHTML=data.urunrenk;
    txtgaranti.innerHTML=data.urungaranti + " Yıl";
    txturunprop.innerHTML=data.urunnot;
    txturunprice.innerHTML=data.urunprice+" TL";
    txtkategori.innerHTML=data.KategoriName;
  })
}
tosa.addEventListener("click",()=>{
  ysAjax("data", "POST", "id=" + txtids.value, function (sonuc) {
    console.log(sonuc.responseText)
    if (sonuc.responseText == "false") {

      window.location.href = "http://localhost:3000/giris"
    }
    else {
      alertt("Ürün Sepete Eklendi");
    }
  });
})