async function fetchsocial() {
    const url = "https://docs.google.com/spreadsheets/d/10TzvwA5p98p3tjBkpvsnQRGzp5AHY8-nAiPKPOOjR4Q/gviz/tq?&sheet=social_Links&headers=1";
    
    try {
        const res = await fetch(url);
        let text = await res.text();
        let data = JSON.parse(text.substring(47).slice(0, -2));

        let cachedsocial = data.table.rows.map((row, index) => {
            const cells = row.c;
            return {
                youtube: cells[0]?.v || "",
                whatsapp: cells[1]?.v || "",
                instagram: cells[2]?.v || "",
                facebook: cells[3]?.v || "",
                telegram: cells[4]?.v || "",
                tiktok: cells[5]?.v || "",
                x: cells[6]?.v || "",
            };
        });
        return cachedsocial;
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

fetchsocial().then(data => {
    if (!data) return;

    let socialdiv = document.getElementById('socialdiv');
    socialdiv.innerHTML = ""; // تنظيف الديف قبل إضافة المحتوى

    // مصفوفة لتعريف الأيقونات والألوان لكل منصة لسهولة التحكم
    const platforms = [
        { key: 'facebook', icon: 'fa-facebook', color: '#1877f2' },
        { key: 'instagram', icon: 'fa-instagram', color: '#e4405f' },
        { key: 'telegram', icon: 'fa-telegram', color: '#0088cc' },
        { key: 'whatsapp', icon: 'fa-whatsapp', color: '#25d366' },
        { key: 'youtube', icon: 'fa-youtube', color: '#ff0000' },
        { key: 'tiktok', icon: 'fa-tiktok', color: '#000000' },
        { key: 'x', icon: 'fa-x-twitter', color: '#000000' }
    ];

    // المرور على كل العناصر في المصفوفة القادمة من جوجل شيت
    data.forEach(item => {
        platforms.forEach(p => {
            // التحقق: إذا كان الرابط موجوداً وليس فارغاً
            if (item[p.key] && item[p.key] !== "") {
                let link = item[p.key];
                
                // إضافة كود خاص للواتساب إذا كان المدخل مجرد رقم
                if (p.key === 'whatsapp' && !link.includes('http')) {
                    link = `https://wa.me/${link}`;
                }

                socialdiv.innerHTML += `
                    <a href="${link}" target="_blank" class="social-icon" style="margin: 5px; text-decoration: none;">
                        <i class="fa-brands ${p.icon}" style="color:${p.color}; font-size: 24px;"></i>
                    </a>
                `;
            }
        });
    });
});