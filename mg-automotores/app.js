// Init Firebase
let app, db, auth, storage;
document.addEventListener("DOMContentLoaded", () => {
  app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  storage = firebase.storage();

  initUI();
  loadYears();
  hookAuth();
  fetchCars(); // initial
});

function $(s){return document.querySelector(s)}
function $all(s){return Array.from(document.querySelectorAll(s))}
const toast = (m)=>{const t=$("#toast");t.textContent=m;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),2500)}

// Contacts
function setupContacts(){
  const {martin, ger} = window.MG_CONTACTS || {};
  const base = "https://wa.me/";
  $("#ctaMartin").href = martin ? `${base}${martin}` : "#";
  $("#ctaMartin").textContent = "Martín";
  $("#ctaGer").href = ger ? `${base}${ger}` : "#";
  $("#ctaGer").textContent = "Gero";
  $("#yearNow").textContent = new Date().getFullYear();
}

function initUI(){
  setupContacts();
  $("#filterForm").addEventListener("submit",(e)=>{e.preventDefault(); applyFilters();});
  $("#clearFilters").addEventListener("click",()=>{
    $("#q").value="";
    $("#year").value="";
    $("#order").value="createdAt_desc";
    applyFilters();
  });
  $all("#filterForm input, #filterForm select").forEach(el=>{
    el.addEventListener("change",()=>applyFilters());
  });
  $("#btn-nuevo").addEventListener("click",()=>$("#modalForm").showModal());
  $("#closeModal").addEventListener("click",()=>$("#modalForm").close());
  $("#cancelCar").addEventListener("click",()=>$("#modalForm").close());

  // Guardar publicación
  $("#saveCar").addEventListener("click", async (e)=>{
    e.preventDefault();
    const f = new FormData($("#carForm"));
    const item = {
      make: f.get("make").trim(),
      model: f.get("model").trim(),
      version: f.get("version").trim(),
      year: +f.get("year"),
      km: +f.get("km"),
      price: +f.get("price"),
      location: f.get("location")?.trim() || "",
      description: f.get("description")?.trim() || "",
      features: (f.get("features")||"").split(",").map(s=>s.trim()).filter(Boolean),
      contactPhone: f.get("contactPhone")?.trim() || "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      images:[]
    };
    if(!item.make || !item.model || !item.year || !item.km || !item.price){
      toast("Completá los campos obligatorios"); return;
    }

    try{
      $("#saveCar").disabled = true;
      const ref = await db.collection("cars").add(item);

      // Subir fotos (si hay)
      const files = $("#photos").files || [];
      const urls = [];
      for (let i=0;i<Math.min(files.length,8);i++){
        const file = files[i];
        const path = `cars/${ref.id}/${Date.now()}-${file.name}`;
        const snap = await storage.ref().child(path).put(file);
        const url = await snap.ref.getDownloadURL();
        urls.push(url);
      }
      await ref.set({images: urls}, {merge:true});
      $("#modalForm").close();
      $("#carForm").reset();
      toast("Publicación creada 🎉");
      applyFilters();
    }catch(err){
      console.error(err);
      toast("Error al publicar");
    }finally{
      $("#saveCar").disabled = false;
    }
  });

  // Login / Logout
  $("#btn-login").addEventListener("click", signIn);
  $("#btn-logout").addEventListener("click", ()=>auth.signOut());
}

// Años en filtro
function loadYears(){
  const sel = $("#year");
  const y = new Date().getFullYear();
  for(let i=y;i>=1995;i--){
    const o = document.createElement("option");
    o.value = i; o.textContent = i;
    sel.appendChild(o);
  }
}

// Auth con Google y chequeo de whitelist (emails autorizados)
const ADMIN_WHITELIST = [
  // poné tus correos aquí:
  "martin@example.com",
  "vos@example.com"
];

function hookAuth(){
  auth.onAuthStateChanged(user=>{
    const isAdmin = !!user && ADMIN_WHITELIST.includes(user.email);
    $("#btn-login").classList.toggle("hidden", !!user);
    $("#btn-logout").classList.toggle("hidden", !user);
    $("#btn-nuevo").classList.toggle("hidden", !isAdmin);
  });
}
async function signIn(){
  try{
    const prov = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(prov);
    toast("Sesión iniciada");
  }catch(e){ console.error(e); toast("No se pudo iniciar sesión"); }
}

// Query y render de autos
let unsubscribe = null;
let allCars = [];
let firstLoad = false;
async function fetchCars(){
  $("#loader").classList.remove("hidden");
  if(unsubscribe) unsubscribe();

  const ref = db.collection("cars").orderBy("createdAt","desc");
  unsubscribe = ref.onSnapshot(snap=>{
    allCars = [];
    snap.forEach(d=>{
      const data = d.data();
      allCars.push({id:d.id, ...data});
    });
    firstLoad = true;
    applyFilters();
    $("#loader").classList.add("hidden");
  }, err=>{
    console.error(err);
    toast("No se pudo obtener el inventario");
    $("#loader").classList.add("hidden");
  });
}

function applyFilters(){
  if(!firstLoad){ return; }
  const q = $("#q").value.toLowerCase().trim();
  const year = $("#year").value;
  const order = $("#order").value;

  let filtered = allCars.slice();

  if(year){
    filtered = filtered.filter(car=>`${car.year}` === `${year}`);
  }
  if(q){
    filtered = filtered.filter(car=>{
      const hay = `${car.make} ${car.model} ${car.version||""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const [field, dir] = order.split("_");
  const direction = dir === "desc" ? -1 : 1;
  filtered.sort((a,b)=>{
    let av, bv;
    if(field === "createdAt"){
      av = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt || 0;
      bv = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt || 0;
    }else{
      av = typeof a[field] === "number" ? a[field] : parseFloat(a[field]) || 0;
      bv = typeof b[field] === "number" ? b[field] : parseFloat(b[field]) || 0;
    }
    if(av === bv) return 0;
    return av > bv ? direction : -direction;
  });

  renderCars(filtered);
}

function renderCars(items){
  const grid = $("#carsGrid"); grid.innerHTML = "";
  $("#emptyState").classList.toggle("hidden", items.length>0);
  items.forEach(car=>{
    const kmVal = typeof car.km === "number" ? car.km : parseFloat(car.km) || 0;
    const priceVal = typeof car.price === "number" ? car.price : parseFloat(car.price);
    const price = priceVal ? formatARS(priceVal) : "Consultar";
    const cover = car.images?.[0] || "assets/logo-mg.png";
    const wa = buildWA(car);
    const features = Array.isArray(car.features)
      ? car.features
      : (car.features ? `${car.features}`.split(",").map(s=>s.trim()).filter(Boolean) : []);
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="thumb"><img src="${cover}" alt="${car.make} ${car.model}"></div>
      <div class="card-body">
        <div class="badges">
          <span class="badge">${car.year}</span>
          <span class="badge">${num(kmVal)} km</span>
          ${car.location ? `<span class="badge">${car.location}</span>`:""}
        </div>
        <div class="title">${car.make} ${car.model} ${car.version||""}</div>
        <div class="meta">${features.slice(0,3).join(" · ")||""}</div>
        <div class="price">${price}</div>
      </div>
      <div class="card-actions">
        <a class="cta" target="_blank" rel="noopener" href="${wa.martin}">WhatsApp Martín</a>
        <a class="cta primary" target="_blank" rel="noopener" href="${wa.ger}">WhatsApp MG</a>
      </div>
    `;
    grid.appendChild(el);
  });
}

function formatARS(n){
  return n.toLocaleString("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});
}
function num(n){
  const value = Number(n) || 0;
  return new Intl.NumberFormat("es-AR").format(value);
}

function buildWA(car){
  const msg = `Hola! Me interesa el ${car.make} ${car.model} ${car.version||""} ${car.year} (${num(car.km)} km) publicado en MG Automotores.`;
  const encoded = encodeURIComponent(msg);
  const {martin, ger} = window.MG_CONTACTS || {};
  const base = "https://wa.me/";
  return {
    martin: martin ? `${base}${martin}?text=${encoded}` : "#",
    ger: ger ? `${base}${ger}?text=${encoded}` : "#"
  };
}
