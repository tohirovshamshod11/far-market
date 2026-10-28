'use strict';
// Category-aware listing schemas. One field = one structured key in product.details.
const YN = [['yes','Ha'],['no','Yo‘q'],['unknown','Noma’lum']], DOC = [['yes','Bor'],['no','Yo‘q']], GEN = [['male','Erkak'],['female','Urg‘ochi']],
  HEALTH = [['healthy','Sog‘lom'],['treated','Davolangan'],['special','Maxsus ma’lumot kerak']], QUAL = [['high','Yuqori'],['medium','O‘rta'],['low','Past']],
  STORE = [['indoor','Yopiq omborda'],['shed','Ayvon ostida'],['open','Ochiq joyda']], DIR = [['milk','Sut yo‘nalishi'],['meat','Go‘sht yo‘nalishi']];
const T = (k, label, o = {}) => ({ k, label, type:'text', ...o }), N = (k, label, o = {}) => ({ k, label, type:'number', min:0, step:'any', ...o });
const S = (k, label, opts, o = {}) => ({ k, label, type:'select', opts, ...o }), D = (k, label, o = {}) => ({ k, label, type:'date', ...o });
const fem = d => d.gender === 'female';
const BR = l => S('breed', 'Zoti', [...l.map(x => [x, x]), ['other','Boshqa']], { req:true });
const AGE = [N('ageYears', 'Yoshi (yil)', { req:true, max:60, step:1 }), N('ageMonths', 'Yoshi (oy)', { max:11, step:1 })], WT = N('weightKg', 'Vazni (kg)', { min:0.1 });
const HV = [S('healthStatus', 'Sog‘liq holati', HEALTH, { req:true }), S('vaccinated', 'Emlanganmi?', YN, { req:true }), S('documents', 'Hujjatlari', DOC)];
const BREED = ['Holstein','Simental','Qizil cho‘l','Qora-ola','Mahalliy'], SHEEP = ['Hisori','Qorako‘l','Jaydari','Edilbay','Mahalliy'], HORSE = ['Qorabayir','Arab','Axaltekin','Mahalliy'];
const BREEDING = S('forBreeding', 'Naslchilik uchunmi?', YN);
const SCHEMAS = {
  cattle:{ title:'Sigir', fields:[BR(BREED), S('gender','Jinsi',GEN,{req:true}), ...AGE, WT, N('birthCount','Tug‘im soni',{showIf:fem,step:1}), S('pregnancy','Homiladorlik holati',YN,{showIf:fem}), N('milkProduction','Sut mahsuldorligi (litr/kun)',{showIf:fem}), ...HV, T('reason','Sotish sababi')] },
  bull:{ title:'Buqa', fields:[BR(BREED), ...AGE, WT, ...HV, BREEDING] },
  sheep:{ title:'Qo‘y', fields:[BR(SHEEP), S('gender','Jinsi',GEN,{req:true}), ...AGE, WT, BREEDING, T('woolType','Jun sifati / turi'), ...HV] },
  ram:{ title:'Qo‘chqor', fields:[BR(SHEEP), ...AGE, WT, BREEDING, ...HV] },
  goat:{ title:'Echki', fields:[BR(['Sanen','Mahalliy','Angora']), S('gender','Jinsi',GEN,{req:true}), ...AGE, WT, S('direction','Yo‘nalishi',DIR,{req:true}), N('milkProduction','Sut mahsuldorligi (litr/kun)',{showIf:d => d.direction === 'milk' && fem(d)}), S('pregnancy','Homiladorlik holati',YN,{showIf:fem}), ...HV] },
  horse:{ title:'Ot', fields:[BR(HORSE), S('gender','Jinsi',GEN,{req:true}), ...AGE, WT, N('heightCm','Bo‘yi (sm)',{min:30}), S('purpose','Yo‘nalishi',[['sport','Sport'],['work','Ish'],['breeding','Naslchilik'],['riding','Oddiy minish'],['other','Boshqa']],{req:true}), ...HV] },
  camel:{ title:'Tuya', fields:[BR(['Baqtriyan','Dromedar','Mahalliy']), S('gender','Jinsi',GEN,{req:true}), ...AGE, WT, S('breedingStatus','Naslchilik holati',YN), ...HV] },
  poultry:{ title:'Parranda', fields:[S('poultryType','Parranda turi',[['hen','Tovuq'],['rooster','Xo‘roz'],['duck','O‘rdak'],['goose','G‘oz'],['turkey','Kurka'],['other','Boshqa']],{req:true}), T('breed','Zoti'), N('ageMonths','Yoshi (oy)',{req:true,step:1}), S('gender','Jinsi',[...GEN,['mixed','Aralash']]), N('avgWeightKg','O‘rtacha vazni (kg)',{min:0.05}), S('purpose','Yo‘nalishi',[['meat','Go‘sht'],['egg','Tuxum'],['breeding','Naslchilik']],{req:true}), S('vaccinated','Emlanganmi?',YN,{req:true}), S('healthStatus','Sog‘liq holati',HEALTH,{req:true})] },
  small:{ title:'Boshqa hayvon', fields:[T('breed','Zoti / turi',{req:true}), S('gender','Jinsi',GEN), ...AGE, WT, S('healthStatus','Sog‘liq holati',HEALTH,{req:true}), S('vaccinated','Emlanganmi?',YN)] },
  hay:{ title:'Beda / pichan', fields:[S('feedType','Yem turi',[['alfalfa','Beda'],['hay','Pichan'],['straw','Somon'],['pressed','Presslangan yem']],{req:true}), S('cutType','O‘rim turi',[['1','1-o‘rim'],['2','2-o‘rim'],['3','3-o‘rim']]), S('quality','Sifat darajasi',QUAL,{req:true}), N('moisturePercent','Namlik (%)',{max:100}), S('pressType','Press turi',[['square','To‘rtburchak'],['round','Dumaloq'],['loose','Bo‘sh']]), N('baleWeightKg','Bir press og‘irligi (kg)',{min:0.1}), S('storageCondition','Saqlash sharoiti',STORE,{req:true})] },
  silage:{ title:'Silos', fields:[S('silageType','Silos turi',[['maize','Makkajo‘xori'],['grass','O‘t'],['mixed','Aralash'],['other','Boshqa']],{req:true}), T('composition','Tarkibi'), N('moisturePercent','Namlik (%)',{max:100,req:true}), D('producedDate','Tayyorlangan sana'), S('storageMethod','Saqlash usuli',[['trench','Transheya'],['roll','Rulon'],['bag','Qop']],{req:true}), S('quality','Sifat darajasi',QUAL)] },
  grain:{ title:'Don', fields:[S('grainType','Don turi',[['wheat','Bug‘doy'],['barley','Arpa'],['corn','Makkajo‘xori'],['oats','Jo‘xori'],['other','Boshqa']],{req:true}), N('harvestYear','Hosil yili',{min:2000,max:2100,step:1,req:true}), T('variety','Nav'), N('moisturePercent','Namlik (%)',{max:100,req:true}), N('purityPercent','Tozalik (%)',{max:100}), S('storageCondition','Saqlash sharoiti',STORE,{req:true})] },
  compound_feed:{ title:'Kombikorm', fields:[T('productName','Yem nomi',{req:true}), T('manufacturer','Ishlab chiqaruvchi'), T('composition','Tarkibi'), S('forAnimals','Hayvon turi uchun',[['cattle','Qoramol'],['sheep','Qo‘y'],['goat','Echki'],['horse','Ot'],['poultry','Parranda'],['other','Boshqa']],{req:true}), N('packageWeightKg','Qadoq og‘irligi (kg)',{min:0.1,req:true}), D('producedDate','Ishlab chiqarilgan sana'), D('expiryDate','Yaroqlilik muddati',{req:true})] },
  other_feed:{ title:'Boshqa yem', fields:[T('productName','Mahsulot nomi',{req:true}), S('quality','Sifat darajasi',QUAL), S('storageCondition','Saqlash sharoiti',STORE)] }
};
// group: livestock|feed. legacy = category key used by existing filters/cards. schema = key in SCHEMAS.
const SUBS = {
  cattle:{ group:'livestock', label:'Sigir', icon:'🐄', schema:'cattle', legacy:'cattle' }, bull:{ group:'livestock', label:'Buqa', icon:'🐂', schema:'bull', legacy:'cattle', fixed:{ gender:'male' } },
  sheep:{ group:'livestock', label:'Qo‘y', icon:'🐑', schema:'sheep', legacy:'sheep' }, ram:{ group:'livestock', label:'Qo‘chqor', icon:'🐏', schema:'ram', legacy:'sheep', fixed:{ gender:'male' } },
  goat:{ group:'livestock', label:'Echki', icon:'🐐', schema:'goat', legacy:'goat' }, horse:{ group:'livestock', label:'Ot', icon:'🐎', schema:'horse', legacy:'horse' },
  camel:{ group:'livestock', label:'Tuya', icon:'🐫', schema:'camel', legacy:'camel' }, poultry:{ group:'livestock', label:'Parranda', icon:'🐔', schema:'poultry', legacy:'poultry', unit:'dona' },
  rabbit:{ group:'livestock', label:'Quyon', icon:'🐇', schema:'small', legacy:'other' }, other_animal:{ group:'livestock', label:'Boshqa', icon:'🦃', schema:'small', legacy:'other' },
  alfalfa:{ group:'feed', label:'Beda', icon:'🌿', schema:'hay', legacy:'hay', fixed:{ feedType:'alfalfa' }, pt:'per_bale', unit:'press' }, hay:{ group:'feed', label:'Pichan', icon:'🌿', schema:'hay', legacy:'hay', fixed:{ feedType:'hay' }, pt:'per_bale', unit:'press' },
  straw:{ group:'feed', label:'Somon', icon:'🌾', schema:'hay', legacy:'hay', fixed:{ feedType:'straw' }, pt:'per_bale', unit:'press' }, pressed:{ group:'feed', label:'Presslangan yem', icon:'🧺', schema:'hay', legacy:'hay', fixed:{ feedType:'pressed' }, pt:'per_bale', unit:'press' },
  silage:{ group:'feed', label:'Silos', icon:'🌱', schema:'silage', legacy:'feed' }, maize:{ group:'feed', label:'Makkajo‘xori (silos)', icon:'🌽', schema:'silage', legacy:'feed', fixed:{ silageType:'maize' } },
  wheat:{ group:'feed', label:'Bug‘doy', icon:'🌾', schema:'grain', legacy:'feed', fixed:{ grainType:'wheat' } }, barley:{ group:'feed', label:'Arpa', icon:'🌾', schema:'grain', legacy:'feed', fixed:{ grainType:'barley' } },
  corn_grain:{ group:'feed', label:'Makkajo‘xori doni', icon:'🌽', schema:'grain', legacy:'feed', fixed:{ grainType:'corn' } }, compound_feed:{ group:'feed', label:'Kombikorm', icon:'🥣', schema:'compound_feed', legacy:'feed', unit:'qop' },
  other_feed:{ group:'feed', label:'Boshqa', icon:'📦', schema:'other_feed', legacy:'agri' }
};
const LGROUPS = [['livestock','🐄','Chorva',true],['feed','🌾','Yem-xashak',true],['vet','🩺','Veterinariya xizmati',false],['transport','🚚','Transport xizmati',false],['agri','🌱','Qishloq xo‘jaligi mahsuloti',false]];
const PRICE_TYPES = { livestock:[['per_animal','1 bosh uchun'],['fixed','Umumiy narx']], feed:[['per_kg','1 kg uchun'],['per_ton','1 tonna uchun'],['per_bale','1 press uchun'],['per_unit','1 dona uchun'],['fixed','Umumiy narx']] };
const UNITS = { livestock:['bosh','dona'], feed:['kg','tonna','press','qop','dona'] };
// HARD RULE: every new listing (livestock AND feed) needs 5..15 real photos to be published.
const PHOTO_RULES = { livestock:{ min:5, max:15, rec:8 }, feed:{ min:5, max:15, rec:8 } };
