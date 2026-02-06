let cachedProducts = []; 
let cachedCategories = [];

async function fetchAllData() {
    const url = "https://docs.google.com/spreadsheets/d/10TzvwA5p98p3tjBkpvsnQRGzp5AHY8-nAiPKPOOjR4Q/gviz/tq?&sheet=Products&headers=1";
    
    try {
        const res = await fetch(url);
        let text = await res.text();
        let data = JSON.parse(text.substring(47).slice(0, -2));

        cachedProducts = data.table.rows.map((row, index) => {
            const cells = row.c;
            return {
                id: cells[0]?.v || index,
                firstimage: cells[1]?.v || "",
                secondimage: cells[2]?.v || "",
                thirdimage: cells[3]?.v || "",
                title: cells[4]?.v || "",
                description: cells[5]?.v || "",
                price: Number(cells[6]?.v) || 0,
                beforDiscount: Number(cells[7]?.v) || 0,
                category: cells[8]?.v || ""
            };
        });
        return cachedProducts;
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}


async function getcategories() {
    const url = "https://docs.google.com/spreadsheets/d/10TzvwA5p98p3tjBkpvsnQRGzp5AHY8-nAiPKPOOjR4Q/gviz/tq?&sheet=categories&headers=1";

    const res = await fetch(url);
    let data = await res.text();

    data = data.substring(47).slice(0, -2);
    data = JSON.parse(data);

    let cachedCategories = [];
    data.table.rows.forEach((row, index) => {
        const cells = row.c;
        cachedCategories.push({
            category: cells[0]?.v || ""
        });
    });

    return cachedCategories;
}
document.addEventListener("DOMContentLoaded", async function() {

    // 1️⃣ تحميل البيانات
    await fetchAllData();

    // 2️⃣ تجهيز Fuse بعد ما البيانات تبقى جاهزة
    if (typeof Fuse !== 'undefined') {
        fuse = new Fuse(cachedProducts, {
            keys: ['title', 'description', 'category'],
            threshold: 0.4,
            distance: 100
        });
    }

    get_cart_number();

    // الصفحة الرئيسية
    let sectionProducts = document.getElementById('products');
    if (sectionProducts) {
        sectionProducts.innerHTML = "";
        cachedProducts.forEach(p => sectionProducts.innerHTML += card(p));
        
        let cats = await getcategories();
        displaycategories(cats);
    }

    // صفحة السلة
    if (document.getElementById('cartcontent')) {
        showcart();
        getTotal();
        get_Products_input_names();
    }

    // صفحة التفاصيل
    if (document.getElementById('Detailes')) {
        handleDetailsPage();
    }

    // صفحة البحث
    if (document.getElementById('searchResults')) {
        handleSearchPage();
    }
});

// دالة معالجة صفحة التفاصيل
// function handleDetailsPage() {
//     let Detalies = document.getElementById('Detailes');
//     let queryParams = new URLSearchParams(window.location.search);
//     let productId = parseInt(queryParams.get('id'));

//     if (!isNaN(productId)) {
//         // البحث في الكاش اللي حملناه في أول الخطوات
//         let product = cachedProducts.find(p => String(p.id) === String(productId));
        
//         if (product) {
//             Detalies.innerHTML = `
//                 <div class="container py-5">
//                     <div class="row">
//                         <div class="col-md-6 text-center">
//                             <img src="${product.firstimage}" class="img-fluid rounded shadow" style="max-height:400px">
//                         </div>
//                         <div class="col-md-6 mt-4 mt-md-0">
//                             <h2>${product.title}</h2>
//                             <span class="badge badge-info mb-3">${product.category}</span>
//                             <p class="lead">${product.description}</p>
//                             <h3 class="text-success">${product.price} EGP</h3>
//                             <button class="btn btn-info btn-lg w-100 mt-4" onclick="addToCart(${product.id})">
//                                 Add To Cart <i class="fa-solid fa-cart-plus"></i>
//                             </button>
//                         </div>
//                     </div>
//                 </div>`;
//         } else {
//             Detalies.innerHTML = `<h1 class="text-center mt-5">المنتج غير موجود</h1>`;
//         }
//     }
// }

function handleDetailsPage() {
    let Detalies = document.getElementById('Detailes');
    let queryParams = new URLSearchParams(window.location.search);
    let productId = parseInt(queryParams.get('id'));

    if (!isNaN(productId)) {
        let product = cachedProducts.find(p => String(p.id) === String(productId));
        
        if (product) {
            // نجمع الصور الموجودة فقط
            const images = [product.firstimage, product.secondimage, product.thirdimage]
                .filter(img => img && img.trim() !== "");

            Detalies.innerHTML = `
                <div class="container py-5">
                    <div class="row">
                        <div class="col-md-6 text-center">
                            <div class="swiper product-detail-slider">
                                <div class="swiper-wrapper">
                                    ${images.map(img => `
                                        <div class="swiper-slide">
                                            <img src="${img}" class="img-fluid rounded shadow" 
                                                 style="max-height:400px; width:100%; object-fit:contain;">
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="swiper-pagination"></div>
                                <div class="swiper-button-next"></div>
                                <div class="swiper-button-prev"></div>
                            </div>
                        </div>

                        <div class="col-md-6 mt-4 mt-md-0">
                            <h2>${product.title}</h2>
                            <span class="badge badge-info mb-3">${product.category}</span>
                            <p class="lead">${product.description}</p>
                            <h3 class="text-success">${product.price} EGP</h3>
                            <button class="btn btn-info btn-lg w-100 mt-4" onclick="addToCart(${product.id})">
                                Add To Cart <i class="fa-solid fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // تهيئة السلايدر بعد إضافته للـ DOM
            new Swiper('.product-detail-slider', {
                loop: images.length > 1,
                autoplay: images.length > 1 ? { delay: 3000, disableOnInteraction: false } : false,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
            });
        } else {
            Detalies.innerHTML = `<h1 class="text-center mt-5">المنتج غير موجود</h1>`;
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////   

function card(product) {
    return `
    <div class="col-lg-3 col-md-4 col-sm-6 col-6 mb-4">
        <div class="card semester${product.category} search-card mt-3 h-100 shadow-sm border-0" 
             style="transition: transform 0.3s, box-shadow 0.3s; border-radius: 15px; overflow: hidden;">

            <div class="card-img-top text-center bg-light" 
                 onclick="showDetailes(${product.id})" 
                 style="height: 220px; overflow: hidden; cursor: pointer;">
                <img loading="lazy" src="${product.firstimage}" alt="${product.title}" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5 class="card-title search-title text-dark mb-1" 
                        style="font-size: 1.1rem; font-weight: 600; min-height: 45px; overflow: hidden;">
                        ${product.title}
                    </h5>
                    <p class="card-text h5 text-info font-weight-bold mb-1">
                        ${product.price} <small style="font-size: 12px;">EGP</small>
                    </p>
                    
                    ${product.beforDiscount > 0 ? `
                        <p class="card-text mb-3" style="text-decoration: line-through; color: gray; font-size: 0.9rem;">
                            ${product.beforDiscount} EGP
                        </p>` : '<div class="mb-3" style="height: 1.2rem;"></div>'}
                </div>
                     
                <div class="print">
                    <button class="btn btn-info w-100 shadow-sm text-white" style="border-radius: 12px;" 
                            onclick="addToCart(${product.id})">
                        <span>Add To Cart</span>
                        <i class="fa-solid fa-cart-plus ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////


function showDetailes(id){
    window.location.href=`detailes.html?id=${id}`;    
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // البحث عن المنتج داخل السلة باستخدام الـ id فقط
    let existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        // لو المنتج موجود: زوّد الكمية
        existingProduct.amount += 1;
    } else {
        // لو المنتج جديد: ضيفه بالسلة مع amount = 1
        cart.push({
            id: productId,
            amount: 1
        });
    }

    // حفظ التغييرات
    localStorage.setItem('cart', JSON.stringify(cart));

    // تحديث عدد السلة
    get_cart_number();
}





function cartProduct(cartProducts, index, products) {
    let item = cartProducts[index];

    let product = products.find(p => p.id === item.id);
    if (!product) return `
    <div class="box d-flex w-100 pt-5 pb-3 text-dark" style="border-bottom:2px black solid;">
        <div class="boxBody pl-5 col-7">
            <h4>Product Not Found</h4>
        </div>
    </div>
    `;

    return `
    <div class="box d-flex w-100 pt-5 pb-3 text-dark" style="border-bottom:2px black solid;">
        <img src="${product.firstimage}" width="100px" style="border-radius:20px">

        <div class="boxBody pl-5 col-7">
            <h4>${product.title}</h4>
            <div>Price: ${product.price} EGP</div>

            <div class="mt-2">
                <button class="btn btn-sm btn-warning" onclick="decreaseQuantity(${product.id})">-</button>
                <span class="mx-2">${item.amount}</span>
                <button class="btn btn-sm btn-warning" onclick="increaseQuantity(${product.id})">+</button>
                <p class="mt-2">Total: ${product.price * item.amount} EGP</p>
            </div>
        </div>
         <div>

        <button class="btn btn-outline-danger mt-5" onclick="removecart(${product.id})">
            <i class="fa-solid fa-trash"></i>
        </button>
        </div>
    </div>
    `;
}


async function showcart() {
    let cartcontent = document.getElementById('cartcontent');
    if (!cartcontent) return;

    let cartProducts = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartProducts.length === 0) {
        cartcontent.innerHTML = `
        <div class="container w-100 d-flex justify-content-center align-items-center" style="height:75vh;">
            <div class="text-center p-4" style="border:2px dotted black;border-radius:20px">
                <p class="h2"><i class="fa-solid fa-cart-shopping"></i> Your cart is empty</p>
                <a href="index.html" class="btn btn-primary mt-3">Go to Home</a>
            </div>
        </div>`;
        return;
    }

    // نستخدم البيانات المخزنة مسبقاً
    cartcontent.innerHTML = "";
    cartcontent.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="text-info">سلة المشتريات</h4>
    <button class="btn btn-outline-danger btn-sm" onclick="clearFullCart()">
        <i class="fa-solid fa-trash-can"></i> مسح السلة بالكامل
    </button>
</div>

<div class="cartcontent col-lg-6 col-md-12 col-sm-12" id="cartcontent" ...>
    </div>`;

    cartProducts.forEach((item, index) => {
        cartcontent.innerHTML += cartProduct(cartProducts, index, cachedProducts);
    });
}

function refreshCart() {
    document.getElementById('cartcontent').innerHTML = "";
    showcart();
    getTotal();
    get_cart_number();
    get_Products_input_names();
}

function increaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let item = cart.find(p => p.id === productId);
    if (item) {
        item.amount += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        refreshCart();
    }
}
function decreaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let itemIndex = cart.findIndex(p => p.id === productId);

    if (itemIndex !== -1) {
        if (cart[itemIndex].amount > 1) {
            cart[itemIndex].amount -= 1;
        } else {
            cart.splice(itemIndex, 1); // حذف المنتج إذا وصلت الكمية للصفر
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        refreshCart();
    }
}




function removecart(productId){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart = cart.filter(item => item.id !== productId);

    localStorage.setItem('cart', JSON.stringify(cart));
    refreshCart();
}

function getTotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let result = 0;

    cart.forEach(item => {
        // البحث في الكاش بدلاً من استدعاء API
        let product = cachedProducts.find(p => p.id === item.id);
        if (product) {
            result += product.price * item.amount;
        }
    });

    let total = document.getElementById('total');
    if (total) {
        total.innerHTML = `Total : ${result} EGP`;
    }
}





function get_cart_number(){
    if(localStorage.getItem('cart')){
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = 0;
        
        for(let i = 0; i < cart.length; i++){
            totalItems += cart[i].amount || 1;  
        }
        document.getElementById('cartCounter').innerHTML=`<i class="fa-solid fa-cart-plus h5 p-2  bg-info" style="border-radius:20px"> ${totalItems} `;
      }
}

function get_Products_input_names(){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let result = "";

    cart.forEach(item => {
        let product = cachedProducts.find(p => p.id === item.id);
        if (product) {
            result += `${item.id} -> ${product.title} => ${item.amount} ; \n`;
        }
    });

    let input = document.getElementById('Products_input_names');
    if (input) input.value = result;
}

//////////////////////////////////////////////////////////////////////////////////////////

function filterByCat(type,el) {
    let sectionProducts = document.getElementById('products');
    if (!sectionProducts) return;

    // الفلترة تتم من المتغير المخزن في الذاكرة مباشرة
    let filtered = (type === 'all') ? cachedProducts : cachedProducts.filter(p => p.category === type);


    sectionProducts.innerHTML = "";    
    filtered.forEach(product => {
        sectionProducts.innerHTML += card(product);
    });

    document.querySelectorAll('.filterBtn').forEach(btn => {
    btn.classList.remove('active');
  });
  el.classList.add('active');
}


function displaycategories(categories) {
    let categorysection = document.getElementById('categories');
    
    // تجميع الأزرار في متغير واحد لتحسين الأداء
    let buttonsHTML = `            
        <button class="filterBtn active btn btn-outline-info m-1 Aall    shadow-sm" 
            style="border-radius: 20px; font-weight: 500;"
            onclick="filterByCat('all',this)">
            all
        </button>`;    
    categories.forEach(cat => {
        buttonsHTML += `
            <button class="filterBtn ${cat.category === 'all' ? 'active' : ''} btn btn-outline-info m-1 A${cat.category} shadow-sm" 
                    style="border-radius: 20px; font-weight: 500;"
                    onclick="filterByCat('${cat.category}',this)">
                ${cat.category}
            </button>`;
    });

    categorysection.innerHTML = buttonsHTML;
}

// تشغيل المشروع

/////////////////////////////////////////////////////////////////////////////////////////

let fuse; // متغير عالمي للمحرك
    let params = new URLSearchParams(window.location.search);
    let searchTerm = params.get('search');
if(searchTerm){
document.addEventListener("DOMContentLoaded", async function() {
    // 1. جلب البيانات (مرة واحدة)
    
    // 2. تهيئة Fuse.js بالبيانات المخزنة
    const options = {
        keys: ['title', 'description', 'category'], // الحقول اللي هيتم البحث فيها
        threshold: 0.4, // نسبة السماح بالأخطاء الإملائية
        distance: 100   // مدى قرب الحروف من بعضها
    };
    fuse = new Fuse(cachedProducts, options);

    // 3. ربط خانة البحث (إذا كانت موجودة في الصفحة الحالية)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            
            if (query.trim() === "") {
                renderProducts(cachedProducts); // عرض الكل لو الخانة فاضية
            } else {
                const results = fuse.search(query);
                const filtered = results.map(r => r.item); // استخراج المنتجات فقط
                renderProducts(filtered);
            }
        });
    }
    
    // باقي منطق الصفحات (الرئيسية، السلة، التفاصيل)...
    get_cart_number();
    // ...
});

}

function handleSearchPage() {
    let params = new URLSearchParams(window.location.search);
    let searchTerm = params.get('search');

    let resultsContainer = document.getElementById('searchResults');
    let titleDiv = document.getElementById('searchTitle');


    if (!searchTerm || searchTerm.trim() === "") {
        titleDiv.innerHTML = `<h3 class="text-center mt-4">Please enter a search term</h3>`;
        return;
    }

    titleDiv.innerHTML = `
      <h2 class="text-center my-4">
        Search Results for "<span class="text-info">${searchTerm}</span>"
      </h2>
    `;
    let searchInput = document.getElementById('search');
    searchInput.value = searchTerm;

    if (!fuse) {
        resultsContainer.innerHTML = `<p class="text-center">Search engine not ready</p>`;
        return;
    }

    let results = fuse.search(searchTerm);
    let products = results.map(r => r.item);

    resultsContainer.innerHTML = "";

    if (products.length === 0) {
        resultsContainer.innerHTML = `
          <p class="text-center w-100 h4 mt-4">No products found</p>
        `;
        return;
    }

    products.forEach(p => {
        resultsContainer.innerHTML += card(p);
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById('loader-wrapper');

    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 500);     }
});
