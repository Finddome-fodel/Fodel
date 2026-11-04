/**
 * Valuation-form wording for the seven later languages, keyed by the English
 * text in valuation-questions.ts. Each row is [sr, uk, tr, he, ar, ru, zh].
 *
 * Kept apart so the 21-argument t5() calls stay readable; t5() looks every
 * English text up here. A missing row falls back to English and shows up in
 * `npm run check:i18n` as "still English".
 */

export const LATER_LOCALES = ['sr', 'uk', 'tr', 'he', 'ar', 'ru', 'zh'] as const;
export type LaterLocale = (typeof LATER_LOCALES)[number];
type Row = readonly [sr: string, uk: string, tr: string, he: string, ar: string, ru: string, zh: string];

export const VALUATION_LATER: Readonly<Record<string, Row>> = {
  // ── Shared answers ──
  'I don’t know': ['Ne znam', 'Не знаю', 'Bilmiyorum', 'לא יודע/ת', 'لا أعرف', 'Не знаю', '不清楚'],
  Yes: ['Da', 'Так', 'Evet', 'כן', 'نعم', 'Да', '是'],
  No: ['Ne', 'Ні', 'Hayır', 'לא', 'لا', 'Нет', '否'],
  'Borders the plot': ['Graniči sa placem', 'Межує з ділянкою', 'Arsaya bitişik', 'גובל במגרש', 'متاخم لقطعة الأرض', 'Граничит с участком', '与地块相邻'],
  'Within walking distance': ['Na pešačkoj udaljenosti', 'У пішій доступності', 'Yürüme mesafesinde', 'במרחק הליכה', 'على مسافة قريبة سيرًا على الأقدام', 'В пешей доступности', '步行可达'],
  'Not nearby': ['Nije u blizini', 'Немає поблизу', 'Yakında yok', 'אין בקרבת מקום', 'غير موجود بالقرب', 'Нет поблизости', '附近没有'],

  // ── Surroundings ──
  'What kind of road leads to the property?': ['Kakav put vodi do nekretnine?', 'Яка дорога веде до об’єкта?', 'Mülke nasıl bir yol çıkıyor?', 'איזו דרך מובילה לנכס?', 'ما نوع الطريق المؤدي إلى العقار؟', 'Какая дорога ведёт к объекту?', '通往房产的是什么道路？'],
  'Asphalt road': ['Asfaltni put', 'Асфальтована дорога', 'Asfalt yol', 'כביש סלול', 'طريق معبّد', 'Асфальтированная дорога', '柏油路'],
  'Gravel or crushed-stone road': ['Put od šljunka ili tucanika', 'Гравійна або щебенева дорога', 'Çakıl veya mıcır yol', 'דרך חצץ או אבן כתושה', 'طريق من الحصى أو الحجر المكسّر', 'Гравийная или щебёночная дорога', '砾石或碎石路'],
  'Dirt track': ['Zemljani put', 'Ґрунтова дорога', 'Toprak yol', 'דרך עפר', 'طريق ترابي', 'Грунтовая дорога', '土路'],
  'Is there a noticeable source of noise nearby (busy road, railway, factory)?': ['Da li u blizini postoji izražen izvor buke (prometan put, pruga, fabrika)?', 'Чи є поблизу помітне джерело шуму (жвава дорога, залізниця, підприємство)?', 'Yakında belirgin bir gürültü kaynağı (yoğun yol, demiryolu, fabrika) var mı?', 'האם יש בקרבת מקום מקור רעש בולט (כביש סואן, מסילת רכבת, מפעל)?', 'هل يوجد بالقرب مصدر ضوضاء ملحوظ (طريق مزدحم، سكة حديد، مصنع)؟', 'Есть ли поблизости заметный источник шума (оживлённая дорога, железная дорога, предприятие)?', '附近是否有明显的噪音源（繁忙道路、铁路、工厂）？'],
  'What internet connection is there?': ['Kakva je internet veza?', 'Яке є підключення до інтернету?', 'Nasıl bir internet bağlantısı var?', 'איזה חיבור אינטרנט יש?', 'ما نوع الاتصال بالإنترنت المتوفر؟', 'Какое есть подключение к интернету?', '有什么样的网络连接？'],
  'Fixed line or fibre': ['Fiksna linija ili optika', 'Дротовий або оптоволоконний', 'Sabit hat veya fiber', 'קווי או סיב אופטי', 'خط ثابت أو ألياف ضوئية', 'Проводной или оптоволоконный', '固定宽带或光纤'],
  'Mobile internet only': ['Samo mobilni internet', 'Лише мобільний інтернет', 'Yalnızca mobil internet', 'אינטרנט סלולרי בלבד', 'إنترنت عبر الهاتف المحمول فقط', 'Только мобильный интернет', '仅移动网络'],
  None: ['Nema', 'Немає', 'Yok', 'אין', 'لا يوجد', 'Нет', '无'],
  'Does the property have a view / panorama?': ['Da li nekretnina ima pogled / panoramu?', 'Чи є з об’єкта вид / панорама?', 'Mülkün manzarası / panoraması var mı?', 'האם יש מהנכס נוף / פנורמה?', 'هل يطل العقار على منظر / إطلالة بانورامية؟', 'Есть ли из объекта вид / панорама?', '房产是否有景观 / 全景视野？'],
  'Is there a lake, stream or waterside nearby?': ['Da li je u blizini jezero, potok ili obala?', 'Чи є поблизу озеро, струмок або берег водойми?', 'Yakında göl, dere veya su kenarı var mı?', 'האם יש בקרבת מקום אגם, נחל או חוף מים?', 'هل توجد بالقرب بحيرة أو جدول أو ضفة ماء؟', 'Есть ли поблизости озеро, ручей или берег водоёма?', '附近是否有湖泊、溪流或水岸？'],
  'Is there woodland nearby?': ['Da li je u blizini šuma?', 'Чи є поблизу ліс?', 'Yakında orman var mı?', 'האם יש יער בקרבת מקום?', 'هل توجد غابة بالقرب؟', 'Есть ли поблизости лес?', '附近是否有林地？'],
  'Is there a farm or livestock operation nearby?': ['Da li je u blizini poljoprivredno gazdinstvo ili stočna farma?', 'Чи є поблизу сільськогосподарське або тваринницьке підприємство?', 'Yakında bir tarım işletmesi veya hayvancılık tesisi var mı?', 'האם יש בקרבת מקום משק חקלאי או מתקן לגידול בעלי חיים?', 'هل توجد بالقرب منشأة زراعية أو حظيرة لتربية المواشي؟', 'Есть ли поблизости сельхозпредприятие или животноводческая ферма?', '附近是否有农场或畜牧养殖场？'],
  'Do high-voltage power lines run over or close to the property?': ['Da li iznad nekretnine ili u njenoj blizini prolazi dalekovod?', 'Чи проходить над об’єктом або поблизу лінія високої напруги?', 'Mülkün üzerinden veya yakınından yüksek gerilim hattı geçiyor mu?', 'האם עוברים קווי מתח גבוה מעל הנכס או בקרבתו?', 'هل تمر خطوط كهرباء عالية الجهد فوق العقار أو بالقرب منه؟', 'Проходит ли над объектом или рядом линия высокого напряжения?', '房产上方或附近是否有高压线经过？'],
  'Yes, over the plot': ['Da, iznad placa', 'Так, над ділянкою', 'Evet, arsanın üzerinden', 'כן, מעל המגרש', 'نعم، فوق قطعة الأرض', 'Да, над участком', '是，从地块上方经过'],
  'Yes, nearby': ['Da, u blizini', 'Так, поблизу', 'Evet, yakınında', 'כן, בקרבת מקום', 'نعم، بالقرب', 'Да, поблизости', '是，在附近'],

  // ── Building ──
  'Wall material': ['Materijal zidova', 'Матеріал стін', 'Duvar malzemesi', 'חומר הקירות', 'مادة الجدران', 'Материал стен', '墙体材料'],
  Brick: ['Cigla', 'Цегла', 'Tuğla', 'לבנים', 'طوب', 'Кирпич', '砖'],
  Adobe: ['Čerpič', 'Саман', 'Kerpiç', 'בוץ (אדובי)', 'طوب لبن', 'Саман', '土坯'],
  Panel: ['Panel', 'Панель', 'Panel (prefabrik)', 'פאנלים טרומיים', 'ألواح مسبقة الصنع', 'Панель', '预制板'],
  'Timber / light frame': ['Drvo / laka konstrukcija', 'Дерево / легкий каркас', 'Ahşap / hafif karkas', 'עץ / שלד קל', 'خشب / هيكل خفيف', 'Дерево / лёгкий каркас', '木结构 / 轻型框架'],
  Stone: ['Kamen', 'Камінь', 'Taş', 'אבן', 'حجر', 'Камень', '石材'],
  Mixed: ['Mešovito', 'Змішаний', 'Karma', 'משולב', 'مختلط', 'Смешанный', '混合'],
  'Floor construction': ['Međuspratna konstrukcija', 'Перекриття', 'Döşeme yapısı', 'מבנה התקרות', 'هيكل الأسقف الفاصلة', 'Перекрытия', '楼板结构'],
  Concrete: ['Beton', 'Бетон', 'Beton', 'בטון', 'خرسانة', 'Бетон', '混凝土'],
  Timber: ['Drvo', 'Дерево', 'Ahşap', 'עץ', 'خشب', 'Дерево', '木材'],
  'Roof structure': ['Krovna konstrukcija', 'Конструкція даху', 'Çatı yapısı', 'מבנה הגג', 'هيكل السقف', 'Конструкция крыши', '屋顶结构'],
  Other: ['Drugo', 'Інше', 'Diğer', 'אחר', 'أخرى', 'Другое', '其他'],
  'Roof covering': ['Krovni pokrivač', 'Покрівля', 'Çatı kaplaması', 'כיסוי הגג', 'تغطية السقف', 'Кровля', '屋面材料'],
  Tiles: ['Crep', 'Черепиця', 'Kiremit', 'רעפים', 'قرميد', 'Черепица', '瓦片'],
  'Metal sheet': ['Lim', 'Металевий лист', 'Metal levha', 'פח', 'صفائح معدنية', 'Металлический лист', '金属板'],
  Slate: ['Škriljac', 'Шифер', 'Arduvaz', 'צפחה', 'أردواز', 'Шифер', '石板'],
  'Condition of the roof': ['Stanje krova', 'Стан даху', 'Çatının durumu', 'מצב הגג', 'حالة السقف', 'Состояние крыши', '屋顶状况'],
  Good: ['Dobro', 'Добрий', 'İyi', 'טוב', 'جيدة', 'Хорошее', '良好'],
  'Needs renovation': ['Potrebna obnova', 'Потребує ремонту', 'Yenilenmesi gerekiyor', 'דורש שיפוץ', 'يحتاج إلى تجديد', 'Требует ремонта', '需要翻修'],
  'Age of windows and doors': ['Starost prozora i vrata', 'Вік вікон і дверей', 'Pencere ve kapıların yaşı', 'גיל החלונות והדלתות', 'عمر النوافذ والأبواب', 'Возраст окон и дверей', '门窗新旧'],
  'New / modern': ['Novi / savremeni', 'Нові / сучасні', 'Yeni / modern', 'חדשים / מודרניים', 'جديدة / حديثة', 'Новые / современные', '新 / 现代'],
  Old: ['Stari', 'Старі', 'Eski', 'ישנים', 'قديمة', 'Старые', '旧'],
  'Material of windows and doors': ['Materijal prozora i vrata', 'Матеріал вікон і дверей', 'Pencere ve kapıların malzemesi', 'חומר החלונות והדלתות', 'مادة النوافذ والأبواب', 'Материал окон и дверей', '门窗材料'],
  Plastic: ['PVC', 'Пластик', 'PVC', 'פלסטיק (PVC)', 'بلاستيك (PVC)', 'Пластик', '塑钢'],
  Wood: ['Drvo', 'Дерево', 'Ahşap', 'עץ', 'خشب', 'Дерево', '木质'],
  Aluminium: ['Aluminijum', 'Алюміній', 'Alüminyum', 'אלומיניום', 'ألومنيوم', 'Алюминий', '铝合金'],
  Insulation: ['Izolacija', 'Утеплення', 'Yalıtım', 'בידוד', 'العزل', 'Утепление', '保温'],
  Present: ['Postoji', 'Є', 'Var', 'קיים', 'موجود', 'Есть', '有'],
  Partial: ['Delimična', 'Часткове', 'Kısmi', 'חלקי', 'جزئي', 'Частичное', '部分'],
  Cooling: ['Hlađenje', 'Охолодження', 'Soğutma', 'קירור', 'التبريد', 'Охлаждение', '制冷'],
  'Air conditioning': ['Klima-uređaj', 'Кондиціонер', 'Klima', 'מיזוג אוויר', 'تكييف الهواء', 'Кондиционер', '空调'],
  Utilities: ['Komunalni priključci', 'Комунікації', 'Altyapı bağlantıları', 'תשתיות', 'المرافق', 'Коммуникации', '市政设施'],
  Electricity: ['Struja', 'Електрика', 'Elektrik', 'חשמל', 'كهرباء', 'Электричество', '电'],
  Water: ['Voda', 'Вода', 'Su', 'מים', 'مياه', 'Вода', '水'],
  Sewerage: ['Kanalizacija', 'Каналізація', 'Kanalizasyon', 'ביוב', 'صرف صحي', 'Канализация', '排污管道'],
  Gas: ['Gas', 'Газ', 'Doğalgaz', 'גז', 'غاز', 'Газ', '燃气'],
  'Septic tank': ['Septička jama', 'Септик', 'Fosseptik', 'בור ספיגה', 'خزان صرف صحي', 'Септик', '化粪池'],
  Well: ['Bunar', 'Колодязь', 'Kuyu', 'באר', 'بئر', 'Колодец', '水井'],
  'Solar panels': ['Solarni paneli', 'Сонячні панелі', 'Güneş panelleri', 'פאנלים סולאריים', 'ألواح شمسية', 'Солнечные панели', '太阳能板'],

  // ── Setting ──
  'Orientation and sunlight': ['Orijentacija i osunčanost', 'Орієнтація та освітленість', 'Yön ve güneş alma', 'כיווני אוויר ושמש', 'الاتجاه وأشعة الشمس', 'Ориентация и освещённость', '朝向与采光'],
  Sunny: ['Sunčano', 'Сонячно', 'Güneşli', 'שטוף שמש', 'مشمس', 'Солнечно', '向阳'],
  Shady: ['Senovito', 'Затінено', 'Gölgeli', 'מוצל', 'مظلّل', 'Затенено', '背阴'],
  'Centre and amenities': ['Centar i usluge', 'Центр і послуги', 'Merkez ve hizmetler', 'מרכז ושירותים', 'المركز والخدمات', 'Центр и инфраструктура', '中心区与生活配套'],
  'By car': ['Automobilom', 'Автомобілем', 'Arabayla', 'ברכב', 'بالسيارة', 'На машине', '驾车可达'],
  'Far away': ['Daleko', 'Далеко', 'Uzak', 'רחוק', 'بعيد', 'Далеко', '较远'],
  'Surrounding land use': ['Namena okolnog zemljišta', 'Використання навколишньої території', 'Çevredeki arazi kullanımı', 'שימושי הקרקע בסביבה', 'استخدام الأراضي المحيطة', 'Использование окружающей территории', '周边土地用途'],
  'Residential area': ['Stambena zona', 'Житлова зона', 'Konut alanı', 'אזור מגורים', 'منطقة سكنية', 'Жилая зона', '住宅区'],
  'Recreational area': ['Vikend-zona', 'Рекреаційна зона', 'Tatil / sayfiye bölgesi', 'אזור נופש', 'منطقة استجمام', 'Рекреационная зона', '休闲度假区'],
  'Outlying area / farmsteads': ['Van naselja / salaši', 'Позаміська територія / хутори', 'Yerleşim dışı / çiftlik evleri', 'שטח פתוח / חוות בודדות', 'منطقة خارجية / مزارع متفرقة', 'Загородная территория / хутора', '郊外 / 农庄'],
  Agricultural: ['Poljoprivredno', 'Сільськогосподарська', 'Tarımsal', 'חקלאי', 'زراعية', 'Сельскохозяйственная', '农业用地'],
  'Industrial / mixed': ['Industrijsko / mešovito', 'Промислова / змішана', 'Sanayi / karma', 'תעשייתי / מעורב', 'صناعية / مختلطة', 'Промышленная / смешанная', '工业 / 混合'],
  'Condition of neighbouring buildings': ['Stanje susednih zgrada', 'Стан сусідніх будівель', 'Komşu binaların durumu', 'מצב המבנים הסמוכים', 'حالة المباني المجاورة', 'Состояние соседних зданий', '相邻建筑状况'],
  Poor: ['Loše', 'Поганий', 'Kötü', 'ירוד', 'متدهورة', 'Плохое', '较差'],
  'Disturbing facility nearby': ['Uznemirujući objekat u blizini', 'Неприємний об’єкт поблизу', 'Yakında rahatsız edici tesis', 'מתקן מטריד בקרבת מקום', 'منشأة مزعجة بالقرب', 'Мешающий объект поблизости', '附近有干扰性设施'],
  'Condition of garden and fence': ['Stanje bašte i ograde', 'Стан саду й огорожі', 'Bahçe ve çitin durumu', 'מצב הגינה והגדר', 'حالة الحديقة والسياج', 'Состояние сада и забора', '花园与围栏状况'],
  'Needs tidying': ['Potrebno uređenje', 'Потребує впорядкування', 'Düzenlenmesi gerekiyor', 'דורש סידור', 'تحتاج إلى ترتيب', 'Требует приведения в порядок', '需要整理'],
  'Room for extension': ['Mogućnost proširenja', 'Можливість розширення', 'Genişletme olanağı', 'אפשרות הרחבה', 'إمكانية التوسعة', 'Возможность расширения', '扩建空间'],

  // ── Legal ──
  'Known legal restrictions': ['Poznata pravna ograničenja', 'Відомі правові обмеження', 'Bilinen hukuki kısıtlamalar', 'מגבלות משפטיות ידועות', 'قيود قانونية معروفة', 'Известные правовые ограничения', '已知法律限制'],
  Usufruct: ['Plodouživanje', 'Узуфрукт', 'İntifa hakkı', 'זכות שימוש ופירות (אוזופרוקט)', 'حق الانتفاع', 'Узуфрукт', '用益权'],
  'Someone else has the right to use the property and enjoy its fruits.': ['Neko drugi ima pravo da koristi nekretninu i ubira njene plodove.', 'Хтось інший має право користуватися об’єктом і отримувати з нього доходи.', 'Başka birinin mülkü kullanma ve ondan yararlanma hakkı vardır.', 'לאדם אחר יש זכות להשתמש בנכס ולהפיק ממנו תועלת.', 'لشخص آخر الحق في استخدام العقار والانتفاع بثماره.', 'Кто-то другой имеет право пользоваться объектом и получать от него доходы.', '他人有权使用该房产并获取其收益。'],
  'Mortgage / charge': ['Hipoteka / teret', 'Іпотека / обтяження', 'İpotek / takyidat', 'משכנתה / שעבוד', 'رهن / عبء', 'Ипотека / обременение', '抵押 / 负担'],
  'The property secures a loan or other claim.': ['Nekretnina služi kao obezbeđenje kredita ili drugog potraživanja.', 'Об’єкт є забезпеченням кредиту або іншої вимоги.', 'Mülk bir kredinin veya başka bir alacağın teminatıdır.', 'הנכס משמש בטוחה להלוואה או לחוב אחר.', 'العقار ضمان لقرض أو لمطالبة أخرى.', 'Объект служит обеспечением кредита или иного требования.', '该房产是贷款或其他债权的担保物。'],
  'Right of pre-emption': ['Pravo preče kupovine', 'Переважне право купівлі', 'Önalım hakkı', 'זכות קדימה ברכישה', 'حق الشفعة', 'Преимущественное право покупки', '优先购买权'],
  'A specific person may buy before other buyers.': ['Određeno lice može kupiti pre drugih kupaca.', 'Певна особа може купити раніше за інших покупців.', 'Belirli bir kişi diğer alıcılardan önce satın alabilir.', 'אדם מסוים רשאי לקנות לפני קונים אחרים.', 'يحق لشخص معيّن الشراء قبل المشترين الآخرين.', 'Определённое лицо может купить раньше других покупателей.', '特定人士可先于其他买家购买。'],
  Easement: ['Službenost', 'Сервітут', 'İrtifak hakkı', 'זיקת הנאה', 'حق ارتفاق', 'Сервитут', '地役权'],
  'Someone else may cross or otherwise use the plot.': ['Neko drugi sme da prelazi preko placa ili ga na drugi način koristi.', 'Хтось інший може проходити через ділянку або інакше нею користуватися.', 'Başka biri arsadan geçebilir veya arsayı başka şekilde kullanabilir.', 'אדם אחר רשאי לעבור במגרש או להשתמש בו בדרך אחרת.', 'يحق لشخص آخر المرور عبر قطعة الأرض أو استخدامها بطريقة أخرى.', 'Кто-то другой может проходить через участок или иначе им пользоваться.', '他人可通行或以其他方式使用该地块。'],
  'Undivided co-ownership': ['Nepodeljeno suvlasništvo', 'Неподілена спільна власність', 'Paylı (bölünmemiş) mülkiyet', 'בעלות משותפת לא מחולקת', 'ملكية مشتركة غير مفرزة', 'Неразделённая долевая собственность', '未分割共有'],
  'Several owners share the property, without separate land registry numbers.': ['Više vlasnika deli nekretninu, bez zasebnih katastarskih brojeva.', 'Кілька власників володіють об’єктом спільно, без окремих кадастрових номерів.', 'Birden fazla malik mülkü, ayrı tapu parsel numaraları olmadan paylaşır.', 'כמה בעלים חולקים בנכס, ללא מספרי חלקה נפרדים ברישום המקרקעין.', 'يتشارك عدة ملاك العقار دون أرقام مستقلة في السجل العقاري.', 'Несколько собственников владеют объектом совместно, без отдельных кадастровых номеров.', '多位业主共有该房产，没有单独的土地登记编号。'],
  'Heritage / nature protection': ['Zaštita spomenika kulture / prirode', 'Охорона пам’яток / природи', 'Tarihî eser / doğa koruma', 'שימור מורשת / שמירת טבע', 'حماية التراث / الطبيعة', 'Охрана памятников / природы', '文物 / 自然保护'],
  'The building or area is protected; changes need permission.': ['Zgrada ili područje su zaštićeni; za izmene je potrebna dozvola.', 'Будівля або територія під охороною; зміни потребують дозволу.', 'Bina veya alan koruma altındadır; değişiklikler izne tabidir.', 'המבנה או האזור מוגנים; שינויים מחייבים היתר.', 'المبنى أو المنطقة محميّان؛ وأي تغيير يحتاج إلى تصريح.', 'Здание или территория под охраной; изменения требуют разрешения.', '该建筑或区域受保护；任何改动均需许可。'],
  'Restriction on trading agricultural land': ['Ograničenje prometa poljoprivrednog zemljišta', 'Обмеження обігу сільськогосподарських земель', 'Tarım arazisi satış kısıtlaması', 'מגבלה על סחר בקרקע חקלאית', 'قيود على تداول الأراضي الزراعية', 'Ограничение оборота сельхозземель', '农用地交易限制'],
  'Agricultural land rules may limit who can buy.': ['Pravila o poljoprivrednom zemljištu mogu ograničiti ko sme da kupi.', 'Правила щодо сільськогосподарських земель можуть обмежувати коло покупців.', 'Tarım arazisi kuralları kimin satın alabileceğini sınırlayabilir.', 'כללי הקרקע החקלאית עשויים להגביל מי רשאי לקנות.', 'قد تحدّ قواعد الأراضي الزراعية من الأشخاص المسموح لهم بالشراء.', 'Правила оборота сельхозземель могут ограничивать круг покупателей.', '农用地规定可能会限制谁可以购买。'],
  'None known': ['Nisu poznata', 'Невідомі', 'Bilinen yok', 'לא ידוע על מגבלות', 'لا توجد قيود معروفة', 'Неизвестны', '未知有任何限制'],
};

/** The later-language texts for one English text; English where a row is missing. */
export function laterOf(en: string): Record<LaterLocale, string> {
  const row = VALUATION_LATER[en];
  return Object.fromEntries(LATER_LOCALES.map((l, i) => [l, row?.[i] ?? en])) as Record<LaterLocale, string>;
}
