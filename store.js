/**
 * FRANDHY JOYERÍA — STORE ENGINE & INTERACTIVE LOGIC
 * "La Mina de Plata 925" · Santiago de los Caballeros, República Dominicana
 * WhatsApp Oficial: 829-370-7605 / 829-379-7605
 * Ubicación: Calle 30 de Marzo, Plaza 30 de Marzo, Local B (Frente a Banfondesa)
 */

(function () {
  'use strict';

  const CART_KEY = 'frandhy_bag_v2';

  // State
  let currentCategory = 'todas';
  let searchQuery = '';
  let activeModalProduct = null;

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const catalogCountEl = document.getElementById('catalog-count');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const navSearchBar = document.getElementById('nav-search-bar');
  const navSearchBtn = document.getElementById('nav-search-btn');

  // Modal Elements
  const productModal = document.getElementById('product-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalImg = document.getElementById('modal-img');
  const modalCat = document.getElementById('modal-cat');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalOldPrice = document.getElementById('modal-old-price');
  const modalMaterial = document.getElementById('modal-material');
  const modalWeight = document.getElementById('modal-weight');
  const modalStock = document.getElementById('modal-stock');
  const modalCode = document.getElementById('modal-code');
  const modalDesc = document.getElementById('modal-desc');
  const modalWaBtn = document.getElementById('modal-wa-btn');
  const modalAddBagBtn = document.getElementById('modal-add-bag-btn');

  // Cart Elements
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartItemsWrap = document.getElementById('cart-items-wrap');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const navBagCounters = document.querySelectorAll('.bag-counter');

  // Mobile Drawer
  const mobDrawer = document.getElementById('mob-drawer');
  const mobOverlay = document.getElementById('mob-overlay');
  const mobToggleBtn = document.getElementById('mob-toggle-btn');
  const mobCloseBtn = document.getElementById('mob-close-btn');

  // ========================================================================
  // 1. CART ENGINE
  // ========================================================================
  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Luxury Toast Notification System
  let toastTimeout = null;
  function showToast(message, icon = 'fa-gem') {
    let toast = document.getElementById('frandhy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'frandhy-toast';
      toast.className = 'frandhy-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(productId, qty = 1) {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    if (!store) return false;
    const product = store.getProductById(productId);
    if (!product) return false;

    // Control estricto de Stock disponible
    const maxStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 99;
    if (maxStock <= 0) {
      showToast('Esta joya se encuentra agotada en taller.', 'fa-circle-xmark');
      return false;
    }

    const cart = getCart();
    const existing = cart.find(item => String(item.id) === String(product.id));

    if (existing) {
      if (existing.qty >= maxStock) {
        showToast(maxStock === 1 ? '¡Solo queda 1 unidad disponible de esta joya!' : `Stock máximo alcanzado (${maxStock} disponibles).`, 'fa-triangle-exclamation');
        openCartDrawer();
        return false;
      }
      if (existing.qty + qty > maxStock) {
        existing.qty = maxStock;
        showToast(`Ajustado al máximo disponible (${maxStock} unid.).`, 'fa-triangle-exclamation');
      } else {
        existing.qty += qty;
        showToast('Pieza agregada a tu bolsa de joyas.', 'fa-bag-shopping');
      }
    } else {
      const initialQty = Math.min(qty, maxStock);
      cart.push({
        id: product.id,
        nombre: product.nombre,
        codigo: product.codigo,
        precio: product.precio,
        imagen: product.imagen,
        material: product.material,
        qty: initialQty
      });
      showToast('Pieza agregada a tu bolsa de joyas.', 'fa-bag-shopping');
    }

    saveCart(cart);
    openCartDrawer();
    return true;
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCart(cart);
    showToast('Pieza removida de tu bolsa.', 'fa-trash-can');
  }

  function updateItemQty(productId, delta) {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    let cart = getCart();
    const item = cart.find(i => String(i.id) === String(productId));
    if (!item) return;

    // Validar contra el stock real en el inventario
    const product = store ? store.getProductById(productId) : null;
    const maxStock = product && typeof product.stock === 'number' ? Math.max(0, product.stock) : 99;

    if (delta > 0) {
      if (item.qty >= maxStock) {
        showToast(maxStock === 1 ? '¡Solo queda 1 unidad disponible de esta joya exclusiva!' : `Stock máximo alcanzado (${maxStock} unidades disponibles).`, 'fa-triangle-exclamation');
        return;
      }
      item.qty += delta;
      if (item.qty > maxStock) item.qty = maxStock;
    } else if (delta < 0) {
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => String(i.id) !== String(productId));
        saveCart(cart);
        showToast('Pieza removida de tu bolsa.', 'fa-trash-can');
        return;
      }
    }

    saveCart(cart);
  }

  function openCartDrawer() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function updateCartUI() {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    const cart = getCart();
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.qty), 0);

    // Update counters
    navBagCounters.forEach(el => {
      el.textContent = totalQty;
      el.classList.toggle('active', totalQty > 0);
    });

    const mobCount = document.getElementById('mob-bag-count');
    if (mobCount) mobCount.textContent = totalQty;

    // Render cart items
    if (cartItemsWrap) {
      if (cart.length === 0) {
        cartItemsWrap.innerHTML = `
          <div class="cart-empty">
            <i class="fa-solid fa-gem" style="color:var(--gold-light);"></i>
            <h4>Tu bolsa está vacía</h4>
            <p>Explora nuestras cadenas, guillos y dijes en Plata 925 y agrega tus piezas favoritas.</p>
            <button type="button" class="btn-primary" onclick="window.FRANDHY_APP.closeCartDrawer();" style="margin-top:12px; font-size:12px;">
              Ver Catálogo 925
            </button>
          </div>
        `;
      } else {
        cartItemsWrap.innerHTML = cart.map(item => {
          const product = store ? store.getProductById(item.id) : null;
          const maxStock = product && typeof product.stock === 'number' ? Math.max(0, product.stock) : 99;
          const isMax = item.qty >= maxStock;
          const isSingle = maxStock === 1;

          let stockTag = '';
          if (isMax && isSingle) {
            stockTag = `<span class="cart-stock-tag warning"><i class="fa-solid fa-bolt"></i> ¡Única unidad disponible!</span>`;
          } else if (isMax) {
            stockTag = `<span class="cart-stock-tag max"><i class="fa-solid fa-lock"></i> Máx. en stock (${maxStock})</span>`;
          } else if (isSingle) {
            stockTag = `<span class="cart-stock-tag warning"><i class="fa-solid fa-bolt"></i> ¡Última unidad!</span>`;
          }

          return `
            <div class="cart-item">
              <img src="${item.imagen || 'assets/img/no-image.svg'}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='assets/img/hero/cristian_hero_luxury.jpg'">
              <div class="cart-item-info">
                <h4 class="cart-item-title">${item.nombre}</h4>
                <div class="cart-item-meta">${item.material || 'Plata Ley 925'}</div>
                <div class="cart-item-price">${store.formatPrice(item.precio * item.qty)}</div>
                
                <div class="cart-item-bottom">
                  <div class="cart-qty-stepper">
                    <button type="button" class="cart-qty-btn minus" onclick="window.FRANDHY_APP.updateItemQty('${item.id}', -1)" aria-label="Restar cantidad" title="${item.qty === 1 ? 'Quitar joya de la bolsa' : 'Restar 1'}">
                      <i class="fa-solid fa-minus" style="font-size:10px;"></i>
                    </button>
                    <span class="cart-qty-num">${item.qty}</span>
                    <button type="button" class="cart-qty-btn plus ${isMax ? 'is-max' : ''}" onclick="window.FRANDHY_APP.updateItemQty('${item.id}', 1)" aria-label="Sumar cantidad" title="${isMax ? (isSingle ? 'Solo hay 1 unidad en taller' : 'Stock máximo alcanzado') : 'Sumar 1'}">
                      <i class="fa-solid fa-plus" style="font-size:10px;"></i>
                    </button>
                  </div>
                  ${stockTag}
                </div>
              </div>
              <button type="button" class="cart-remove-btn" onclick="window.FRANDHY_APP.removeFromCart('${item.id}')" aria-label="Eliminar ${item.nombre} de la bolsa" title="Quitar de la bolsa">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          `;
        }).join('');
      }
    }

    if (cartTotalPrice && store) {
      cartTotalPrice.textContent = store.formatPrice(totalPrice);
    }
  }

  // WhatsApp Single Item Direct Buy
  function getWhatsAppProductUrl(product) {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    const cfg = store ? store.getConfig() : {};
    const phone = cfg.whatsapp || '18293707605';
    const text = 
      `✨ *CONSULTA FRANDHY JOYERÍA — LA MINA DE PLATA 925* ✨\n` +
      `📍 Santiago de los Caballeros, RD\n\n` +
      `Hola Frandhy Joyería, deseo ordenar la siguiente pieza:\n\n` +
      `💎 *${product.nombre}*\n` +
      `   • Código: ${product.codigo || 'FJ-925'}\n` +
      `   • Material: ${product.material || 'Plata Ley 925 Maciza'}\n` +
      `   • Precio: ${store.formatPrice(product.precio)}\n` +
      (product.peso_aprox ? `   • Peso: ${product.peso_aprox}\n` : '') +
      `\n¿Tienen disponibilidad para retiro en Calle 30 de Marzo o envío express? Gracias.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // WhatsApp Full Bag Checkout
  function checkoutViaWhatsApp() {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    const cart = getCart();
    if (cart.length === 0) return;

    const cfg = store ? store.getConfig() : {};
    const phone = cfg.whatsapp || '18293707605';
    const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.qty), 0);

    let msg = `✨ *ORDEN FRANDHY JOYERÍA — LA MINA DE PLATA 925* ✨\n`;
    msg += `📍 *Santiago de los Caballeros, RD*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `¡Hola Frandhy Joyería! Quiero confirmar un pedido con las siguientes piezas:\n\n`;

    cart.forEach((item, i) => {
      msg += `*${i + 1}. ${item.nombre}* (x${item.qty})\n`;
      msg += `   • Código: ${item.codigo || 'N/A'}\n`;
      msg += `   • Subtotal: ${store.formatPrice(item.precio * item.qty)}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL ESTIMADO: ${store.formatPrice(totalPrice)}*\n\n`;
    msg += `👤 *Mis Datos:*\n`;
    msg += `• Nombre Completo:\n`;
    msg += `• Ciudad / Dirección de Envío:\n`;
    msg += `• Método: [ ] Retiro en Calle 30 de Marzo, Santiago / [ ] Envío asegurado a domicilio\n\n`;
    msg += `Por favor envíenme el video de la balanza digital y datos bancarios para completar el pago. ¡Gracias!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ========================================================================
  // 2. CATALOG RENDERING & FILTERING
  // ========================================================================
  function renderCatalog() {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    if (!productsGrid || !store) return;

    const all = store.getProducts();
    let filtered = all;

    // Filter by Category
    if (currentCategory && currentCategory !== 'todas') {
      filtered = filtered.filter(p => p.categoria_slug === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.codigo && p.codigo.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.descripcion_corta && p.descripcion_corta.toLowerCase().includes(q))
      );
    }

    // Update Counter
    if (catalogCountEl) {
      catalogCountEl.textContent = `Mostrando ${filtered.length} de ${all.length} joyas`;
    }

    // Render Grid
    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background:#fff; border-radius:14px; border:1px solid var(--bdr-light);">
          <i class="fa-solid fa-gem" style="font-size:38px; color:var(--gold); margin-bottom:14px;"></i>
          <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:8px;">No encontramos piezas coincidentes</h3>
          <p style="font-size:13.5px; color:var(--text-dark-2); max-width:440px; margin:0 auto 18px;">
            Intenta con otro término o selecciona una categoría diferente de nuestro catálogo en Plata Ley 925.
          </p>
          <button type="button" class="btn-primary" onclick="window.FRANDHY_APP.filterByCategory('todas')">
            Ver Todo el Catálogo
          </button>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(p => {
      const waUrl = getWhatsAppProductUrl(p);
      const isOutOfStock = typeof p.stock === 'number' && p.stock <= 0;
      const isSingleStock = p.stock === 1;

      return `
        <article class="prod-card fade-in visible ${isOutOfStock ? 'is-out-of-stock' : ''}" data-id="${p.id}">
          <div class="prod-img-wrap" onclick="window.FRANDHY_APP.openProductModal('${p.id}')">
            <img src="${p.imagen || 'assets/img/custom_bp_pendant.jpg'}" alt="${p.nombre}" class="prod-img" loading="lazy" decoding="async" onerror="this.src='assets/img/hero/cristian_hero_luxury.jpg'">
            <div class="prod-badges-row">
              <span class="prod-badge-gold">PLATA 925</span>
              ${p.nuevo ? `<span class="prod-badge-gold" style="background:#16a34a; color:#fff;">NUEVO</span>` : ''}
              ${isOutOfStock ? `<span class="prod-badge-gold" style="background:#dc2626; color:#fff; border-color:transparent;">AGOTADO</span>` : (isSingleStock ? `<span class="prod-badge-gold" style="background:#ea580c; color:#fff; border-color:transparent;"><i class="fa-solid fa-bolt" style="font-size:9px;"></i> ¡ÚLTIMA PIEZA!</span>` : '')}
            </div>
            <button type="button" class="prod-quick-btn" onclick="event.stopPropagation(); window.FRANDHY_APP.openProductModal('${p.id}')" aria-label="Vista rápida">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
          <div class="prod-body">
            <div class="prod-meta">
              <span>${p.material || 'Plata Ley 925'}</span>
              ${p.peso_aprox ? `<span>&bull; ${p.peso_aprox}</span>` : ''}
            </div>
            <h3 class="prod-title" onclick="window.FRANDHY_APP.openProductModal('${p.id}')">${p.nombre}</h3>
            
            <div class="prod-price-box">
              <div class="prod-prices">
                <span class="prod-price">${store.formatPrice(p.precio)}</span>
                ${p.precio_anterior ? `<span class="prod-old-price">${store.formatPrice(p.precio_anterior)}</span>` : ''}
              </div>
            </div>

            <div class="prod-actions">
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn-card-wa" title="Pedir por WhatsApp">
                <i class="fa-brands fa-whatsapp"></i> <span>Pedir</span>
              </a>
              <button type="button" class="btn-card-bag ${isOutOfStock ? 'disabled' : ''}" onclick="window.FRANDHY_APP.addToCart('${p.id}')" title="${isOutOfStock ? 'Pieza Agotada' : 'Añadir a mi bolsa'}" aria-label="${isOutOfStock ? 'Agotado' : 'Añadir a bolsa'}" ${isOutOfStock ? 'disabled' : ''}>
                <i class="fa-solid ${isOutOfStock ? 'fa-ban' : 'fa-bag-shopping'}"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function filterByCategory(cat) {
    currentCategory = cat;

    // Update Pills in Catalog Toolbar
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-cat') === cat);
    });

    // Update Category Cards (Luxury Tiles, Rings, Lookbook)
    document.querySelectorAll('.lux-cat-card, .cat-ring-item, .cat-card, .lookbook-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-cat') === cat);
    });

    renderCatalog();

    // Smooth scroll to catalog if triggered from categories section above
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl && window.scrollY < catalogEl.offsetTop - 140) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ========================================================================
  // 3. PRODUCT MODAL
  // ========================================================================
  function openProductModal(productId) {
    const store = window.FRANDHY_STORE || window.CRISTIAN_STORE;
    if (!productModal || !store) return;
    const p = store.getProductById(productId);
    if (!p) return;

    activeModalProduct = p;

    if (modalImg) modalImg.src = p.imagen || 'assets/img/no-image.svg';
    if (modalCat) modalCat.textContent = p.categoria || 'Plata 925';
    if (modalTitle) modalTitle.textContent = p.nombre;
    if (modalPrice) modalPrice.textContent = store.formatPrice(p.precio);
    
    if (modalOldPrice) {
      if (p.precio_anterior) {
        modalOldPrice.textContent = store.formatPrice(p.precio_anterior);
        modalOldPrice.style.display = 'inline-block';
      } else {
        modalOldPrice.style.display = 'none';
      }
    }

    if (modalMaterial) modalMaterial.textContent = p.material || 'Plata Ley 925 Italiana Maciza';
    if (modalWeight) modalWeight.textContent = p.peso_aprox || 'Báscula Digital Verificada';
    if (modalCode) modalCode.textContent = p.codigo || 'FJ-925';
    const maxStock = typeof p.stock === 'number' ? Math.max(0, p.stock) : 99;
    const isOutOfStock = maxStock <= 0;
    const isSingleStock = maxStock === 1;

    if (modalStock) {
      if (isOutOfStock) {
        modalStock.textContent = 'Agotado en Taller';
        modalStock.style.color = '#dc2626';
      } else if (isSingleStock) {
        modalStock.textContent = '¡Última Pieza Disponible!';
        modalStock.style.color = '#ea580c';
      } else {
        modalStock.textContent = p.disponible ? `Disponible (${maxStock} piezas en stock)` : 'Bajo Confección';
        modalStock.style.color = '';
      }
    }
    if (modalDesc) modalDesc.textContent = p.descripcion_larga || p.descripcion_corta || 'Joya forjada en el taller de Frandhy Joyería en Santiago de los Caballeros.';

    if (modalWaBtn) {
      modalWaBtn.href = getWhatsAppProductUrl(p);
    }

    if (modalAddBagBtn) {
      if (isOutOfStock) {
        modalAddBagBtn.disabled = true;
        modalAddBagBtn.style.opacity = '0.45';
        modalAddBagBtn.style.cursor = 'not-allowed';
        modalAddBagBtn.innerHTML = '<i class="fa-solid fa-ban"></i> <span>Pieza Agotada</span>';
      } else {
        modalAddBagBtn.disabled = false;
        modalAddBagBtn.style.opacity = '';
        modalAddBagBtn.style.cursor = '';
        modalAddBagBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> <span>Agregar a mi Bolsa</span>';
        modalAddBagBtn.onclick = function () {
          addToCart(p.id, 1);
          closeProductModal();
        };
      }
    }

    productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (productModal) {
      productModal.classList.remove('open');
      document.body.style.overflow = '';
      activeModalProduct = null;
    }
  }

  // ========================================================================
  // 4. VALUE & TRUST CAROUSEL (RESPONSIVE SLIDER)
  // ========================================================================
  function initTrustCarousel() {
    const track = document.getElementById('trust-slider-track');
    const prevBtn = document.getElementById('trust-prev-btn');
    const nextBtn = document.getElementById('trust-next-btn');
    const dots = document.querySelectorAll('#trust-carousel-dots .trust-dot');

    if (!track) return;

    function getCardWidth() {
      const firstCard = track.querySelector('.trust-card');
      return firstCard ? firstCard.getBoundingClientRect().width + 18 : 308;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
      });
    }

    // Scroll sync for dots
    track.addEventListener('scroll', () => {
      const scrollPos = track.scrollLeft;
      const cardW = getCardWidth();
      const activeIdx = Math.round(scrollPos / cardW);

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    }, { passive: true });

    // Click on dots
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
        track.scrollTo({ left: idx * getCardWidth(), behavior: 'smooth' });
      });
    });
  }

  // ========================================================================
  // 5. EVENT LISTENERS & INITIALIZATION
  // ========================================================================
  function setupEvents() {
    // Nav Scroll Effect
    const siteNav = document.getElementById('site-nav');
    window.addEventListener('scroll', () => {
      if (siteNav) {
        siteNav.classList.toggle('scrolled', window.scrollY > 20);
      }
    }, { passive: true });

    // Search Bar Toggle
    if (navSearchBtn && navSearchBar) {
      navSearchBtn.addEventListener('click', () => {
        navSearchBar.classList.toggle('open');
        if (navSearchBar.classList.contains('open') && searchInput) {
          searchInput.focus();
        }
      });
    }

    // Search Input
    if (searchInput) {
      let debounce = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        searchQuery = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery ? 'inline-flex' : 'none';
        }
        debounce = setTimeout(renderCatalog, 250);
      });
    }

    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderCatalog();
        searchInput.focus();
      });
    }

    // Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-cat');
        filterByCategory(cat);
      });
    });

    // Category Cards in Section 3
    document.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-cat');
        filterByCategory(cat);
        const catalogEl = document.getElementById('catalogo');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Cart Drawer Open/Close
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
    if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', checkoutViaWhatsApp);

    // Modal Close
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    if (productModal) {
      productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
      });
    }

    // Mobile Drawer
    if (mobToggleBtn && mobDrawer && mobOverlay) {
      mobToggleBtn.addEventListener('click', () => {
        mobDrawer.classList.add('open');
        mobOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    function closeMobileMenu() {
      if (mobDrawer && mobOverlay) {
        mobDrawer.classList.remove('open');
        mobOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    if (mobCloseBtn) mobCloseBtn.addEventListener('click', closeMobileMenu);
    if (mobOverlay) mobOverlay.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('[data-close-mob]').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Escape Key Handler
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeProductModal();
        closeMobileMenu();
      }
    });

    // Fade In on Scroll (IntersectionObserver)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    } else {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }
  }

  // Workshop Custom Jewelry Carousel
  function initWorkshopCarousel() {
    const stage = document.querySelector('.workshop-carousel-stage');
    if (!stage) return;

    const slides = stage.querySelectorAll('.workshop-pendant-img');
    const dots = document.querySelectorAll('.workshop-dot');
    const badgeText = document.getElementById('workshop-badge-text');
    const prevBtn = document.getElementById('w-prev');
    const nextBtn = document.getElementById('w-next');
    if (!slides.length) return;

    const badges = [
      "Iniciales 'BP' a Medida",
      "Nombre 'GÉMINIS' Iced Out",
      "Medallón 'Triángulo & Ojo'",
      "'Bandido Al Fin' Iced Out"
    ];

    let currentIndex = 0;
    let timer = null;

    function getIntervalMs() {
      // 3.2 segundos en celular para que pase ágil y dinámico; 4.5s en desktop
      return window.innerWidth < 768 ? 3200 : 4500;
    }

    function showSlide(index) {
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;
      currentIndex = index;

      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      if (badgeText && badges[currentIndex]) {
        badgeText.textContent = badges[currentIndex];
      }
    }

    function startAutoSlide() {
      stopAutoSlide();
      timer = setInterval(() => {
        showSlide(currentIndex + 1);
      }, getIntervalMs());
    }

    function stopAutoSlide() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
        startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
        startAutoSlide();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        startAutoSlide();
      });
    });

    const showcase = document.querySelector('.workshop-img-showcase');
    if (showcase) {
      showcase.addEventListener('mouseenter', stopAutoSlide);
      showcase.addEventListener('mouseleave', startAutoSlide);

      // Deslizamiento táctil suave y rápido para celulares (Touch Swipe)
      let touchStartX = 0;
      let touchStartY = 0;

      showcase.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
        stopAutoSlide();
      }, { passive: true });

      showcase.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;

          // Si el movimiento es horizontal y mayor a 30px, cambiar de pieza
          if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              showSlide(currentIndex + 1); // Deslizar izquierda -> siguiente
            } else {
              showSlide(currentIndex - 1); // Deslizar derecha -> anterior
            }
          }
        }
        startAutoSlide();
      }, { passive: true });
    }

    startAutoSlide();
  }

  // Hallmark Bar Carousel (Mobile only — desktop stays flex row)
  function initHallmarkCarousel() {
    const cells = document.querySelectorAll('.hallmark-cell');
    const btnPrev = document.getElementById('hm-prev');
    const btnNext = document.getElementById('hm-next');
    if (!cells.length) return;

    let idx = 0;
    let timer = null;

    function showCell(i) {
      cells.forEach(function(c, j) { c.classList.toggle('hm-active', j === i); });
      idx = i;
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function() {
        showCell((idx + 1) % cells.length);
      }, 5000);
    }

    function goNext() {
      showCell((idx + 1) % cells.length);
      startTimer(); // reinicia el auto-timer al tocar flecha
    }

    function goPrev() {
      showCell((idx - 1 + cells.length) % cells.length);
      startTimer(); // reinicia el auto-timer al tocar flecha
    }

    function applyMode() {
      if (window.innerWidth >= 1024) {
        // Desktop: quitar active, let CSS handle flex layout
        clearInterval(timer);
        timer = null;
        cells.forEach(function(c) { c.classList.remove('hm-active'); });
      } else {
        // Mobile/Tablet: carousel
        showCell(idx);
        startTimer();
      }
    }

    // Wire arrows
    if (btnNext) btnNext.addEventListener('click', goNext);
    if (btnPrev) btnPrev.addEventListener('click', goPrev);

    applyMode();

    var resizeTO;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(applyMode, 150);
    });
  }

  // App Initialization
  function init() {
    updateCartUI();
    renderCatalog();
    initTrustCarousel();
    initWorkshopCarousel();
    initHallmarkCarousel();
    setupEvents();
  }

  // Exponer API Pública con ambos nombres para compatibilidad
  window.FRANDHY_APP = {
    addToCart,
    removeFromCart,
    updateItemQty,
    openCartDrawer,
    closeCartDrawer,
    openProductModal,
    closeProductModal,
    filterByCategory,
    renderCatalog
  };
  window.CRISTIAN_APP = window.FRANDHY_APP;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
