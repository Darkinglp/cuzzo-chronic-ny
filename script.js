window.addEventListener('DOMContentLoaded', () => {
  // ==========================================================
  // CONFIGURACIÓN DEL NÚMERO DE WHATSAPP DEL CLIENTE (USA +1)
  // ==========================================================
  const CLIENT_EMAIL = "Jayzibby442@icloud.com"; // Pon aquí el correo real de Cuzzo's Chronic

  // Imagen de los 5 empaques de Cuzzo's Chronic
  const PACKAGES_IMAGE_PATH = "empaques.jpg";

  const canvas = document.getElementById('smoke-canvas');
  const ctx = canvas.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const mainScene = document.getElementById('main-scene');
  const viewport = document.getElementById('camera-viewport');
  const tableSurface = document.getElementById('table-surface');
  const spotlight = document.getElementById('table-spotlight');

  // Si el usuario guarda un PNG transparente "cogollo.png" en su carpeta,
  // quitamos el clip-path de recorte para usar la transparencia natural de su PNG
  const testCustomBud = new Image();
  testCustomBud.src = "cogollo.png";
  testCustomBud.onload = () => {
    document.querySelectorAll('.real-nug').forEach(img => {
      img.style.clipPath = 'none';
    });
  };

  // ==========================================================
  // 1. FONDO ANIMADO: EMPAQUES GRANDES + PARTÍCULAS + HUMO
  // ==========================================================
  const triCanvas = document.getElementById('trichome-canvas');
  const triCtx = triCanvas.getContext('2d');
  let particles = [];
  let floatingPackages = [];
  let scrollSmokePuffs = [];
  let croppedBagSprites = [];

  function resizeCanvases() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    triCanvas.width = window.innerWidth;
    triCanvas.height = window.innerHeight;
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  // Recortar automáticamente las 5 bolsas de empaques.jpg
  const rawPackImg = new Image();
  rawPackImg.crossOrigin = "anonymous";
  rawPackImg.src = PACKAGES_IMAGE_PATH;
  rawPackImg.onload = () => {
    const W = rawPackImg.width;
    const H = rawPackImg.height;
    const regions = [
      { x: 0.01, y: 0.03, w: 0.32, h: 0.46 },
      { x: 0.33, y: 0.03, w: 0.33, h: 0.46 },
      { x: 0.66, y: 0.03, w: 0.33, h: 0.46 },
      { x: 0.14, y: 0.51, w: 0.35, h: 0.47 },
      { x: 0.50, y: 0.51, w: 0.35, h: 0.47 }
    ];

    croppedBagSprites = regions.map(r => {
      const sw = Math.floor(W * r.w);
      const sh = Math.floor(H * r.h);
      const off = document.createElement('canvas');
      off.width = sw;
      off.height = sh;
      const octx = off.getContext('2d');
      octx.drawImage(rawPackImg, Math.floor(W * r.x), Math.floor(H * r.y), sw, sh, 0, 0, sw, sh);

      try {
        const imgData = octx.getImageData(0, 0, sw, sh);
        const d = imgData.data;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const idx = (y * sw + x) * 4;
            if (d[idx] < 18 && d[idx + 1] < 18 && d[idx + 2] < 18) {
              d[idx + 3] = 0;
            } else {
              break;
            }
          }
          for (let x = sw - 1; x >= 0; x--) {
            const idx = (y * sw + x) * 4;
            if (d[idx] < 18 && d[idx + 1] < 18 && d[idx + 2] < 18) {
              d[idx + 3] = 0;
            } else {
              break;
            }
          }
        }
        octx.putImageData(imgData, 0, 0);
      } catch (e) {}
      return off;
    });
  };

  function drawFallbackBag(ctx, variant, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    if (variant === 0) {
      ctx.fillStyle = '#111213';
      ctx.strokeStyle = '#ef4444';
    } else if (variant === 1) {
      ctx.fillStyle = '#a3e635';
      ctx.strokeStyle = '#dc2626';
    } else if (variant === 2) {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ec4899';
    } else if (variant === 3) {
      ctx.fillStyle = '#0c0a08';
      ctx.strokeStyle = '#d4af37';
    } else {
      ctx.fillStyle = '#1d4ed8';
      ctx.strokeStyle = '#ec4899';
    }
    ctx.lineWidth = 2.2;
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 5, -h / 2 + 12);
    ctx.lineTo(w / 2 - 5, -h / 2 + 12);
    ctx.stroke();

    ctx.fillStyle = variant === 3 ? '#d4af37' : '#ef4444';
    ctx.fillRect(-w * 0.4, -8, w * 0.8, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(9, Math.floor(w * 0.14))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText("CUZZO'S", 0, 4);
    ctx.restore();
  }

  for (let i = 0; i < 8; i++) {
    floatingPackages.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: 88 + Math.random() * 38,
      h: 114 + Math.random() * 48,
      angle: (Math.random() - 0.5) * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.003,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.24 - Math.random() * 0.26,
      alpha: 0.22 + Math.random() * 0.14,
      variant: i % 5
    });
  }

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

  for (let i = 0; i < 38; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.35 ? '#ffffff' : '#d4af37'
    });
  }

  let lastScrollY = window.scrollY;
  const smokeCurtainLeft = document.getElementById('smoke-curtain-left');
  const smokeCurtainRight = document.getElementById('smoke-curtain-right');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (Math.abs(delta) > 4 && scrollSmokePuffs.length < 16) {
      scrollSmokePuffs.push({
        x: Math.random() * triCanvas.width,
        y: delta > 0 ? triCanvas.height + 60 : -60,
        vx: (Math.random() - 0.5) * 1.8,
        vy: delta > 0 ? -(2 + Math.random() * 3) : (2 + Math.random() * 3),
        size: 180 + Math.random() * 140,
        rotation: Math.random() * Math.PI * 2,
        opacity: 0.2,
        life: 0,
        maxLife: 90
      });
    }

    floatingPackages.forEach(pkg => {
      pkg.y -= delta * 0.22;
      pkg.angle += delta * 0.0012;
      if (pkg.y < -140) pkg.y = triCanvas.height + 120;
      if (pkg.y > triCanvas.height + 140) pkg.y = -120;
    });

    if (smokeCurtainLeft && smokeCurtainRight) {
      const shift = Math.min(120, currentScrollY * 0.15);
      smokeCurtainLeft.style.transform = `translateX(-${shift}px)`;
      smokeCurtainRight.style.transform = `translateX(${shift}px)`;
    }
  }, { passive: true });

  function renderAmbientAndScrollFX() {
    triCtx.clearRect(0, 0, triCanvas.width, triCanvas.height);

    floatingPackages.forEach(pkg => {
      pkg.x += pkg.vx;
      pkg.y += pkg.vy;
      pkg.angle += pkg.rotSpeed;
      if (pkg.y < -140) pkg.y = triCanvas.height + 120;
      if (pkg.x < -140) pkg.x = triCanvas.width + 120;
      if (pkg.x > triCanvas.width + 140) pkg.x = -120;

      triCtx.save();
      triCtx.translate(pkg.x, pkg.y);
      triCtx.rotate(pkg.angle);
      triCtx.globalAlpha = pkg.alpha;

      if (croppedBagSprites.length === 5) {
        const sprite = croppedBagSprites[pkg.variant];
        triCtx.drawImage(sprite, -pkg.w / 2, -pkg.h / 2, pkg.w, pkg.h);
      } else {
        drawFallbackBag(triCtx, pkg.variant, pkg.w, pkg.h);
      }
      triCtx.restore();
    });

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

  // ==========================================================
  // 2. CAMBIO DINÁMICO DE TEMA AL HACER SCROLL (NEGRO ➔ BLANCO ➔ NEGRO)
  // ==========================================================
  const whiteStackCard = document.getElementById('roots-section');
  const finalDarkStackCard = document.getElementById('why-cuzzo-section');

  function updateThemeByScroll() {
    if (!whiteStackCard || !finalDarkStackCard) return;
    const whiteRect = whiteStackCard.getBoundingClientRect();
    const darkFinalRect = finalDarkStackCard.getBoundingClientRect();
    const triggerLine = window.innerHeight * 0.52;

    if (whiteRect.top <= triggerLine && darkFinalRect.top > triggerLine) {
      document.body.classList.add('theme-light-active');
    } else {
      document.body.classList.remove('theme-light-active');
    }
  }
  window.addEventListener('scroll', updateThemeByScroll, { passive: true });

  // ==========================================================
  // 3. MOTOR MATEMÁTICO DE HUMO DENSO INICIAL
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
  // 4. VERIFICACIÓN DE EDAD (21+) Y CENTRADO EN CELULAR
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
  // 5. CATÁLOGO DE PRODUCTOS Y BOLSAS HERMÉTICAS + WHATSAPP
  // ==========================================================
  function createWhatsAppLink(itemName, categoryType) {
    const subject = `🗽 NY Harvest Inquiry: ${itemName} (${categoryType}) — Cuzzo's Chronic`;
    
    const body = 
      `Yo Cuzzo's Chronic Fam! 🗽🌱\n\n` +
      `I just checked out your interactive rolling tray on cuzzoschronic.com and I'm really interested in getting more info on:\n\n` +
      `• Selection: ${itemName}\n` +
      `• Category: ${categoryType}\n\n` +
      `Love that you guys grow 100% in Living Soil and keep the real New York classics alive. Please let me know current batch availability and how we can connect!\n\n` +
      `Best regards,`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // En celular abre directo la App de Gmail / Correo lista para presionar Enviar
      return `mailto:${CLIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      // En PC abre directo Gmail en el navegador con el correo ya redactado
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${CLIENT_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  const generalWaUrl = createWhatsAppLink("Cuzzo's Chronic Menu & Harvest", "General Inquiry");
  const navWaBtn = document.getElementById('nav-whatsapp-btn');
  const bottomWaBtn = document.getElementById('bottom-whatsapp-cta');
  if (navWaBtn) navWaBtn.href = generalWaUrl;
  if (bottomWaBtn) bottomWaBtn.href = generalWaUrl;

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
    "Signature Collector Packs": {
      title: "Cuzzo's Chronic — Signature Art Packs",
      desc: "Our custom New York collector pouches designed to lock in living-soil freshness and terpene character.",
      items: [
        {
          name: "Cuzzo's Chronic — Full Collector Series",
          badge: "NY ART PACKS",
          genetics: "Black Classic • Pop-Art Legends • Luxury Gold CC • Sprinkles Edition",
          desc: "Sealed fresh from our family harvest. Ask on WhatsApp for available strains inside each limited-edition Cuzzo's Chronic pouch.",
          image: PACKAGES_IMAGE_PATH
        }
      ]
    },
    "Artisanal Edibles": {
      title: "Small-Batch Craft Edibles",
      desc: "Infused with solventless rosin pressed directly from our living soil flower. Full-spectrum effects with true strain character.",
      items: [
        {
          name: "Cuzzo's Solventless Live Rosin Chews",
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
          name: "Chat Directly With the Cuzzo's Chronic Family",
          badge: "NY ROOTS",
          genetics: "Family-Owned & Operated in New York",
          desc: "Have questions about our living soil process or current batch availability? Hit us up on WhatsApp.",
          image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80"
        }
      ]
    }
  };

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
      hudLink.textContent = `Inspect Selection`;
    }
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => updateHUD(item));
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      updateHUD(item);
      openCatalogModal(activeCategoryName);
    });
  });

  if (hudLink) {
    hudLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCatalogModal(activeCategoryName);
    });
  }

  const laminaSheets = document.querySelectorAll('.lamina-sheet');
  laminaSheets.forEach((sheet) => {
    const statusText = sheet.querySelector('.seal-status-text');
    sheet.addEventListener('mouseenter', () => {
      if (statusText) statusText.textContent = "🔓 SEAL OPENED • FRESH LIVING SOIL BUDS";
    });
    sheet.addEventListener('mouseleave', () => {
      if (!sheet.classList.contains('bag-open') && statusText) {
        statusText.textContent = "🔒 HERMETIC LIVING SOIL SEAL • TAP TO OPEN";
      }
    });

    sheet.addEventListener('click', () => {
      const cat = sheet.getAttribute('data-category') || "Old-School Classics";
      if (window.innerWidth <= 900 && !sheet.classList.contains('bag-open')) {
        laminaSheets.forEach(s => s.classList.remove('bag-open'));
        sheet.classList.add('bag-open');
        if (statusText) statusText.textContent = "🔓 SEAL OPENED • TAP AGAIN TO INSPECT";
      } else {
        openCatalogModal(cat);
      }
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
          <img src="${prod.image}" onerror="this.src='https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=400&q=80'" alt="${prod.name}" loading="lazy" />
          <span class="strain-badge">${prod.badge}</span>
        </div>
        <div class="product-info">
          <h4>${prod.name}</h4>
          <span class="product-genetics">🌱 ${prod.genetics}</span>
          <p>${prod.desc}</p>
        </div>
        <div class="product-actions-col">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-inquire-btn">
            ✉️ Inquire via Email
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
});