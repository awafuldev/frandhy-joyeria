/**
 * FRANDHY JOYERÍA ("La Mina de Plata 925") — ADMIN PANEL ENGINE
 * Conectado a FRANDHY_STORE (LocalStorage)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // DOM Elements
  const loginView      = document.getElementById('login-view');
  const dashboardView  = document.getElementById('dashboard-view');
  const formLogin      = document.getElementById('form-login');
  const adminPassInput = document.getElementById('admin-pass-input');
  const loginAlert     = document.getElementById('login-alert-container');
  const dashAlert      = document.getElementById('dashboard-alert-container');
  const btnLogout      = document.getElementById('btn-logout');

  // Stats
  const statTotalProducts    = document.getElementById('stat-total-products');
  const statStockProducts    = document.getElementById('stat-stock-products');
  const statFeaturedProducts = document.getElementById('stat-featured-products');
  const statCategories       = document.getElementById('stat-categories');

  // Inventory
  const productsTbody   = document.getElementById('admin-products-tbody');
  const mobileDeck      = document.getElementById('admin-products-mobile-deck');
  const searchInput     = document.getElementById('admin-search-input');
  const btnOpenCreate   = document.getElementById('btn-open-create-modal');

  // Modal Product
  const modal          = document.getElementById('admin-product-modal');
  const modalTitle     = document.getElementById('admin-modal-title');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const formProduct    = document.getElementById('form-product');
  const prodId         = document.getElementById('prod-id');
  const prodName       = document.getElementById('prod-name');
  const prodCode       = document.getElementById('prod-code');
  const prodCategory   = document.getElementById('prod-category');
  const prodMaterial   = document.getElementById('prod-material');
  const prodPrice      = document.getElementById('prod-price');
  const prodOldPrice   = document.getElementById('prod-old-price');
  const prodWeight     = document.getElementById('prod-weight');
  const prodStock      = document.getElementById('prod-stock');
  const prodImageFile  = document.getElementById('prod-image-file');
  const prodImageUrl   = document.getElementById('prod-image-url');
  const prodImgPreview = document.getElementById('prod-image-preview');
  const prodDescShort  = document.getElementById('prod-desc-short');
  const prodFeatured   = document.getElementById('prod-featured');
  const prodNew        = document.getElementById('prod-new');

  // Categories
  const formCategory        = document.getElementById('form-category');
  const catNameInput        = document.getElementById('cat-name-input');
  const catIconSelect       = document.getElementById('cat-icon-select');
  const categoriesContainer = document.getElementById('categories-list-container');

  // Settings
  const formSettings  = document.getElementById('form-settings');
  const cfgNombre     = document.getElementById('cfg-nombre');
  const cfgSlogan     = document.getElementById('cfg-slogan');
  const cfgWhatsapp   = document.getElementById('cfg-whatsapp');
  const cfgTelefono   = document.getElementById('cfg-telefono');
  const cfgInstagram  = document.getElementById('cfg-instagram');
  const cfgDireccion        = document.getElementById('cfg-direccion');
  const cfgPassword         = document.getElementById('cfg-password');
  const cfgPasswordConfirm  = document.getElementById('cfg-password-confirm');

  let currentImageData = '';

  // ========================================================================
  // 1. AUTHENTICATION & DEFENSE CONTRA FUERZA BRUTA
  // ========================================================================
  let lockoutInterval = null;

  function formatRemainingTime(ms) {
    const totalSecs = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function startLockoutCountdown(remainingMs) {
    if (lockoutInterval) clearInterval(lockoutInterval);
    const endTime = Date.now() + remainingMs;

    const btnSubmit = formLogin ? formLogin.querySelector('button[type="submit"]') : null;
    if (adminPassInput) adminPassInput.disabled = true;
    if (btnSubmit) btnSubmit.disabled = true;

    function renderCountdown() {
      const left = endTime - Date.now();
      if (left <= 0) {
        clearInterval(lockoutInterval);
        lockoutInterval = null;
        if (adminPassInput) {
          adminPassInput.disabled = false;
          adminPassInput.focus();
        }
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar al Panel';
        }
        FRANDHY_STORE.resetLockout();
        loginAlert.innerHTML = `
          <div style="padding:10px 14px; background:rgba(34,197,94,0.15); border:1px solid #22c55e; border-radius:6px; color:#86efac; font-size:12.5px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-shield-halved"></i>
            <span>El bloqueo temporal ha finalizado. Puedes ingresar nuevamente.</span>
          </div>
        `;
        return;
      }

      loginAlert.innerHTML = `
        <div style="padding:12px 14px; background:rgba(239,68,68,0.16); border:1px solid #ef4444; border-radius:6px; color:#fca5a5; font-size:12.5px; margin-bottom:14px; display:flex; align-items:flex-start; gap:10px;">
          <i class="fa-solid fa-lock" style="color:#ef4444; margin-top:2px; font-size:16px;"></i>
          <div>
            <strong style="display:block; color:#fff; font-size:13px; margin-bottom:2px;">Panel Bloqueado por Seguridad</strong>
            <span style="font-size:12px; color:#fca5a5;">Has excedido los intentos permitidos. Reintenta en: <strong style="color:var(--adm-gold); font-family:monospace; font-size:14px; letter-spacing:1px;">${formatRemainingTime(left)}</strong></span>
          </div>
        </div>
      `;
    }

    renderCountdown();
    lockoutInterval = setInterval(renderCountdown, 1000);
  }

  function checkLockoutOnLoad() {
    const status = FRANDHY_STORE.getLockoutStatus();
    if (status.locked) {
      startLockoutCountdown(status.remainingMs);
    }
  }

  function updateDefaultPassHint() {
    const hint = document.getElementById('login-default-pass-hint');
    if (hint) {
      hint.style.display = FRANDHY_STORE.isDefaultPassword() ? 'block' : 'none';
    }
  }

  function checkAuth() {
    updateDefaultPassHint();
    if (FRANDHY_STORE.isAdminAuthed()) {
      loginView.style.display = 'none';
      dashboardView.style.display = 'block';
      if (btnLogout) btnLogout.style.display = 'inline-flex';
      document.body.style.visibility = 'visible'; // revelar ya con la vista correcta
      initDashboard();
    } else {
      loginView.style.display = 'flex';
      dashboardView.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';
      document.body.style.visibility = 'visible'; // revelar ya con login visible
      checkLockoutOnLoad();
    }
  }

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = adminPassInput.value.trim();
    if (!pass) return;

    const btnSubmit = formLogin.querySelector('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando credenciales...';
    }

    try {
      const res = await FRANDHY_STORE.loginAdmin(pass);
      if (res.success) {
        adminPassInput.value = '';
        loginAlert.innerHTML = '';
        checkAuth();
      } else {
        if (res.locked) {
          startLockoutCountdown(res.remainingMs);
        } else {
          loginAlert.innerHTML = `
            <div style="padding:10px 14px; background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:6px; color:#fca5a5; font-size:12.5px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-circle-exclamation" style="font-size:14px;"></i>
              <span>${res.message || 'Contraseña incorrecta.'}</span>
            </div>
          `;
        }
      }
    } catch (err) {
      loginAlert.innerHTML = `
        <div style="padding:10px 14px; background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:6px; color:#fca5a5; font-size:12.5px; margin-bottom:14px;">
          Error en el proceso de autenticación.
        </div>
      `;
    } finally {
      if (btnSubmit && !adminPassInput.disabled) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar al Panel';
      }
    }
  });

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      FRANDHY_STORE.logoutAdmin();
      checkAuth();
    });
  }

  // ========================================================================
  // 2. DASHBOARD INIT & TABS
  // ========================================================================
  function initDashboard() {
    updateStats();
    renderInventory();
    renderCategories();
    loadSettings();
    checkFirstLoginWarning();
  }

  // Tabs switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const contentEl = document.getElementById(targetTab);
      if (contentEl) contentEl.style.display = 'block';
    });
  });

  // ========================================================================
  // 3. STATS
  // ========================================================================
  function updateStats() {
    const products = FRANDHY_STORE.getProducts();
    const cats = FRANDHY_STORE.getCategories();

    if (statTotalProducts)    statTotalProducts.textContent = products.length;
    if (statStockProducts)    statStockProducts.textContent = products.filter(p => p.stock > 0).length;
    if (statFeaturedProducts) statFeaturedProducts.textContent = products.filter(p => p.destacado).length;
    if (statCategories)       statCategories.textContent = cats.length;
  }

  // ========================================================================
  // 4. INVENTORY RENDER (TABLE & MOBILE)
  // ========================================================================
  function renderInventory() {
    const all = FRANDHY_STORE.getProducts();
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const list = all.filter(p => {
      return !q || 
             p.nombre.toLowerCase().includes(q) ||
             (p.codigo && p.codigo.toLowerCase().includes(q)) ||
             (p.categoria && p.categoria.toLowerCase().includes(q));
    });

    // 4.1 Desktop Table
    if (productsTbody) {
      if (list.length === 0) {
        productsTbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding:40px; color:var(--adm-text-3);">
              No se encontraron joyas en el inventario.
            </td>
          </tr>
        `;
      } else {
        productsTbody.innerHTML = list.map(p => `
          <tr>
            <td>
              <img src="${p.imagen || 'assets/img/no-image.svg'}" class="table-thumb" alt="${p.nombre}" onerror="this.src='assets/img/no-image.svg'">
            </td>
            <td>
              <div style="font-weight:600; color:var(--adm-text);">${p.nombre}</div>
              <div style="font-size:11px; color:var(--adm-gold); font-family:monospace;">${p.codigo || 'S/C'}</div>
            </td>
            <td>${p.categoria || 'Sin categoría'}</td>
            <td style="font-weight:700; color:var(--adm-gold-2);">${FRANDHY_STORE.formatPrice(p.precio)}</td>
            <td>
              <span class="${p.stock > 0 ? 'stock-ok' : 'stock-out'}">
                ${p.stock > 0 ? `${p.stock} un.` : 'Agotado'}
              </span>
            </td>
            <td>
              <div style="display:flex; gap:6px;">
                <span class="toggle-pill ${p.destacado ? 'active' : 'inactive'}" onclick="toggleField('${p.id}', 'destacado')">
                  <i class="fa-solid fa-star"></i> Destacado
                </span>
                <span class="toggle-pill ${p.nuevo ? 'active' : 'inactive'}" onclick="toggleField('${p.id}', 'nuevo')">
                  <i class="fa-solid fa-sparkles"></i> Nuevo
                </span>
              </div>
            </td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:6px;">
                <button type="button" class="btn-icon" title="Editar joya" onclick="editProduct('${p.id}')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn-icon danger" title="Eliminar joya" onclick="deleteProduct('${p.id}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    // 4.2 Mobile Deck
    if (mobileDeck) {
      if (list.length === 0) {
        mobileDeck.innerHTML = `
          <div style="text-align:center; padding:40px 16px; background:var(--adm-surface); border-radius:10px; border:1px solid var(--adm-border); color:var(--adm-text-3);">
            No se encontraron joyas coincidentes.
          </div>
        `;
      } else {
        mobileDeck.innerHTML = list.map(p => `
          <div class="mobile-prod-card">
            <div class="mobile-card-header">
              <img src="${p.imagen || 'assets/img/no-image.svg'}" class="mobile-card-thumb" alt="${p.nombre}" onerror="this.src='assets/img/no-image.svg'">
              <div class="mobile-card-info">
                <div class="mobile-card-code">${p.codigo || 'S/C'}</div>
                <div class="mobile-card-name">${p.nombre}</div>
                <div class="mobile-card-cat">${p.categoria || 'Oro 14k'} &bull; ${p.material || 'Macizo'}</div>
              </div>
            </div>

            <div class="mobile-card-metrics">
              <div class="mobile-metric">
                <div class="mobile-metric-label">Precio</div>
                <div class="mobile-metric-val" style="color:var(--adm-gold-2);">${FRANDHY_STORE.formatPrice(p.precio)}</div>
              </div>
              <div class="mobile-metric">
                <div class="mobile-metric-label">Stock</div>
                <div class="mobile-metric-val ${p.stock > 0 ? 'stock-ok' : 'stock-out'}">
                  ${p.stock > 0 ? `${p.stock} un.` : 'Agotado'}
                </div>
              </div>
              <div class="mobile-metric">
                <div class="mobile-metric-label">Estado</div>
                <div class="mobile-metric-val" style="font-size:11px;">
                  ${p.destacado ? '<span style="color:var(--adm-gold);">★ Dest.</span>' : ''}
                  ${p.nuevo ? '<span style="color:#4ade80;">● Nuevo</span>' : ''}
                  ${!p.destacado && !p.nuevo ? '<span style="color:var(--adm-text-3);">—</span>' : ''}
                </div>
              </div>
            </div>

            <div class="mobile-toggle-row">
              <span class="toggle-pill ${p.destacado ? 'active' : 'inactive'}" onclick="toggleField('${p.id}', 'destacado')" style="justify-content:center; padding:6px 4px; font-size:11px;">
                <i class="fa-solid fa-star"></i> ${p.destacado ? 'Destacado' : 'Normal'}
              </span>
              <span class="toggle-pill ${p.nuevo ? 'active' : 'inactive'}" onclick="toggleField('${p.id}', 'nuevo')" style="justify-content:center; padding:6px 4px; font-size:11px;">
                <i class="fa-solid fa-sparkles"></i> ${p.nuevo ? 'Nuevo' : 'Clásico'}
              </span>
            </div>

            <div class="mobile-card-actions">
              <button type="button" class="btn-ghost" onclick="editProduct('${p.id}')">
                <i class="fa-solid fa-pen-to-square"></i> Editar Joya
              </button>
              <button type="button" class="btn-danger" onclick="deleteProduct('${p.id}')">
                <i class="fa-solid fa-trash-can"></i> Eliminar
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Toggles rápidos
  window.toggleField = function (id, field) {
    const list = FRANDHY_STORE.getProducts();
    const p = list.find(item => item.id === id);
    if (!p) return;

    p[field] = !p[field];
    FRANDHY_STORE.updateProduct(id, { [field]: p[field] });
    updateStats();
    renderInventory();
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => renderInventory());
  }

  // ========================================================================
  // 5. PRODUCT MODAL (CREATE / EDIT)
  // ========================================================================
  function populateCategorySelect() {
    const cats = FRANDHY_STORE.getCategories();
    if (!prodCategory) return;
    prodCategory.innerHTML = cats.map(c => `
      <option value="${c.nombre}">${c.nombre}</option>
    `).join('');
  }

  function openModal(isEdit = false) {
    populateCategorySelect();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalTitle.innerHTML = isEdit 
      ? '<i class="fa-solid fa-pen-to-square"></i> Editar Joya' 
      : '<i class="fa-solid fa-plus"></i> Agregar Nueva Joya';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    formProduct.reset();
    prodId.value = '';
    currentImageData = '';
    if (prodImgPreview) prodImgPreview.style.display = 'none';
  }

  if (btnOpenCreate) {
    btnOpenCreate.addEventListener('click', () => {
      formProduct.reset();
      prodId.value = '';
      currentImageData = '';
      if (prodImgPreview) prodImgPreview.style.display = 'none';
      prodCode.value = 'FJ-925-' + Math.floor(100 + Math.random() * 900);
      openModal(false);
    });
  }

  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Previsualización y Compresión Automática de Imagen en Cliente
  // Reduce cualquier foto (incluso de 10MB tomada con celular) a ~50-80KB para proteger los 100GB
  function compressImageClient(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let w = img.width;
          let h = img.height;

          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          // Convertir a JPEG comprimido
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  prodImageFile.addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    if (prodImgPreview) {
      prodImgPreview.style.display = 'block';
      prodImgPreview.alt = 'Comprimiendo imagen...';
    }

    try {
      currentImageData = await compressImageClient(file, 800, 0.8);
      prodImgPreview.src = currentImageData;
      prodImgPreview.style.display = 'block';
      prodImageUrl.value = '';
    } catch (err) {
      console.error('Error al optimizar imagen:', err);
    }
  });

  prodImageUrl.addEventListener('input', function () {
    if (this.value.trim() !== '') {
      currentImageData = this.value.trim();
      prodImgPreview.src = currentImageData;
      prodImgPreview.style.display = 'block';
    }
  });

  // Editar Joya
  window.editProduct = function (id) {
    const p = FRANDHY_STORE.getProductById(id);
    if (!p) return;

    prodId.value = p.id;
    prodName.value = p.nombre || '';
    prodCode.value = p.codigo || '';
    prodCategory.value = p.categoria || 'Cadenas de Plata 925';
    prodMaterial.value = p.material || 'Plata Ley 925 Italiana';
    prodPrice.value = p.precio || '';
    prodOldPrice.value = p.precio_anterior || '';
    prodWeight.value = p.peso_aprox || '';
    prodStock.value = p.stock !== undefined ? p.stock : 4;
    prodDescShort.value = p.descripcion_corta || '';

    currentImageData = p.imagen || '';
    if (currentImageData) {
      prodImgPreview.src = currentImageData;
      prodImgPreview.style.display = 'block';
      prodImageUrl.value = currentImageData.startsWith('data:') ? '' : currentImageData;
    } else {
      prodImgPreview.style.display = 'none';
    }

    prodFeatured.checked = !!p.destacado;
    prodNew.checked = !!p.nuevo;

    openModal(true);
  };

  // Guardar Joya (Submit)
  formProduct.addEventListener('submit', (e) => {
    e.preventDefault();

    const catName = prodCategory.value;
    const catSlug = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

    const productData = {
      nombre:            prodName.value.trim(),
      codigo:            prodCode.value.trim() || 'FJ-925-' + Math.floor(100 + Math.random() * 900),
      categoria:         catName,
      categoria_slug:    catSlug,
      material:          prodMaterial.value.trim(),
      precio:            parseFloat(prodPrice.value) || 0,
      precio_anterior:   prodOldPrice.value ? parseFloat(prodOldPrice.value) : null,
      peso_aprox:        prodWeight.value.trim(),
      stock:             parseInt(prodStock.value) || 0,
      imagen:            currentImageData || 'assets/img/custom_bp_pendant.jpg',
      descripcion_corta: prodDescShort.value.trim(),
      destacado:         prodFeatured.checked,
      nuevo:             prodNew.checked,
      disponible:        true
    };

    const id = prodId.value;
    if (id) {
      FRANDHY_STORE.updateProduct(id, productData);
    } else {
      FRANDHY_STORE.addProduct(productData);
    }

    closeModal();
    updateStats();
    renderInventory();
  });

  // Eliminar Joya
  window.deleteProduct = function (id) {
    const p = FRANDHY_STORE.getProductById(id);
    if (!p) return;

    if (confirm(`¿Estás seguro de eliminar "${p.nombre}" del catálogo de Frandhy Joyería?`)) {
      FRANDHY_STORE.deleteProduct(id);
      updateStats();
      renderInventory();
    }
  };

  // ========================================================================
  // 6. CATEGORIES ENGINE
  // ========================================================================
  function renderCategories() {
    const cats = FRANDHY_STORE.getCategories();
    const products = FRANDHY_STORE.getProducts();

    if (!categoriesContainer) return;

    if (cats.length === 0) {
      categoriesContainer.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--adm-text-3);">
          No hay colecciones registradas.
        </div>
      `;
      return;
    }

    categoriesContainer.innerHTML = cats.map(c => {
      const count = products.filter(p => {
        return (p.categoria && p.categoria.toLowerCase() === c.nombre.toLowerCase()) ||
               (p.categoria_slug && p.categoria_slug === c.slug);
      }).length;

      return `
        <div class="cat-row">
          <div class="cat-row-left">
            <span class="cat-icon-badge"><i class="fa-solid ${c.icono || 'fa-tag'}"></i></span>
            <div>
              <div class="cat-row-name">${c.nombre}</div>
              <span class="cat-count-pill">${count} joya${count === 1 ? '' : 's'}</span>
            </div>
          </div>
          <button type="button" class="btn-icon danger" onclick="deleteCategory('${c.id}')" title="Eliminar colección">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  formCategory.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = catNameInput.value.trim();
    if (!nombre) return;

    const slug = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    FRANDHY_STORE.addCategory({
      nombre: nombre,
      slug: slug,
      icono: catIconSelect.value
    });

    catNameInput.value = '';
    renderCategories();
    updateStats();
  });

  window.deleteCategory = function (id) {
    if (confirm('¿Deseas eliminar esta categoría? Las piezas existentes mantendrán su información.')) {
      FRANDHY_STORE.deleteCategory(id);
      renderCategories();
      updateStats();
    }
  };

  // ========================================================================
  // 7. SETTINGS ENGINE
  // ========================================================================
  function loadSettings() {
    const cfg = FRANDHY_STORE.getConfig();
    if (cfgNombre)    cfgNombre.value = cfg.nombre_sitio || '';
    if (cfgSlogan)    cfgSlogan.value = cfg.slogan || '';
    if (cfgWhatsapp)  cfgWhatsapp.value = cfg.whatsapp || '';
    if (cfgTelefono)  cfgTelefono.value = cfg.telefono || '';
    if (cfgInstagram) cfgInstagram.value = cfg.instagram || '';
    if (cfgDireccion) cfgDireccion.value = cfg.direccion || '';
  }

  formSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = formSettings.querySelector('button[type="submit"]');

    const newPass = cfgPassword ? cfgPassword.value.trim() : '';
    const confirmPass = cfgPasswordConfirm ? cfgPasswordConfirm.value.trim() : '';

    if (newPass) {
      if (newPass.length < 6) {
        alert('Por seguridad comercial, la nueva contraseña debe tener al menos 6 caracteres.');
        if (cfgPassword) cfgPassword.focus();
        return;
      }
      if (newPass !== confirmPass) {
        alert('Las contraseñas no coinciden. Por favor confirma la nueva contraseña con exactitud.');
        if (cfgPasswordConfirm) cfgPasswordConfirm.focus();
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cifrando y asegurando clave...';
      }

      try {
        await FRANDHY_STORE.setNewPassword(newPass);
      } catch (err) {
        alert('Error al asegurar contraseña: ' + (err.message || 'Error desconocido'));
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Configuración';
        }
        return;
      }
    }

    const cfg = FRANDHY_STORE.getConfig();
    cfg.nombre_sitio = cfgNombre.value.trim();
    cfg.slogan       = cfgSlogan.value.trim();
    cfg.whatsapp     = cfgWhatsapp.value.trim();
    cfg.telefono     = cfgTelefono.value.trim();
    cfg.instagram    = cfgInstagram.value.trim();
    cfg.direccion    = cfgDireccion.value.trim();

    FRANDHY_STORE.saveConfig(cfg);

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Configuración';
    }

    alert(newPass ? '¡Contraseña cifrada con éxito con PBKDF2-SHA256 (100,000 iteraciones) y configuración guardada de forma segura!' : 'Configuración guardada exitosamente.');
    if (cfgPassword) cfgPassword.value = '';
    if (cfgPasswordConfirm) cfgPasswordConfirm.value = '';
    checkFirstLoginWarning();
    updateDefaultPassHint();
  });

  function checkFirstLoginWarning() {
    const dashboardAlertContainer = document.getElementById('dashboard-alert-container');
    if (!dashboardAlertContainer) return;

    if (FRANDHY_STORE.isDefaultPassword()) {
      dashboardAlertContainer.innerHTML = `
        <div style="background:rgba(212,157,55,0.14); border:1px solid var(--adm-gold); border-radius:var(--radius); padding:16px 20px; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--adm-gold); font-size:22px;"></i>
            <div>
              <strong style="color:#fff; font-size:14px; display:block;">Primer acceso: Cambia tu contraseña por defecto</strong>
              <span style="font-size:12.5px; color:var(--adm-text-2);">Tu panel está usando la clave temporal <code style="background:#090a0d; padding:2px 6px; border-radius:4px; color:var(--adm-gold);">admin123</code>. Te sugerimos cambiarla ahora para proteger tu tienda.</span>
            </div>
          </div>
          <button type="button" class="btn-gold" id="btn-quick-change-pass" style="padding:7px 16px; font-size:12.5px;">
            <i class="fa-solid fa-key"></i> Cambiar Contraseña Ahora
          </button>
        </div>
      `;

      const btnQuickChange = document.getElementById('btn-quick-change-pass');
      if (btnQuickChange) {
        btnQuickChange.addEventListener('click', () => {
          const settingsBtn = document.querySelector('.sidebar-btn[data-tab="tab-settings"]');
          if (settingsBtn) settingsBtn.click();
          if (cfgPassword) {
            cfgPassword.focus();
            cfgPassword.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    } else {
      dashboardAlertContainer.innerHTML = '';
    }
  }

  // RUN
  checkAuth();
});
