async function getProducts() {

    const url = "https://docs.google.com/spreadsheets/d/10TzvwA5p98p3tjBkpvsnQRGzp5AHY8-nAiPKPOOjR4Q/gviz/tq?&sheet=Products";

    const res = await fetch(url);
    let data = await res.text();

    data = data.substring(47).slice(0, -2);
    data = JSON.parse(data);

    let products = [];

    data.table.rows.forEach((row, index) => {
        const cells = row.c;

        products.push({
            id:cells[0]?.v || index,
            img: cells[1]?.v || "",
            title: cells[4]?.v || "",
            description: cells[5]?.v || "",
            price: Number(cells[6]?.v) || 0,
            discount: Number(cells[7]?.v) || 0,
            category: cells[8]?.v || ""
        });
    });

    return products;
}

// 2. دالة تحويل التاريخ

function excelDateToJS(serial) {
    if (!serial || isNaN(serial)) return serial;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toLocaleString('en-us', { hour12: true });
}

// 3. المحرك الرئيسي للفاتورة
async function initInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const allProducts = await getProducts(); // جلب قائمة الأسعار

    // عرض البيانات الأساسية
    document.getElementById('dateVal').innerText = excelDateToJS(urlParams.get('time'));
    document.getElementById('nameVal').innerText = urlParams.get('name') || "---";
    document.getElementById('phoneVal').innerText = urlParams.get('phone') || "---";
    document.getElementById('addressVal').innerText = urlParams.get('address') || "---";
    document.getElementById('paymentVal').innerText = urlParams.get('payment') || "كاش";

    const customerName = urlParams.get('name') || 'Invoice';
document.title = `Invoice - ${customerName}`;

    // معالجة الطلبات وحساب الأسعار
    const orderRaw = urlParams.get('order');
    if (orderRaw) {
        const items = orderRaw.split(';').filter(i => i.trim() !== "");
        const tbody = document.getElementById('orderTableBody');
        let totalInvoice = 0;

        items.forEach((item, index) => {
            // استخراج الـ ID والكمية من النص (مثال: 43->Wooden Wedges=>1)
            const parts = item.split('=>');
            const qty = parseInt(parts[1]) || 0;
            const id = parts[0].split('->')[0].trim(); // استخراج الـ ID (رقم 43)

            // البحث عن المنتج في القائمة التي جلبناها من الشيت باستخدام الـ ID
            const productInfo = allProducts.find(p => String(p.id) === String(id));
            
            const price = productInfo ? productInfo.price : 0;
            const img = productInfo ? productInfo.img : "";
            const title = productInfo ? productInfo.title : "منتج غير مسجل";
            const rowTotal = price * qty;
            totalInvoice += rowTotal;

            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="${img}" style="width:50px; border-radius:5px;" alt="product"></td>
                    <td>${title}</td>
                    <td class="text-center">${qty}</td>
                    <td class="text-center">${price.toLocaleString()} ج.م</td>
                    <td class="text-center font-weight-bold">${rowTotal.toLocaleString()} ج.م</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        document.getElementById('grandTotal').innerText = totalInvoice.toLocaleString() + " ج.م";
    }
}

// تشغيل الوظيفة عند تحميل الصفحة
initInvoice();


document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById('loader-wrapper');

    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 500); 
    }
});
