import QRCode from 'qrcode';

// Luxury Goan Color Tokens
export const PALETTE = {
  green: "#026733",
  greenDeep: "#014f2e",
  greenInk: "#01351f",
  yellow: "#fdd302",
  gold: "#ffd700",
  pink: "#eb0471",
  neonPink: "#ff007a",
  cyan: "#00f2fe",
  cream: "#fef7e6",
  darkBg: "#021008"
};

// Exact Industry Standard Dimensions
export const DIMENSIONS = {
  card: { w: 998, h: 1436 },
  pfp: { size: 1024 },
  slot: { x: 387, y: 52, w: 224, h: 46, radius: 23 },
  photo: { x: 234, y: 350, w: 530, h: 510, rx: 265, ry: 140, inset: 10 },
  namePlate: { x: 74, y: 880, w: 850, h: 136, radius: 32, inset: 8 },
  rolePill: { x: 249, y: 1032, w: 500, h: 76, radius: 38 },
  serialSlot: { cx: 499, y: 1122 },
  hashtagSlot: { cx: 499, y: 850 },
  qrSlot: { x: 384, y: 1180, size: 210, radius: 20 }
};

export const EVENT = {
  name: "HACKER HOUSE GOA",
  year: "2026",
  dates: "28 – 31 OCT 2026",
  place: "GOA, INDIA",
  tagline: "4 DAYS. ONE RHYTHM. EVERYTHING INTENTIONAL.",
  hashtag: "#FrameInGoa",
  studio: "2:47PM STUDIO"
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
  let curX = x;
  if (align === "center") curX = x - total / 2;
  else if (align === "right") curX = x - total;
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

// Proportional Typographic Curved Text
export function drawArcTextProportional(ctx, text, cx, cy, radius, startAngleCenter, inward = true, letterSpacing = 2) {
  ctx.save();
  const chars = [...text];
  const charWidths = chars.map(c => ctx.measureText(c).width + letterSpacing);
  const totalWidth = charWidths.reduce((a, b) => a + b, 0);
  const totalAngle = totalWidth / radius;

  let currentAngle = inward 
    ? (startAngleCenter - totalAngle / 2) 
    : (startAngleCenter + totalAngle / 2);

  for (let i = 0; i < chars.length; i++) {
    const charW = charWidths[i];
    const halfAngle = (charW / 2) / radius;
    const charAngle = inward ? (currentAngle + halfAngle) : (currentAngle - halfAngle);

    ctx.save();
    const x = cx + radius * Math.cos(charAngle);
    const y = cy + radius * Math.sin(charAngle);
    ctx.translate(x, y);

    if (inward) {
      ctx.rotate(charAngle + Math.PI / 2);
    } else {
      ctx.rotate(charAngle - Math.PI / 2);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();

    if (inward) {
      currentAngle += charW / radius;
    } else {
      currentAngle -= charW / radius;
    }
  }
  ctx.restore();
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
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 6, y - 4, w + 12, h + 8);

  ctx.fillStyle = PALETTE.greenInk;
  let curX = x;
  while (curX < x + w) {
    const barW = 1 + Math.floor(rand() * 3);
    const gapW = 1 + Math.floor(rand() * 2);
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

  async loadTemplates() {
    return Promise.resolve();
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
      console.warn('QR generation error', e);
    }
  }

  // =========================================================================
  // FORMAT B: BUILDER ID CARD - FRONT (998 x 1436 px)
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

    // 1. Luxury Goan Emerald Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#025229');
    bgGrad.addColorStop(0.3, '#01381c');
    bgGrad.addColorStop(0.7, '#012613');
    bgGrad.addColorStop(1, '#01150a');
    ctx.fillStyle = bgGrad;
    roundRectPath(ctx, 0, 0, w, h, 32);
    ctx.fill();

    // 2. Gold Precision Double Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.yellow;
    roundRectPath(ctx, 14, 14, w - 28, h - 28, 22);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(253, 211, 2, 0.45)';
    roundRectPath(ctx, 24, 24, w - 48, h - 48, 16);
    ctx.stroke();

    // 3. Top Header Details (Meaningful Studio + Date)
    ctx.save();
    ctx.font = '800 20px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.yellow;
    drawTracked(ctx, '2:47PM STUDIO', 60, 115, 1.2, 'left');

    ctx.font = '700 18px "Space Grotesk", sans-serif';
    drawTracked(ctx, '28 – 31 OCT 2026 // GOA, INDIA', w - 60, 115, 0.6, 'right');
    ctx.restore();

    // 4. Main Event Wordmark: HACKER [गोवा] HOUSE
    const titleY = 180;
    this.drawTitleBlock(ctx, w / 2, titleY);

    // 5. Official Subtitle Tagline
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(254, 247, 230, 0.92)';
    drawTracked(ctx, '4 DAYS. ONE RHYTHM. EVERYTHING INTENTIONAL.', w / 2, titleY + 68, 2.2);
    ctx.restore();

    // 6. Photo Arch Frame
    const p = DIMENSIONS.photo;

    // Elegant Tropical Palm Framing Accents
    this.drawPalmLeavesArch(ctx, p.x, p.y, p.w, p.h);

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

    // 7. #FrameInGoa Ribbon Banner across Arch Base
    this.drawRibbonBanner(ctx, DIMENSIONS.hashtagSlot.cx, DIMENSIONS.hashtagSlot.y, '#FrameInGoa');

    // 8. Name Plate Container (Clean, focused, prominent)
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

    const builderName = (state.name || 'YOUR NAME').toUpperCase();
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

    // 9. Role Badge Pill (Clean, high contrast)
    const rp = DIMENSIONS.rolePill;
    const roleStr = (state.role || 'YOUR ROLE').toUpperCase();
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
      maxSize: 36,
      minSize: 18,
      tracking: 3
    });
    ctx.fillStyle = PALETTE.yellow;
    ctx.textBaseline = 'middle';
    drawTracked(ctx, `❖  ${roleStr}  ❖`, rp.x + rp.w / 2, rp.y + rp.h / 2 + 2, fittedRole.tracking);
    ctx.restore();

    // 10. Squad & Serial Pill
    const serialStr = state.serial || `#GOA-2026-${Math.abs(this.hashCode(state.name || 'BUILDER')).toString(16).toUpperCase().padStart(4, '0')}A`;
    const teamStr = (state.teamName || '').toUpperCase();
    const fullSerial = teamStr ? `TEAM: ${teamStr}  ·  ${serialStr}` : serialStr;

    ctx.save();
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const serialW = Math.min(measureTracked(ctx, fullSerial, 2) + 48, 720);
    roundRectPath(ctx, DIMENSIONS.serialSlot.cx - serialW / 2, DIMENSIONS.serialSlot.y, serialW, 42, 21);
    ctx.fillStyle = 'rgba(1, 53, 31, 0.95)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(253, 211, 2, 0.85)';
    ctx.stroke();
    ctx.fillStyle = PALETTE.cream;
    drawTracked(ctx, fullSerial, DIMENSIONS.serialSlot.cx, DIMENSIONS.serialSlot.y + 21 + 1, 2);
    ctx.restore();

    // 11. Bottom Scannable QR Code
    const qrP = DIMENSIONS.qrSlot;
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

    // 12. Bottom Portuguese Azulejo Mosaic Tile Band
    this.drawAzulejoMosaicBand(ctx, 36, h - 44, w - 72, 22);

    // 13. Top Lanyard Slot Cutout
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
  // FORMAT B: BUILDER ID CARD - BACK (998 x 1436 px) - GEN-Z HOUSE RULES
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
    bgGrad.addColorStop(0, '#025229');
    bgGrad.addColorStop(0.3, '#01381c');
    bgGrad.addColorStop(0.7, '#012613');
    bgGrad.addColorStop(1, '#01150a');
    ctx.fillStyle = bgGrad;
    roundRectPath(ctx, 0, 0, w, h, 32);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.yellow;
    roundRectPath(ctx, 14, 14, w - 28, h - 28, 22);
    ctx.stroke();

    // 2. Header Title: HACKER [गोवा] HOUSE
    const titleY = 140;
    this.drawTitleBlock(ctx, w / 2, titleY);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(254, 247, 230, 0.9)';
    drawTracked(ctx, '4 DAYS. ONE RHYTHM. EVERYTHING INTENTIONAL.', w / 2, titleY + 64, 2);
    ctx.restore();

    // Decorative Gold Star divider
    ctx.save();
    ctx.fillStyle = PALETTE.yellow;
    ctx.font = '20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❖', w / 2, titleY + 96);
    ctx.restore();

    // 3. Upper QR Code & Scanner Instructions Block
    const qrBoxX = 80;
    const qrBoxY = 270;
    const qrBoxSize = 250;

    // White QR Container
    ctx.save();
    roundRectPath(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 40, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    if (this.qrImage) {
      ctx.drawImage(this.qrImage, qrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
    }

    // Barcode serial below QR
    const serialStr = state.serial || `#GOA-2026-${Math.abs(this.hashCode(state.name || 'BUILDER')).toString(16).toUpperCase().padStart(4, '0')}A`;
    drawBarcode(ctx, serialStr, qrBoxX + 16, qrBoxY + qrBoxSize - 6, qrBoxSize - 32, 16);

    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.greenInk;
    ctx.textAlign = 'center';
    ctx.fillText(serialStr, qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 26);
    ctx.restore();

    // Right Side: SCAN ME + Explanatory Text + Sun/Boat Vector Art
    const infoX = qrBoxX + qrBoxSize + 48;
    ctx.save();
    ctx.font = '900 32px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'left';
    ctx.fillText('❖  SCAN ME  ❖', infoX, qrBoxY + 45);

    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#fefce8';
    ctx.fillText('SCAN THIS QR CODE FOR', infoX, qrBoxY + 90);
    ctx.fillText('SCHEDULE, ANNOUNCEMENTS,', infoX, qrBoxY + 118);
    ctx.fillText('UPDATES & IMPORTANT', infoX, qrBoxY + 146);
    ctx.fillText('INFORMATION.', infoX, qrBoxY + 174);

    // Vector Sun & Boat Art
    this.drawGoanSunAndSail(ctx, infoX + 120, qrBoxY + 240);
    ctx.restore();

    // 4. Portuguese Azulejo Floral Mosaic Ribbon Divider
    this.drawAzulejoMosaicBand(ctx, 30, 600, w - 60, 24);

    // 5. Gen-Z Rules & Regulations Section
    const rulesY = 665;
    this.drawRolePill(ctx, w / 2, rulesY, 'RULES & REGULATIONS');

    const rules = [
      {
        icon: '🪪',
        text: 'THIS ID CARD IS PERSONAL AND NON-TRANSFERABLE.\nALWAYS WEAR IT DURING THE EVENT.'
      },
      {
        icon: '🤝',
        text: 'RESPECT EVERY HACKER. NO HATE, NO HARASSMENT,\nNO DISRESPECT.'
      },
      {
        icon: '🔇',
        text: 'MAINTAIN SILENCE IN SESSION ROOMS.\nKEEP THE VIBE FOCUSED.'
      },
      {
        icon: '🗑️',
        text: "KEEP THE VENUE CLEAN. USE DUSTBINS.\nLET'S LEAVE NO TRACE."
      },
      {
        icon: '🛡️',
        text: "FOLLOW ALL SAFETY GUIDELINES.\nORGANIZERS' DECISIONS ARE FINAL."
      }
    ];

    ctx.save();
    let curY = rulesY + 65;
    rules.forEach((item) => {
      // Icon Box
      ctx.font = '26px "Space Grotesk", sans-serif';
      ctx.fillText(item.icon, 80, curY + 10);

      // Text Lines
      ctx.font = '700 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(254, 252, 232, 0.95)';
      ctx.textAlign = 'left';

      const lines = item.text.split('\n');
      ctx.fillText(lines[0], 130, curY);
      if (lines[1]) {
        ctx.font = '500 15px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(254, 252, 232, 0.75)';
        ctx.fillText(lines[1], 130, curY + 24);
      }

      // Subtle dashed rule divider
      ctx.strokeStyle = 'rgba(253, 211, 2, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(130, curY + 42);
      ctx.lineTo(w - 380, curY + 42);
      ctx.stroke();
      ctx.setLineDash([]);

      curY += 72;
    });
    ctx.restore();

    // Beach Vibe Vector Elements on Bottom Right (Palm, Umbrella, Scooter)
    this.drawBeachVibeIllustration(ctx, w - 240, h - 220);

    // 6. Yellow Footer Bar across full card base
    ctx.save();
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillRect(14, h - 80, w - 28, 66);

    ctx.font = '900 24px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.greenInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❖  GOA, INDIA  •  28 – 31 OCT 2026  ❖', w / 2, h - 47);
    ctx.restore();

    // 7. Top Lanyard Slot Cutout
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
  // =========================================================================
  renderPFP(state, scale = 1.0) {
    const canvas = document.createElement('canvas');
    const size = Math.round(DIMENSIONS.pfp.size * scale);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const s = DIMENSIONS.pfp.size;
    const center = s / 2;
    const innerR = 345;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    // 1. Ambient Emerald Backdrop
    const bgGrad = ctx.createRadialGradient(center, center, 140, center, center, s / 2);
    bgGrad.addColorStop(0, '#0a3822');
    bgGrad.addColorStop(0.7, '#041f13');
    bgGrad.addColorStop(1, '#021008');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, s, s);

    // Corner Ambient Flourishes
    this.drawCornerCyberHUD(ctx, s);

    // 2. User Avatar Photo (Clipped Circle)
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();

    const photoBox = {
      x: center - innerR,
      y: center - innerR,
      w: innerR * 2,
      h: innerR * 2
    };

    if (this.userImage) {
      drawCoveredImage(ctx, this.userImage, photoBox, state);
    } else {
      this.drawAvatarSilhouette(ctx, center, center, 150);
    }
    ctx.restore();

    // 3. Neon Outer Glow Rings
    ctx.save();
    ctx.shadowColor = 'rgba(0, 242, 254, 0.6)';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(center, center, innerR + 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.beginPath();
    ctx.arc(center, center, innerR + 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Proportional Curved Top Typography
    ctx.save();
    ctx.font = '900 32px "Syne", "Bodoni Moda", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
    ctx.shadowBlur = 10;
    drawArcTextProportional(ctx, 'HACKER HOUSE GOA · 28-31 OCT', center, center, innerR + 68, -Math.PI / 2, true, 4);
    ctx.restore();

    // Top Studio Pill
    ctx.save();
    const pillW = 260;
    const pillH = 34;
    const pillY = 36;
    roundRectPath(ctx, center - pillW / 2, pillY, pillW, pillH, 17);
    ctx.fillStyle = 'rgba(2, 103, 51, 0.95)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2:47PM STUDIO // HHGOA.COM', center, pillY + pillH / 2 + 1);
    ctx.restore();

    // 5. Proportional Curved Bottom Typography
    ctx.save();
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;
    drawArcTextProportional(ctx, '◆  247 BUILDERS  ·  GOA RESIDENCY  ◆', center, center, innerR + 56, Math.PI / 2, false, 3.5);
    ctx.restore();

    // Bottom Badge Plaque
    ctx.save();
    const bannerW = 460;
    const bannerH = 56;
    const bannerY = 860;
    roundRectPath(ctx, center - bannerW / 2, bannerY, bannerW, bannerH, 28);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.font = '900 24px "Syne", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HACKER HOUSE GOA 2026', center, bannerY + bannerH / 2);
    ctx.restore();

    ctx.restore();
    return canvas;
  }

  // =========================================================================
  // 16:9 SHOWCASE FOR X POSTS (2400 x 1350 px)
  // =========================================================================
  renderXPostShowcase(state) {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    const front = this.renderCardFront(state, 0.82);
    const back = this.renderCardBack(state, 0.82);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 2400, 1350);
    bgGrad.addColorStop(0, '#01150a');
    bgGrad.addColorStop(0.5, '#022915');
    bgGrad.addColorStop(1, '#011008');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2400, 1350);

    // Title
    ctx.font = '900 64px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'center';
    ctx.fillText('HACKER HOUSE GOA 2026', 1200, 110);

    ctx.font = '700 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(254, 252, 232, 0.85)';
    ctx.fillText('OFFICIAL RESIDENCY PASS  •  28 – 31 OCT 2026  •  @247PMSTUDIO', 1200, 160);

    // Draw Front & Back Cards Side-by-Side with Shadow
    const cardY = 210;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    ctx.drawImage(front, 320, cardY);
    ctx.drawImage(back, 1260, cardY);
    ctx.restore();

    return canvas;
  }

  // Helper Drawing Routines
  drawTitleBlock(ctx, cx, cy) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textHacker = 'HACKER';
    const textHouse = 'HOUSE';
    const textGoa = 'गोवा';

    ctx.font = '900 68px "Bodoni Moda", "Syne", serif';
    const wHacker = ctx.measureText(textHacker).width;
    const wHouse = ctx.measureText(textHouse).width;

    ctx.font = '900 40px "Syne", sans-serif';
    const wGoaBox = 110;
    const hGoaBox = 54;
    const totalW = wHacker + wGoaBox + wHouse + 40;

    let curX = cx - totalW / 2;

    // HACKER
    ctx.font = '900 68px "Bodoni Moda", "Syne", serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'left';
    ctx.fillText(textHacker, curX, cy);
    curX += wHacker + 20;

    // [गोवा] Neon Pink Pill
    ctx.save();
    roundRectPath(ctx, curX, cy - hGoaBox / 2, wGoaBox, hGoaBox, 14);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.font = '800 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(textGoa, curX + wGoaBox / 2, cy + 2);
    ctx.restore();

    curX += wGoaBox + 20;

    // HOUSE
    ctx.font = '900 68px "Bodoni Moda", "Syne", serif';
    ctx.fillStyle = PALETTE.yellow;
    ctx.textAlign = 'left';
    ctx.fillText(textHouse, curX, cy);
    ctx.restore();
  }

  drawPalmLeavesArch(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 211, 2, 0.35)';
    ctx.lineWidth = 2;
    // Subtle Goan palm contour
    ctx.beginPath();
    ctx.arc(x - 30, y + 200, 80, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + w + 30, y + 200, 80, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
    ctx.stroke();
    ctx.restore();
  }

  drawGoanSunAndSail(ctx, cx, cy) {
    ctx.save();
    // Sun
    ctx.fillStyle = PALETTE.yellow;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, Math.PI, 0);
    ctx.fill();

    // Waves
    ctx.strokeStyle = PALETTE.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 8);
    ctx.lineTo(cx + 60, cy + 8);
    ctx.moveTo(cx - 40, cy + 18);
    ctx.lineTo(cx + 40, cy + 18);
    ctx.stroke();

    // Sailboat
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy + 4);
    ctx.lineTo(cx - 70, cy - 24);
    ctx.lineTo(cx - 65, cy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawBeachVibeIllustration(ctx, cx, cy) {
    ctx.save();
    // Palm tree vector line
    ctx.strokeStyle = 'rgba(254, 252, 232, 0.85)';
    ctx.lineWidth = 2.5;

    // Palm Trunk
    ctx.beginPath();
    ctx.moveTo(cx + 100, cy + 160);
    ctx.quadraticCurveTo(cx + 80, cy + 60, cx + 110, cy - 40);
    ctx.stroke();

    // Palm Fronds
    const fx = cx + 110;
    const fy = cy - 40;
    [-0.6, -0.2, 0.2, 0.6, 1.0].forEach(angle => {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + Math.cos(angle) * 70, fy - 30 + Math.sin(angle) * 50, fx + Math.cos(angle) * 110, fy + Math.sin(angle) * 70);
      ctx.stroke();
    });

    // Beach Umbrella
    ctx.fillStyle = PALETTE.pink;
    ctx.beginPath();
    ctx.arc(cx - 40, cy + 80, 44, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = PALETTE.yellow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 80);
    ctx.lineTo(cx - 30, cy + 160);
    ctx.stroke();

    // Pink Scooter
    ctx.fillStyle = PALETTE.pink;
    roundRectPath(ctx, cx - 120, cy + 130, 65, 24, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 110, cy + 155, 12, 0, Math.PI * 2);
    ctx.arc(cx - 65, cy + 155, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCornerCyberHUD(ctx, size) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    ctx.lineWidth = 2;

    const len = 45;
    ctx.beginPath();
    ctx.moveTo(30, 30 + len);
    ctx.lineTo(30, 30);
    ctx.lineTo(30 + len, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size - 30 - len, 30);
    ctx.lineTo(size - 30, 30);
    ctx.lineTo(size - 30, 30 + len);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(30, size - 30 - len);
    ctx.lineTo(30, size - 30);
    ctx.lineTo(30 + len, size - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size - 30 - len, size - 30);
    ctx.lineTo(size - 30, size - 30);
    ctx.lineTo(size - 30, size - 30 - len);
    ctx.stroke();
    ctx.restore();
  }

  drawRibbonBanner(ctx, cx, cy, text, w = 280, h = 48) {
    ctx.save();
    const tailW = 16;
    ctx.fillStyle = '#b8930a';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy - h / 2 + 4);
    ctx.lineTo(cx - w / 2 - tailW, cy);
    ctx.lineTo(cx - w / 2, cy + h / 2 - 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + w / 2, cy - h / 2 + 4);
    ctx.lineTo(cx + w / 2 + tailW, cy);
    ctx.lineTo(cx + w / 2, cy + h / 2 - 4);
    ctx.closePath();
    ctx.fill();

    const grad = ctx.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2);
    grad.addColorStop(0, '#fff4b0');
    grad.addColorStop(0.45, PALETTE.yellow);
    grad.addColorStop(1, '#b8930a');
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(1, 53, 31, 0.4)';
    ctx.stroke();

    ctx.font = '900 22px "Syne", sans-serif';
    ctx.fillStyle = PALETTE.greenInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  drawRolePill(ctx, cx, cy, text) {
    ctx.save();
    const pillW = 380;
    const pillH = 50;

    roundRectPath(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fillStyle = PALETTE.pink;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.yellow;
    ctx.stroke();

    ctx.font = '900 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`❖  ${text.toUpperCase()}  ❖`, cx, cy);
    ctx.restore();
  }

  drawAzulejoMosaicBand(ctx, x, y, width, height) {
    ctx.save();
    const count = Math.round(width / height);
    const step = width / count;

    ctx.strokeStyle = 'rgba(253, 211, 2, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const tx = x + i * step;
      const alt = i % 2 === 0;

      ctx.fillStyle = alt ? PALETTE.cream : PALETTE.greenInk;
      ctx.fillRect(tx, y, step, height);

      const cx = tx + step / 2;
      const cy = y + height / 2;
      const motifColor = alt ? PALETTE.greenInk : PALETTE.yellow;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = motifColor;
      ctx.rotate(Math.PI / 4);
      const r = height * 0.24;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = motifColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, height * 0.36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
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
