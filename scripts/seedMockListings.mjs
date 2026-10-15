import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://glxkkoahhryubdcktvfg.supabase.co';
const supabaseKey = 'sb_publishable_2s5GscNj70iqy1NZq1zkYg_AgAIjMmn';
const USER_ID = '23f85559-5a00-496d-9d63-5729724a55f5';

const supabase = createClient(supabaseUrl, supabaseKey);

export const mockBaseItems = [
  // 1. Будівельні суміші та сипучі (c1)
  { title: "Штукатурка Knauf MP-75 гіпсова 30кг", category: "c1-1", unit: "мішок", basePrice: 285 },
  { title: "Штукатурка Knauf Rotband універсальна 30кг", category: "c1-1", unit: "мішок", basePrice: 320 },
  { title: "Штукатурка цементна Siltek P-11 25кг", category: "c1-1", unit: "мішок", basePrice: 195 },
  { title: "Шпаклівка Knauf Multi-Finish 25кг", category: "c1-2", unit: "мішок", basePrice: 340 },
  { title: "Шпаклівка фінішна Semin Fibrelastic 5кг", category: "c1-2", unit: "відро", basePrice: 780 },
  { title: "Шпаклівка акрилова Dufa Acryl-Spachtel 8кг", category: "c1-2", unit: "відро", basePrice: 410 },
  { title: "Клей для плитки Ceresit CM 117 25кг", category: "c1-3", unit: "мішок", basePrice: 460 },
  { title: "Клей для керамограніту Siltek T-81 25кг", category: "c1-3", unit: "мішок", basePrice: 390 },
  { title: "Клей для газоблоку Стоунлайт Літо 20кг", category: "c1-4", unit: "мішок", basePrice: 175 },
  { title: "Клей для пінопласту та мінвати Ceresit CT 83 25кг", category: "c1-4", unit: "мішок", basePrice: 245 },
  { title: "Стяжка підлоги Siltek F-20 25кг", category: "c1-5", unit: "мішок", basePrice: 160 },
  { title: "Самовирівнювальна підлога Ceresit CN 69 25кг", category: "c1-5", unit: "мішок", basePrice: 420 },
  { title: "Цемент М-500 Дікергофф ПЦ I-500 25кг", category: "c1-6", unit: "мішок", basePrice: 185 },
  { title: "Пісок річковий митий фасований 50кг", category: "c1-7", unit: "мішок", basePrice: 65 },
  { title: "Керамзит фракція 10-20 фасований 40л", category: "c1-7", unit: "мішок", basePrice: 130 },
  { title: "Суміш кладочна Polimin М-100 25кг", category: "c1-8", unit: "мішок", basePrice: 110 },
  { title: "Пластифікатор для бетону та стяжки Байріс 5л", category: "c1-9", unit: "каністра", basePrice: 290 },

  // 2. Гіпсокартонні системи, профілі та стелі (c2)
  { title: "Гіпсокартон Knauf стіновий 12.5мм 1.2х2.5м", category: "c2-1", unit: "лист", basePrice: 245 },
  { title: "Гіпсокартон Knauf вологостійкий 12.5мм 1.2х2.5м", category: "c2-2", unit: "лист", basePrice: 310 },
  { title: "Гіпсокартон Knauf вогнестійкий 12.5мм 1.2х2.5м", category: "c2-2", unit: "лист", basePrice: 335 },
  { title: "Аквапанель Knauf Cement Board Outdoor 12.5мм", category: "c2-3", unit: "лист", basePrice: 890 },
  { title: "Профіль CD-60 Knauf 0.6мм 3м", category: "c2-4", unit: "шт", basePrice: 95 },
  { title: "Профіль UD-27 Knauf 0.6мм 3м", category: "c2-4", unit: "шт", basePrice: 65 },
  { title: "Профіль стієчний CW-75 0.6мм 3м", category: "c2-4", unit: "шт", basePrice: 155 },
  { title: "Профіль направляючий UW-75 0.6мм 3м", category: "c2-4", unit: "шт", basePrice: 130 },
  { title: "Маяк штукатурний 6мм оцинкований 3м", category: "c2-5", unit: "шт", basePrice: 22 },
  { title: "Кутник перфорований алюмінієвий 25х25 3м", category: "c2-5", unit: "шт", basePrice: 28 },
  { title: "Кутник пластиковий з армуючою сіткою 2.5м", category: "c2-5", unit: "шт", basePrice: 35 },
  { title: "Підвіс прямий ЕС 60/125 0.8мм (пешка)", category: "c2-6", unit: "шт", basePrice: 7 },
  { title: "З'єднувач однорівневий КРАБ 60х27 оцинкований", category: "c2-6", unit: "шт", basePrice: 12 },
  { title: "Стрічка для швів паперова Knauf Kurt 75м", category: "c2-7", unit: "рулон", basePrice: 420 },
  { title: "Стрічка армуюча серп'янка 45мм х 90м", category: "c2-7", unit: "рулон", basePrice: 135 },
  { title: "Сітка штукатурна фасадна 160г/м² 50м²", category: "c2-8", unit: "рулон", basePrice: 980 },
  { title: "Плита підвісної стелі Armstrong Bajkal 600х600", category: "c2-11", unit: "упак", basePrice: 890 },

  // 3. Тепло- та звукоізоляція, плівки й мембрани (c3)
  { title: "Мінеральна вата Izovat 30 100мм 3м²", category: "c3-1", unit: "упак", basePrice: 520 },
  { title: "Базальтова вата Rockwool Frontrock Super 100мм", category: "c3-1", unit: "упак", basePrice: 980 },
  { title: "Мінеральна вата Knauf Insulation Теплорулон 041 18м²", category: "c3-1", unit: "рулон", basePrice: 850 },
  { title: "Пінопласт Hirsch EPS 60 1000х500х50мм", category: "c3-2", unit: "упак", basePrice: 480 },
  { title: "Екструдований пінополістирол Penoboard XPS 50мм", category: "c3-3", unit: "лист", basePrice: 165 },
  { title: "Акустична мінеральна вата AcousticWool Sonet 50мм", category: "c3-5", unit: "упак", basePrice: 790 },
  { title: "Паробар'єр армований Juta H110 75м²", category: "c3-6", unit: "рулон", basePrice: 1350 },
  { title: "Вітрозахисна мембрана Strotex 1300 Basic 75м²", category: "c3-6", unit: "рулон", basePrice: 1650 },
  { title: "Супердифузійна мембрана Mastermax 3 Classic 135г 75м²", category: "c3-7", unit: "рулон", basePrice: 2450 },
  { title: "Теплоізоляція труб Sanflex 22/9мм 2м", category: "c3-8", unit: "шт", basePrice: 38 },
  { title: "Звукоізоляційна стрічка Knauf Діхтунгсбанд 50мм 30м", category: "c3-10", unit: "рулон", basePrice: 210 },

  // 4. Фарби, ґрунтовки та будівельна хімія (c4)
  { title: "Ґрунтовка глибокопроникна Ceresit CT 17 10л", category: "c4-1", unit: "каністра", basePrice: 360 },
  { title: "Ґрунтовка бетоноконтакт Knauf Betokontakt 15кг", category: "c4-1", unit: "відро", basePrice: 940 },
  { title: "Фарба інтер'єрна Dufa Mattlatex D100 біла 10л", category: "c4-2", unit: "відро", basePrice: 1250 },
  { title: "Фарба шовковисто-матова Caparol Samtex 7 10л", category: "c4-2", unit: "відро", basePrice: 3200 },
  { title: "Фарба фасадна акрилова Ceresit CT 42 15л", category: "c4-3", unit: "відро", basePrice: 2150 },
  { title: "Фарба гумова Farbex Rubber Farba графіт RAL 7024 12кг", category: "c4-4", unit: "відро", basePrice: 1650 },
  { title: "Емаль алкідна ПФ-115 біла Зебра 2.8кг", category: "c4-4", unit: "банка", basePrice: 310 },
  { title: "Декоративна штукатурка короїд Ceresit CT 174 25кг", category: "c4-5", unit: "відро", basePrice: 1850 },
  { title: "Монтажна піна професійна Tytan 65 пістолетна", category: "c4-6", unit: "балон", basePrice: 245 },
  { title: "Силіконовий герметик санітарний Soudal білий 280мл", category: "c4-7", unit: "туба", basePrice: 185 },
  { title: "Клей рідкі цвяхи Titebond Heavy Duty 310мл", category: "c4-8", unit: "туба", basePrice: 225 },
  { title: "Антисептик для дерева Сенеж Екобіо 5л", category: "c4-10", unit: "каністра", basePrice: 380 },

  // 5. Плитка та підлогові покриття (c5)
  { title: "Плитка для ванної Golden Tile 30х60 біла ректифікат", category: "c5-1", unit: "м²", basePrice: 490 },
  { title: "Керамограніт Gres Cersanit 60х60 сірий матовий", category: "c5-2", unit: "м²", basePrice: 580 },
  { title: "Керамограніт під дерево Opoczno 20x120", category: "c5-2", unit: "м²", basePrice: 720 },
  { title: "Мозаїка скляна для басейну та душової 30х30", category: "c5-3", unit: "лист", basePrice: 140 },
  { title: "Затирка для плитки Ceresit CE 40 антрацит 2кг", category: "c5-5", unit: "відро", basePrice: 240 },
  { title: "Затирка епоксидна двокомпонентна Mapei Kerapoxy 3кг", category: "c5-5", unit: "відро", basePrice: 1150 },
  { title: "Ламінат Kronopol 32 клас дуб натуральний 8мм", category: "c5-6", unit: "м²", basePrice: 420 },
  { title: "Вінілова підлога SPC 33 клас водостійка 4мм", category: "c5-7", unit: "м²", basePrice: 720 },
  { title: "Паркетна дошка Barlinek дуб натур 14мм", category: "c5-8", unit: "м²", basePrice: 1450 },
  { title: "Лінолеум комерційний Tarkett 2.5м", category: "c5-9", unit: "м²", basePrice: 380 },
  { title: "Підкладка під ламінат полотно ППЕ 3мм 50м²", category: "c5-10", unit: "рулон", basePrice: 450 },
  { title: "Підкладка хвойна тиха хода Isoplaat 4мм", category: "c5-10", unit: "упак", basePrice: 590 },
  { title: "Плінтус підлоговий МДФ білий 80мм 2.4м", category: "c5-11", unit: "шт", basePrice: 180 },
  { title: "Система вирівнювання плитки СВП основа 1.5мм 500шт", category: "c5-12", unit: "упак", basePrice: 220 },
  { title: "Клин для вирівнювання плитки СВП Нова 200шт", category: "c5-12", unit: "упак", basePrice: 170 },
  { title: "Профіль кутовий алюмінієвий для плитки 10мм 2.5м", category: "c5-13", unit: "шт", basePrice: 165 },

  // 6. Електрика та освітлення (c6)
  { title: "Кабель ВВГ-Пнгд 3х2.5 ЗЗКМ мідний моноліт", category: "c6-1", unit: "м", basePrice: 48 },
  { title: "Кабель ВВГ-Пнгд 3х1.5 Гал-Кат плаский", category: "c6-1", unit: "м", basePrice: 32 },
  { title: "Провід ПВС 3х2.5 Одескабель круглий гнучкий", category: "c6-1", unit: "м", basePrice: 54 },
  { title: "Гофротруба ПВХ з протяжкою 20мм Sokol сіра 100м", category: "c6-2", unit: "бухта", basePrice: 650 },
  { title: "Автоматичний вимикач 1P 16A Hager MCN116 6kA", category: "c6-3", unit: "шт", basePrice: 145 },
  { title: "Автоматичний вимикач 1P 25A Schneider Resi9 6kA", category: "c6-3", unit: "шт", basePrice: 155 },
  { title: "Диференційний автомат 2P 16A 30mA Hager", category: "c6-3", unit: "шт", basePrice: 920 },
  { title: "ПЗВ пристрій захисного відключення 2P 40A 30mA Eaton", category: "c6-3", unit: "шт", basePrice: 1150 },
  { title: "Реле контролю напруги ZUBR D2-40 red", category: "c6-3", unit: "шт", basePrice: 1350 },
  { title: "Щит вбудований на 24 модулі Hager Golf білі двері", category: "c6-4", unit: "шт", basePrice: 1250 },
  { title: "Розподільча коробка Schneider 80x80 для гіпсокартону", category: "c6-5", unit: "шт", basePrice: 45 },
  { title: "Розетка з заземленням Schneider Asfora біла", category: "c6-6", unit: "шт", basePrice: 110 },
  { title: "Клема швидкого монтажу WAGO 221-413 3-провідна", category: "c6-7", unit: "упак", basePrice: 380 },
  { title: "LED-стрічка 12V 2835 120д/м теплий білий 5м", category: "c6-8", unit: "бухта", basePrice: 350 },
  { title: "Світильник точковий врізний LED 7W білий матовий", category: "c6-9", unit: "шт", basePrice: 160 },

  // 7. Сантехніка, опалення та вентиляція (c7)
  { title: "Труба поліпропіленова VSplast PPR Fiber 20мм 4м", category: "c7-1", unit: "шт", basePrice: 95 },
  { title: "Труба каналізаційна Ostendorf HTsafe 110х1000мм", category: "c7-2", unit: "шт", basePrice: 165 },
  { title: "Труба каналізаційна Ostendorf HTsafe 50х500мм", category: "c7-2", unit: "шт", basePrice: 75 },
  { title: "Трап для душу лінійний з сухим затвором 70см Viega", category: "c7-3", unit: "шт", basePrice: 3800 },
  { title: "Кран кульовий 1/2 з американкою Solomon посилений", category: "c7-4", unit: "шт", basePrice: 215 },
  { title: "Труба для теплої підлоги PERT-EVOH 16х2.0 VSplast", category: "c7-5", unit: "м", basePrice: 32 },
  { title: "Радіатор біметалевий Fondital Alustal 500/100 10 секцій", category: "c7-6", unit: "шт", basePrice: 4200 },
  { title: "Інсталяція для унітазу Geberit Duofix 111.300.00.5", category: "c7-7", unit: "компл", basePrice: 7900 },
  { title: "Унітаз підвісний безобідковий Cersanit City Clean On", category: "c7-8", unit: "шт", basePrice: 3400 },
  { title: "Змішувач для ванни Grohe BauClassic з душовим гарнітуром", category: "c7-10", unit: "шт", basePrice: 3600 },
  { title: "Вентилятор витяжний Vents 100 Квайт безшумний", category: "c7-13", unit: "шт", basePrice: 1250 },
  { title: "Люк-невидимка ревізійний під плитку 400х600", category: "c7-14", unit: "шт", basePrice: 2100 },

  // 8. Кладочні матеріали, бетон та метал (c8)
  { title: "Газоблок Стоунлайт D500 600х200х300мм паз-гребінь", category: "c8-1", unit: "шт", basePrice: 115 },
  { title: "Газоблок перегородковий Стоунлайт 600х200х100мм", category: "c8-1", unit: "шт", basePrice: 42 },
  { title: "Цегла рядова повнотіла М-100 керамічна червона", category: "c8-3", unit: "шт", basePrice: 11 },
  { title: "Арматура сталева рифлена А500С Ø12мм 3м", category: "c8-4", unit: "м", basePrice: 42 },
  { title: "Труба профільна сталева 40х20х2мм 6м", category: "c8-5", unit: "шт", basePrice: 380 },
  { title: "Сітка кладочна армопояс 50х50 2.5мм 1х2м", category: "c8-6", unit: "карта", basePrice: 75 },
  { title: "Перемичка залізобетонна 2ПБ 13-1-п", category: "c8-8", unit: "шт", basePrice: 310 },
  { title: "Тротуарна плитка Старе Місто сіра 40мм", category: "c8-10", unit: "м²", basePrice: 320 },
  { title: "Лоток водовідвідний пластиковий з решіткою 1м", category: "c8-11", unit: "шт", basePrice: 290 },

  // 9. Покрівля, фасад та водостік (c9)
  { title: "Металочерепиця Монтеррей RAL 7024 0.45мм", category: "c9-1", unit: "м²", basePrice: 340 },
  { title: "Профнастил покрівельний ПК-20 0.45мм оцинкований", category: "c9-2", unit: "м²", basePrice: 260 },
  { title: "Бітумна черепиця Shinglas Соната коричнева", category: "c9-3", unit: "м²", basePrice: 295 },
  { title: "Євроруберойд Техноеласт ЕПП 10м²", category: "c9-5", unit: "рулон", basePrice: 1850 },
  { title: "Планка вітрова торцева для покрівлі 2м RAL 8017", category: "c9-6", unit: "шт", basePrice: 145 },
  { title: "Водостічний жолоб Bryza 125мм 3м графіт", category: "c9-8", unit: "шт", basePrice: 275 },
  { title: "Труба водостічна Bryza 90мм 3м графіт", category: "c9-8", unit: "шт", basePrice: 310 },
  { title: "Сайдинг вініловий Vox System MAX-3 дуб 3.85м", category: "c9-9", unit: "панель", basePrice: 280 },
  { title: "Полікарбонат стільниковий 6мм прозорий 2.1х6м", category: "c9-11", unit: "лист", basePrice: 2350 },

  // 10. Деревина та плитні матеріали (c10)
  { title: "Брус монтажний дерев'яний сухий сосна 50х50 3м", category: "c10-1", unit: "шт", basePrice: 95 },
  { title: "Дошка обрізна сосна 25х100 4м свіжопил", category: "c10-2", unit: "шт", basePrice: 120 },
  { title: "Вагонка дерев'яна сосна Європрофіль 12х88 3м", category: "c10-3", unit: "м²", basePrice: 290 },
  { title: "Терасна дошка модрина вельвет 28х140 3м", category: "c10-4", unit: "м²", basePrice: 890 },
  { title: "Плита OSB-3 Kronospan вологостійка 10мм 2500х1250", category: "c10-5", unit: "лист", basePrice: 410 },
  { title: "Плита OSB-3 Kronospan вологостійка 15мм 2500х1250", category: "c10-5", unit: "лист", basePrice: 590 },
  { title: "Фанера вологостійка березова ФК 12мм 1525х1525", category: "c10-6", unit: "лист", basePrice: 620 },
  { title: "Рейка монтажна суха сосна 20х40 3м", category: "c10-10", unit: "шт", basePrice: 45 },

  // 11. Кріплення та металовироби (c11)
  { title: "Саморізи по металу 3.5х25 Knauf TN (1000 шт)", category: "c11-1", unit: "упак", basePrice: 185 },
  { title: "Саморізи по дереву 3.5х35 фосфатовані (1000 шт)", category: "c11-1", unit: "упак", basePrice: 195 },
  { title: "Саморізи з пресшайбою гострі 4.2х16 оцинковані (1000 шт)", category: "c11-1", unit: "упак", basePrice: 230 },
  { title: "Дюбель швидкий монтаж 6х40 гриб Wkret-Met (100 шт)", category: "c11-2", unit: "упак", basePrice: 65 },
  { title: "Дюбель фасадний для теплоізоляції 10х160 метал (50 шт)", category: "c11-2", unit: "упак", basePrice: 240 },
  { title: "Болт з шестигранною головкою М8х40 DIN 933 (50 шт)", category: "c11-3", unit: "упак", basePrice: 110 },
  { title: "Шпилька різьбова DIN 975 М10 оцинкована 1м", category: "c11-4", unit: "шт", basePrice: 65 },
  { title: "Кутник перфорований посилений 105х105х90 2.0мм", category: "c11-6", unit: "шт", basePrice: 38 },
  { title: "Хомут сантехнічний металевий з гумкою 1/2 (50 шт)", category: "c11-9", unit: "упак", basePrice: 210 },

  // 12. Інструменти, розхідники та інвентар (c12)
  { title: "Шпатель фасадний нержавіючий 350мм 2K Hardex", category: "c12-1", unit: "шт", basePrice: 220 },
  { title: "Правило-трапеція з ребром жорсткості 2.0м Сталь", category: "c12-1", unit: "шт", basePrice: 440 },
  { title: "Валик малярний Anza Platinum мікрофібра 25см", category: "c12-2", unit: "шт", basePrice: 320 },
  { title: "Диск відрізний по металу 125х1.2х22.2 Klingspor Extra", category: "c12-8", unit: "шт", basePrice: 35 },
  { title: "Диск алмазний Distar 1A1R 125мм Hard Ceramics для плитки", category: "c12-8", unit: "шт", basePrice: 680 },
  { title: "Бур по бетону SDS-Plus Bosch Plus-5X 6х160мм", category: "c12-7", unit: "шт", basePrice: 115 },
  { title: "Рулетка вимірювальна 5м магнітна прогумована Haisser", category: "c12-5", unit: "шт", basePrice: 175 },
  { title: "Рівень будівельний алюмінієвий 3 вічка 100см Kapro", category: "c12-5", unit: "шт", basePrice: 580 },
  { title: "Драбина алюмінієва трансформер 4х3 сходинки Krause", category: "c12-12", unit: "шт", basePrice: 4200 },
  { title: "Мішки будівельні поліпропіленові 50кг посилені (10 шт)", category: "c12-14", unit: "упак", basePrice: 95 },
  { title: "Плівка поліетиленова первинна 100мкм рукав 1.5м (100м)", category: "c12-14", unit: "рулон", basePrice: 1250 },

  // 13. Гідроізоляція та захист від вологи (c13)
  { title: "Гідроізоляція мастика Knauf Flachendicht 5кг", category: "c13-1", unit: "відро", basePrice: 690 },
  { title: "Гідроізоляція двокомпонентна Ceresit CR 66 25кг", category: "c13-1", unit: "компл", basePrice: 1450 },
  { title: "Мастика бітумно-гумова AquaMast для фундаменту 18кг", category: "c13-2", unit: "відро", basePrice: 890 },
  { title: "Стрічка гідроізоляційна еластична Mapei Mapeband 10м", category: "c13-5", unit: "рулон", basePrice: 680 },
  { title: "Кутик гідроізоляційний внутрішній Mapei 90°", category: "c13-5", unit: "шт", basePrice: 95 },
  { title: "Манжета гідроізоляційна настінна для труб 120х120", category: "c13-6", unit: "шт", basePrice: 75 },
  { title: "Проникаюча гідроізоляція для бетону Пенетрон 5кг", category: "c13-8", unit: "відро", basePrice: 850 },
  { title: "Гідроізоляційна шипоподібна геомембрана Ізоліт 1.5х20м", category: "c13-11", unit: "рулон", basePrice: 1950 },

  // 14. Оздоблення стін і стелі (c14)
  { title: "Шпалери вінілові на флізеліні Marburg фактурні 1.06х10м", category: "c14-1", unit: "рулон", basePrice: 780 },
  { title: "Клей для флізелінових шпалер Метилан Експрес 250г", category: "c14-2", unit: "пачка", basePrice: 165 },
  { title: "Склополотно Wellton паутинка W40 50м² щільність 40г", category: "c14-3", unit: "рулон", basePrice: 950 },
  { title: "Стінові 3D панелі МДФ під дерево рейкові 2.7м", category: "c14-4", unit: "м²", basePrice: 680 },
  { title: "Стельовий багет поліуретановий Orac Decor 2м", category: "c14-6", unit: "шт", basePrice: 195 },
  { title: "Молдинг настінний полімерний 20х40 2м", category: "c14-7", unit: "шт", basePrice: 140 },

  // 15. Вікна, двері та комплектуючі (c15)
  { title: "Дверне полотно Новий Стиль глухе 80см сірий дуб", category: "c15-1", unit: "шт", basePrice: 2400 },
  { title: "Двері прихованого монтажу алюмінієвий короб під фарбування", category: "c15-1", unit: "компл", basePrice: 8900 },
  { title: "Дверна ручка на розетці Colombo графіт матовий", category: "c15-4", unit: "пара", basePrice: 680 },
  { title: "Замок врізний магнітний AGB Mediana Polaris Італія", category: "c15-4", unit: "шт", basePrice: 590 },
  { title: "Підвіконня пластикове Danke Premium білий глянець 300мм 1.5м", category: "c15-6", unit: "шт", basePrice: 620 },
  { title: "Відлив віконний оцинкований полімерний білий 150мм 1.5м", category: "c15-7", unit: "шт", basePrice: 140 },
  { title: "Москітна сітка Anwis віконна внутрішня 1300х600мм", category: "c15-8", unit: "шт", basePrice: 380 }
];

const KYIV_LOCATIONS = [
  { name: "вулиця Хрещатик, Шевченківський район, Київ", lat: 50.4471, lng: 30.5222 },
  { name: "проспект Перемоги, Шевченківський район, Київ", lat: 50.4550, lng: 30.4500 },
  { name: "вулиця Велика Васильківська, Печерський район, Київ", lat: 50.4280, lng: 30.5180 },
  { name: "Оболонський проспект, Оболонський район, Київ", lat: 50.5050, lng: 30.4980 },
  { name: "проспект Володимира Івасюка, Оболонський район, Київ", lat: 50.5120, lng: 30.5150 },
  { name: "вулиця Сагайдачного, Подільський район, Київ", lat: 50.4630, lng: 30.5200 },
  { name: "вулиця Межигірська, Подільський район, Київ", lat: 50.4710, lng: 30.5050 },
  { name: "проспект Миколи Бажана, Дарницький район, Київ", lat: 50.4020, lng: 30.6350 },
  { name: "вулиця Михайла Гришка, Позняки, Дарницький район, Київ", lat: 50.3950, lng: 30.6300 },
  { name: "Дніпровська набережна, Березняки, Дніпровський район, Київ", lat: 50.4180, lng: 30.5980 },
  { name: "проспект Соборності, Дніпровський район, Київ", lat: 50.4420, lng: 30.6050 },
  { name: "проспект Червоної Калини, Троєщина, Деснянський район, Київ", lat: 50.5100, lng: 30.6000 },
  { name: "Голосіївський проспект, Голосіївський район, Київ", lat: 50.3950, lng: 30.5100 },
  { name: "Повітрофлотський проспект, Солом'янський район, Київ", lat: 50.4350, lng: 30.4700 },
  { name: "вулиця Романа Ратушного, Солом'янський район, Київ", lat: 50.4235, lng: 30.4901 },
  { name: "проспект Леся Курбаса, Борщагівка, Святошинський район, Київ", lat: 50.4320, lng: 30.3800 },
  { name: "вулиця Академіка Палладіна, Академмістечко, Київ", lat: 50.4650, lng: 30.3550 },
  { name: "вулиця Стеценка, Нивки, Шевченківський район, Київ", lat: 50.4850, lng: 30.4200 }
];

const DESCRIPTIONS = [
  "Залишок після ремонту власної квартири. Зберігається у сухому теплому приміщенні. Цілісність заводської упаковки збережена.",
  "Новий сертифікований матеріал. Купували офіційно під об'єкт із запасом, залишились надлишки. Відмінна якість.",
  "Оригінальна якісна продукція. Зберігався на закритому складі без вологи та перепадів температур. Готовий до використання.",
  "Надійний матеріал від перевіреного виробника. Термін придатності свіжий. Можливий самовивіз або доставка по домовленості."
];

const IMAGES = [
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600",
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600"
];

function generateProducts(totalCount = 15000) {
  const items = [];
  for (let i = 1; i <= totalCount; i++) {
    const baseItem = mockBaseItems[i % mockBaseItems.length];
    const loc = KYIV_LOCATIONS[i % KYIV_LOCATIONS.length];
    
    // Невеликий розкид координат довкола району (±0.008 градусів ~ 500-900 метрів)
    const latOffset = (Math.random() - 0.5) * 0.016;
    const lngOffset = (Math.random() - 0.5) * 0.024;
    
    const lat = Number((loc.lat + latOffset).toFixed(6));
    const lng = Number((loc.lng + lngOffset).toFixed(6));
    
    const priceVariance = (Math.random() * 0.3 - 0.15); // ±15% від базової ціни
    const price = Math.round(baseItem.basePrice * (1 + priceVariance));
    const qty = Math.floor(Math.random() * 45) + 1;
    const isNew = Math.random() > 0.45;
    const isExact = Math.random() > 0.2; // 80% точна адреса, 20% район

    items.push({
      user_id: USER_ID,
      title: `${baseItem.title} #${i}`,
      category_id: baseItem.category,
      status: isNew ? 'новий' : 'залишок',
      quantity: qty,
      unit: baseItem.unit,
      is_free: false,
      price: price,
      address: loc.name,
      delivery: Math.random() > 0.5 ? ['Самовивіз', 'Нова Пошта'] : ['Самовивіз'],
      delivery_details: 'За домовленістю, можливий огляд на місці.',
      description: `${DESCRIPTIONS[i % DESCRIPTIONS.length]} ${baseItem.title}. Кількість у наявності: ${qty} ${baseItem.unit}.`,
      images: [IMAGES[i % IMAGES.length]],
      latitude: lat,
      longitude: lng,
      is_exact_location: isExact,
      listing_state: 'active',
      views: Math.floor(Math.random() * 15)
    });
  }
  return items;
}

async function seed() {
  console.log('1. Очищуємо таблицю mock_listings від попередніх даних...');
  const { error: delErr } = await supabase
    .from('mock_listings')
    .delete()
    .neq('title', '___NEVER_MATCH___'); // видаляє всі існуючі записи

  if (delErr) {
    console.error('Помилка очищення mock_listings:', delErr);
    process.exit(1);
  }
  console.log('Попередні дані успішно видалено.');

  console.log('2. Генерація 15 000 товарів для mock_listings...');
  const allProducts = generateProducts(15000);
  console.log(`Згенеровано ${allProducts.length} товарів. Заливаємо пачками по 500...`);

  const BATCH_SIZE = 500;
  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('mock_listings').insert(batch);
    if (error) {
      console.error(`Помилка на пачці ${i} - ${i + batch.length}:`, error);
      process.exit(1);
    }
    console.log(`Успішно завантажено: ${Math.min(i + BATCH_SIZE, allProducts.length)} / ${allProducts.length}`);
  }

  console.log('✅ Всі 15 000 товарів успішно завантажені в mock_listings за оновленою структурою категорій!');
}

seed();
