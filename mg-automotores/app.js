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
  $("#filterForm").addEventListener("submit",(e)=>{e.preventDefault(); fetchCars()});
  $("#clearFilters").addEventListener("click",()=>{ $("#q").value=""; $("#year").value=""; $("#order").value="createdAt_desc"; fetchCars() });
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
      fetchCars();
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
async function fetchCars(){
  $("#loader").classList.remove("hidden");
  if(unsubscribe) unsubscribe();

  const q = $("#q").value.toLowerCase().trim();
  const year = $("#year").value;
  const order = $("#order").value;

  let ref = db.collection("cars");

  if(year) ref = ref.where("year","==", +year);

  // Orden
  const [field, dir] = order.split("_");
  ref = ref.orderBy(field === "createdAt" ? "createdAt" : field, dir === "desc" ? "desc" : "asc");

  unsubscribe = ref.onSnapshot(snap=>{
    const rows = [];
    snap.forEach(d=>{
      const c = {id:d.id, ...d.data()};
      // Filtro simple por texto
      const hay = `${c.make} ${c.model} ${c.version}`.toLowerCase();
      if(q && !hay.includes(q)) return;
      rows.push(c);
    });
    renderCars(rows);
    $("#loader").classList.add("hidden");
  }, err=>{
    console.error(err);
    $("#loader").classList.add("hidden");
  });
}

function renderCars(items){
  const grid = $("#carsGrid"); grid.innerHTML = "";
  $("#emptyState").classList.toggle("hidden", items.length>0);
  items.forEach(car=>{
    const price = car.price ? formatARS(car.price) : "Consultar";
    const cover = car.images?.[0] || "assets/logo-mg.png";
    const wa = buildWA(car);
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="thumb"><img src="${cover}" alt="${car.make} ${car.model}"></div>
      <div class="card-body">
        <div class="badges">
          <span class="badge">${car.year}</span>
          <span class="badge">${num(car.km)} km</span>
          ${car.location ? `<span class="badge">${car.location}</span>`:""}
        </div>
        <div class="title">${car.make} ${car.model} ${car.version||""}</div>
        <div class="meta">${car.features?.slice(0,3).join(" · ")||""}</div>
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
function num(n){ return new Intl.NumberFormat("es-AR").format(n || 0) }

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
