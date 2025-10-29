
import { loadProducts, seedIfEmpty, SAMPLE, currency, loadCart, saveCart, toast } from './utils.js';

seedIfEmpty(SAMPLE);

const elGrid = document.querySelector('#grid');
const elSearch = document.querySelector('#search');
const elCategory = document.querySelector('#category');
const elSort = document.querySelector('#sort');
const cartBtn = document.querySelector('#btn-cart');
const drawer = document.querySelector('#drawer');
const closeDrawer = document.querySelector('#close-drawer');
const cartList = document.querySelector('#cart-list');
const cartTotal = document.querySelector('#cart-total');

let filters = { q:'', cat:'', sort:'popular' }
let products = loadProducts();
let cart = loadCart();

const categories = ['Semua', ...Array.from(new Set(products.map(p=>p.category)))];
elCategory.innerHTML = categories.map(c=>`<option value="${c==='Semua'?'':c}">${c}</option>`).join('');

function render(){
  const f = products.filter(p => {
    const byQ = p.title.toLowerCase().includes(filters.q) || (p.desc||'').toLowerCase().includes(filters.q);
    const byC = !filters.cat || p.category === filters.cat;
    return byQ && byC;
  }).sort((a,b)=>{
    if(filters.sort==='termurah') return a.price - b.price;
    if(filters.sort==='termahal') return b.price - a.price;
    if(filters.sort==='stok') return b.stock - a.stock;
    // featured = popular
    return (b.featured|0) - (a.featured|0);
  });

  elGrid.innerHTML = f.map(p=>`
    <article class="card product">
      <div class="cover"><img src="${p.image}" alt="${p.title}" onerror="this.src='assets/placeholder.png'"></div>
      <div class="card-body">
        <div class="kicker">${p.category}</div>
        <div class="title">${p.title}</div>
        <div class="meta"><span class="price">${currency(p.price)}</span><span class="badge">${p.stock} stok</span>${p.featured?'<span class="badge">★ Favorit</span>':''}</div>
        <p class="mini" style="margin:.4rem 0 0">${p.desc||''}</p>
        <div style="display:flex; gap:8px; margin-top:10px">
          <button class="btn" data-add="${p.id}">Tambah ke Keranjang</button>
          <a class="btn outline" href="admin.html">Kelola</a>
        </div>
      </div>
    </article>
  `).join('');

  // Bind add-to-cart
  elGrid.querySelectorAll('[data-add]').forEach(btn=> btn.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.add;
    const item = products.find(x=>x.id===id);
    if(!item) return;
    const found = cart.find(c=>c.id===id);
    if(found){ found.qty = Math.min(found.qty+1, item.stock) } else { cart.push({ id, title:item.title, price:item.price, image:item.image, qty:1 }) }
    saveCart(cart); renderCart(); toast('Ditambahkan ke keranjang');
  }));
}

function renderCart(){
  cart = loadCart();
  cartList.innerHTML = cart.map(c=>`
    <div class="cart-item">
      <img src="${c.image}" alt="${c.title}" onerror="this.src='assets/placeholder.png'">
      <div>
        <div class="name">${c.title}</div>
        <div class="muted">${currency(c.price)} × 
          <button class="btn ghost" data-dec="${c.id}">−</button> ${c.qty}
          <button class="btn ghost" data-inc="${c.id}">+</button>
        </div>
      </div>
      <div>${currency(c.price*c.qty)}</div>
    </div>
  `).join('');

  const total = cart.reduce((s,c)=> s + c.price*c.qty, 0);
  cartTotal.textContent = currency(total);

  cartList.querySelectorAll('[data-inc]').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.inc;
    const p = products.find(x=>x.id===id);
    const item = cart.find(x=>x.id===id);
    if(item && p){ item.qty = Math.min(item.qty+1, p.stock); saveCart(cart); renderCart(); }
  }));
  cartList.querySelectorAll('[data-dec]').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.dec;
    const i = cart.findIndex(x=>x.id===id);
    if(i>-1){ cart[i].qty -= 1; if(cart[i].qty<=0) cart.splice(i,1); saveCart(cart); renderCart(); }
  }));
}

elSearch.addEventListener('input', e=>{ filters.q = e.target.value.trim().toLowerCase(); render() });
elCategory.addEventListener('change', e=>{ filters.cat = e.target.value; render() });
elSort.addEventListener('change', e=>{ filters.sort = e.target.value; render() });

cartBtn.addEventListener('click', ()=> drawer.classList.add('open'));
closeDrawer.addEventListener('click', ()=> drawer.classList.remove('open'));

render(); renderCart();
