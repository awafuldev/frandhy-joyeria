/**
 * FRANDHY JOYERÍA — DATA LAYER & STORAGE ENGINE
 * "La Mina de Plata 925" · Santiago de los Caballeros, República Dominicana
 * Instagram Oficial: @frandhyjoyeria
 * Ubicación: Calle 30 de Marzo, Plaza 30 de Marzo, Local B (Frente a Banfondesa)
 * WhatsApp: (829) 370-7605 / (829) 379-7605
 */

(function () {
  'use strict';

  const PRODUCTS_KEY = 'frandhy_products_v2';
  const CONFIG_KEY = 'frandhy_config_v2';
  const CATEGORIES_KEY = 'frandhy_categories_v2';
  const AUTH_KEY = 'frandhy_admin_session_v2';
  const LOCKOUT_KEY = 'frandhy_admin_lockout_v2';

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos de bloqueo por seguridad
  const SESSION_TTL_MS = 4 * 60 * 60 * 1000;  // 4 horas de validez de sesión

  // Parámetros de clave por defecto ('admin123') usando PBKDF2-HMAC-SHA256 (100,000 iteraciones)
  // CERO contraseñas en texto plano almacenadas en la base de datos o localStorage
  const DEFAULT_PASS_SALT = '023793445ab840851c9c667ac741e276';
  const DEFAULT_PASS_HASH = '48ce568d7db5b27dcf11428603f158f8a46c16c71a5925739f3686fb970ca8a6';

  function defaultConfig() {
    return {
      nombre_sitio: 'Frandhy Joyería',
      slogan: 'La Mina de Plata 925 · Especialistas en Joyas Italianas',
      whatsapp: '18293707605',
      whatsapp_secundario: '18293797605',
      telefono: '(829) 370-7605 / (829) 379-7605',
      direccion: 'Calle 30 de Marzo, Plaza 30 de Marzo, Local B (Frente a Banfondesa), Santiago de los Caballeros, R.D.',
      horario: 'Lun–Sáb: 8:30 AM – 6:30 PM &bull; Envíos a todo RD y USA',
      instagram: 'frandhyjoyeria',
      instagram_url: 'https://www.instagram.com/frandhyjoyeria/',
      email: 'contacto@frandhyjoyeria.com',
      moneda: 'RD$',
      logo_url: 'assets/img/logo_frandhy.svg',
      admin_pass_salt: DEFAULT_PASS_SALT,
      admin_pass_hash: DEFAULT_PASS_HASH,
      custom_password_set: false,
      meta_descripcion: 'Frandhy Joyería en Santiago de los Caballeros. La mina de plata 925: cadenas cubanas Miami, guillos macizos, anillos iced out pavé, dijes con tu nombre calados a láser y orfebrería de alta ley.'
    };
  }

  function defaultCategories() {
    return [
      { id: 'cat-cadenas', nombre: 'Cadenas de Plata 925', slug: 'cadenas', icono: 'fa-link' },
      { id: 'cat-guillos', nombre: 'Guillos & Manillas', slug: 'guillos', icono: 'fa-circle-notch' },
      { id: 'cat-anillos', nombre: 'Anillos & Sellos', slug: 'anillos', icono: 'fa-ring' },
      { id: 'cat-dijes', nombre: 'Dijes & Nombres', slug: 'dijes', icono: 'fa-shield-halved' },
      { id: 'cat-aretes', nombre: 'Aretes & Huggies', slug: 'aretes', icono: 'fa-gem' },
      { id: 'cat-sets', nombre: 'Sets Exclusivos', slug: 'sets', icono: 'fa-layer-group' }
    ];
  }

  function seedProducts() {
    return [
      {
        id: 'fj-001',
        nombre: 'Cadena Cubana Miami Plata 925 Maciza (10mm)',
        codigo: 'FJ-CC925-10',
        categoria: 'Cadenas de Plata 925',
        categoria_slug: 'cadenas',
        precio: 14500,
        precio_anterior: 16800,
        material: 'Plata Ley 925 Italiana Maciza',
        acabado: 'Corte Diamante Espejo',
        peso_aprox: '76.0g',
        largo: '22 y 24 pulgadas',
        imagen: 'assets/img/products/silver_cuban_chain.jpg',
        stock: 6,
        destacado: true,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'La reina de las cadenas. Eslabón cubano plano biselado a diamante con broche de caja doble traba.',
        descripcion_larga: 'Pieza insignia de Frandhy Joyería "La Mina de Plata 925". Forjada con plata de ley 925 italiana auténtica. Cada eslabón tiene corte a diamante de 6 caras que refleja la luz como un espejo. Incluye certificado de autenticidad 925 y video de pesaje en báscula.'
      },
      {
        id: 'fj-002',
        nombre: 'Guillo Cubano Plata 925 con Broche de Caja (12mm)',
        codigo: 'FJ-GL925-12',
        categoria: 'Guillos & Manillas',
        categoria_slug: 'guillos',
        precio: 9800,
        precio_anterior: 11200,
        material: 'Plata Ley 925 Maciza',
        acabado: 'Pulido Espejo Italiano',
        peso_aprox: '48.5g',
        largo: '8.5 pulgadas',
        imagen: 'assets/img/products/silver_cuban_bracelet.jpg',
        stock: 8,
        destacado: true,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Guillo imponente de 12mm de grosor en plata sólida con cierre de seguridad hermético grabado 925.',
        descripcion_larga: 'Diseñado para destacar en la muñeca. Elaborado en plata de ley 925 maciza que no se decolora, resistente al uso diario, al agua y al sudor. Un clásico infaltable para caballeros.'
      },
      {
        id: 'fj-003',
        nombre: 'Cadena Tenis Iced Out Plata 925 con Circones',
        codigo: 'FJ-TN925-04',
        categoria: 'Cadenas de Plata 925',
        categoria_slug: 'cadenas',
        precio: 16500,
        precio_anterior: 18900,
        material: 'Plata 925 + Circones 4mm AAAAA',
        acabado: 'Engaste 4 Garras',
        peso_aprox: '38.0g',
        largo: '20 pulgadas',
        imagen: 'assets/img/products/silver_tennis_necklace.jpg',
        stock: 5,
        destacado: true,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Brillo deslumbrante estilo diamond chain con piedras montadas una a una sobre base de plata 925.',
        descripcion_larga: 'Circones corte brillante de alto destello montados en plata 925 hipoalergénica con broche de doble seguro.'
      },
      {
        id: 'fj-004',
        nombre: 'Dije con Nombre Personalizado en Plata 925',
        codigo: 'FJ-DJ925-NM',
        categoria: 'Dijes & Nombres',
        categoria_slug: 'dijes',
        precio: 4200,
        precio_anterior: 4800,
        material: 'Plata Ley 925 Maciza',
        acabado: 'Calado Láser y Pulido',
        peso_aprox: '8.5g - 14.0g',
        largo: 'Medida a elección',
        imagen: 'assets/img/products/silver_initial_charm.jpg',
        stock: 12,
        destacado: true,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Tu nombre, el de tus hijos o una palabra especial calada en chapa gruesa de plata 925 en nuestro taller de Santiago.',
        descripcion_larga: 'Fabricación artesanal con tecnología láser en nuestra tienda de Santiago de los Caballeros. Tiempo de entrega: 48 a 72 horas. Chapa gruesa que no se dobla ni se deforma con el uso.'
      },
      {
        id: 'fj-005',
        nombre: 'Anillo Sello Pavé Plata 925 Iced Out',
        codigo: 'FJ-AN925-PV',
        categoria: 'Anillos & Sellos',
        categoria_slug: 'anillos',
        precio: 5800,
        precio_anterior: 6500,
        material: 'Plata Ley 925 + Micro Circones',
        acabado: 'Micropavé Artesanal',
        peso_aprox: '16.2g',
        largo: 'Tallas 8 a 12 disponibles',
        imagen: 'assets/img/products/gold_signet_ring.jpg',
        stock: 7,
        destacado: true,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Anillo imponente de sello cuadrado con mesa repleta de micro circones brillantes engastados a mano.',
        descripcion_larga: 'Estructura sólida y cuerpo macizo forjado en plata 925. Ajuste anatómico cómodo para el dedo, no mancha la piel y mantiene su brillo radiante permanente.'
      },
      {
        id: 'fj-006',
        nombre: 'Aretes Huggies Plata 925 con Circones',
        codigo: 'FJ-AR925-HG',
        categoria: 'Aretes & Huggies',
        categoria_slug: 'aretes',
        precio: 3200,
        precio_anterior: 3800,
        material: 'Plata Ley 925 Hipoalergénica',
        acabado: 'Piedras Engastadas',
        peso_aprox: '6.4g (el par)',
        largo: '14mm diámetro',
        imagen: 'assets/img/products/silver_hoop_earrings.jpg',
        stock: 10,
        destacado: false,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Aros ajustados huggie en plata pura hipoalergénica. Ideales para uso diario continuo sin irritación.',
        descripcion_larga: 'Broche de clic seguro y cómodo. No se abren solos, resistentes al agua y al sudor. Circones transparentes de máximo brillo frontal.'
      },
      {
        id: 'fj-007',
        nombre: 'Set Cubano Cadena + Guillo Plata 925',
        codigo: 'FJ-SET925-CB',
        categoria: 'Sets Exclusivos',
        categoria_slug: 'sets',
        precio: 22500,
        precio_anterior: 25500,
        material: 'Plata Ley 925 Italiana Maciza',
        acabado: 'Corte Diamante a Juego',
        peso_aprox: '124.5g (total)',
        largo: 'Cadena 22" + Guillo 8.5"',
        imagen: 'assets/img/products/gold_cuban_set.jpg',
        stock: 3,
        destacado: true,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'El combo definitivo. Cadena de 10mm + Guillo de 12mm en plata italiana maciza con ahorro especial por set.',
        descripcion_larga: 'Ambas piezas forjadas con el mismo calibre y tono de plata para una combinación exacta y uniforme. Empaque premium de terciopelo incluido.'
      },
      {
        id: 'fj-008',
        nombre: 'Cadena Franco Plata 925 Maciza (6mm)',
        codigo: 'FJ-FR925-06',
        categoria: 'Cadenas de Plata 925',
        categoria_slug: 'cadenas',
        precio: 11200,
        precio_anterior: 12800,
        material: 'Plata Ley 925 Italiana',
        acabado: 'Eslabón Franco Cuadrado',
        peso_aprox: '52.0g',
        largo: '22 pulgadas',
        imagen: 'assets/img/products/gold_franco_chain.jpg',
        stock: 5,
        destacado: false,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Eslabón franco italiano de cuatro caras densas. La cadena más resistente a tirones del mercado.',
        descripcion_larga: 'Diseño geométrico que no se enreda y cae con perfecta fluidez sobre el pecho. Broche de langosta reforzado con contraste 925 e ITALY grabado.'
      },
      {
        id: 'fj-009',
        nombre: 'Dije Cruz Relieve Plata 925 con Circones',
        codigo: 'FJ-DJ925-CR',
        categoria: 'Dijes & Nombres',
        categoria_slug: 'dijes',
        precio: 4800,
        precio_anterior: 5500,
        material: 'Plata Ley 925 + Pavé',
        acabado: 'Efecto 3D Capas',
        peso_aprox: '15.4g',
        largo: '5.5cm alto',
        imagen: 'assets/img/products/gold_cross_pendant.jpg',
        stock: 6,
        destacado: false,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Cruz clásica con reasa ancha compatible con cadenas cubanas de hasta 12mm de grosor.',
        descripcion_larga: 'Cruz tridimensional con base biselada y detalles centrales con incrustaciones de circones brillantes. Dorso liso pulido a espejo.'
      },
      {
        id: 'fj-010',
        nombre: 'Cadena Cordón Salomónico Plata 925 (Rope Chain)',
        codigo: 'FJ-RP925-05',
        categoria: 'Cadenas de Plata 925',
        categoria_slug: 'cadenas',
        precio: 8900,
        precio_anterior: 9900,
        material: 'Plata Ley 925 Italiana',
        acabado: 'Corte Diamante Espiral',
        peso_aprox: '36.5g',
        largo: '24 pulgadas',
        imagen: 'assets/img/products/gold_rope_chain.jpg',
        stock: 6,
        destacado: false,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Eslabón de soga trenzada de 5mm con torsión continua que refleja la luz desde cualquier ángulo.',
        descripcion_larga: 'Un diseño atemporal de la orfebrería italiana. Ideal para lucir sola o combinada con dijes pesados. Cierre de seguridad reforzado con sello 925.'
      },
      {
        id: 'fj-011',
        nombre: 'Guillo de Eslabón Fígaro 3x1 Plata 925',
        codigo: 'FJ-GL925-FG',
        categoria: 'Guillos & Manillas',
        categoria_slug: 'guillos',
        precio: 6500,
        precio_anterior: 7400,
        material: 'Plata Ley 925 Italiana',
        acabado: 'Corte Diamante Plano',
        peso_aprox: '28.0g',
        largo: '8.5 pulgadas',
        imagen: 'assets/img/products/gold_cuban_bracelet.jpg',
        stock: 7,
        destacado: false,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Secuencia clásica de tres eslabones cortos y uno alargado, con cantos biselados y broche de langosta.',
        descripcion_larga: 'Clásico diseño italiano fabricado en plata 925 genuina. Liviano en la muñeca pero de presencia sólida y masculina.'
      },
      {
        id: 'fj-012',
        nombre: 'Anillo Corona Imperial Plata 925',
        codigo: 'FJ-AN925-CR',
        categoria: 'Anillos & Sellos',
        categoria_slug: 'anillos',
        precio: 4900,
        precio_anterior: 5600,
        material: 'Plata Ley 925',
        acabado: 'Relieve y Circones',
        peso_aprox: '12.8g',
        largo: 'Tallas 7 a 11 disponibles',
        imagen: 'assets/img/products/gold_hoop_earrings.jpg',
        stock: 5,
        destacado: false,
        nuevo: true,
        disponible: true,
        descripcion_corta: 'Diseño de corona real detallada con puntas coronadas en circones brillantes sobre banda maciza.',
        descripcion_larga: 'Pieza representativa de estatus y elegancia. Fundición en plata de ley 925 con acabado satinado interior para máximo confort.'
      },
      {
        id: 'fj-013',
        nombre: 'Dije Medalla San Judas Tadeo Plata 925',
        codigo: 'FJ-DJ925-SJ',
        categoria: 'Dijes & Nombres',
        categoria_slug: 'dijes',
        precio: 5200,
        precio_anterior: 6000,
        material: 'Plata Ley 925 Maciza',
        acabado: 'Alto Relieve Esculpido',
        peso_aprox: '18.0g',
        largo: '6.0cm con reasa',
        imagen: 'assets/img/products/gold_jesus_pendant.jpg',
        stock: 4,
        destacado: true,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Dije de devoción y protección con figura en alto relieve y reasa reforzada para cadenas de eslabón pesado.',
        descripcion_larga: 'Escultura detallada en plata maciza que representa a San Judas Tadeo con manto texturizado y reasa grabada con el sello de pureza 925.'
      },
      {
        id: 'fj-014',
        nombre: 'Dormilonas Redondas Circones 6mm Plata 925',
        codigo: 'FJ-AR925-DM',
        categoria: 'Aretes & Huggies',
        categoria_slug: 'aretes',
        precio: 2800,
        precio_anterior: 3400,
        material: 'Plata Ley 925 Hipoalergénica',
        acabado: 'Circones AAAAA 6 Garras',
        peso_aprox: '3.8g (el par)',
        largo: '6mm de diámetro',
        imagen: 'assets/img/products/silver_hoop_earrings.jpg',
        stock: 14,
        destacado: false,
        nuevo: false,
        disponible: true,
        descripcion_corta: 'Solitarias con piedra de corte brillante redondo y tuerca mariposa de presión firme.',
        descripcion_larga: 'Básico indispensable tanto para damas como caballeros. Piedra limpia sin imperfecciones y plata hipoalergénica libre de níquel.'
      }
    ];
  }

  // ========================================================================
  // CRIPTOGRAFÍA & SEGURIDAD COMERCIAL (PBKDF2-HMAC-SHA256 / 100,000 Iteraciones)
  // Protección contra filtraciones, ataques de fuerza bruta y ataques de tiempo
  // ========================================================================
  function buf2hex(buf) {
    const bytes = new Uint8Array(buf);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  function hex2buf(hexString) {
    const matches = hexString.match(/.{1,2}/g) || [];
    return new Uint8Array(matches.map(b => parseInt(b, 16)));
  }

  function generateRandomSalt(bytesCount) {
    const len = bytesCount || 16;
    const arr = new Uint8Array(len);
    try {
      const cryptoObj = (typeof window !== 'undefined' && window.crypto) ? window.crypto : (typeof crypto !== 'undefined' ? (crypto.webcrypto || crypto) : null);
      if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
        cryptoObj.getRandomValues(arr);
        return buf2hex(arr);
      }
    } catch (_) {}
    for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256);
    return buf2hex(arr);
  }

  async function computePBKDF2Hash(password, saltHex) {
    const enc = new TextEncoder();
    const saltBytes = hex2buf(saltHex || DEFAULT_PASS_SALT);
    const subtleObj = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle)
      ? window.crypto.subtle
      : (typeof crypto !== 'undefined' && crypto.webcrypto && crypto.webcrypto.subtle ? crypto.webcrypto.subtle : null);

    if (subtleObj && subtleObj.deriveBits) {
      const keyMat = await subtleObj.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedBits = await subtleObj.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMat,
        256
      );
      return buf2hex(derivedBits);
    }
    throw new Error('WebCrypto no disponible en este entorno');
  }

  function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  function getLockoutStatus() {
    try {
      const raw = localStorage.getItem(LOCKOUT_KEY);
      if (!raw) return { locked: false, attempts: 0, attemptsLeft: MAX_LOGIN_ATTEMPTS, remainingMs: 0 };
      const data = JSON.parse(raw);
      const now = Date.now();
      if (data.lockoutUntil && data.lockoutUntil > now) {
        return {
          locked: true,
          attempts: data.attempts || MAX_LOGIN_ATTEMPTS,
          attemptsLeft: 0,
          remainingMs: data.lockoutUntil - now
        };
      }
      if (data.lockoutUntil && data.lockoutUntil <= now) {
        localStorage.removeItem(LOCKOUT_KEY);
        return { locked: false, attempts: 0, attemptsLeft: MAX_LOGIN_ATTEMPTS, remainingMs: 0 };
      }
      const attempts = data.attempts || 0;
      return {
        locked: false,
        attempts: attempts,
        attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
        remainingMs: 0
      };
    } catch (e) {
      return { locked: false, attempts: 0, attemptsLeft: MAX_LOGIN_ATTEMPTS, remainingMs: 0 };
    }
  }

  function recordFailedAttempt() {
    const status = getLockoutStatus();
    const attempts = status.attempts + 1;
    const now = Date.now();
    let lockoutUntil = 0;
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      lockoutUntil = now + LOCKOUT_DURATION_MS;
    }
    const data = {
      attempts: attempts,
      lockoutUntil: lockoutUntil,
      lastAttempt: now
    };
    try {
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
    } catch (_) {}
    return getLockoutStatus();
  }

  function resetLockout() {
    try {
      localStorage.removeItem(LOCKOUT_KEY);
    } catch (_) {}
  }

  const FRANDHY_STORE = {
    // Configuración
    getConfig: function () {
      try {
        const raw = localStorage.getItem(CONFIG_KEY);
        let cfg = raw ? Object.assign(defaultConfig(), JSON.parse(raw)) : defaultConfig();
        // Migración de seguridad: si existía clave en texto plano, migrar y eliminarla permanentemente
        if (cfg.admin_pass) {
          if (!cfg.admin_pass_hash || cfg.admin_pass_hash === DEFAULT_PASS_HASH) {
            if (cfg.admin_pass === 'admin123') {
              cfg.admin_pass_salt = DEFAULT_PASS_SALT;
              cfg.admin_pass_hash = DEFAULT_PASS_HASH;
            }
          }
          delete cfg.admin_pass;
          try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
          } catch (_) {}
        }
        return cfg;
      } catch (e) {
        return defaultConfig();
      }
    },

    saveConfig: function (cfg) {
      if (cfg && cfg.admin_pass) delete cfg.admin_pass; // Cero contraseñas en texto plano
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      return cfg;
    },

    // Categorías
    getCategories: function () {
      try {
        const raw = localStorage.getItem(CATEGORIES_KEY);
        return raw ? JSON.parse(raw) : defaultCategories();
      } catch (e) {
        return defaultCategories();
      }
    },

    saveCategories: function (cats) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
      return cats;
    },

    // Productos
    getProducts: function () {
      try {
        const raw = localStorage.getItem(PRODUCTS_KEY);
        return raw ? JSON.parse(raw) : seedProducts();
      } catch (e) {
        return seedProducts();
      }
    },

    saveProducts: function (products) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return products;
    },

    getProductById: function (id) {
      const all = this.getProducts();
      return all.find(p => String(p.id) === String(id)) || null;
    },

    addProduct: function (product) {
      const all = this.getProducts();
      if (!product.id) {
        product.id = 'fj-' + Date.now().toString(36);
      }
      product.created_at = new Date().toISOString();
      all.unshift(product);
      this.saveProducts(all);
      return product;
    },

    updateProduct: function (id, updates) {
      const all = this.getProducts();
      const idx = all.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) {
        all[idx] = Object.assign({}, all[idx], updates, { updated_at: new Date().toISOString() });
        this.saveProducts(all);
        return all[idx];
      }
      return null;
    },

    saveProduct: function (product) {
      if (product.id) {
        const existing = this.getProductById(product.id);
        if (existing) {
          return this.updateProduct(product.id, product);
        }
      }
      return this.addProduct(product);
    },

    deleteProduct: function (id) {
      let all = this.getProducts();
      all = all.filter(p => String(p.id) !== String(id));
      this.saveProducts(all);
      return true;
    },

    addCategory: function (cat) {
      const cats = this.getCategories();
      if (!cat.id) cat.id = 'cat-' + Date.now().toString(36);
      if (!cat.slug && cat.nombre) {
        cat.slug = cat.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      cats.push(cat);
      this.saveCategories(cats);
      return cat;
    },

    deleteCategory: function (id) {
      const cats = this.getCategories().filter(c => String(c.id) !== String(id));
      this.saveCategories(cats);
      return true;
    },

    resetToSeed: function () {
      const seeds = seedProducts();
      this.saveProducts(seeds);
      this.saveCategories(defaultCategories());
      this.saveConfig(defaultConfig());
      return seeds;
    },

    formatPrice: function (amount) {
      if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
      return 'RD$ ' + amount.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },

    // Autenticación de panel y seguridad comercial
    isAdminAuthed: function () {
      try {
        const raw = sessionStorage.getItem(AUTH_KEY);
        if (!raw) return false;
        if (raw === 'true') return true; // Compatibilidad de sesión anterior
        const session = JSON.parse(raw);
        if (session && session.token && session.expires_at) {
          if (Date.now() < session.expires_at) {
            return true;
          }
        }
        sessionStorage.removeItem(AUTH_KEY);
        return false;
      } catch (e) {
        sessionStorage.removeItem(AUTH_KEY);
        return false;
      }
    },

    setAdminAuthed: function (val) {
      if (val) {
        const sessionData = {
          token: generateRandomSalt(32),
          created_at: Date.now(),
          expires_at: Date.now() + SESSION_TTL_MS
        };
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
      } else {
        sessionStorage.removeItem(AUTH_KEY);
      }
    },

    logoutAdmin: function () {
      sessionStorage.removeItem(AUTH_KEY);
    },

    getLockoutStatus: function () {
      return getLockoutStatus();
    },

    resetLockout: function () {
      resetLockout();
    },

    isDefaultPassword: function () {
      const cfg = this.getConfig();
      if (cfg.custom_password_set === true) return false;
      if (cfg.admin_pass_hash && cfg.admin_pass_hash !== DEFAULT_PASS_HASH) return false;
      return true;
    },

    loginAdmin: async function (pass) {
      const lockout = getLockoutStatus();
      if (lockout.locked) {
        return {
          success: false,
          locked: true,
          remainingMs: lockout.remainingMs,
          message: 'Acceso bloqueado por seguridad. Demasiados intentos fallidos.'
        };
      }

      // Si ya se ha configurado una clave personalizada, 'admin123' queda completamente inhabilitada
      if (!this.isDefaultPassword() && pass === 'admin123') {
        const newStatus = recordFailedAttempt();
        if (newStatus.locked) {
          return {
            success: false,
            locked: true,
            remainingMs: newStatus.remainingMs,
            message: 'Has alcanzado 5 intentos fallidos. Panel bloqueado por 5 minutos por seguridad.'
          };
        } else {
          return {
            success: false,
            locked: false,
            attemptsLeft: newStatus.attemptsLeft,
            message: 'La contraseña por defecto admin123 ya no es válida. Debes ingresar tu contraseña personalizada.'
          };
        }
      }

      const cfg = this.getConfig();
      const salt = cfg.admin_pass_salt || DEFAULT_PASS_SALT;
      const expectedHash = cfg.admin_pass_hash || DEFAULT_PASS_HASH;

      let computed;
      try {
        computed = await computePBKDF2Hash(pass, salt);
      } catch (err) {
        console.error('Error de seguridad al derivar clave:', err);
        return {
          success: false,
          locked: false,
          message: 'Error de verificación de seguridad en el navegador.'
        };
      }

      if (timingSafeEqual(computed, expectedHash)) {
        resetLockout();
        this.setAdminAuthed(true);
        return { success: true };
      } else {
        const newStatus = recordFailedAttempt();
        if (newStatus.locked) {
          return {
            success: false,
            locked: true,
            remainingMs: newStatus.remainingMs,
            message: 'Has alcanzado 5 intentos fallidos. Panel bloqueado por 5 minutos por seguridad bancaria.'
          };
        } else {
          return {
            success: false,
            locked: false,
            attemptsLeft: newStatus.attemptsLeft,
            message: 'Contraseña incorrecta. Te quedan ' + newStatus.attemptsLeft + ' intento(s) antes del bloqueo temporal.'
          };
        }
      }
    },

    setNewPassword: async function (newPassword) {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }
      const newSalt = generateRandomSalt(16);
      const newHash = await computePBKDF2Hash(newPassword, newSalt);
      const cfg = this.getConfig();
      cfg.admin_pass_salt = newSalt;
      cfg.admin_pass_hash = newHash;
      cfg.custom_password_set = true;
      delete cfg.admin_pass; // Eliminar siempre texto plano
      this.saveConfig(cfg);
      return true;
    }
  };

  // Exponer globalmente con ambos nombres para compatibilidad
  window.FRANDHY_STORE = FRANDHY_STORE;
  window.CRISTIAN_STORE = FRANDHY_STORE;

  // Auto inicializar si no existe
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    FRANDHY_STORE.resetToSeed();
  }
  if (!localStorage.getItem(CONFIG_KEY)) {
    FRANDHY_STORE.saveConfig(defaultConfig());
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    FRANDHY_STORE.saveCategories(defaultCategories());
  }
})();
