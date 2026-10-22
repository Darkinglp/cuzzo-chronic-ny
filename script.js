window.addEventListener('DOMContentLoaded', () => {
  // ==========================================================
  // CONFIGURACIÓN DEL CLIENTE (WHATSAPP + BASE DE DATOS OPCIONAL)
  // ==========================================================
  const CLIENT_WHATSAPP_NUMBER = "12125550199"; // Número real de EE. UU. (+1)
  const FORMSPREE_ENDPOINT = ""; // Opcional: URL de Getform.io o Formspree.io

  const canvas = document.getElementById('smoke-canvas');
  const ctx = canvas.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const mainScene = document.getElementById('main-scene');
  const viewport = document.getElementById('camera-viewport');
  const tableSurface = document.getElementById('table-surface');
  const spotlight = document.getElementById('table-spotlight');

  // ==========================================================
  // 1. CANVAS AMBIENTAL: TRICOMAS + LÁMINAS DE PAPEL + HUMO AL HACER SCROLL
  // ==========================================================
  const triCanvas = document.getElementById('trichome-canvas');
  const triCtx = triCanvas.getContext('2d');
  let particles = [];
  let rollingPapers = [];
  let scrollSmokePuffs = [];

  function resizeCanvases() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    triCanvas.width = window.innerWidth;
    triCanvas.height = window.innerHeight;
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  // Buffer de textura suave de humo para tanto la intro como el scroll
  const puffCanvas = document.createElement('canvas');
  const puffCtx = puffCanvas.getContext('2d');
  const puffSize = 256;
  puffCanvas.width = puffSize;
  puffCanvas.height = puffSize;

  function generateSmokeTexture() {
    const half = puffSize / 2;
    const blobs = [
      { x: half, y: half, r: half * 0.75, a: 0.28 },
      { x: half * 0.8, y: half * 0.9, r: half * 0.55, a: 0.2 },
      { x: half * 1.2, y: half * 1.1, r: half * 0.5, a: 0.18 },
      { x: half * 1.1, y: half * 0.8, r: half * 0.45, a: 0.15 }
    ];
    blobs.forEach(b => {
      const grad = puffCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, `rgba(230, 240, 235, ${b.a})`);
      grad.addColorStop(0.45, `rgba(195, 210, 200, ${b.a * 0.6})`);
      grad.addColorStop(0.8, `rgba(150, 165, 155, ${b.a * 0.2})`);
      grad.addColorStop(1, 'rgba(150, 165, 155, 0)');
      puffCtx.fillStyle = grad;
      puffCtx.beginPath();
      puffCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      puffCtx.fill();
    });
  }
  generateSmokeTexture();

  // Partículas de polen dorado y tricomas
  for (let i = 0; i < 38; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.3 ? '#d4af37' : '#4ade80'
    });
  }

  // "Láminas" / Hojillas de papel de cáñamo orgánico flotando en 3D con el scroll
  for (let i = 0; i < 9; i++) {
    rollingPapers.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: 36 + Math.random() * 22,
      h: 14 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.25,
      alpha: 0.12 + Math.random() * 0.14
    });
  }

  // Detector de Scroll para disparar humo interactivo y mover las láminas
  let lastScrollY = window.scrollY;
  const smokeCurtainLeft = document.getElementById('smoke-curtain-left');
  const smokeCurtainRight = document.getElementById('smoke-curtain-right');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Al hacer scroll, generamos nubes de humo suaves que cruzan la pantalla
    if (Math.abs(delta) > 4 && scrollSmokePuffs.length < 18) {
      scrollSmokePuffs.push({
        x: Math.random() * triCanvas.width,
        y: delta > 0 ? triCanvas.height + 60 : -60,
        vx: (Math.random() - 0.5) * 1.8,
        vy: delta > 0 ? -(2 + Math.random() * 3) : (2 + Math.random() * 3),
        size: 180 + Math.random() * 140,
        rotation: Math.random() * Math.PI * 2,
        opacity: 0.22,
        life: 0,
        maxLife: 90
      });
    }

    // Mover las láminas flotantes con efecto parallax al bajar
    rollingPapers.forEach(rp => {
      rp.y -= delta * 0.18;
      rp.angle += delta * 0.002;
      if (rp.y < -50) rp.y = triCanvas.height + 40;
      if (rp.y > triCanvas.height + 50) rp.y = -40;
    });

    // Abrir las cortinas de humo en la sección de láminas
    if (smokeCurtainLeft && smokeCurtainRight) {
      const shift = Math.min(120, currentScrollY * 0.15);
      smokeCurtainLeft.style.transform = `translateX(-${shift}px)`;
      smokeCurtainRight.style.transform = `translateX(${shift}px)`;
    }
  }, { passive: true });

  function renderAmbientAndScrollFX() {
    triCtx.clearRect(0, 0, triCanvas.width, triCanvas.height);

    // 1. Dibujar polen dorado y tricomas
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) p.y = triCanvas.height;
      if (p.x < 0) p.x = triCanvas.width;
      if (p.x > triCanvas.width) p.x = 0;

      triCtx.save();
      triCtx.globalAlpha = p.alpha;
      triCtx.fillStyle = p.color;
      triCtx.shadowBlur = 8;
      triCtx.shadowColor = p.color;
      triCtx.beginPath();
      triCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      triCtx.fill();
      triCtx.restore();
    });

    // 2. Dibujar las "Láminas" (Papeles de enrolar traslúcidos con filo dorado)
    rollingPapers.forEach(rp => {
      rp.x += rp.vx;
      rp.y += rp.vy;
      rp.angle += rp.rotSpeed;
      if (rp.y < -50) rp.y = triCanvas.height + 40;
      if (rp.x < -50) rp.x = triCanvas.width + 40;
      if (rp.x > triCanvas.width + 50) rp.x = -40;

      triCtx.save();
      triCtx.translate(rp.x, rp.y);
      triCtx.rotate(rp.angle);
      triCtx.globalAlpha = rp.alpha;
      // Cuerpo del papel de cáñamo orgánico
      triCtx.fillStyle = '#d6b485';
      triCtx.strokeStyle = '#d4af37';
      triCtx.lineWidth = 1;
      triCtx.beginPath();
      triCtx.roundRect(-rp.w / 2, -rp.h / 2, rp.w, rp.h, 3);
      triCtx.fill();
      triCtx.stroke();
      // Banda de goma dorada característica de la lámina
      triCtx.fillStyle = '#f5e6b3';
      triCtx.fillRect(-rp.w / 2, -rp.h / 2, rp.w, 3);
      triCtx.restore();
    });

    // 3. Dibujar volutas de humo reactivas cuando el usuario hace scroll
    for (let i = scrollSmokePuffs.length - 1; i >= 0; i--) {
      const sp = scrollSmokePuffs[i];
      sp.life++;
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.size += 1.2;
      sp.rotation += 0.008;
      const prog = sp.life / sp.maxLife;
      const alpha = (1 - prog) * sp.opacity;

      if (sp.life >= sp.maxLife || alpha <= 0.01) {
        scrollSmokePuffs.splice(i, 1);
        continue;
      }

      triCtx.save();
      triCtx.translate(sp.x, sp.y);
      triCtx.rotate(sp.rotation);
      triCtx.globalAlpha = alpha;
      triCtx.drawImage(puffCanvas, -sp.size / 2, -sp.size / 2, sp.size, sp.size);
      triCtx.restore();
    }

    requestAnimationFrame(renderAmbientAndScrollFX);
  }
  renderAmbientAndScrollFX();

  // Observador para animar las láminas y bloques de historia cuando entran en pantalla
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================================
  // 2. MOTOR MATEMÁTICO DE HUMO DENSO INICIAL
  // ==========================================================
  class MachinePuff {
    constructor() { this.init(); }
    init() {
      const nozzleSpread = canvas.width * 0.6;
      this.x = (canvas.width / 2 - nozzleSpread / 2) + Math.random() * nozzleSpread;
      this.y = canvas.height + 40 + Math.random() * 80;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = -(4.5 + Math.random() * 6);
      this.size = 150 + Math.random() * 90;
      this.growth = 1.3 + Math.random() * 1.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.015;
      this.life = 0;
      this.maxLife = 220 + Math.random() * 80;
      this.opacity = 0;
    }
    update() {
      this.life++;
      this.vx *= 0.985;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;
      this.size += this.growth;
      this.rotation += this.rotSpeed;
      const progress = this.life / this.maxLife;
      this.opacity = progress < 0.2 ? (progress / 0.2) * 0.85 : (1 - (progress - 0.2) / 0.8) * 0.85;
      if (this.life >= this.maxLife || this.opacity <= 0.01) this.init();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.drawImage(puffCanvas, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  const puffs = [];
  for (let i = 0; i < 60; i++) {
    const p = new MachinePuff();
    p.life = Math.random() * p.maxLife * 0.4;
    puffs.push(p);
  }

  let animationFrame;
  function renderSmoke() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    puffs.forEach(p => { p.update(); p.draw(); });
    animationFrame = requestAnimationFrame(renderSmoke);
  }
  renderSmoke();

  // ==========================================================
  // 3. VERIFICACIÓN DE EDAD (21+) Y CENTRADO EN CELULAR
  // ==========================================================
  const ageGate = document.getElementById('age-gate');
  const btnAgeYes = document.getElementById('btn-age-yes');
  const btnAgeNo = document.getElementById('btn-age-no');
  const ageErrorMsg = document.getElementById('age-error-msg');

  btnAgeYes.addEventListener('click', () => {
    ageGate.classList.add('hidden');
    setTimeout(() => {
      introScreen.style.opacity = '0';
      setTimeout(() => {
        introScreen.style.display = 'none';
        cancelAnimationFrame(animationFrame);
        mainScene.classList.add('visible');
        centerTableOnMobile();
      }, 1000);
    }, 2200);
  });

  btnAgeNo.addEventListener('click', () => {
    ageErrorMsg.style.display = 'block';
  });

  if (tableSurface && spotlight) {
    tableSurface.addEventListener('mousemove', (e) => {
      const rect = tableSurface.getBoundingClientRect();
      spotlight.style.left = `${e.clientX - rect.left}px`;
      spotlight.style.top = `${e.clientY - rect.top}px`;
    });
  }

  function centerTableOnMobile() {
    if (window.innerWidth <= 900 && viewport) {
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    }
  }
  window.addEventListener('resize', centerTableOnMobile);

  // ==========================================================
  // 4. CATÁLOGO COMPLETO CON TODOS LOS PRODUCTOS
  // ==========================================================
  function createWhatsAppLink(itemName, categoryType) {
    const chillMessage = `Yo Cuzzo Chronic fam! 🗽🌱 Just checked out your interactive rolling tray and I'm really vibing with the *${itemName}* (${categoryType}). Love that you guys grow in Living Soil and keep the real NY classics alive. Can I get more info on this harvest?`;
    return `https://wa.me/${CLIENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(chillMessage)}`;
  }

  const catalogData = {
    "Jack Herer (House Favorite)": {
      title: "Jack Herer — Personal House Favorite",
      desc: "Grown the natural way in living soil. Sativa, Hybrid, and Indica should be more than just labels on a package—this is authentic old-school character.",
      items: [
        {
          name: "Jack Herer — Reserve Living Soil Flower",
          badge: "SATIVA LEGEND",
          genetics: "Haze Hybrid × Northern Lights #5 × Shiva Skunk",
          desc: "Our crown jewel. Frosted buds bursting with spicy pine, herbal warmth, and that clear-headed, creative New York energy.",
          image: "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Jack Herer — Hand-Rolled Craft Pre-Roll Pack",
          badge: "WHOLE FLOWER",
          genetics: "100% Whole Bud • Zero Shake or Trim",
          desc: "Rolled in organic unbleached hemp paper with glass tips so you taste the living soil terpenes from the very first pull.",
          image: "https://images.unsplash.com/photo-1589140915708-20ff586fe767?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    "Old-School Classics": {
      title: "Keeping the Classics Alive",
      desc: "We got tired of seeing the same recycled strains and fancy names that never lived up to the hype. Here are the true legends that made us fall in love with flower.",
      items: [
        {
          name: "Blue Dream — Old-School Cut",
          badge: "CLASSIC HYBRID",
          genetics: "Blueberry × Original Haze (Living Soil)",
          desc: "Sweet wild berry aroma with smooth, balanced full-body relaxation and gentle cerebral inspiration.",
          image: "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Lemon Haze — Zesty NY Harvest",
          badge: "SATIVA DOMINANT",
          genetics: "Lemon Skunk × Silver Haze",
          desc: "Vibrant citrus peel aroma, golden trichomes, and an unmistakable energetic vibe grown with genuine family care.",
          image: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "OG Kush — Authentic Roots",
          badge: "HERITAGE HYBRID",
          genetics: "Chemdawg × Lemon Thai × Hindu Kush",
          desc: "Gassy, earthy, and piney. No shortcuts—just the heavy, dank aroma true connoisseurs respect.",
          image: "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Granddaddy Purple (GDP)",
          badge: "PURE INDICA",
          genetics: "Mendo Purps × Skunk × Afghanistan",
          desc: "Deep royal purple hues and sweet grape-berry notes. The ultimate nighttime classic grown from seed to soil.",
          image: "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    "Artisanal Edibles": {
      title: "Small-Batch Craft Edibles",
      desc: "Infused with solventless rosin pressed directly from our living soil flower. Full-spectrum effects with true strain character.",
      items: [
        {
          name: "Cuzzo Solventless Live Rosin Chews",
          badge: "FULL SPECTRUM",
          genetics: "Infused with Blue Dream & Lemon Haze Rosin",
          desc: "Handcrafted wild berry & citrus pectin gummies. Clean ingredients, rich natural fruit, and zero distillate aftertaste.",
          image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "70% Dark Chocolate Gold-Leaf Bar",
          badge: "ARTISANAL BAR",
          genetics: "Single-Origin Cacao × OG Kush Infusion",
          desc: "Velvety dark chocolate crafted in small NY batches, finished with edible gold flakes and slow-acting full-body warmth.",
          image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Raw NY Wildflower Infused Honey",
          badge: "ORGANIC INFUSION",
          genetics: "Local NY Honey × Jack Herer Terpenes",
          desc: "Perfect for your morning tea or evening unwind. Pure botanical synergy straight from the family harvest.",
          image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=400&q=80"
        }
      ]
    },
    "The Living Soil Difference": {
      title: "What We Do — Our Roots & Living Soil",
      desc: "Rooted in Quality. Grown with Love. Keeping the Classics Alive.",
      items: [
        {
          name: "Chat Directly With the Cuzzo Family",
          badge: "NY ROOTS",
          genetics: "Family-Owned & Operated in New York",
          desc: "Have questions about our living soil process or current batch availability? Hit us up on WhatsApp.",
          image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80"
        }
      ]
    }
  };

  // Modal de catálogo
  const modalHTML = `
    <div class="store-modal-overlay" id="store-modal">
      <div class="store-modal-content">
        <button class="modal-close-btn" id="modal-close">&times;</button>
        <div class="modal-header">
          <h2 id="modal-title">Title</h2>
          <p id="modal-desc">Description</p>
        </div>
        <div class="modal-products-grid" id="modal-products-list"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const items = document.querySelectorAll('.interactive-item');
  const hudEyebrow = document.getElementById('hud-eyebrow');
  const hudTitle = document.getElementById('hud-title');
  const hudDesc = document.getElementById('hud-desc');
  const hudLink = document.getElementById('hud-link');

  const modal = document.getElementById('store-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalProductsList = document.getElementById('modal-products-list');

  let activeCategoryName = "Jack Herer (House Favorite)";

  function updateHUD(item) {
    items.forEach(i => i.classList.remove('active-item'));
    item.classList.add('active-item');
    const category = item.getAttribute('data-category');
    const desc = item.getAttribute('data-desc');
    activeCategoryName = category;

    if (hudEyebrow) hudEyebrow.textContent = "SELECTED ON THE TRAY";
    if (hudTitle) hudTitle.textContent = category;
    if (hudDesc) hudDesc.textContent = desc;
    if (hudLink) {
      hudLink.textContent = category === "VIP Membership" ? "Open VIP Vault" : `Inspect Selection`;
    }
  }

  function scrollToMembership() {
    modal.classList.remove('active');
    const vaultSection = document.getElementById('membership-vault');
    if (vaultSection) {
      vaultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => updateHUD(item));
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      updateHUD(item);
      if (activeCategoryName === "VIP Membership") {
        scrollToMembership();
      } else {
        openCatalogModal(activeCategoryName);
      }
    });
  });

  if (hudLink) {
    hudLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (activeCategoryName === "VIP Membership") {
        scrollToMembership();
      } else {
        openCatalogModal(activeCategoryName);
      }
    });
  }

  // También si hacen clic en cualquiera de las 3 Láminas coleccionables al bajar, abre el catálogo correspondiente
  document.querySelectorAll('.lamina-sheet').forEach((sheet, idx) => {
    sheet.style.cursor = 'pointer';
    sheet.addEventListener('click', () => {
      if (idx === 0) openCatalogModal("Jack Herer (House Favorite)");
      else openCatalogModal("Old-School Classics");
    });
  });

  function openCatalogModal(categoryKey) {
    const data = catalogData[categoryKey] || catalogData["Jack Herer (House Favorite)"];
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;

    modalProductsList.innerHTML = '';
    data.items.forEach(prod => {
      const waUrl = createWhatsAppLink(prod.name, categoryKey);
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-thumb-wrapper">
          <img src="${prod.image}" alt="${prod.name}" loading="lazy" />
          <span class="strain-badge">${prod.badge}</span>
        </div>
        <div class="product-info">
          <h4>${prod.name}</h4>
          <span class="product-genetics">🌱 ${prod.genetics}</span>
          <p>${prod.desc}</p>
        </div>
        <div class="product-actions-col">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-inquire-btn">
            💬 Ask on WhatsApp
          </a>
        </div>
      `;
      modalProductsList.appendChild(card);
    });

    modal.classList.add('active');
  }

  modalClose.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // ==========================================================
  // 5. TARJETA VIP EN VIVO + SUBIDA DE FOTO DE ID
  // ==========================================================
  const memNameInput = document.getElementById('mem-name');
  const memAddressInput = document.getElementById('mem-address');
  const liveCardName = document.getElementById('live-card-name');
  const liveCardAddress = document.getElementById('live-card-address');
  const liveCardIdStatus = document.getElementById('live-card-id-status');
  const liveCardCode = document.getElementById('live-card-code');

  const idUploadZone = document.getElementById('id-upload-zone');
  const idFileInput = document.getElementById('mem-id-pic');
  const idPlaceholder = document.getElementById('id-upload-placeholder');
  const idPreviewContainer = document.getElementById('id-preview-container');
  const idPreviewImg = document.getElementById('id-preview-img');
  const idFilename = document.getElementById('id-filename');
  const changeIdBtn = document.getElementById('change-id-btn');

  const membershipForm = document.getElementById('membership-form');
  const membershipSuccess = document.getElementById('membership-success');
  const resetFormBtn = document.getElementById('reset-form-btn');

  memNameInput.addEventListener('input', (e) => {
    liveCardName.textContent = e.target.value.trim().toUpperCase() || "YOUR FULL NAME";
  });

  memAddressInput.addEventListener('input', (e) => {
    liveCardAddress.textContent = e.target.value.trim().toUpperCase() || "NEW YORK, NY";
  });

  idUploadZone.addEventListener('click', (e) => {
    if (e.target !== changeIdBtn) idFileInput.click();
  });

  changeIdBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    idFileInput.click();
  });

  idFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        idPreviewImg.src = event.target.result;
        idFilename.textContent = file.name;
        idPlaceholder.style.display = 'none';
        idPreviewContainer.style.display = 'flex';
        liveCardIdStatus.textContent = "✓ 21+ ID Photo Attached";
        liveCardIdStatus.classList.add('verified');
      };
      reader.readAsDataURL(file);
    }
  });

  membershipForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = memNameInput.value.trim();
    const phone = document.getElementById('mem-phone').value.trim();
    const email = document.getElementById('mem-email').value.trim();
    const address = memAddressInput.value.trim();
    const reason = document.getElementById('mem-reason').value.trim();
    const idFile = idFileInput.files[0];

    if (!idFile) {
      alert("Please take or upload a picture of your ID for 21+ age verification.");
      return;
    }

    const randomCode = "CUZZO-NY-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('generated-member-id').textContent = randomCode;
    liveCardCode.textContent = `PASS #${randomCode}`;

    if (FORMSPREE_ENDPOINT) {
      try {
        const formData = new FormData(membershipForm);
        formData.append('memberCode', randomCode);
        await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
      } catch (err) {
        console.log("Guardado local listo, continuando a WhatsApp...");
      }
    }

    const applicationMessage = 
      `🗽 *NEW CUZZO CHRONIC MEMBERSHIP SIGN UP* 🌱\n` +
      `*Member Pass ID:* ${randomCode}\n\n` +
      `👤 *Full Name:* ${fullName}\n` +
      `📍 *Address:* ${address}\n` +
      `📞 *Phone:* ${phone}\n` +
      `✉️ *Email:* ${email}\n` +
      `🪪 *ID Verification Photo:* ${idFile.name} (Attaching my ID photo right now)\n\n` +
      `💬 *Reason for Joining:* "${reason}"`;

    const waVerifyUrl = `https://wa.me/${CLIENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(applicationMessage)}`;
    document.getElementById('whatsapp-final-verify-btn').href = waVerifyUrl;

    membershipForm.style.display = 'none';
    membershipSuccess.style.display = 'block';
  });

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      membershipForm.style.display = 'flex';
      membershipSuccess.style.display = 'none';
    });
  }
});