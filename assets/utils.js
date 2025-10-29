
// Utilities for LocalStorage-backed product data + helpers
const STORAGE_KEY = 'store.products.v1';
const CART_KEY = 'store.cart.v1';

export function uid(){ return (Date.now().toString(36)+Math.random().toString(36).slice(2,7)).toUpperCase() }

export function loadProducts(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] }catch(e){ console.warn(e); return [] }
}

export function saveProducts(items){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function seedIfEmpty(sample){
  if(loadProducts().length === 0){
    saveProducts(sample);
  }
}

export function currency(n){ return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n) }

export function loadCart(){
  try{ const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
}
export function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)) }

export function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t) }
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
}

export const SAMPLE = [
  { id: uid(), title: 'Aurora Headphones', price: 799000, category:'Audio', image:'assets/placeholder.png', stock: 12, featured: true, desc:'Headphone ringan dengan suara jernih.'},
  { id: uid(), title: 'Nebula Smartwatch', price: 1299000, category:'Wearable', image:'assets/placeholder.png', stock: 8, featured: true, desc:'Pantau aktivitas harian dan notifikasi cepat.'},
  { id: uid(), title: 'Lumen Lamp', price: 349000, category:'Home', image:'assets/placeholder.png', stock: 25, featured: false, desc:'Lampu meja minimalis dengan 3 tingkat kecerahan.'},
  { id: uid(), title: 'Pulse Speaker', price: 599000, category:'Audio', image:'assets/placeholder.png', stock: 16, featured: false, desc:'Speaker portabel bass mantap.'},
  { id: uid(), title: 'Orbit Backpack', price: 459000, category:'Fashion', image:'assets/placeholder.png', stock: 20, featured: false, desc:'Tas ransel anti air dengan banyak kompartemen.'}
];
