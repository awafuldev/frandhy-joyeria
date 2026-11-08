/**
 * Frandhy Joyería — Admin Panel JavaScript
 * Vanilla ES6+, no dependencies
 */

'use strict';

// ── Sidebar toggle (mobile) ───────────────────────────────────
function initSidebar() {
  const sidebarToggle  = document.getElementById('sidebarToggle');
  const adminSidebar   = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose   = document.getElementById('sidebarClose');

  function openSidebar() {
    adminSidebar?.classList.add('sidebar-open');
    sidebarOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    adminSidebar?.classList.remove('sidebar-open');
    sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  sidebarToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminSidebar?.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });
}
initSidebar();

// ── CSRF token (from meta tag or hidden input) ────────────────
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content
    || document.querySelector('input[name="_csrf_token"]')?.value
    || '';
}

// ── AJAX helper ───────────────────────────────────────────────
async function adminFetch(url, data = {}) {
  const formData = new FormData();
  formData.append('_csrf_token', getCsrfToken());
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));

  const response = await fetch(url, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Network error: ' + response.status);
  return response.json();
}

// ── Toggle switches (disponible, destacado, nuevo) ───────────
document.querySelectorAll('[data-toggle-action]').forEach(btn => {
  btn.addEventListener('click', async function () {
    const action = this.dataset.toggleAction;
    const id     = this.dataset.id;
    const target = this;

    target.disabled = true;
    try {
      const result = await adminFetch(window.location.href, { action, id });
      if (result.success) {
        const isActive = result.value === 1;
        target.classList.toggle('active', isActive);
        target.classList.toggle('inactive', !isActive);
        target.textContent = isActive
          ? (target.dataset.labelOn  || 'Sí')
          : (target.dataset.labelOff || 'No');
        // Update badge styling
        const badge = target.querySelector('.toggle-indicator') || target;
        badge.title = isActive ? 'Activo (clic para desactivar)' : 'Inactivo (clic para activar)';
      }
    } catch (e) {
      showAdminAlert('Error al actualizar. Intenta de nuevo.', 'error');
    } finally {
      target.disabled = false;
    }
  });
});

// ── Confirm delete modal ──────────────────────────────────────
const confirmModal     = document.getElementById('confirm-delete-modal');
const confirmYes       = document.getElementById('confirm-delete-yes');
const confirmNo        = document.getElementById('confirm-delete-no');
let pendingDeleteForm  = null;

document.querySelectorAll('[data-confirm-delete]').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const message = this.dataset.confirmDelete || '¿Confirmas eliminar este elemento?';
    const form    = this.closest('form') || document.querySelector(this.dataset.form);
    if (confirmModal) {
      document.getElementById('confirm-delete-message')?.textContent && 
        (document.getElementById('confirm-delete-message').textContent = message);
      pendingDeleteForm = form || null;
      confirmModal.classList.add('active');
    } else {
      if (confirm(message)) {
        if (form) form.submit();
        else window.location.href = this.href;
      }
    }
  });
});

confirmYes?.addEventListener('click', () => {
  if (pendingDeleteForm) pendingDeleteForm.submit();
  confirmModal?.classList.remove('active');
});
confirmNo?.addEventListener('click', () => {
  confirmModal?.classList.remove('active');
  pendingDeleteForm = null;
});
confirmModal?.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    confirmModal.classList.remove('active');
    pendingDeleteForm = null;
  }
});

// ── Auto-generate slug from title field ───────────────────────
const nombreField = document.getElementById('nombre');
const slugField   = document.getElementById('slug');
const slugEdit    = document.getElementById('slug-edit-btn');
let slugLocked    = true;

if (nombreField && slugField) {
  nombreField.addEventListener('input', function () {
    if (slugLocked) {
      slugField.value = slugify(this.value);
    }
  });
}

slugEdit?.addEventListener('click', () => {
  slugLocked = false;
  slugField.readOnly = false;
  slugField.focus();
  slugEdit.style.display = 'none';
});

function slugify(text) {
  const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u','Á':'a','É':'e','Í':'i','Ó':'o','Ú':'u','Ñ':'n' };
  return text
    .split('').map(c => map[c] || c).join('')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Image upload preview — Main image ────────────────────────
const imgInput    = document.getElementById('imagen_principal');
const imgPreview  = document.getElementById('img-preview');
const imgPlaceholder = document.getElementById('img-placeholder');

imgInput?.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showAdminAlert('Solo se permiten imágenes (JPG, PNG, WebP).', 'error');
    this.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showAdminAlert('El archivo es muy grande. Máximo 5MB.', 'error');
    this.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (imgPreview) {
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
    }
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// ── Image upload preview — Gallery (multiple) ────────────────
const galeriaInput  = document.getElementById('galeria');
const galeriaPreview = document.getElementById('galeria-preview');

galeriaInput?.addEventListener('change', function () {
  if (!galeriaPreview) return;
  galeriaPreview.innerHTML = '';
  Array.from(this.files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'gallery-preview-item';
      div.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      galeriaPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});

// ── Gallery image delete (AJAX) ───────────────────────────────
document.querySelectorAll('[data-delete-gallery]').forEach(btn => {
  btn.addEventListener('click', async function () {
    const imgId = this.dataset.deleteGallery;
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    this.disabled = true;
    try {
      const result = await adminFetch(window.location.href, {
        action: 'delete_gallery_image',
        img_id: imgId
      });
      if (result.success) {
        this.closest('.gallery-preview-item')?.remove();
      }
    } catch (e) {
      showAdminAlert('Error eliminando imagen.', 'error');
      this.disabled = false;
    }
  });
});

// ── Character counters ────────────────────────────────────────
document.querySelectorAll('[data-maxlength]').forEach(el => {
  const max     = parseInt(el.dataset.maxlength, 10);
  const countEl = document.getElementById(el.id + '-count');
  if (!countEl) return;

  const update = () => {
    const remaining = max - el.value.length;
    countEl.textContent = remaining;
    countEl.classList.toggle('warn', remaining < 20);
    countEl.classList.toggle('danger', remaining < 0);
  };

  el.addEventListener('input', update);
  update();
});

// ── Auto-fill SEO fields from product fields ──────────────────
const metaTitleField = document.getElementById('meta_titulo');
const metaDescField  = document.getElementById('meta_descripcion');
const descCortaField = document.getElementById('descripcion_corta');

nombreField?.addEventListener('input', function () {
  if (metaTitleField && !metaTitleField.dataset.manual) {
    metaTitleField.value = this.value + ' | Frandhy Joyería';
  }
});

descCortaField?.addEventListener('input', function () {
  if (metaDescField && !metaDescField.dataset.manual) {
    metaDescField.value = this.value.substring(0, 160);
  }
});

metaTitleField?.addEventListener('input', function () { this.dataset.manual = '1'; });
metaDescField?.addEventListener('input',  function () { this.dataset.manual = '1'; });

// ── Uppercase code field ──────────────────────────────────────
const codigoField = document.getElementById('codigo');
codigoField?.addEventListener('input', function () {
  this.value = this.value.toUpperCase();
});

// ── Drag-and-drop category reorder ───────────────────────────
function initDragSort() {
  const list = document.getElementById('categories-sortable');
  if (!list) return;

  let dragItem = null;

  list.querySelectorAll('[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      dragItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      dragItem = null;
      saveCategoryOrder();
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragItem || dragItem === item) return;
      const rect = item.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      list.insertBefore(dragItem, after ? item.nextSibling : item);
    });
  });
}

async function saveCategoryOrder() {
  const items = document.querySelectorAll('#categories-sortable [data-cat-id]');
  const ids = Array.from(items).map(i => i.dataset.catId);
  try {
    await adminFetch(window.location.href, {
      action: 'update_order',
      ids: JSON.stringify(ids)
    });
  } catch (e) {
    console.warn('Order save failed:', e);
  }
}
initDragSort();

// ── Admin flash messages ──────────────────────────────────────
function showAdminAlert(message, type = 'info') {
  const container = document.getElementById('admin-alerts') || document.querySelector('.admin-content');
  if (!container) { alert(message); return; }

  const alert = document.createElement('div');
  alert.className = `admin-alert admin-alert-${type}`;
  alert.innerHTML = `<span>${message}</span><button class="alert-close">&times;</button>`;
  container.insertBefore(alert, container.firstChild);

  alert.querySelector('.alert-close')?.addEventListener('click', () => alert.remove());
  setTimeout(() => alert.remove(), 5000);
}

// Auto-dismiss existing alerts
document.querySelectorAll('.admin-alert').forEach(alert => {
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 400);
  }, 5000);

  alert.querySelector('.alert-close')?.addEventListener('click', () => alert.remove());
});

// ── WhatsApp message preview ──────────────────────────────────
function updateWhatsAppPreview() {
  const template  = document.getElementById('whatsapp_mensaje')?.value || '';
  const preview   = document.getElementById('wa-preview');
  if (!preview) return;

  const sample = {
    '{nombre}':   'Cadena Figaro Plata 925',
    '{codigo}':   'FRJ-001',
    '{precio}':   '2,500.00',
    '{material}': 'Plata 925',
  };
  let text = template;
  Object.entries(sample).forEach(([k, v]) => { text = text.replaceAll(k, v); });
  preview.textContent = text;
}

document.getElementById('whatsapp_mensaje')?.addEventListener('input', updateWhatsAppPreview);
updateWhatsAppPreview();

// ── Datatables search (local) ─────────────────────────────────
const tableSearch = document.getElementById('table-search');
if (tableSearch) {
  tableSearch.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.admin-table tbody tr').forEach(row => {
      row.style.display = !q || row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── Password show/hide toggle ─────────────────────────────────
document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetId = this.dataset.togglePassword;
    const input    = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? 'OCULTAR' : 'MOSTRAR';
    this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

// ── Password strength indicator ───────────────────────────────
const pwdField     = document.getElementById('password');
const pwdStrength  = document.getElementById('password-strength');

if (pwdField && pwdStrength) {
  pwdField.addEventListener('input', function () {
    const val = this.value;
    let score = 0;
    if (val.length >= 8)  score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
    pwdStrength.textContent  = levels[score] || '';
    pwdStrength.style.color  = colors[score] || '';
  });
}

// ── Confirm password match ────────────────────────────────────
const pwdConfirm = document.getElementById('password_confirm');
if (pwdField && pwdConfirm) {
  function checkMatch() {
    if (pwdConfirm.value && pwdField.value !== pwdConfirm.value) {
      pwdConfirm.setCustomValidity('Las contraseñas no coinciden.');
    } else {
      pwdConfirm.setCustomValidity('');
    }
  }
  pwdField.addEventListener('input', checkMatch);
  pwdConfirm.addEventListener('input', checkMatch);
}

// Legacy page shell compatibility: old functional screens use #menuToggle/#sidebar.
(function initLegacySidebar(){
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;
  let overlay = document.getElementById('legacySidebarOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'legacySidebarOverlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  const close = () => { sidebar.classList.remove('show'); overlay.classList.remove('active'); document.body.style.overflow=''; };
  toggle.addEventListener('click', () => { sidebar.classList.add('show'); overlay.classList.add('active'); document.body.style.overflow='hidden'; });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
