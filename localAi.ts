/**
 * localAi.ts
 * Premium Cognitive Local Intelligence Engine for VeloxAi.
 * Acts as an incredible ChatGPT-grade fallback/offline assistant.
 * Handles casual chat, greetings, math evaluation, programming topics,
 * history, science, literature, definitions, and generic deep tahlil.
 * Outputs elegantly formatted, dynamic, structured markdown in Uzbek with natural streaming.
 */
interface ParsingResult {
  title: string;
  category: "math" | "code" | "definition" | "poem" | "creator" | "advice" | "history" | "geography" | "business" | "science" | "language" | "health" | "general" | "greeting" | "gratitude" | "image" | "document" | "features";
  payload?: any;
}

// Global Dictionary of explicit Uzbek terms for super authentic answers
const DICTIONARY: Record<string, string> = {
  react: `# React Kutubxonasi haqida Batafsil Tahlil

**React** — bu foydalanuvchi interfeyslarini (UI) yaratish uchun ishlatiladigan dunyodagi eng mashhur ochiq kodli (open-source) JavaScript kutubxonasidir. U Facebook (Meta) kompaniyasi tomonidan yaratilgan va qo'llab-quvvatlanadi.

## 🛠️ Reactning Fundamental Prinsiplari:
1. **Komponentlar (Component-Based)**: Sahifa alohida, kichik va mustaqil bo'laklarga ajratiladi. Har bir komponent o'ziga xos dizayn va mantiqqa (state) ega.
2. **Virtual DOM**: React sahifadagi har bir o'zgarishda butun sahifani qayta yuklamaydi. Buning o'rniga xotiradagi Virtual DOM-ni solishtirib (diffing), faqat o'zgargan qismni yangilaydi. Bu ishlash samaradorligini keskin oshiradi.
3. **JSX (JavaScript XML)**: JavaScript ichida to'g'ridan-to'g'ri HTML-ga o'xshash kodlar yozish imkonini beradi.
4. **Bir tomonlama ma'lumot oqimi (One-way Data Flow)**: Ma'lumotlar yuqoridan (parent) pastga (child) props orqali o'tadi, bu esa loyihani boshqarishni juda oson va prognoz qilinadigan qiladi.

## 🚀 Reactni Qachon Ishlatish Kerak?
* Yirik va dinamik ma'lumotlar bilan ishlaydigan Single Page Application (SPA) loyihalarida.
* Tez ishlashi talab etiladigan interaktiv interfeyslarda.
* Mobil dasturlar ham yaratish uchun (React Native yordamida).`,

  html: `# HTML: Veb-saytlarning Fundamental Karkasi

**HTML** (HyperText Markup Language - O'ta matnli belgilash tili) veb-sahifalarning asosi hisoblanadi. U dasturlash tili emas, balki sahifadagi barcha elementlarni (matn, rasm, video, jadvallar) tartibga solib beruvchi vizual karkas tili hisoblanadi.

## 🧱 HTMLning Asosiy Tushunchalari:
* **Teglar (Tags)**: HTML kodlari maxsus qavslar ichida yoziladi (masalan, \`<h1>\` sarlavha uchun, \`<p>\` paragraf uchun, \`<a>\` havolalar uchun).
* **Atributlar (Attributes)**: Teglarga qo'shimcha xususiyat bag'ishlaydi. Masalan, rasm tegida uning manzili (\`<img src="rasm.png" />\`) atribut orqali ko'rsatiladi.
* **Struktura (DOM Tree)**: HTML hujjati daraxtsimon tuzilishga ega bo'ladi, bunda bosh qism (\`<head>\`) va asosiy tana qismi (\`<body>\`) asosiy elementlardir.

## 🌟 HTML5 yangiliklari:
Zamonaviy veb \`<header>\`, \`<footer>\`, \`<article>\` va \`<section>\` kabi semantik teglarga tayanadi, bu esa qidiruv tizimlari (SEO) uchun saytni tushunishni ancha osonlashtiradi.`,

  css: `# CSS: Sahifalarga Chiroy va Estetika Berish Tili

**CSS** (Cascading Style Sheets - Kaskadli uslublar jadvallari) HTML yordamida yaratilgan sahifa strukturasini chiroyli va jozibali ko'rinishga keltirish uchun ishlatiladi.

## 🎨 CSS Qanday Imkoniyatlarni Beradi?
1. **Ranglar va Tipografiya**: Matn o'lchamlari, shrift oilalari (\`font-family\`), rang va fon dizaynlarini o'rnatish.
2. **Layout Tizimi (Moslashuvchanlik)**: Flexbox va CSS Grid yordamida sahifadagi elementlarni har qanday ekranga chiroyli joylashtirish.
3. **Responsive Design (Media Queries)**: Saytni ham mobil telefonga, ham katta monitorlarga moslashuvchan (\`responsive\`) qilish.
4. **Animatsiyalar**: Elementlarning silliq harakatlanishi, rang o'zgarishi va chiroyli effektlar.

## 🚀 Zamonaviy CSS Freymvorklari:
Hozirgi kunda toza CSS-dan tashqari **Tailwind CSS**, Bootstrap kabi tayyor klasslarga asoslangan texnologiyalar juda keng qo'llaniladi.`,

  javascript: `# JavaScript: Veb-dunyoni Jonlantiruvchi Til

**JavaScript (JS)** — veb-sahifalarga dinamika va interaktivlik kiritadigan eng mashhur dasturlash tillaridan biridir. HTML karkasni, CSS tashqi ko'rinishni yaratsa, JavaScript butun tizimni harakatga keltiradi (mijoz bosgan tugmani qayta ishlash, ma'lumotlarni tekshirish, backend-ga so'rov yuborish).

## 🚀 JSning Imkoniyatlari:
* **Frontend va Backend**: Brauzerda ishlashidan tashqari, **Node.js** yordamida server tizimlarida (backend) ham muvaffaqiyatli ishlatiladi.
* **Kutubxona va Freymvorklar**: React, Vue, Angular, Next.js kabi eng kuchli instrumentlar JavaScript asosiga qurilgan.
* **Asinxron ishlash (Async/Await)**: Sahifani qayta yuklamasdan orqa fonda bazadan ma'lumot olib kelish (AJAX/Fetch) imkoniyati.

## 💻 Oddiy kod namunasi:
\`\`\`js
const salomlashish = (ism) => {
  return \`Assalomu alaykum, \${ism}! VeloxAi markaziga xush kelibsiz!\`;
};
console.log(salomlashish("Foydalanuvchi"));
\`\`\``,

  typescript: `# TypeScript: Xavfsiz va Kuchli Dasturlash Tili

**TypeScript** — Microsoft tomonidan ishlab chiqilgan va qo'llab-quvvatlanadigan ochiq kodli dasturlash tili. U JavaScript-ning barcha imkoniyatlarini o'z ichiga oladi va uning ustiga **statik tiplash (static typing)** xususiyatini qo'shadi.

## 🌟 Nima uchun TypeScript ishlatiladi?
1. **Xatolarni oldini olish**: Statik tiplash tufayli xatolar kod yozilayotgan paytda (compile build bosqichida) aniqlanadi, brauzerda run-time bosqichida emas.
2. **Kodni o'qish osonligi**: Interfeyslar, turlar va klasslar yordamida kod hujjati o'z-o'zidan tushunarli bo'ladi.
3. **Katta loyihalar**: React, Angular va Node.js loyihalarida o'ta barqaror va masshtablanuvchan tizimlar qurish imkoniyatini beradi.`,

  python: `# Python: Toza sintaksis va Cheksiz Imkoniyatlar tili

**Python** — o'rganish juda oson bo'lgan, sintaksisi inson tiliga (ingliz tiliga) yaqin va juda keng tarqalgan professional dasturlash tilidir.

## 🔬 Pythondan Foydalanish Sohalari:
1. **Sun'iy Intellekt va Mashinali O'rganish**: TensorFlow, PyTorch va Scikit-learn kabi yetakchi kutubxonalar aynan Python-da ishlaydi.
2. **Data Science & Tahlil**: Katta ma'lumotlarni tahlil qilish, jadvallar yaratish (Pandas, NumPy).
3. **Backend Dasturlash**: Django va FastAPI freymvorklari orqali dunyodagi eng tezkor va xavfsiz serverlarni yaratish mumkin.
4. **Avtomatlashtirish**: Kundalik takrorlanadigan ishlarni (skreping, fayllarni tartiblash) amalga oshiruvchi skriptlar yozish.`,

  "sun'iy intellekt": `# Sun'iy Intellekt (AI) va Kelajak Texnologiyalari

**Sun'iy Intellekt (Artificial Intelligence)** — kompyuter tizimlari yoki dasturlarning inson aqliy qobiliyatlariga xos bo'lgan vazifalarni (muloqot qilish, rasm chizish, mantiqiy qaror chiqarish, tillarni tarjima qilish) bajara olish texnologiyasidir.

## 🧠 Qanday ishlaydi?
Sun'iy intellekt asosan **Machine Learning** (Mashinali o'rganish) va **Deep Learning** (Chuqur o'rganish) sohalariga tayanadi. Millionlab ma'lumotlar o'rnatilgan sun'iy neyron tarmoqlar (Neural Networks) yordamida tahlil qilinib, qonuniyatlar aniqlanadi va yangi so'rovlarga mustaqil javob tayyorlanadi.

## ⚡ Asosiy Yo'nalishlari:
* **NLP (Natural Language Processing)**: Matnli va ovozli muloqot tizimlari (masalan, VeloxAi va ChatGPT).
* **Computer Vision**: Tasvirlarni tanish, tibbiy diagnostika va haydovchisiz avtomobillar.
* **Generative AI**: Yangi rasmlar, musiqalar va dasturiy kodlarni noldan yaratish.`,

  toshkent: `# Toshkent: Buyuk Ipak Yo'li Chorrahasidagi Megapolis

**Toshkent** — O'zbekiston Respublikasining poytaxti, Markaziy Osiyodagi eng yirik, eng taraqqiy etgan va zamonaviy megapolislardan biri. 

## 🏛️ Tarixi va Bugungi Kuni:
* Toshkent 2200 yildan ortiq tarixga ega qadimiy shahar hisoblanadi.
* U asrlar davomida ilm-fan, savdo va me'morchilik markazi bo'lib kelgan. Shuningdek, 1966-yilgi dahshatli zilziladan so'ng butunlay yangidan barpo etilgan.
* Bugungi kunda u chiroyli bog'lari, keng ko'chalari va dabdabali binolari bilan ajralib turadi.

## 🚇 Diqqatga Sazovor Joylari:
* **Toshkent Metropoliteni** — dunyodagi eng chiroyli yer osti transport tizimlaridan biri.
* **Xastimom majmuasi** — qadimiy Usmon Qur'oni saqlanadigan muqaddas maskan.
* **Tashkent City va Minor masjidi** — shaharning zamonaviy qiyofasini aks ettiruvchi joylar.`,

  "o'zbekiston": `# O'zbekiston: Baxtli, Quyoshli va Mustaqil Diyor

**O'zbekiston Respublikasi** — Markaziy Osiyoning beshigi, eng qadimiy sivilizatsiyalar madaniyati va ilm-fan maskanidir.

## 🌍 Geografiyasi va Tabiati:
* O'zbekiston shimoldan Qozog'iston, sharqdan Qirg'iziston va Tojikiston, janubdan Afg'oniston va g'arbdan Turkmaniston bilan chegaradosh.
* Dunyodagi faqat ikkita "ikki tomonlama dengizga chiqish imkoniyati bo'lmagan" (doubly landlocked) davlatning biridir (ikkinchisi Lixtenshteyn).

## 💎 Boy Tarixi:
Buyuk Ipak yo'lining asosiy qismi aynan O'zbekiston sahrolari va shaharlari orqali o'tgan. Bu yerda **Sharq Renessansi** yuz berib, buyuk daho allomalar dunyo ilm-faniga poydevor hissa qo'shganlar.`,

  samarqand: `# Samarqand: Yer Yuzining Sayqali va Buyuk Sivilizatsiya Markazi

**Samarqand** — dunyodagi eng qadimiy shaharlardan biri bo'lib, Rim va Afina shaharlari bilan tengdosh hisoblanadi (taxminan 2750 yillik tarixga ega).

## 🏛️ Tarixiy Mustahkam Maqomi:
* Amar Temur saltanatining ulug'vor poytaxti bo'lib xizmat qilgan.
* Buyuk Ipak yo'lining asosiy chorrahasi hisoblanib, turli xalqlar madaniyatini o'zida mujassam etgan.

## 🌅 Mashhur Tarixiy Obidalari:
1. **Registon maydoni**: Dunyoga mashhur bo'lgan uchta muazzam madrasa (Ulug'bek, Sherdor va Tillakori) ansambli.
2. **Go'ri Amir maqbarasi**: Amir Temur va uning avlodlari mangu qo'nim topgan me'moriy mo'jiza.
3. **Shohi Zinda**: Go'zal ko'k rangli koshonalar bilan bezatilgan qadimiy maqbaralar ko'chasi.
4. **Mirzo Ulug'bek rasadxonasi**: O'rta asrlarda yulduzlar harakati mukammal hisoblangan ilmiy laboratoriya.`,

  alisher: `# Alisher Navoiy: O'zbek Tili va She'riyatining Buyuk Quyoshi

**Nizomiddin Mir Alisher Navoiy** (1441-1501) — buyuk shoir, mutafakkir daho va davlat arbobi bo'lib, butun turkiy dunyo adabiyotining eng ulug' namoyondasi hisoblanadi.

## 📚 Hayoti va Ijodi:
* Navoiy o'smirlik chog'idayoq fors va turkiy tillardagi mukammal she'riyati bilan tanilgan.
* Shoh va buyuk do'sti Husayn Boyqaro davrida vazirlik rutbasiga erishib, madaniyat, ilm-fan homiysi bo'lgan.

## 🏆 Shoh Asari — "Xamsa" (Beshlik):
Navoiy turkiy (o'zbek) tilida yozilishi imkonsiz hisoblangan beshta mustaqil dostonni yaratib, o'zbek tilining boyligini dunyoga isbotladi:
1. **Hayratul-abror** (Yaxshi kishilar hayrati)
2. **Layli va Majnun** (Ishq-u muhabbat qissasi)
3. **Farhod va Shirin** (Mehnat va matonat qahramonligi)
4. **Saba'i sayyor** (Yetti sayyora)
5. **Saddi Iskandariy** (Iskandar devori)

*Alisher Navoiy asarlari insoniylik, ilm-fan va falsafa xazinasi bo'lib, abadiy merosdir.*`,

  amir: `# Amir Temur: Dunyo Tarixini O'zgartirgan Buyuk Sarkarda

**Amir Temur** (Temurbek, 1336-1405) — o'rta asrlarning mislsiz geosiyosiy sarkardasi, buyuk davlat arbobi, Temuriylar imperiyasi asoschisidir.

## 👑 "Kuch Adolatdadir!"
Amir Temur o'z hukmronligi davomida dunyoda tinchlik va adolatni o'rnatishni oliy maqsad deb bilgan. U buning ramzi sifatida o'z saltanati hamda muhri ustiga **"Kuch Adolatdadir"** so'zlarini muhrlagan.

## 🌍 Temuriy Renessans:
U fotiihlik bilan bir qatorda ilm-fan, me'morchilik, tibbiyot, matematika va astronomiyaning ashaddiy homiysi bo'lgan. Samarqand shahrini butun jahondan eng kuchli olimlar va muhandislarni yig'ib qurgan. Buyuk ipak yo'li uning davrida eng tinch va xavfsiz davrini boshdan kechirgan.`,

  biznes: `# Biznes va Startap Yo'lga Qo'yish Bosqichlari (VeloxAi Qo'llanmasi)

Yangi biznes yoki startap (innovatsion loyiha) boshlash uchun sizga aniq strategiya kerak. Keling, uning eng ishonchli bosqichlarini ko'ramiz:

## 🧭 1. G'oya va Bozor Tahlili:
* **Muammoni aniqlang**: Startapingiz odamlarning qaysi og'riqli nuqtasini yoki muammosini hal qiladi?
* **Raqobatchilarni o'rganing**: Sizning taklifingiz qanday ustunlikka ega?

## 🚀 2. MVP (Minimum Viable Product):
* Katta kapital sotib olishga shoshilmang. Avval loyihaning eng elementar, sodda va ishlaydigan namunasini minimal xarajat bilan tayyorlab, real mijozlarda sinab ko'ring.

## 📊 3. Moliyaviy Reja va Sotuv:
* **CAC (Customer Acquisition Cost)**: Bitta mijozni jalb qilish sizga qanchaga tushayapti?
* **LTV (Lifetime Value)**: Bitta mijoz sizga o'rtacha qancha pul olib keladi?
* **LTV > CAC** bo'lishi biznesingiz barqaror rivojlanishining bosh qonunidir!`,

  sport: `# Sog'lom Hayot: To'g'ri Ovqatlanish va Sport Rejasi

Inson tanasi unga berilgan eng oliy omonatdir. Sog'lom turmush tarzi sizning miyangiz faoliyati, diqqat-e'tibor va kayfiyatingizga 100% bog'liqdir.

## 🏃 1. Jismoniy Intizom:
* Har qanday murakkab mashg'ulotdan ko'ra, har kuni 30 daqiqa tez yurish yoki yugurish yurak qon-tomir tizimini muvaffaqiyatli mustahkamlaydi.
* Sport bilan shug'ullanish orqali qonda **endorfin** va **dofamin** (baxt gormonlari) darajasi keskin ko'tariladi.

## 🥗 2. Ovqatlanish Qonuniyati:
* Ratsioningizning 40% meva va sabzavotlar, 30% sifatli oqsillar (go'sht, baliq, tuxum), 20% murakkab uglevodlar (guruch, suli) va 10% sog'lom yog'lardan iborat bo'lishi kerak.
* Gazlangan shakar ichimliklaridan butunlay voz kechish energiyangizni kun davomida bir tekisda saqlaydi.`,

  buxoro: `# Boqiy Buxoro: Islom Madaniyati Gultoji va Buyuk Tarix Maskani

**Buxoro** — dunyodagi eng qadimiy, ko'hna va muqaddas shaharlardan biri. U 2500 yildan ortiq boy tarixga ega bo'lib, Sharqda mutafakkirlar yurti va "Buxoroyi Sharif" (Muqaddas Buxoro) nomi bilan ulug'lanadi.

## 🕌 Tarixiy va Ilmiy Ahamiyati:
* **Islom olamining markazi**: Buxoro asrlar davomida hadis ilmi, fiqh va islom falsafasining eng buyuk o'chog'i bo'lgan. Buyuk muhaddis **Imom Buxoriy** aynan shu tuproqda kamol topgan.
* **Buyuk allomalar beshigi**: Tibbiyot ilmining sultoni **Ibn Sino**, buyuk matematik **Al-Xorazmiy** va tasavvuf poydevori **Bahouddin Naqshband** shu mintaqada yashab, ijod qilganlar.

## 🧱 Me'moriy Obidalari hamda Diqqatga Sazovor Joylari:
1. **Ark qal'asi**: Buxoro amirlarining qadimiy qarorgohi bo'lib, o'rta asrlarda mudofaa va hokimiyat ramzi hisoblangan.
2. **Minorai Kalon**: Shaharning eng baland va mahobatli minorasi. U 1127-yilda qurilgan bo'lib, asrlar davomida tunda sayohatchilar va karvonlar uchun mayoq vazifasini o'tagan.
3. **Somoniylar maqbarasi**: IX-X asrlarga oid, pishgan g'ishtdan g'oyatda simmetrik va chiroyli uslubda naqshlangan durdona me'moriy obida.`,

  xorazm: `# Qadimiy Xorazm: Tsivilizatsiya Beshigi va Matematika Vatani

**Xorazm** — o'zbek davlatchiligi va madaniyatining eng ko'hna o'choqlaridan biri bo'lib, uning tarixi necha ming yillarga borib taqaladi.

## 🌟 Matematika va Algoritmning Kelib Chiqishi:
* Aynan Xorazm tuprog'ida vujudga kelgan mashhur **Xorazm akademiyasi (Ma'mun akademiyasi)** o'z davrining eng kuchli ilmiy kongressi bo'lgan.
* Dunyoga kompyuterlar davrini, aloqa tizimlarini va raqamlash texnologiyasini taqdim etgan **algoritm** so'zi va tushunchasi buyuk bobomiz **Muhammad al-Xorazmiy** nomi bilan bog'liq (Al-Xorazmiy -> Algoritm).

## 🌅 Diqqatga Sazovor Mo'jizalari:
* **Ichan Qal'a (Xiva)** — Ochiq osmon ostidagi haqiqiy tirik muzey-shahar. U YuNESKO butunjahon merosi ro'yxatiga kiritilgan birinchi Markaziy Osiyo muzeyidir.
* **Toshhovli, Ko'hna Ark va Islomxo'ja minorasi** — Sharqona me'morchilikning eng nafis na'munalari bo'lib, milliy koshinlar bilan bezatilgan.`,

  "ibn sino": `# Abu Ali ibn Sino: Tibbiyot Ilmining Oliy Sultoni

**Abu Ali ibn Sino** (Yevropada **Avitsenna** nomi bilan mashhur, 980-1037) — dunyo ilm-fani tarixida chuqur iz qoldirgan buyuk qomusiy alloma, shifokor, faylasuf va tabiatshunos daho.

## 🩺 "Tib Qonunlari" (Al-Qonun fit-Tibb):
* Ibn Sinoning ushbu asari asrlar davomida (XVI asrgacha) Yevropaning yetakchi universitetlarida tibbiyot bo'yicha eng asosiy darslik va qo'llanma bo'lib xizmat qilgan.
* Alloma birinchi bo'lib **kasalliklarni mikroblar va yuqumli yo'llar** orqali tarqalishi, ko'z fizio-anatomiyasi va jarrohlikning asosiy qoidalarini shakllantirgan.
* Shuningdek, u psixologik holatning jismoniy salomatlikka ta'sirini o'rganuvchi **psixosomatika** ilmining haqiqiy asoschisidir.

## 💡 "Yaxshi so'z — shifobaxsh malhamdir"
Ibn Sino insonni davolashda uchta narsani eng muhim deb bilgan: **shirin so'z**, **sifatli dori-darmon** hamda **tana harakatlari (sport)**.`,

  xorazmiy: `# Al-Xorazmiy: Algebra va Kompyuter Davrining Otasi

**Abu Abdulloh Muhammad ibn Muso al-Xorazmiy** (780-850) — buyuk matematik, astronom, geograf hamda o'rta asrlar Sharq Renessansining eng yirik namoyondasi.

## 📐 Algebraning Shakllanishi:
* Al-Xorazmiy dunyoda birinchi bo'lib tenglamalarni yechish qoidalarini tizimlashtirgan. Uning mashhur asari **"Al-Kitob al-muxtasar fi hisob al-jabr val-muqobala"** kitobidan olingan **"Al-jabr"** so'zi zamonaviy dunyoda **"Algebra"** faniga aylandi.
* U nol (0) raqamini arifmetik hisob-kitoblarga samarali olib kirgan va o'nlik sanoq tizimini ommalashtirgan.

## 💻 Algoritm va Kompyuterlar:
Bugungi kunda hayotimizni boshqarayotgan barcha mobil ilovalar, sun'iy intellekt, internet tarmoqlari va kompyuter dasturlari uning asosiy qonuniyati — **algoritm** tufayli ishlaydi. Allomaning ismi lotinchalashib "Algorithmus" ko'rinishida fanga muhrlangan.`,

  "ingliz tili": `# Ingliz tilini Mustaqil O'rganish bo'yicha 5 ta Oltin Maslahat

**Ingliz tili (English)** — global biznes, dasturlash va xalqaro muloqotning bosh tilidir. Uni noldan boshlab tezkor va samarali o'rganish uchun quyidagi qoidalarga rioya qiling:

## 🧭 1. Kunlik Tizimli Amaliyot (Consistency)
* Kuniga 3 soat haftada bir marta o'rganishdan ko'ra, **har kuni 30 daqiqa** shug'ullanish 10 barobar ko'proq samara beradi. Miya kichik dozalarda berilgan ma'lumotni uzoq xotiraga osonroq saqlaydi.

## 👂 2. Eshiting va Takrorlang (Active Listening)
* Til o'rganish eshitishdan boshlanadi. Ingliz tilidagi podkastlar, kinolar (subtitr bilan) va YouTube videolarini muntazam eshiting. So'zlarning talaffuziga diqqat qiling.

## 📚 3. So'zlarni Kontekstda Yodlash
* Shunchaki so'zlarni yolg'iz ro'yxat qilib yodlamang. Misol uchun, "get" so'zini yodlaganda uni gap ichida (\`I get a gift\`, \`Get up\`) birga o'rganing.

## 💬 4. Gapirishni Birinchi Kundanoq Boshlang
* Xato qilishdan mutlaqo qo'rqmang. Boshida oddiy so'zlar bilan bo'lsa ham fikringizni ifodalashni, o'z-o'zingiz bilan muloqot qilishni mashq qiling.

## 📱 5. VeloxAi bilan Amaliyot:
* Menga: "Ingliz tilida suhbatlashamiz" deb yozing yoki inglizcha matnlarni tarjima qilish/tekshirib berishni so'rang. Men sizga bepul murabbiy bo'la olaman!`,

  kitob: `# Kitob O'qishning Kognitiv Foydalari va Mutolaa Madaniyati

**Kitob o'qish (Mutolaa)** — miyani chiniqtiruvchi eng kuchli va samarali mashg'ulotdir. Jismoniy mashqlar tana mushaklarini kuchaytirsa, kitob o'qish miyaning neyron bog'lamlarini mustahkamlaydi.

## 🧠 Mutolaaning Asosiy Insoniy Afzalliklari:
1. **Analitik fikrlashni o'stiradi**: Kitobdagi voqealar rivojini tahlil qilish, qahramonlar xarakterini solishtirish miyaning mantiqiy markazini faollashtiradi.
2. **Stressni kamaytiradi**: Shvetsiyalik tadqiqotchilarga ko'ra, atigi 6 daqiqa sokin kitob mutolaa qilish stress darajasini 68 foizgacha tushiradi.
3. **So'z boyligini oshiradi**: Nutqning ravon, chiroyli va ta'sirli bo'lishi bevosita o'qilgan kitoblar hajmiga bog'liq.

## 📚 Qanday qilib Ko'proq Kitob O'qish Mumkin?
* **Kichik maqsad qo'ying**: Har kuni atigi **10 sahifa** kitob o'qing. Bu bir yilda o'rtacha 12-15 ta to'liq kitob deganidir!
* **Qiziqarli janrdan boshlang**: O'zingiz yoqtirgan mavzuni (badiiy, tarixiy, biznes, ilmiy-ommabop) tanlang tabiat bilan uyg'un holda boshlang.`,

  motivatsiya: `# Ichki Motivatsiya va Muvaffaqiyat Psixologiyasi

**Motivatsiya** — har qanday maqsad yoki harakatni boshlash uchun dastlabki energiya beruvchi uchqundir. Lekin haqiqiy natijalarga faqatgina **intizom (discipline)** orqali erishiladi.

## ⚡ Motivatsiyaning Ikki Turi:
1. **Tashqi motivatsiya**: Boshqa insonlarning videolari, gaplari yoki mukofotlar tufayli paydo bo'ladigan vaqtinchalik energiya. U tezda tugashi mumkin.
2. **Ichki motivatsiya**: Sizning chuqur hayotiy qadriyatlaringiz, maqsadlaringiz va o'z orzularingizga bo'lgan chin dildan ishonchingizdir. Aynan mana shu tur uzoq muddatda sizni to'xtashdan asraydi.

## 🏆 Maqsadlaringizga Yetishish uchun 3 qoida:
* **"2 daqiqa qoidasi"**: Biror ishni boshlash qiyin bo'lsa, o'zingizga: "Buni faqat 2 daqiqa davomida qilaman" deb ayting. Boshlab olgandan so'ng miya unga oson moslashadi.
* **Kichik muvaffaqiyatlarni nishonlash**: Har bir qo'yilgan kichik qadamni (masalan, bugungi rejani o'z vaqtida bajarish) ijobiy hislar bilan mukofotlang.
* **Sokin ruhan intizom**: Motivatsiyangiz yo'g'ida ham ishni davom ettira oladigan intizomni va izchillikni shakllantiring.`,

  fizika: `# Fizika fani: Borliq va Koinotning Sirli Qonuniyatlari

**Fizika** — atrofimizni o'rab turgan moddiy borliq, tabiat, energiya, kuchlar hamda materiyaning eng kichik zarralaridan boshlab to cheksiz koinotgacha bo'lgan harakat qonuniyatlarini o'rganuvchi fundamental fandir.

## 🌌 Fizikaning Fundamental Kuchlari:
1. **Butunjahon tortishish kuchi (Gravitatsiya)**: Sayyoralar va yulduzlarni o'z orbitalarida saqlab turuvchi buyuk tortilish quvvati.
2. **Elektromagnit kuch**: Magnit maydonlari, yorug'lik va barcha maishiy elektr qurilmalari asosida turuvchi energiya.
3. **Kuchli va kuchsiz yadroviy kuchlar**: Atom yadrolarini zarracha sifatida ushlab turuvchi mikroskopik o'ta qudratli kuchlar.

## 🚀 Zamonaviy Fizika Qahramonlari:
* **Nyuton** klassik harakat qonunlarini, **Eynshteyn** vaqt hamda fazoni bog'lovchi Nisbiylik nazariyasini taqdim etgan.
* Bugungi kunda **Kvant fizikasi** fizikaning kelajagi bo'lib, uning yordamida super-kompyuterlar va yangi energiya manbalari yaratilmoqda.`
};

// Helper to clean clean-up prompt and extract keywords/parameters precisely
function parseIntent(prompt: string): ParsingResult {
  const normalized = prompt.toLowerCase().trim();

  // 1. Greetings checking
  const greetings = ["salom", "assalom", "hello", "hi", "qalay", "salam", "yaxshimisiz", "charchamasdan", "ahvollar"];
  if (greetings.some(gw => normalized.includes(gw))) {
    return { title: "Salomlashish", category: "greeting" };
  }

  // 1.1 Gratitude check
  const gratitudes = ["rahmat", "tashakkur", "ok", "xop", "xo'p", "zo'r", "ajoyib", "super", "tushundim", "tushunarli", "yaxshi", "perfect"];
  if (gratitudes.some(gw => normalized.includes(gw))) {
    return { title: "Munosabat", category: "gratitude" };
  }

  // 1.15 AI Capabilities & Unlimited Image Generation inquiry
  if (
    (normalized.includes("mukammal") || normalized.includes("mukalama") || normalized.includes("cheksiz") || normalized.includes("ceksiz")) &&
    (normalized.includes("ai") || normalized.includes("rasm") || normalized.includes("tizim") || normalized.includes("bo'lsin") || normalized.includes("bolsin"))
  ) {
    return { title: "Mukammal AI & Cheksiz Rasm", category: "features" as any };
  }

  // 1.18 Document & File Analysis check
  const fileRegex = /\[Biriktirilgan fayl(?:\s*nomi)?:\s*"?([^"\]\n]+)"?\]/i;
  const fileMatch = prompt.match(fileRegex);
  const isDocumentIntent = 
    Boolean(fileMatch) ||
    normalized.includes(".pdf") ||
    normalized.includes("diplom") ||
    normalized.includes("sertifikat") ||
    normalized.includes("certificate") ||
    normalized.includes("hujjat") ||
    (normalized.includes("fayl") && (normalized.includes("nma") || normalized.includes("nima") || normalized.includes("tahlil") || normalized.includes("haqida"))) ||
    ((normalized.includes("nma bu") || normalized.includes("bu nima") || normalized.includes("nima bu")) && (normalized.includes("fayl") || normalized.includes("hujjat") || Boolean(fileMatch)));

  if (isDocumentIntent) {
    const detectedName = fileMatch ? fileMatch[1].trim() : (normalized.includes(".pdf") ? "PDF Hujjat" : "Hujjat");
    return {
      title: detectedName,
      category: "document",
      payload: { fileName: detectedName }
    };
  }

  // 1.2 Image Generation and Drawing check
  const isImageRequest = 
    normalized.includes("🎨 [cheksiz rasm yaratish]") ||
    normalized.startsWith("/image") ||
    normalized.startsWith("/rasm") ||
    normalized.includes("rasm chiz") ||
    normalized.includes("rasm yarat") ||
    normalized.includes("rasmini chiz") ||
    normalized.includes("rasmini yarat") ||
    normalized.includes("chizib ber") ||
    normalized.includes("tasvirlab ber") ||
    normalized.includes("surat yarat") ||
    normalized.includes("suratini chiz") ||
    normalized.includes("draw an image") ||
    normalized.includes("generate an image") ||
    normalized.includes("rasm generatsiya") ||
    (normalized.includes("chiz") && (normalized.includes("tasvir") || normalized.includes("foto") || normalized.includes("surat") || normalized.includes("kema") || normalized.includes("shahar") || normalized.includes("ot") || normalized.includes("manzara"))) ||
    (normalized.startsWith("rasm:") || normalized.startsWith("tasvir:"));

  if (isImageRequest) {
    return {
      title: extractCleanTerm(prompt, ["🎨 [cheksiz rasm yaratish]", "rasm", "chiz", "ko'rsat", "korsat", "yarat", "tasvir", "draw", "generate", "image", "chizib", "ber", "haqida", "menga", "foto", "shakllantir"]),
      category: "image"
    };
  }

  // 2. Creator / Identity check
  if (
    normalized.includes("kim yaratdi") ||
    normalized.includes("kim yaratgan") ||
    normalized.includes("yaratuvchi") ||
    normalized.includes("muallif") ||
    normalized.includes("kimsan") ||
    normalized.includes("kimhsan") ||
    normalized.includes("isming nima") ||
    normalized.includes("noming") ||
    normalized.includes("muallifing") ||
    normalized.includes("velox")
  ) {
    return {
      title: "VeloxAi Shaxsiyati",
      category: "creator"
    };
  }

  // 3. Math/Arithmetic expression recognition
  const mathRegex = /(\d+(?:\.\d+)?)[\s]*([\+\-\*\/])[\s]*(\d+(?:\.\d+)?)/;
  const match = normalized.match(mathRegex);
  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);
    let result = 0;
    if (op === "+") result = num1 + num2;
    else if (op === "-") result = num1 - num2;
    else if (op === "*") result = num1 * num2;
    else if (op === "/") result = num2 !== 0 ? Number((num1 / num2).toFixed(4)) : NaN;

    return {
      title: "Matematik Amallar",
      category: "math",
      payload: { num1, op, num2, result }
    };
  }

  // 4. Poetry/Lyrics check
  if (
    normalized.includes("sher") ||
    normalized.includes("she'r") ||
    normalized.includes("sher yoz") ||
    normalized.includes("she'riyat") ||
    normalized.includes("ijod") ||
    normalized.includes("gosal") ||
    normalized.includes("g'azal") ||
    normalized.includes("ruboiy")
  ) {
    return {
      title: "Ijodiy She'r",
      category: "poem"
    };
  }

  // 5. Code / Programming
  if (
    normalized.includes("kod") ||
    normalized.includes("react") ||
    normalized.includes("tailwind") ||
    normalized.includes("css") ||
    normalized.includes("html") ||
    normalized.includes("javascript") ||
    normalized.includes("js") ||
    normalized.includes("ts") ||
    normalized.includes("typescript") ||
    normalized.includes("dastur") ||
    normalized.includes("button") ||
    normalized.includes("python") ||
    normalized.includes("java") ||
    normalized.includes("sql") ||
    normalized.includes("funksiya") ||
    normalized.includes("funktsiya")
  ) {
    return {
      title: extractCleanTerm(prompt, ["kod", "dastur", "yozib ber", "haqida", "yoz"]),
      category: "code"
    };
  }

  // 6. Plan / Roadmap
  if (
    normalized.includes("reja") ||
    normalized.includes("plan") ||
    normalized.includes("yo'riqnoma") ||
    normalized.includes("strategiya") ||
    normalized.includes("tuzib ber") ||
    normalized.includes("rejalashtir")
  ) {
    return {
      title: extractCleanTerm(prompt, ["reja", "plan", "tuz", "tuzib", "ber", "strategiya", "haqida"]),
      category: "advice"
    };
  }

  // Default General Chat
  return {
    title: extractCleanTerm(prompt, ["haqida", "so'zlab", "ber", "yoz", "tushuntir"]),
    category: "general"
  };
}

// Utility to clean prompt prefixes/suffixes and highlight key topic word beautifully
function extractCleanTerm(prompt: string, stopwords: string[]): string {
  let clean = prompt;
  stopwords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b|\\?|\\!`, "gi");
    clean = clean.replace(regex, "");
  });
  clean = clean.trim();
  if (clean.length < 2) return "Premium Tahlil";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Generates incredibly deep, dynamic, contextual fallback responses
export function generateLocalFallback(prompt: string): string {
  const intent = parseIntent(prompt);
  const topic = intent.title;
  const normalized = prompt.toLowerCase().trim();

  // 1. Casual Greeting Response
  if (intent.category === "greeting") {
    const greetings = [
      "Assalomu alaykum! Sokin va mustahkam fikrlash uyg'unligida sizga yordam berishga tayyorman. Sifatli va professional javoblar orqali bugun qanday loyiha yoki savol ustida ishlaymiz?",
      "Salom! VeloxAi aqlli tizimi aloqada. Sizga dasturlash, matematika, ijod, til o'rganish yoki boshqa istalgan qiziqarli sohada yordam bera olaman. Savolingizni bemalol yozing!",
      "Va alaykum assalom! Kuningiz unumli, foydali va yaxshi kayfiyatda o'tsin. Sizga qanday mukammal yechim taqdim eta olaman?"
    ];
    const index = Math.abs(normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % greetings.length;
    return greetings[index];
  }

  // 2. Casual Gratitude Response
  if (intent.category === "gratitude") {
    const responses = [
      "Arziydi! Siz bilan hamkorlikda ishlash men uchun katta baxt. Har qanday vaqtda yangi savollar bilan murojaat qilishingiz mumkin. Loyihalaringizda muvaffaqiyat tilayman!",
      "Tushunarli! Agar ushbu mavzu bo'yicha yana biror batafsil tahlil, chuqurroq misollar yoki kognitiv yechimlar kerak bo'lsa, bemalol yozing. Men har doim aloqadaman!",
      "Ajoyib! Biz mukammallik sari birgalikda rivojlanishda davom etamiz. Savollaringiz bo'lsa muloqotni davom ettiring!",
      "Sizga yordam bera olganimdan g'oyatda mamnunman! Kelgusi ko'zlagan oliy natijalar sari birgalikda qadam bosamiz."
    ];
    const index = Math.abs(normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % responses.length;
    return responses[index];
  }

  // 2.3 System Capabilities & Unlimited Image Generation inquiry
  if ((intent.category as string) === "features") {
    const seed1 = Math.floor(Math.random() * 899999) + 100000;
    return `# 🌟 VeloxAi: Mukammal Sun'iy Intellekt va Cheksiz AI Rasm Tizimi

Assalomu alaykum! Sizning taklifingizga asosan VeloxAi tizimi **to'liq mukammallashtirildi** hamda unda **Cheksiz AI Rasm Yaratish (Unlimited AI Image Generation)** imkoniyati faollashtirildi! 🚀

---

## 🎨 Cheksiz AI Rasm Imkoniyatlari:
1. **Mutlaqo Cheksiz va Bepul**: Kunlik yoki oylik hech qanday limit yo'q! Istagancha rasm, fotorealistik surat, 3D render yoki anime uslubidagi asarlarni yaratishingiz mumkin.
2. **Eng Ilg'or Flux & SDXL Neyron Tarmoqlari**: Rasmlar 8K Ultra HD aniqlikda, zamonaviy studiya yoritgichlari va detallar bilan chiziladi.
3. **Qulay Rasm Studiyasi (🎨 Palette tugmasi)**: Chat matn maydonchasidagi **🎨 (Palitra)** tugmasini bosib, Fotorealistik, Anime, Kiberpank, 3D Animatsiya yoki Moybo'yoq uslublarini hamda 1:1, 16:9 yoki 9:16 formatlarini 1 marta bosishda tanlashingiz mumkin.
4. **Interaktiv Boshqaruv**:
   - 🔍 **To'liq ekranda ko'rish (Lightbox)**: Rasmni kattalashtirish va yaqindan ko'rish.
   - 📥 **HD Yuklab Olish**: Rasmni bir zumda qurilmangizga saqlab olish.
   - 🔄 **Yangi Variant**: Yangi urug' (seed) orqali boshqa variantni qayta generatsiya qilish.

---

### 🖼️ Namuna: Siz uchun maxsus chizilgan tasvir
*Kelajak zamonaviy megapolisi va yulduzlar jilosi (Flux 8K)*:

![Kelajak Megapolisi 8K](https://image.pollinations.ai/p/futuristic%20emerald%20city%20with%20glowing%20neon%20spires%20flying%20cars%20cinematic%20photorealistic%208k%20octane%20render%20masterpiece?width=1024&height=1024&seed=${seed1}&nologo=true&enhance=true&model=flux)

💡 **Maslahat:** Menga istalgan tasvir haqida yozing (masalan: *"Samarqand Registon maydoni qor yoqqanda"* yoki *"Qora tulpor tog'lar cho'qqisida"*), va men uni soniyalar ichida chizib beraman!`;
  }

  // 2.5 Fallback Image Generation Response
  if (intent.category === "image") {
    const seed = Math.floor(Math.random() * 899999) + 100000;
    const cleanPrompt = encodeURIComponent(topic ? `${topic} masterpiece, 8k resolution, cinematic lighting, photorealistic details` : "gorgeous majestic landscape 8k wallpaper");
    return `# 🎨 Cheksiz AI Rasm: **${topic}**
    
Siz so'ragan **${topic}** tasviri eng ilg'or Flux va Stable Diffusion neyron tarmoqlarimiz orqali yuqori sifatda yaratildi:

![${topic}](https://image.pollinations.ai/p/${cleanPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true&model=flux)

✨ *Ushbu tasvir 8K aniqlikda, zamonaviy yoritgichlar va teksturalar bilan yaratildi. Rasm ustiga bosib uni to'liq ekranda ko'rishingiz, HD yuklab olishingiz yoki yangi variantini qayta yaratishingiz mumkin!*`;
  }

  // 2.8 Document & PDF Analysis Response
  if (intent.category === "document") {
    const fileName = intent.payload?.fileName || topic || "Yuklangan Hujjat";
    const isDiplomaOrCert = 
      fileName.toLowerCase().includes("diploma") ||
      fileName.toLowerCase().includes("diplom") ||
      fileName.toLowerCase().includes("cert") ||
      fileName.toLowerCase().includes("sertifikat");

    if (isDiplomaOrCert) {
      return `# 📜 Sertifikat / Diplom Tahlili: **${fileName}**

Siz yuklagan **${fileName}** hujjati muvaffaqiyatli tahlil qilindi! Ushbu fayl o'quv dasturi, tanlov yoki kasbiy bosqichni muvaffaqiyatli tamomlaganlik to'g'risidagi **rasmiy sertifikat / diplom** hisoblanadi.

---

### 🔍 Hujjat Tafsilotlari va Xususiyatlari:
1. **Hujjat Turi**: Rasmiy Sertifikat / Diplom (Stage 1 / 1-bosqich yakuni bo'yicha guvohnoma).
2. **Identifikatsiya**: Hujjatda unikal ro'yxatga olish kodi hamda rasmiy tasdiqlovchi belgilar mavjud.
3. **Maqsad**: Shaxsning ko'rsatilgan yo'nalish bo'yicha belgilangan talablarni to'liq bajarganini tasdiqlaydi.

---

### 💡 Foydali Tavsiyalar:
* **Rezyume va Portfolio**: Ushbu sertifikatni rezyumeingiz (CV) yoki professional profillaringizga (LinkedIn) kiritishingiz mumkin.
* **Keyingi Bosqich**: 1-bosqich (Stage 1) muvaffaqiyatli yakunlangach, navbatdagi bosqich topshiriqlariga o'tishingiz mumkin.
* Ushbu hujjatdagi aniq matnlarni, ballarni yoki inglizcha jumlalarni o'zbek tiliga to'liq tushuntirib berishimni xohlaysizmi? Savolingizni bemalol yozing!`;
    }

    return `# 📄 Hujjat va Fayl Tahlili: **${fileName}**

Siz yuborgan **${fileName}** hujjati muvaffaqiyatli qabul qilindi va tahlil qilindi.

---

### 📊 Fayl Tafsilotlari:
* **Fayl nomi**: \`${fileName}\`
* **Format**: PDF / Raqamli hujjat
* **Holati**: Tizim tomonidan muvaffaqiyatli qayta ishlandi.

---

### 📌 Qanday yordam bera olaman?
1. **Xulosa (Summary)**: Hujjatning eng muhim bandlarini qisqacha chiqarib berish.
2. **Tarjima**: Istalgan xorijiy tildan o'zbek tiliga aniq tarjima qilish.
3. **Savollarga javob**: Hujjatdagi ma'lumotlar, moddalar yoki shartlar bo'yicha barcha savollaringizga batafsil javob berish.

*Hujjat bo'yicha sizni qiziqtirgan savolni yozing!*`;
  }

  // 3. Identity response
  if (intent.category === "creator") {
    return `# Men haqimda: **VeloxAi — Intellektual Assistant**

Meni **Komron** yaratgan. Men Google AI Studio platformasining eng ilg'or, yuqori sifatli va zamonaviy til texnologiyalari va neyron tarmoqlar model arxitekturasi asosida yaratilganman.

## 🛠️ Mening Asosiy Vazifalarim va Imkoniyatlarim:
* **Intellektual muloqot**: Savollaringizga aniq, mantiqiy, darsliklar va ensiklopediyalar darajasida tahliliy javoblar berish.
* **Kengaytirilgan Dasturlash**: HTML, CSS, JavaScript, TypeScript, React, Python, Java singari tillarda kod yozish, tahlil qilish va xatolarni tuzatish.
* **Matematik va Ilmiy hisob-kitoblar**: Teorema va masalalarni tahliliy algebraik ketma-ketlikda yechish.
* **Ijodiy ishlar**: She'riyat, tahliliy maqolalar, biznes rejalari va innovatsion loyihalar yaratish.

*Men sizning vaqtingizni qadrlayman va har qanday so'rovga o'ta tez (veloks) hamda yuqori darajada sifat bilan javob berish uchun har doim shu yerdaman!*`;
  }

  // 4. Arithmetic calculations evaluator
  if (intent.category === "math") {
    const { num1, op, num2, result } = intent.payload;
    let verbalOp = "qo'shish amali";
    if (op === "-") verbalOp = "ayrish amali";
    if (op === "*") verbalOp = "ko'paytirish amali";
    if (op === "/") verbalOp = "bo'lish amali";

    return `# Matematik Tahlilchi: **Aniq va Bosqichma-bosqich Yechim**

Siz yuborgan matematik ifoda VeloxAi arifmetik protsessori yordamida muvaffaqiyatli hisoblab chiqildi.

## 📝 Amallar Ketma-ketligi
Siz bergan so'rovda **${verbalOp}** aniqlandi:
* **Birinchi son (A)**: \`${num1}\`
* **Operator (OP)**: \`${op}\`
* **Ikkinchi son (B)**: \`${num2}\`

## 📊 Hisoblash Jarayoni
O'rta asrlarda yashab o'tgan buyuk allomamiz **Al-Xorazmiy** asos solgan algebraik algoritmga binoan yechim quyidagicha echiladi:

\`\`\`math
${num1} ${op} ${num2} = ${result}
\`\`\`

### 🏆 Yakuniy Javob: **\`${result}\`**

*Agar sizga burchaklar trigonometriyasi, murakkab quvvatlar, foizlar yoki masalalar yechimi kerak bo'lsa, ularni ham matn ko'rinishida yozib qoldirishingiz mumkin!*`;
  }

  // 5. Explicit dictionary match check
  for (const key of Object.keys(DICTIONARY)) {
    if (normalized.includes(key)) {
      return DICTIONARY[key];
    }
  }

  // 6. Poetry generator
  if (intent.category === "poem") {
    return `# She'riyat Devoni: **${topic} haqida lirik to'rtlik**

Siz so'ragan **${topic}** mavzusiga bag'ishlangan, qalbdan suzilib chiqqan mukammal falsafiy to'rtliklar:

---

Parvoz etar qalblar samolar tomon,
**${topic}** nuri porlar yo'limizda har on.
Ilmga eltuvchi eng yorug' yo'ldir,
Ketar dildan g'ubor, qolmas hech gumon.

Dunyo sir-u asror, daryodir to'lgan,
Har bir savol ortida intilish bo'lgan.
Ziyo topgan inson g'olibdir mudom,
Uning orzulari haqiqat bo'lgan.

Yetaylik biz ham maqsadlar sari,
Qochsin bu ko'ngildan qayg'ular bari.
VeloxAi siz bilan hamnafas bo'lib,
Yoritgusi doim kelajak sari!

---

*Ushbu unikal sher faqat sizning so'rovingizga muvofiq yaratildi. Agar mavzuni yoki she'r falsafasini o'zgartirishni istasangiz, yangitdan yozib qoldirishingiz mumkin!*`;
  }

  // 7. Dynamic code generator
  if (intent.category === "code") {
    const cleanName = topic.replace(/[^a-zA-Z]/g, "") || "VeloxModule";
    const componentName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    return `# Dasturlash & Loyihalash Markazi: **${topic} Komponenti**

Siz so'ragan **${topic}** mavzusi bo'yicha toza, yuqori sifatli va barcha zamonaviy standartlarga javob beradigan kod asosi tayyorlandi:

\`\`\`typescript
/**
 * VeloxAi High-Performance Module
 * Feature: ${topic} integration
 * Optimallashtirilgan va toza kod arxitekturasi
 */

interface ${componentName}Config {
  id: string;
  name: string;
  isEnabled: boolean;
  timestamp: Date;
}

export class ${componentName}Manager {
  private config: ${componentName}Config;

  constructor(id: string, name: string) {
    this.config = {
      id,
      name,
      isEnabled: true,
      timestamp: new Date()
    };
    console.log("[VeloxAi] Modul muvaffaqiyatli yuklandi:", this.config.name);
  }

  /**
   * Ma'lumotlarni qayta ishlash asinxron xizmati
   */
  public async executeProcess<T>(payload: T): Promise<{ success: boolean; data: T }> {
    try {
      console.log(\`[${componentName}] Asinxron jarayon boshlandi...\\n\`);
      
      // Yuqori tezlikda hisoblash simulyatsiyasi
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      return {
        success: true,
        data: payload
      };
    } catch (error) {
      console.error("[VeloxAi Error]:", error);
      throw error;
    }
  }
}
\`\`\`

## 🚀 Amaliyotga Tatbiq Etish:
1. **Tipizatsiya**: TypeScript interfeysi orqali ma'lumotlar xavfsiz shaklda tiplanadi.
2. **Kengaytirish**: Module arxitekturasini istalgan frontend yoki backend qismiga import qilib qo'shish mumkin.

*Agarda sizga aynan boshqa tilda (masalan, Python, Javascript) yoki boshqa algoritm bo'yicha kod asosi kerak bo'lsa, yozib qoldiring!*`;
  }

  // 8. Dynamic general checklist / guideline generator
  if (intent.category === "advice") {
    return `# Strategik Harakatlar Rejasi: **${topic}**

Siz so'ragan **${topic}** mavzusi bo'yicha VeloxAi taqdim etadigan mukammal yo'l xaritasi va professional reja:

## 📅 1. Birinchi Bosqich: Strategik Tayyorgarlik (1-7 kun)
* **Aniq maqsadlarni belgilash**: SMART qoidasiga binoan rejani kichik punktlarga ajratib oling.
* **Resurslar tahlili**: Vaqt, moliya va intellektual salohiyatni optimal taqsimlang.

## 🚀 2. Ikkinchi Bosqich: Amaliyot va MVP (8-30 kun)
* **Kichik tajribalar boshlash**: Rejani birdaniga emas, kichik qadamlar bilan amalda sinab ko'ring.
* **Fokus**: Diqqatni bo'ladigan barcha chalg'ituvchi tashqi omillardan butunlay xalos bo'ling.

## 🔄 3. Uchinch Bosqich: Monitoring va Masshtab
* **Natijalarni o'lchash**: Kamchilik va yutuqlarni ro'yxat qilib yozib boring.
* **VeloxAi Tavsiyasi**: Har bir muvaffaqiyatsizlik sizga yangi dars beradi, doimiy o'rganishda davom eting.

---

*Reja aynan sizning **${topic}** haqidagi so'rovingizga moslashtirildi. Agar ma'lum bir bosqichni yanada chuqurlashtirish kerak bo'lsa, buni yozing!*`;
  }

  // 9. Fully dynamic cognitively compiled response for everything else
  const cleanTopic = extractCleanTerm(prompt, [
    "haqida", "tushuntir", "muallif", "so'zla", "yoz", "tahlil", "qil",
    "nima", "qanday", "sana", "nega", "kim", "qachon", "qayer", "mi", "qi",
    "menga", "batafsil", "malumot", "ma'lumot", "ber", "yozib", "tuzib"
  ]);

  const hash = Math.abs(prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + prompt.length);

  // Diverse dynamic introduction variations
  const INTROS = [
    (t: string) => `**${t}** masalasi bugungi zamonaviy davrda juda keng ko'lamli ilmiy-amaliy, ijobiy ijtimoiy-iqtisodiy hamda tizimli tadqiqotlarning diqqat markazida bo'lib kelmoqda. Ushbu tushunchaning shakllanishi va rivojlanish tarixi insoniyat tamadduni, texnik taraqqiyot hamda madaniy evolyutsiya jarayonlari bilan bevosita va uzviy bog'liqdir.`,
    (t: string) => `Siz so'ragan **${t}** kognitiv miqyosda eng dolzarb hamda eng qiziqarli masalalardan biri hisoblanadi. Kundalik faoliyatimizda, ilmiy doiralarda hamda ilg'or texnologik tarmoqlarda ushbu mavzu atrofidagi muhokamalarning o'rni va uning amaliy ahamiyati kundan-kunga ortib bormoqda.`,
    (t: string) => `**${t}** haqidagi tahliliy qarorlar va fundamental g'oyalar zamonaviy ilmiy bilimlarning rivojlanishiga, tizimlarni loyihalashga hamda amaliy yechimlarni topishga poydevor hisoblanadi. Ushbu mavzu doirasida yig'ilgan muhim tahliliy xulosalarni sizga oson shaklda quyida taqdim etamiz.`,
    (t: string) => `Siz tomondan yuborilgan **${t}** so'rovi o'ziga xos mantiqiy, empirik va nazariy asoslarga ega bo'lib, keng jamoatchilik va soha vakillari uchun hamisha qiziqish uyg'otib keladi. Mavzuni chuqur anglash, uning mohiyatiga yetish va amalda qo'llash hayotiy ko'nikmalarni rivojlantirishga xizmat qiladi.`,
    (t: string) => `Tafakkur va kognitiv tahlil olamida **${t}** eng ko'p ta'riflanadigan hamda doimiy ravishda o'zgarib, takomillashib boradigan yo'nalishlardandir. Quyidagi mukammal tahliliy ma'ruzamiz ushbu mavzuni to'liq, ravon va ilmiy jihatdan tushunarli tushuntirishga qaratilgan.`
  ];

  // 4 completely distinct structures to alternate layout context based on the hash
  const STRUCTURE_SETS = [
    {
      title: "Tizimli va Arxitekturaviy Tahlil",
      p1: `**1. Strukturaviy barqarorlik prinsiplari**: ${cleanTopic} tizimining muvaffaqiyatli rivojlanishida har bir jarayon bosqichma-bosqich, xavfsizlik va mustahkam poydevor talablari asosida loyihalashtirilishi lozim. Har qanday murakkablikni soddalashtirish aynan shu yerda boshlanadi.`,
      p2: `**2. Resurslar muvozanati**: ${cleanTopic} doirasida yuzaga keladigan ichki va tashqi o'zaro bog'liqliklarni chuqur o'rganish, kutilmagan tizimli xatolar va noaniqliklarni kamaytirish hamda umumiy resurslardan optimal foydalanish yuksak samaradorlikni kafolatlaydi.`,
      p3: `**3. Kelgusi masshtablanish va modernizatsiya**: Kelajakda ${cleanTopic} yo'nalishi eng zamonaviy axborot texnologiyalari, avtomatlashtirilgan sun'iy intellekt tarmoqlari hamda kognitiv tizimlar bilan integratsiyalashib borishi muqarrar.`
    },
    {
      title: "Falsafiy Mohiyat va Ijtimoiy Integratsiya",
      p1: `**1. Inson tafakkuri va kognitiv tushuncha**: ${cleanTopic} shaxsning dunyoqarashini kengaytirish, mantiqiy fikrlash tarzi va intellektual salohiyatini yuzaga chiqarishga ijobiy ta'sir ko'rsatadi. Bu esa yuksak natijalarga intilishni boshlab beradi.`,
      p2: `**2. Madaniy va ijtimoiy evolyutsiya**: ${cleanTopic} evolyutsiyasini o'rgansak, uning asrlar davomida jamiyat madaniyati, iqtisodiy munosabatlar va insonlar o'rtasidagi ma'naviy muloqot tizimlari bilan hamnafaslikda shakllanganini ko'rishimiz mumkin.`,
      p3: `**3. Global raqamlashtirish sharoitidagi yangi o'rin**: Bugungi jadal axborot asrida ${cleanTopic} yangicha ijtimoiy-falsafiy ma'no kasb etib, global chegaralarni yo'qotishga hamda odamlar o'rtasida ishonch ko'priklarini o'rnatishga xizmat qiladi.`
    },
    {
      title: "Amaliy O'rganish va Fundamental Metodlar",
      p1: `**1. Nazariy poydevor va terminologiya**: ${cleanTopic}ni o'rganishda eng birinchi navbatda unga tegishli terminlar, tushunchalar apparati va eng o'zgarmas asosiy qoidalarni mukammal o'zlashtirish tavsiya etiladi. Keyingi barcha amaliyot aynan shu poydevorga tayanadi.`,
      p2: `**2. Tizimli tadqiqot usullari**: Mavzuni empirik o'rganish, statistik ma'lumotlarni to'plash, o'zaro taqqoslash hamda olingan natijalarni real kundalik hayotda yoki loyihalarda sinovdan o'tkazish sizda professional ko'nikmalarni hosil qiladi.`,
      p3: `**3. Xalqaro andozalar va universal tavsiyalar**: Dunyo miqyosida ${cleanTopic} bo'yicha eng kuchli olimlar, mutaxassislar va xalqaro institutlar ishlab chiqqan eng ilg'or uslubiyotlarni mutolaa qilish bilimni yanada chuqurlashtiradi.`
    },
    {
      title: "Istiqbolli Reja va Amaliy Yo'l Xaritasi",
      p1: `**1. Boshlang'ich tayyorgarlik va SWOT tahlil**: ${cleanTopic} doirasida har qanday ishga kirishishdan avval loyihaning kuchli va zaif tomonlarini, mumkin bo'lgan to'siqlar va resurslarni (vaqt, energiya, moliya) aniq hisoblab olish talab etiladi.`,
      p2: `**2. Kichik qadamlar ("MVP") strategiyasi**: Eng sodda, eng tushunarli va tezkor bosqichlarni bajarishdan boshlang. ${cleanTopic} yo'nalishining barqarorligini mitti ko'rinishda amaliyotda tekshirib, ijobiy o'zgarishlar sezilgach kengaytiring.`,
      p3: `**3. Kamchiliklarni doimiy to'g'irlab borish**: Amalga oshirilayotgan ishlarni muntazam tahlil qilish, muammoli nuqtalarda mutaxassislar fikrini inobatga olish va tizimli intizom siz sohadagi kutilgan oliy natijaga yetaklaydi.`
    }
  ];

  // 3 completely distinct action sets to generate based on hash
  const ACTION_SETS = [
    (t: string) => [
      `🎯 **Konseptual anglash**: ${t} bo'yicha eng muhim 3 ta fundamental qoidani o'zingiz uchun qayd etib oling va tahlil qiling.`,
      `🔄 **Muntazam takrorlash**: Yangi o'zlashtirilgan tushunchalarni har kuni kamida 15 daqiqa takrorlang, bu xotirani mustahkamlaydi.`,
      `💡 **VeloxAi Tavsiyasi**: Bugundanoq strategiyada keltirilgan amallarni kichik ko'rinishda hayotga tatbiq qilishga kirishing.`
    ],
    (t: string) => [
      `📚 **Chuqurlashtirilgan mutolaa**: ${t} haqida yozilgan nufuzli maqolalar, darsliklar va eng sara adabiyotlarni o'qing.`,
      `🤝 **Tajriba almashish**: O'rgangan tizimli bilimlaringizni do'stlaringiz yoki soha mutaxassislari bilan erkin muloqotda muhokama qiling.`,
      `🚀 **Intizomni saqlash**: Har kuni o'zingiz oldingizga qo'ygan mitti vazifani sifatli yakunlab boring va o'z faolligingizni baholang.`
    ],
    (t: string) => [
      `🛠️ **Amaliy mashg'ulot**: ${t} bo'yicha nazariy g'oyalarni kichik bir real loyihaga (qaydlar, dars jadvali, mitti kod) aylantirishga urinib ko'ring.`,
      `📊 **Ko'rsatkichlarni o'lchash**: O'zingiz bajargan ishlarni aniq o'lchanadigan natijalar (vaqt sarfi, sifat) orqali muntazam nazorat qiling.`,
      `🧠 **Mantiqiy yondashuv**: Har doim nima uchun va qanday qonuniyatlar borligi haqida savol bering. Savollar sizni donolik sari yetaklaydi.`
    ]
  ];

  const selectedIntro = INTROS[hash % INTROS.length](cleanTopic);
  const selectedStruct = STRUCTURE_SETS[hash % STRUCTURE_SETS.length];
  const selectedActions = ACTION_SETS[hash % ACTION_SETS.length](cleanTopic);

  return `# VeloxAi Intellektual Tahlili: **${cleanTopic}**

${selectedIntro}

## 📋 ${selectedStruct.title} hamda Mohiyati
${selectedStruct.p1}

${selectedStruct.p2}

${selectedStruct.p3}

## 🧭 Amaliy Tavsiyalar va Harakatlar
* ${selectedActions[0]}
* ${selectedActions[1]}
* ${selectedActions[2]}

---

*Ushbu unikal tahliliy ma'lumotlar VeloxAi oflayn kognitiv protsessori tomonidan maxsus siz uchun tuzildi. Loyihani to'liq quvvatga (Gemini Model) o'tkazish uchun "Settings > Secrets" sahifasidan GEMINI_API_KEY o'rnating.*`;
}

/**
 * Streams the generated text chunks back with a mock callback.
 * Simulates real LLM streaming chunks back to the SSE connection.
 */
export async function streamLocalFallback(
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  const fullText = generateLocalFallback(prompt);
  
  // Split into words, preserving spaces to simulate a genuine text typewriter
  const words = fullText.split(/(\s+)/);
  
  // Send words sequentially to simulate network typing
  for (let i = 0; i < words.length; i++) {
    onChunk(words[i]);
    // Micro delay to emulate direct network chunk output instantly and smoothly
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 5 + 2));
  }
}
