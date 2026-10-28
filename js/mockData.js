'use strict';
// Clearly labeled DEMO data. All relations (ownerUserId, sellerId, productId, transactionId) are valid.
function buildMockData(pwHash) {
  const now = Date.now(), day = 864e5, iso = d => new Date(now - d * day).toISOString();
  const U = (id, f, l, phone, email, region, district, roles) => ({ id, firstName:f, lastName:l, phone, email, region, district, roles, avatar:'', passwordHash:pwHash, createdAt:iso(200), updatedAt:iso(200) });
  const users = [
    U('u_aziz','Aziz','Karimov','+998901112233','aziz@demo.uz','Toshkent','Chilonzor',['buyer']),
    U('u_dilnoza','Dilnoza','Yusupova','+998902223344','dilnoza@demo.uz','Samarqand','Urgut',['buyer']),
    U('u_botir','Botir','Rahimov','+998903334455','botir@demo.uz','Samarqand','Urgut',['buyer','seller','farmer']),
    U('u_shavkat','Shavkat','Ergashev','+998904445566','shavkat@demo.uz','Buxoro','G‘ijduvon',['buyer','seller']),
    U('u_malika','Malika','Tursunova','+998905556677','malika@demo.uz','Farg‘ona','Qo‘qon',['buyer','seller','business'])
  ];
  const S = (id, owner, name, region, district, desc, ver, days) => ({ id, ownerUserId:owner, name, phone:users.find(u=>u.id===owner).phone, location:district+', '+region, region, district, description:desc, avatar:'', isVerified:ver, createdAt:iso(days), updatedAt:iso(days) });
  const sellers = [
    S('s_a','u_botir','Rahimov Fermer Xo‘jaligi','Samarqand','Urgut','Zotdor qoramol va qo‘y yetishtirish, 8 yillik tajriba.',true,400),
    S('s_b','u_shavkat','Buxoro Qorako‘l','Buxoro','G‘ijduvon','Qorako‘l qo‘ylari va echkilar.',true,300),
    S('s_c','u_malika','Vodiy Yem-Xashak','Farg‘ona','Qo‘qon','Pichan, arpa, omuxta yem yetkazib berish.',false,60)
  ];
  const P = (id, sid, title, category, animalType, breed, gender, age, weight, qty, price, neg, days, lat, lng) => {
    const s = sellers.find(x => x.id === sid);
    return { id, sellerId:sid, title, category, animalType, breed, gender, age, weight, quantity:qty, price, negotiable:neg, region:s.region, district:s.district, location:s.location, description:'Demo e‘lon: sog‘lom, veterinar ko‘rigidan o‘tgan.', images:[], status:LISTING.ACTIVE, views:0, phoneClicks:0, createdAt:iso(days), updatedAt:iso(days), lat, lng };
  };
  const products = [
    P('p_a1','s_a','Simmental sigir','cattle','Sigir','Simmental','Urg‘ochi',3,520,1,24000000,true,20,39.53,66.93),
    P('p_a2','s_a','Hisori qo‘chqor','sheep','Qo‘y','Hisori','Erkak',2,75,5,4200000,true,12,39.55,66.9),
    P('p_a3','s_a','Buqacha (yosh)','cattle','Buqa','Golshteyn','Erkak',1,280,2,13000000,false,5,39.5,66.95),
    P('p_b1','s_b','Qorako‘l qo‘zi','sheep','Qo‘y','Qorako‘l','Erkak',1,40,10,1800000,true,30,39.78,64.43),
    P('p_b2','s_b','Sanen echkisi','goat','Echki','Sanen','Urg‘ochi',2,55,3,3000000,true,9,39.8,64.4),
    P('p_c1','s_c','Pichan (beda) 1 tonna','hay','Pichan','Beda','—',0,1000,20,1500000,true,7,40.38,71.78),
    P('p_c2','s_c','Omuxta yem 50 kg','feed','Yem','Omuxta','—',0,50,100,220000,false,4,40.39,71.75),
    P('p_c3','s_c','Arpa 1 tonna','feed','Don','Arpa','—',0,1000,10,3800000,true,2,40.37,71.8)
  ];
  const T = (id, pid, buyer, status, amt, days) => { const p = products.find(x => x.id === pid);
    return { id, productId:pid, buyerId:buyer, sellerId:p.sellerId, amount:amt, status, reviewed:false, history:[{status, at:iso(days)}], createdAt:iso(days), updatedAt:iso(days) }; };
  const transactions = [
    T('t_c1','p_a1','u_dilnoza',TX.COMPLETED,23000000,60), T('t_c2','p_b1','u_dilnoza',TX.COMPLETED,1700000,45),
    T('t_c3','p_a2','u_aziz',TX.COMPLETED,4000000,10), T('t_p1','p_b2','u_aziz',TX.PENDING,2800000,1),
    T('t_a1','p_c1','u_aziz',TX.ACCEPTED,1400000,2), T('t_r1','p_c2','u_dilnoza',TX.REJECTED,180000,6)
  ];
  const offers = transactions.map(t => ({ id:'o_' + t.id, transactionId:t.id, productId:t.productId, buyerId:t.buyerId, sellerId:t.sellerId, amount:t.amount, message:'Demo taklif',
    status: t.status === TX.PENDING ? OFFER.PENDING : t.status === TX.REJECTED ? OFFER.REJECTED : OFFER.ACCEPTED, createdAt:t.createdAt, updatedAt:t.updatedAt }));
  const R = (id, tid, rating, comment, days) => { const t = transactions.find(x => x.id === tid); t.reviewed = true; const b = users.find(u => u.id === t.buyerId);
    return { id, transactionId:tid, productId:t.productId, sellerId:t.sellerId, buyerId:t.buyerId, buyerName:b.firstName + ' ' + b.lastName[0] + '.', buyerAvatar:'', rating, reliability:rating, productAccuracy:rating, communication:rating, delivery:Math.max(3, rating - 1),
      comment, photos:[], verifiedPurchase:true, helpfulCount:0, helpfulUsers:[], sellerResponse:null, reportCount:0, createdAt:iso(days), updatedAt:iso(days) }; };
  const reviews = [ R('r1','t_c1',5,'Sigir aytilganidek sog‘lom chiqdi. Tavsiya qilaman!',50), R('r2','t_c2',4,'Qo‘zilar yaxshi, yetkazish biroz kechikdi.',35) ];
  const vets = [
    { id:'v1', name:'Dr. Anvar Sodiqov', specialization:'Yirik shoxli mollar', location:'Samarqand, Urgut', rating:4.9, verified:true, experience:12, services:['Ko‘rik','Emlash','Uyga chiqish'], price:80000, availability:'Du–Sh 8:00–18:00', phone:'+998907771122', lat:39.6, lng:66.97 },
    { id:'v2', name:'Dr. Nilufar Ahmedova', specialization:'Qo‘y va echki', location:'Buxoro', rating:4.7, verified:true, experience:8, services:['Ko‘rik','Parazitlarga qarshi'], price:70000, availability:'Du–Ju 9:00–17:00', phone:'+998907772233', lat:39.77, lng:64.42 },
    { id:'v3', name:'Dr. Jasur Toshmatov', specialization:'Ot va tuyalar', location:'Farg‘ona', rating:4.6, verified:false, experience:5, services:['Ko‘rik','Uyga chiqish'], price:90000, availability:'Har kuni', phone:'+998907773344', lat:40.38, lng:71.79 }
  ];
  const posts = [
    { id:'c1', authorId:'u_botir', title:'Qish uchun pichan zaxirasi qancha kerak?', content:'Bitta sigirga qishda taxminan qancha pichan tayyorlash kerak? Tajribangiz bilan bo‘lishing.', category:'Yem', images:[], likedBy:[], bookmarkedBy:[], createdAt:iso(3), updatedAt:iso(3) },
    { id:'c2', authorId:'u_malika', title:'Qo‘zilarni emlash jadvali', content:'Qo‘zilar uchun emlash jadvalini veterinar bilan kelishib tuzing.', category:'Veterinariya', images:[], likedBy:[], bookmarkedBy:[], createdAt:iso(1), updatedAt:iso(1) }
  ];
  const notifications = [{ id:'n1', userId:'u_botir', type:NOTIF.REVIEW, title:'Yangi sharh', message:'Sizning e‘loningizga sharh qoldirildi.', relatedId:'r1', read:false, createdAt:iso(2) }];
  const saved = [{ id:'ss1', userId:'u_aziz', label:'sigir · Samarqand', q:'sigir', opts:{ region:'Samarqand', scope:'livestock' }, createdAt:iso(5) }];
  return { saved, users, sellers, products, transactions, offers, reviews, vets, posts, notifications };
}
