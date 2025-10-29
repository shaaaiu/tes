
import { uid, loadProducts, saveProducts, seedIfEmpty, SAMPLE, currency, toast } from './utils.js';

seedIfEmpty(SAMPLE);

const tbody = document.querySelector('tbody#rows');
const form = document.querySelector('#form');
const exportBtn = document.querySelector('#export');
const importInput = document.querySelector('#import');
const clearBtn = document.querySelector('#clear');
const seedBtn = document.querySelector('#seed');

let products = loadProducts();
let editingId = null;

function resetForm(){
  form.reset();
  editingId = null;
  form.querySelector('[data-mode]').textContent = 'Tambah Produk';
  form.querySelector('#submit').textContent = 'Simpan';
}

function fillForm(p){
  form.title.value = p.title||'';
  form.price.value = p.price||0;
  form.category.value = p.category||'';
  form.image.value = p.image||'';
  form.stock.value = p.stock||0;
  form.featured.checked = !!p.featured;
  form.desc.value = p.desc||'';
}

function render(){
  products = loadProducts();
  tbody.innerHTML = products.map(p=>`
    <tr>
      <td><img class="thumb" src="${p.image}" alt="${p.title}" onerror="this.src='assets/placeholder.png'"></td>
      <td>
        <div style="font-weight:700">${p.title}</div>
        <div class="mini">${p.category}</div>
      </td>
      <td>${currency(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.featured?'<span class="badge">★</span>':'-'}</td>
      <td style="width:160px">
        <div style="display:flex; gap:8px">
          <button class="btn outline" data-edit="${p.id}">Edit</button>
          <button class="btn danger" data-del="${p.id}">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');

  // bind
  tbody.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.edit;
    const p = products.find(x=>x.id===id); if(!p) return;
    editingId = id;
    fillForm(p);
    form.querySelector('[data-mode]').textContent = 'Edit Produk';
    form.querySelector('#submit').textContent = 'Perbarui';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));

  tbody.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.del;
    const idx = products.findIndex(x=>x.id===id);
    if(idx>-1 && confirm('Hapus produk ini?')){ products.splice(idx,1); saveProducts(products); render(); toast('Produk dihapus'); }
  }));
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const payload = {
    title: form.title.value.trim(),
    price: Number(form.price.value||0),
    category: form.category.value.trim(),
    image: form.image.value.trim() || 'assets/placeholder.png',
    stock: Number(form.stock.value||0),
    featured: form.featured.checked,
    desc: form.desc.value.trim()
  };
  if(!payload.title){ toast('Judul wajib diisi'); return }
  if(editingId){
    const i = products.findIndex(x=>x.id===editingId);
    if(i>-1){ products[i] = { ...products[i], ...payload }; }
    toast('Produk diperbarui');
  }else{
    products.unshift({ id: uid(), ...payload });
    toast('Produk ditambahkan');
  }
  saveProducts(products); render(); resetForm();
});

exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(products,null,2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'products-export.json'; a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(Array.isArray(parsed)){
        saveProducts(parsed); render(); toast('Produk diimpor');
      }else{ alert('File tidak valid') }
    }catch(err){ alert('Gagal membaca file') }
    importInput.value = '';
  };
  reader.readAsText(file);
});

clearBtn.addEventListener('click', ()=>{
  if(confirm('Kosongkan semua produk?')){
    saveProducts([]); render(); toast('Data dikosongkan');
  }
});

seedBtn.addEventListener('click', ()=>{
  saveProducts(SAMPLE); render(); toast('Data sample dimuat');
});

render(); resetForm();
