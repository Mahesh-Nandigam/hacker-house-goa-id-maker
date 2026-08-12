import QRCode from 'qrcode';

// Exact Palette from Hacker House Goa
export const PALETTE = {
  green: "#026733",
  greenDeep: "#014f2e",
  greenInk: "#01351f",
  yellow: "#fdd302",
  pink: "#eb0471",
  cyan: "#00f2fe",
  cream: "#fef7e6"
};

export const EVENT = {
  name: "HACKER HOUSE GOA",
  year: "2026",
  dates: "28 – 31 OCT 2026",
  place: "GOA, INDIA",
  tagline: "4 DAYS IN GOA • 247 BUILDERS • BUILT TO SHIP",
  hashtag: "#FrameInGoa",
  studio: "2:47PM STUDIO"
};

export const DIMENSIONS = {
  card: { w: 998, h: 1436 },
  pfp: { size: 1024 },
  slot: { x: 387, y: 56, w: 224, h: 48, radius: 24 },
  photo: { x: 244, y: 380, w: 510, h: 490, rx: 255, ry: 135, inset: 8 },
  namePlate: { x: 74, y: 885, w: 850, h: 140, radius: 34, inset: 8 },
  rolePill: { x: 249, y: 1035, w: 500, h: 80, radius: 40 },
  serialSlot: { cx: 499, y: 1125 },
  hashtagSlot: { cx: 499, y: 855 },
  qrSlot: { x: 384, y: 1175, size: 230, radius: 22 },
  pfpWindow: { x: 132, y: 195, size: 760 },
  pfpPill: { cx: 512, y: 840, w: 640, h: 90, radius: 45 }
};

// Canvas Helper Functions
export function roundRectPath(ctx, x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function archPath(ctx, x, y, w, h, rx, ry) {
  const a = Math.min(rx, w / 2);
  const l = Math.min(ry, h);
  ctx.beginPath();
  ctx.moveTo(x, y + l);
  ctx.ellipse(x + a, y + l, a, l, 0, Math.PI, 1.5 * Math.PI);
  ctx.lineTo(x + w - a, y);
  ctx.ellipse(x + w - a, y + l, a, l, 0, 1.5 * Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

export function measureTracked(ctx, text, tracking = 0) {
  const chars = [...text];
  let total = 0;
  for (const c of chars) {
    total += ctx.measureText(c).width + tracking;
  }
  return Math.max(0, total - (chars.length ? tracking : 0));
}

export function drawTracked(ctx, text, x, y, tracking = 0, align = "center") {
  const total = measureTracked(ctx, text, tracking);
  let curX = align === "center" ? x - total / 2 : x;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of [...text]) {
    ctx.fillText(c, curX, y);
    curX += ctx.measureText(c).width + tracking;
  }
  ctx.textAlign = prevAlign;
  return total;
}

export function fitTracked(ctx, text, maxWidth, options) {
  let size = options.maxSize;
  let tracking = options.tracking;
  const setFont = (s) => {
    ctx.font = `${options.weight} ${s}px ${options.family}`;
  };

  setFont(size);
  while (measureTracked(ctx, text, tracking) > maxWidth && size > options.minSize) {
    size -= 1;
    tracking = Math.max(0, tracking * 0.985);
    setFont(size);
  }
  while (measureTracked(ctx, text, tracking) > maxWidth && tracking > 0) {
    tracking = Math.max(0, tracking - 0.5);
  }
  return { size, tracking };
}

export function drawCoveredImage(ctx, img, box, transform) {
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  if (!natW || !natH) return;

  const rad = ((transform.rotate || 0) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const rotW = box.w * cos + box.h * sin;
  const rotH = box.w * sin + box.h * cos;

  const zoom = transform.zoom || 1.0;
  const scale = Math.max(rotW / natW, rotH / natH) * zoom;
  const drawW = natW * scale;
  const drawH = natH * scale;

  const maxPanX = Math.max(0, drawW - rotW) / 2;
  const maxPanY = Math.max(0, drawH - rotH) / 2;

  ctx.save();
  ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
  ctx.rotate(rad);

  const normPanX = (transform.panX || 0) / 250;
  const normPanY = (transform.panY || 0) / 250;
  ctx.translate(normPanX * maxPanX, normPanY * maxPanY);

  if (transform.theme === 'cyber') {
    ctx.filter = 'contrast(125%) saturate(140%) hue-rotate(15deg)';
  } else if (transform.theme === 'sunset') {
    ctx.filter = 'contrast(110%) saturate(135%) sepia(35%)';
  } else if (transform.theme === 'bw') {
    ctx.filter = 'grayscale(100%) contrast(135%)';
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 0x3c6ef35f) >>> 0;
    return s / 0x100000000;
  };
}

export function drawBarcode(ctx, text, x, y, w, h) {
  let hash = 7;
  for (let i = 0; i < text.length; i++) {
    hash = (31 * hash + text.charCodeAt(i)) >>> 0;
  }
  const rand = seededRandom(hash);
  ctx.save();
  ctx.fillStyle = PALETTE.greenInk;
  let curX = x;
  while (curX < x + w) {
    const barW = 1 + Math.floor(rand() * 3);
    const gapW = 1 + Math.floor(rand() * 3);
    const drawW = Math.min(barW, x + w - curX);
    if (drawW > 0) ctx.fillRect(curX, y, drawW, h);
    curX += barW + gapW;
  }
  ctx.restore();
}

export class GraphicGenerator {
  constructor() {
    this.userImage = null;
    this.qrImage = null;
  }

  async setUserImage(imgSource) {
    if (!imgSource) {
      this.userImage = null;
      return;
    }
    if (imgSource instanceof HTMLImageElement) {
      this.userImage = imgSource;
      return;
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.userImage = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = imgSource;
    });
  }

  async generateQRCode(text) {
    try {
      const targetUrl = text || 'https://hacker-house-goa-2026.devfolio.co/';
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#01351f',
          light: '#ffffff'
        }
      });
      const img = new Image();
      await new Promise((r) => {
        img.onload = r;
        img.src = dataUrl;
      });
      this.qrImage = img;
    } catch (e) {
      console.warn('QR error', e);
    }
  }

  // =========================================================================
  // FORMAT B: BUILDER ID CARD - FRONT (998 x 1436 px)
  // 100% CUSTOM VECTOR MASTERPIECE
  // =========================================================================
  renderCardFront(state, scale = 1.0) {
    const canvas = document.createElement('canvas');
    const width = Math.round(DIMENSIONS.card.w * scale);
    const height = Math.round(DIMENSIONS.card.h * scale);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const w = DIMENSIONS.card.w;
    const h = DIMENSIONS.card.h;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    // 1. Rich Goan Emerald Gradient Base
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#042b1a');
    bgGrad.addColorStop(0.4, '#021e12');
    bgGrad.addColorStop(1, '#01120a');
    ctx.fillStyle = bgGrad;
    roundRectPath(ctx, 0, 0, w, h, 28);
    ctx.fill();

    // Outer Gold Double Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.yellow;
    roundRectPath(ctx, 12, 12, w - 24, h - 24, 20);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(253, 211, 2, 0.4)';
    roundRectPath(ctx, 24, 24, w - 48, h - 48, 14);
    ctx.stroke();

    // 2. Header Strip: 2:47PM STUDIO • 28 - 31 OCT 2026 // GOA, INDIA
    ctx.save();
    ctx.font = '800 20px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText('2:47PM STUDIO', 60, 120);

    ctx.textAlign = 'right';
    ctx.font = '700 18px "Space Grotesk", sans-serif';
    ctx.fillText('28 – 31 OCT 2026 // GOA, INDIA', w - 60, 120);
    ctx.restore();

    // 3. Main Wordmark: HACKER [गोवा] HOUSE
    const titleY = 190;
    this.drawTitleBlock(ctx, w / 2, titleY);

    // 4. Subtitle: 4 DAYS IN GOA • 247 BUILDERS • BUILT TO SHIP
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(254, 247, 230, 0.85)';
    drawTracked(ctx, '4 DAYS IN GOA  ◆  247 BUILDERS  ◆  BUILT TO SHIP', w / 2, titleY + 68, 2.5);
    ctx.restore();

    // 5. Arch Photo Window & Goan Scenery (Palm trees, Umbrella & Vespa)
    const p = DIMENSIONS.photo;
    this.drawArchScenery(ctx, p.x, p.y, p.w, p.h);

    ctx.save();
    const photoBox = {
      x: p.x + p.inset,
      y: p.y + p.inset,
      w: p.w - 2 * p.inset,
      h: p.h - p.inset
    };
    archPath(ctx, photoBox.x, photoBox.y, photoBox.w, photoBox.h, p.rx - p.inset, p.ry - p.inset);
    ctx.clip();
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(photoBox.x, photoBox.y, photoBox.w, photoBox.h);

    if (this.userImage) {
      drawCoveredImage(ctx, this.userImage, photoBox, state);
    } else {
      this.drawAvatarSilhouette(ctx, photoBox.x + photoBox.w / 2, photoBox.y + photoBox.h / 2, 140);
    }
    ctx.restore();

    // Arch Gold Outer Trim
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = PALETTE.yellow;
    archPath(ctx, p.x, p.y, p.w, p.h, p.rx, p.ry);
    ctx.stroke();
    ctx.restore();

    // 6. #FrameInGoa Ribbon Banner across Arch Base
    this.drawRibbonBanner(ctx, DIMENSIONS.hashtagSlot.cx, DIMENSIONS.hashtagSlot.y, '#FrameInGoa');

    // 7. Full Name Display Box
    const np = DIMENSIONS.namePlate;
    const nameBox = {
      x: np.x + np.inset,
      y: np.y + np.inset,
      w: np.w - 2 * np.inset,
      h: np.h - 2 * np.inset
    };

    ctx.save();
    roundRectPath(ctx, nameBox.x, nameBox.y, nameBox.w, nameBox.h, np.radius - np.inset);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();
    ctx.clip();

    const builderName = (state.name || 'ADA LOVELACE').toUpperCase();
    const fittedName = fitTracked(ctx, builderName, nameBox.w - 48, {
      family: '"Syne", "Bodoni Moda", sans-serif',
      weight: '900',
      maxSize: 72,
      minSize: 28,
      tracking: 4
    });
    ctx.fillStyle = PALETTE.green;
    ctx.textBaseline = 'middle';
    drawTracked(ctx, builderName, nameBox.x + nameBox.w / 2, nameBox.y + nameBox.h / 2 + 3, fittedName.tracking);
    ctx.restore();

    // 8. Role Badge Pill
    const rp = DIMENSIONS.rolePill;
    const roleStr = (state.role || 'AI ENGINEER').toUpperCase();
    ctx.save();
    roundRectPath(ctx, rp.x, rp.y, rp.w, rp.h, rp.radius);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    const fittedRole = fitTracked(ctx, `❖  ${roleStr}  ❖`, rp.w - 30, {
      family: '"Space Grotesk", sans-serif',
      weight: '900',
      maxSize: 40,
      minSize: 18,
      tracking: 3
    });
    ctx.fillStyle = PALETTE.yellow;
    ctx.textBaseline = 'middle';
    drawTracked(ctx, `❖  ${roleStr}  ❖`, rp.x + rp.w / 2, rp.y + rp.h / 2 + 2, fittedRole.tracking);
    ctx.restore();

    // 9. Serial Line & Squad
    const serialStr = state.serial || `#GOA-2026-${Math.abs(this.hashCode(state.name || 'BUILDER')).toString(16).toUpperCase().padStart(4, '0')}A`;
    const teamStr = (state.teamName || '').toUpperCase();
    const fullSerial = teamStr ? `${teamStr}  ·  ${serialStr}` : serialStr;

    ctx.save();
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const serialW = Math.min(measureTracked(ctx, fullSerial, 2.2) + 48, 680);
    roundRectPath(ctx, DIMENSIONS.serialSlot.cx - serialW / 2, DIMENSIONS.serialSlot.y, serialW, 44, 22);
    ctx.fillStyle = 'rgba(1, 53, 31, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(253, 211, 2, 0.85)';
    ctx.stroke();
    ctx.fillStyle = PALETTE.cream;
    drawTracked(ctx, fullSerial, DIMENSIONS.serialSlot.cx, DIMENSIONS.serialSlot.y + 22 + 1, 2.2);
    ctx.restore();

    // 10. Resort Scenery + Scannable QR Code Panel
    const qrP = DIMENSIONS.qrSlot;
    this.drawResortBungalows(ctx, 48, 1140, w - 96, 240);

    ctx.save();
    roundRectPath(ctx, qrP.x, qrP.y, qrP.size, qrP.size, qrP.radius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    if (this.qrImage) {
      ctx.drawImage(this.qrImage, qrP.x + 10, qrP.y + 10, qrP.size - 20, qrP.size - 20);
    }
    ctx.restore();

    // 11. Bottom Portuguese Azulejo Mosaic Tile Band
    this.drawAzulejoMosaicBand(ctx, 36, h - 48, w - 72, 24);

    // 12. Top Lanyard Slot Cutout
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const s = DIMENSIONS.slot;
    roundRectPath(ctx, s.x, s.y, s.w, s.h, s.radius);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();

    ctx.restore();
    return canvas;
  }

  // =========================================================================
  // FORMAT B: BUILDER ID CARD - BACK (998 x 1436 px)
  // =========================================================================
  renderCardBack(state, scale = 1.0) {
    const canvas = document.createElement('canvas');
    const width = Math.round(DIMENSIONS.card.w * scale);
    const height = Math.round(DIMENSIONS.card.h * scale);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const w = DIMENSIONS.card.w;
    const h = DIMENSIONS.card.h;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    // 1. Dark Emerald Background Base
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#042b1a');
    bgGrad.addColorStop(0.4, '#021e12');
    bgGrad.addColorStop(1, '#01120a');
    ctx.fillStyle = bgGrad;
    roundRectPath(ctx, 0, 0, w, h, 28);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.yellow;
    roundRectPath(ctx, 12, 12, w - 24, h - 24, 20);
    ctx.stroke();

    // 2. Header Title: HACKER [गोवा] HOUSE
    const titleY = 135;
    this.drawTitleBlock(ctx, w / 2, titleY);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(254, 247, 230, 0.85)';
    drawTracked(ctx, '4 DAYS IN GOA  ◆  247 BUILDERS  ◆  BUILT TO SHIP', w / 2, titleY + 64, 2);
    ctx.restore();

    // 3. Upper QR Code & Verification Block
    const qrBoxX = 74;
    const qrBoxY = 240;
    const qrBoxSize = 240;

    ctx.save();
    roundRectPath(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    if (this.qrImage) {
      ctx.drawImage(this.qrImage, qrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
    }
    ctx.restore();

    const infoX = qrBoxX + qrBoxSize + 36;
    ctx.save();
    ctx.font = '900 28px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText('❖  SCAN TO VERIFY  ❖', infoX, qrBoxY + 45);

    ctx.font = '600 17px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCAN FOR LIVE SCHEDULE,', infoX, qrBoxY + 85);
    ctx.fillText('₹46.5L+ BOUNTY TRACKS,', infoX, qrBoxY + 115);
    ctx.fillText('VILLA ACCESS PASS &', infoX, qrBoxY + 145);
    ctx.fillText('RESIDENCY PORTAL.', infoX, qrBoxY + 175);
    ctx.restore();

    // 4. Azulejo Tile Divider
    this.drawAzulejoMosaicBand(ctx, 50, 510, w - 100, 20);

    // 5. Residency Flow Protocols
    const rulesY = 570;
    this.drawRolePill(ctx, w / 2, rulesY, 'HOUSE PROTOCOLS');

    const protocols = [
      { icon: '🌴', title: 'STAY IN FLOW', desc: 'Code, rest, and beach jams under one roof.' },
      { icon: '⚡', title: 'BUILT TO SHIP', desc: 'A launchpad for generational AI & crypto products.' },
      { icon: '🤝', title: 'ELEVATE SQUAD', desc: 'Collaborate fiercely, elevate each other.' },
      { icon: '🌊', title: 'RECHARGE HARD', desc: 'Intensity by day, Goan sunsets by dusk.' },
      { icon: '🔑', title: 'HIGH-SPEED WI-FI', desc: 'SSID: HHGOA_247_ULTRA  |  KEY: SHIP_OR_DIE' }
    ];

    ctx.save();
    let curY = rulesY + 60;
    protocols.forEach(item => {
      ctx.font = '24px "Space Grotesk", sans-serif';
      ctx.fillText(item.icon, 70, curY);

      ctx.font = '800 17px "JetBrains Mono", monospace';
      ctx.fillStyle = PALETTE.yellow;
      ctx.fillText(item.title + ':', 115, curY - 3);

      ctx.font = '500 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(item.desc, 115, curY + 20);

      curY += 58;
    });
    ctx.restore();

    // 6. Laser Barcode & Hash
    const serialStr = state.serial || `#GOA-2026-${Math.abs(this.hashCode(state.name || 'BUILDER')).toString(16).toUpperCase().padStart(4, '0')}A`;
    drawBarcode(ctx, serialStr, 70, 940, w - 140, 28);

    ctx.save();
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.fillText(`SERIAL HASH: ${serialStr}  •  VERIFIED 2:47PM RESIDENT`, w / 2, 995);
    ctx.restore();

    // 7. Bottom Gold Banner
    const bannerY = h - 75;
    ctx.save();
    roundRectPath(ctx, 60, bannerY - 26, w - 120, 52, 14);
    ctx.fillStyle = PALETTE.yellow;
    ctx.fill();

    ctx.font = '900 22px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.greenInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GOA, INDIA  •  28 – 31 OCT 2026  •  247 RESIDENTS', w / 2, bannerY);
    ctx.restore();

    // 8. Top Lanyard Slot Cutout
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const s = DIMENSIONS.slot;
    roundRectPath(ctx, s.x, s.y, s.w, s.h, s.radius);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();

    ctx.restore();
    return canvas;
  }

  // =========================================================================
  // FORMAT A: PFP FRAME OVERLAY (1024 x 1024 px)
  // 100% CUSTOM VECTOR MASTERPIECE
  // =========================================================================
  renderPFP(state, scale = 1.0) {
    const canvas = document.createElement('canvas');
    const size = Math.round(DIMENSIONS.pfp.size * scale);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const s = DIMENSIONS.pfp.size;
    const center = s / 2;
    const innerR = 340;
    const ringR = 380;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    // 1. Deep Emerald Ambient Radial Backdrop
    const bgGrad = ctx.createRadialGradient(center, center, 120, center, center, s / 2);
    bgGrad.addColorStop(0, '#0a3822');
    bgGrad.addColorStop(0.7, '#041f13');
    bgGrad.addColorStop(1, '#021008');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, s, s);

    // Corner Tropical Palm Leaf Silhouettes
    this.drawCornerPalmLeaves(ctx, s);

    // 2. Center Photo Circle Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = PALETTE.greenInk;
    ctx.fillRect(0, 0, s, s);

    if (this.userImage) {
      const box = {
        x: center - innerR,
        y: center - innerR,
        w: innerR * 2,
        h: innerR * 2
      };
      drawCoveredImage(ctx, this.userImage, box, state);
    } else {
      this.drawAvatarSilhouette(ctx, center, center, innerR * 0.7);
    }
    ctx.restore();

    // 3. Glowing Neon Emerald Outer Ring
    ctx.save();
    ctx.shadowColor = 'rgba(23, 160, 85, 0.85)';
    ctx.shadowBlur = 35;

    ctx.lineWidth = 26;
    ctx.strokeStyle = '#17a055';
    ctx.beginPath();
    ctx.arc(center, center, innerR + 13, 0, Math.PI * 2);
    ctx.stroke();

    // Outer Gold Accent Ring
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.beginPath();
    ctx.arc(center, center, ringR + 15, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric Arc Typography
    this.drawArcTextTop(ctx, "★ HACKER HOUSE GOA 2026 ★", center, center, ringR + 52);
    this.drawArcTextBottom(ctx, "28 - 31 OCT 2026 • 247 BUILDERS", center, center, ringR + 52);
    ctx.restore();

    // 4. Header Top: 2:47PM STUDIO // HHGOA.COM
    ctx.save();
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.fillText('2:47PM STUDIO // HHGOA.COM', center, 65);
    ctx.restore();

    // 5. Bottom Ribbon Banner: #FrameInGoa
    this.drawRibbonBanner(ctx, center, s * 0.88, '#FrameInGoa', 360, 60);

    ctx.restore();
    return canvas;
  }

  // =========================================================================
  // 16:9 X POST SHOWCASE (2400 x 1350 px)
  // =========================================================================
  renderXPostShowcase(state) {
    const canvas = document.createElement('canvas');
    const w = 2400;
    const h = 1350;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 300, w / 2, h / 2, w / 2);
    bgGrad.addColorStop(0, '#042817');
    bgGrad.addColorStop(0.5, '#02180e');
    bgGrad.addColorStop(1, '#010804');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.font = '800 28px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText('2:47PM STUDIO', 90, 85);

    ctx.textAlign = 'right';
    ctx.font = '700 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText('HACKER HOUSE GOA 2026 // #FrameInGoa', w - 90, 85);
    ctx.restore();

    const frontCanvas = this.renderCardFront(state, 0.74);
    const backCanvas = this.renderCardBack(state, 0.74);

    const cardW = frontCanvas.width;
    const cardH = frontCanvas.height;
    const cardY = (h - cardH) / 2 + 30;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = -20;
    ctx.shadowOffsetY = 30;
    ctx.drawImage(frontCanvas, 360, cardY, cardW, cardH);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 20;
    ctx.shadowOffsetY = 30;
    ctx.drawImage(backCanvas, 1300, cardY, cardW, cardH);
    ctx.restore();

    return canvas;
  }

  // =========================================================================
  // VECTOR GRAPHIC HELPERS (TITLE, ARCH SCENERY, PALMS, AZULEJO MOSAIC)
  // =========================================================================

  drawTitleBlock(ctx, cx, cy) {
    ctx.save();
    // "HACKER"
    ctx.font = '900 62px "Bodoni Moda", "Syne", serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'right';
    ctx.fillText('HACKER', cx - 95, cy + 20);

    // Glowing Hot-Pink Box with Hindi "गोवा"
    const boxW = 160;
    const boxH = 68;
    const boxX = cx - boxW / 2;
    const boxY = cy - 34;

    ctx.shadowColor = 'rgba(235, 4, 113, 0.75)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = PALETTE.pink;
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = '900 48px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('गोवा', cx, cy - 1);

    // "HOUSE"
    ctx.font = '900 62px "Bodoni Moda", "Syne", serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('HOUSE', cx + 95, cy + 20);

    ctx.restore();
  }

  drawArchScenery(ctx, px, py, pw, ph) {
    ctx.save();
    // Left Palm Tree
    this.drawPalm(ctx, px - 25, py + 120, 1.1, -0.15);

    // Right Palm Tree
    this.drawPalm(ctx, px + pw + 25, py + 120, 1.1, 0.15);

    // Left Beach Umbrella
    this.drawUmbrella(ctx, px + 10, py + ph - 20);

    // Right Pink Vespa
    this.drawVespa(ctx, px + pw - 10, py + ph - 20);
    ctx.restore();
  }

  drawPalm(ctx, x, y, scale = 1, curve = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#4a2e18';
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.quadraticCurveTo(curve * 100, 90, 0, 0);
    ctx.stroke();

    // Fronds
    const fronds = [
      { angle: -120, len: 130 },
      { angle: -80, len: 150 },
      { angle: -40, len: 140 },
      { angle: 0, len: 130 },
      { angle: 40, len: 140 },
      { angle: 80, len: 150 },
      { angle: 120, len: 130 }
    ];

    fronds.forEach(f => {
      ctx.save();
      ctx.rotate((f.angle * Math.PI) / 180);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-20, f.len * 0.5, 0, f.len);
      ctx.quadraticCurveTo(20, f.len * 0.5, 0, 0);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  drawUmbrella(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -75);
    ctx.stroke();

    ctx.fillStyle = PALETTE.pink;
    ctx.beginPath();
    ctx.arc(0, -75, 44, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = PALETTE.yellow;
    ctx.beginPath();
    ctx.moveTo(0, -75);
    ctx.arc(0, -75, 44, Math.PI + 0.6, Math.PI + 1.2);
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.beginPath();
    ctx.arc(0, -75, 44, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawVespa(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Wheels
    ctx.fillStyle = '#010d06';
    ctx.beginPath();
    ctx.arc(-24, 0, 14, 0, Math.PI * 2);
    ctx.arc(24, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PALETTE.pink;
    roundRectPath(ctx, -26, -26, 52, 18, 8);
    ctx.fill();

    ctx.fillStyle = PALETTE.yellow;
    roundRectPath(ctx, -16, -30, 24, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  drawResortBungalows(ctx, x, y, width, height) {
    ctx.save();
    // Left Villa
    this.drawVilla(ctx, x + 20, y + 40);
    // Right Villa
    this.drawVilla(ctx, x + width - 110, y + 40);

    // Pool Strip
    ctx.fillStyle = 'rgba(0, 242, 254, 0.22)';
    roundRectPath(ctx, x + 40, y + 140, width - 80, 42, 16);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f2fe';
    ctx.stroke();
    ctx.restore();
  }

  drawVilla(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Roof
    ctx.fillStyle = PALETTE.pink;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(45, -28);
    ctx.lineTo(90, 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    // Walls
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(8, 0, 74, 48);

    // Door & Window
    ctx.fillStyle = PALETTE.greenInk;
    ctx.fillRect(16, 12, 18, 18);
    ctx.fillRect(52, 12, 18, 18);
    ctx.fillRect(36, 24, 16, 24);
    ctx.restore();
  }

  drawRibbonBanner(ctx, cx, cy, text, w = 280, h = 48) {
    ctx.save();
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.fillStyle = PALETTE.greenInk;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.font = '900 22px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
    ctx.restore();
  }

  drawRolePill(ctx, cx, cy, text) {
    ctx.save();
    let fontSize = 20;
    ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
    let textW = ctx.measureText(text.toUpperCase()).width;
    const pillW = Math.max(textW + 80, 260);
    const pillH = 50;

    roundRectPath(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`❖  ${text.toUpperCase()}  ❖`, cx, cy);
    ctx.restore();
  }

  drawAzulejoMosaicBand(ctx, x, y, width, height) {
    ctx.save();
    const count = 24;
    const step = width / count;
    ctx.fillStyle = PALETTE.yellow;
    for (let i = 0; i < count; i++) {
      const mx = x + i * step + step / 2;
      const my = y + height / 2;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
    }
    ctx.restore();
  }

  drawCornerPalmLeaves(ctx, size) {
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    // Top Left Corner
    ctx.beginPath();
    ctx.arc(0, 0, 220, 0, Math.PI / 2);
    ctx.fill();

    // Top Right Corner
    ctx.beginPath();
    ctx.arc(size, 0, 220, Math.PI / 2, Math.PI);
    ctx.fill();

    // Bottom Corners
    ctx.beginPath();
    ctx.arc(0, size, 220, 1.5 * Math.PI, 2 * Math.PI);
    ctx.arc(size, size, 220, Math.PI, 1.5 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  drawAvatarSilhouette(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#d4d4d8';
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.5, r * 0.6, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  drawArcTextTop(ctx, text, cx, cy, radius) {
    ctx.save();
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const chars = text.split('');
    const stepAngle = 2.0 * (Math.PI / 180);
    const startAngle = -Math.PI / 2 - (chars.length * stepAngle) / 2;

    for (let i = 0; i < chars.length; i++) {
      const angle = startAngle + i * stepAngle;
      ctx.save();
      ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  drawArcTextBottom(ctx, text, cx, cy, radius) {
    ctx.save();
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const chars = text.split('');
    const stepAngle = 1.9 * (Math.PI / 180);
    const startAngle = Math.PI / 2 + (chars.length * stepAngle) / 2;

    for (let i = 0; i < chars.length; i++) {
      const angle = startAngle - i * stepAngle;
      ctx.save();
      ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.rotate(angle - Math.PI / 2);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }
}
