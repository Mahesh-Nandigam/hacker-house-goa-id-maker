import { GraphicGenerator, PALETTE, EVENT } from './generator.js';
import { sound } from './sound.js';
import confetti from 'canvas-confetti';
import heic2any from 'heic2any';

// App State
const state = {
  activePage: 'maker', // Direct to studio by default
  mode: 'card', // 'card' | 'pfp'
  zoom: 1.0,
  rotate: 0,
  panX: 0,
  panY: 0,
  name: 'Ada Lovelace',
  role: 'AI Engineer',
  teamName: 'XENOX',
  serial: '#GOA-2026-8704A',
  qrUrl: 'https://hacker-house-goa-2026.devfolio.co/'
};

const generator = new GraphicGenerator();

// Page Views
const pageHome = document.getElementById('pageHome');
const pageMaker = document.getElementById('pageMaker');
const pageSchedule = document.getElementById('pageSchedule');

// Navigation Tabs
const navLogoBtn = document.getElementById('navLogoBtn');
const navTabHome = document.getElementById('navTabHome');
const navTabMaker = document.getElementById('navTabMaker');
const navTabSchedule = document.getElementById('navTabSchedule');
const btnHeroCreate = document.getElementById('btnHeroCreate');

// Studio DOM Elements
const canvasFront = document.getElementById('canvasFront');
const canvasBack = document.getElementById('canvasBack');
const card3dObject = document.getElementById('card3dObject');
const card3dScene = document.getElementById('card3dScene');
const btnFlipCard = document.getElementById('btnFlipCard');
const btnAutoSpin = document.getElementById('btnAutoSpin');
const flipInstructionText = document.getElementById('flipInstructionText');

// Mode Tabs
const tabModeCard = document.getElementById('tabModeCard');
const tabModePfp = document.getElementById('tabModePfp');
const idCardSettings = document.getElementById('idCardSettings');
const pfpSettings = document.getElementById('pfpSettings');

// File Upload
const fileInput = document.getElementById('fileInput');
const uploadTriggerBtn = document.getElementById('uploadTriggerBtn');

// Pan Pad Crosshair
const panPad = document.getElementById('panPad');
const panCursor = document.getElementById('panCursor');

// Sliders & Adjustments
const zoomRange = document.getElementById('zoomRange');
const zoomVal = document.getElementById('zoomVal');
const rotateRange = document.getElementById('rotateRange');
const rotateVal = document.getElementById('rotateVal');
const btnRotateCCW = document.getElementById('btnRotateCCW');
const btnRotateCW = document.getElementById('btnRotateCW');
const btnFillFrame = document.getElementById('btnFillFrame');
const btnResetTransform = document.getElementById('btnResetTransform');

// Form Inputs
const inputName = document.getElementById('inputName');
const inputRole = document.getElementById('inputRole');
const inputTeam = document.getElementById('inputTeam');

// Download & Action Buttons
const btnDownloadFront = document.getElementById('btnDownloadFront');
const btnDownloadBack = document.getElementById('btnDownloadBack');
const btnDownloadBoth = document.getElementById('btnDownloadBoth');
const btnShareX = document.getElementById('btnShareX');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');

// Toast
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const toastIcon = document.getElementById('toastIcon');

function showToast(msg, icon = '✨') {
  toastMsg.innerText = msg;
  toastIcon.innerText = icon;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2200);
}

// ----------------------------------------------------
// PAGE NAVIGATION ROUTER
// ----------------------------------------------------
function navigateTo(pageId) {
  state.activePage = pageId;
  sound.click();

  [pageHome, pageMaker, pageSchedule].forEach(page => {
    page.classList.add('hidden');
    page.classList.remove('flex');
  });

  [navTabHome, navTabMaker, navTabSchedule].forEach(tab => tab.classList.remove('active'));

  if (pageId === 'home') {
    pageHome.classList.remove('hidden');
    pageHome.classList.add('flex');
    navTabHome.classList.add('active');
  } else if (pageId === 'maker') {
    pageMaker.classList.remove('hidden');
    navTabMaker.classList.add('active');
    render();
  } else if (pageId === 'schedule') {
    pageSchedule.classList.remove('hidden');
    navTabSchedule.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLogoBtn.addEventListener('click', () => navigateTo('home'));
navTabHome.addEventListener('click', () => navigateTo('home'));
navTabMaker.addEventListener('click', () => navigateTo('maker'));
navTabSchedule.addEventListener('click', () => navigateTo('schedule'));
btnHeroCreate.addEventListener('click', () => navigateTo('maker'));

// Global Persona Loader (exposed on window for quick-fill onclick handlers)
window.loadPersona = (name, role, team) => {
  state.name = name;
  state.role = role;
  state.teamName = team;
  inputName.value = name;
  inputRole.value = role;
  inputTeam.value = team;
  navigateTo('maker');
  showToast(`Loaded ${name}'s Pass!`, '⚡');
};

// Countdown Timer
function updateCountdown() {
  const targetDate = new Date('2026-10-28T09:00:00+05:30').getTime();
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const elDays = document.getElementById('countdownDays');
    const elHours = document.getElementById('countdownHours');
    const elMins = document.getElementById('countdownMins');
    const elSecs = document.getElementById('countdownSecs');

    if (elDays) elDays.innerText = String(days).padStart(2, '0');
    if (elHours) elHours.innerText = String(hours).padStart(2, '0');
    if (elMins) elMins.innerText = String(mins).padStart(2, '0');
    if (elSecs) elSecs.innerText = String(secs).padStart(2, '0');
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ----------------------------------------------------
// CANVAS RENDERING
// ----------------------------------------------------
async function render() {
  if (state.mode === 'card') {
    const frontOutput = generator.renderCardFront(state, 0.75);
    canvasFront.width = frontOutput.width;
    canvasFront.height = frontOutput.height;
    const ctxFront = canvasFront.getContext('2d');
    ctxFront.drawImage(frontOutput, 0, 0);

    const backOutput = generator.renderCardBack(state, 0.75);
    canvasBack.width = backOutput.width;
    canvasBack.height = backOutput.height;
    const ctxBack = canvasBack.getContext('2d');
    ctxBack.drawImage(backOutput, 0, 0);
  } else {
    const pfpOutput = generator.renderPFP(state, 1.0);
    canvasFront.width = pfpOutput.width;
    canvasFront.height = pfpOutput.height;
    const ctxFront = canvasFront.getContext('2d');
    ctxFront.drawImage(pfpOutput, 0, 0);
  }
}

// ----------------------------------------------------
// 3D ORBIT & DRAG-TO-SPIN ENGINE
// ----------------------------------------------------
let rotationY = 0;
let tiltX = 0;
let autoSpinActive = false;
let spinVelocity = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let isCardDragging = false;

function updateFlipStateDisplay() {
  if (state.mode === 'pfp') return;
  const normalized = ((rotationY % 360) + 360) % 360;
  if (normalized > 90 && normalized < 270) {
    flipInstructionText.innerText = 'Showing the back — click the card to flip it over.';
  } else {
    flipInstructionText.innerText = 'Showing the front — click the card to flip it over.';
  }
}

function apply3DRotation() {
  card3dObject.style.transform = `rotateX(${tiltX}deg) rotateY(${rotationY}deg)`;
  updateFlipStateDisplay();
}

function animate3D() {
  if (autoSpinActive) {
    rotationY = (rotationY + 0.65) % 360;
    apply3DRotation();
  } else if (!isCardDragging && Math.abs(spinVelocity) > 0.05) {
    rotationY += spinVelocity;
    spinVelocity *= 0.93;
    tiltX *= 0.9;
    apply3DRotation();
  } else if (!isCardDragging && Math.abs(tiltX) > 0.05) {
    tiltX *= 0.88;
    apply3DRotation();
  }
  requestAnimationFrame(animate3D);
}
requestAnimationFrame(animate3D);

// Drag Handlers for 3D Orbit (Both Card & PFP)
card3dScene.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  isCardDragging = true;
  autoSpinActive = false;
  btnAutoSpin.classList.remove('bg-[#fdd302]', 'text-[#04120a]');
  btnAutoSpin.classList.add('text-[#fefce8]/50');
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  card3dObject.style.transition = 'none';
});

window.addEventListener('mousemove', (e) => {
  if (!isCardDragging) return;
  const deltaX = e.clientX - lastPointerX;
  const deltaY = e.clientY - lastPointerY;
  spinVelocity = deltaX * 0.45;
  rotationY += spinVelocity;
  tiltX = Math.max(-18, Math.min(18, tiltX - deltaY * 0.35));
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  apply3DRotation();
});

window.addEventListener('mouseup', () => {
  if (!isCardDragging) return;
  isCardDragging = false;
  card3dObject.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
});

// Touch Handlers (Mobile Support)
card3dScene.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  isCardDragging = true;
  autoSpinActive = false;
  lastPointerX = e.touches[0].clientX;
  lastPointerY = e.touches[0].clientY;
  card3dObject.style.transition = 'none';
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isCardDragging || e.touches.length !== 1) return;
  const deltaX = e.touches[0].clientX - lastPointerX;
  const deltaY = e.touches[0].clientY - lastPointerY;
  spinVelocity = deltaX * 0.45;
  rotationY += spinVelocity;
  tiltX = Math.max(-18, Math.min(18, tiltX - deltaY * 0.35));
  lastPointerX = e.touches[0].clientX;
  lastPointerY = e.touches[0].clientY;
  apply3DRotation();
}, { passive: true });

window.addEventListener('touchend', () => {
  isCardDragging = false;
  card3dObject.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
});

// Flip Button
btnFlipCard.addEventListener('click', () => {
  sound.click();
  autoSpinActive = false;
  card3dObject.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  const normalized = ((rotationY % 360) + 360) % 360;
  if (normalized < 90 || normalized >= 270) {
    rotationY = 180;
    showToast('Flipped to Back Side', '🔄');
  } else {
    rotationY = 0;
    showToast('Flipped to Front Side', '🔄');
  }
  apply3DRotation();
});

// 3D Auto-Spin
btnAutoSpin.addEventListener('click', () => {
  sound.click();
  autoSpinActive = !autoSpinActive;
  if (autoSpinActive) {
    btnAutoSpin.classList.add('bg-[#fdd302]', 'text-[#04120a]');
    btnAutoSpin.classList.remove('text-[#fefce8]/50');
    showToast('3D Orbit Active', '✨');
  } else {
    btnAutoSpin.classList.remove('bg-[#fdd302]', 'text-[#04120a]');
    btnAutoSpin.classList.add('text-[#fefce8]/50');
    showToast('3D Orbit Paused', '⏸️');
  }
});

const cardBackFace = document.getElementById('cardBackFace');

// Mode Switch (Card vs PFP)
function setMode(mode) {
  state.mode = mode;
  sound.click();

  if (mode === 'card') {
    tabModeCard.classList.add('active');
    tabModePfp.classList.remove('active');
    idCardSettings.classList.remove('hidden');
    pfpSettings.classList.add('hidden');
    btnFlipCard.classList.remove('hidden');
    btnAutoSpin.classList.remove('hidden');
    btnDownloadBack.classList.remove('hidden');
    btnDownloadBoth.classList.remove('hidden');
    btnDownloadFront.innerText = 'Front';
    btnDownloadBack.innerText = 'Back';
    btnDownloadBoth.innerText = 'Both sides';
    flipInstructionText.innerText = 'Showing the front — click the card to flip it over.';
    cardBackFace.classList.remove('hidden');
    card3dObject.classList.remove('is-disc');
  } else {
    tabModePfp.classList.add('active');
    tabModeCard.classList.remove('active');
    pfpSettings.classList.remove('hidden');
    idCardSettings.classList.add('hidden');
    btnFlipCard.classList.add('hidden');
    btnAutoSpin.classList.remove('hidden');
    btnDownloadBack.classList.add('hidden');
    btnDownloadBoth.classList.add('hidden');
    btnDownloadFront.innerText = 'Download PFP';
    flipInstructionText.innerText = 'Drag to spin the disc • Front-only 3D frame, ready for X & LinkedIn';
    cardBackFace.classList.add('hidden');
    card3dObject.classList.add('is-disc');
    rotationY = 0;
    apply3DRotation();
  }
  render();
}

tabModeCard.addEventListener('click', () => setMode('card'));
tabModePfp.addEventListener('click', () => setMode('pfp'));

// Upload Trigger & File Handling
uploadTriggerBtn.addEventListener('click', () => fileInput.click());

async function handleFile(file) {
  if (!file) return;

  sound.click();
  try {
    let imageBlob = file;

    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      showToast('Converting iPhone HEIC...', '📱');
      imageBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92
      });
      if (Array.isArray(imageBlob)) imageBlob = imageBlob[0];
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      await generator.setUserImage(e.target.result);
      showToast('Photo uploaded successfully!', '📸');
      render();
    };
    reader.readAsDataURL(imageBlob);
  } catch (err) {
    showToast('Failed to load image format', '⚠️');
  }
}

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

// Drag & Drop
['dragenter', 'dragover'].forEach(eventName => {
  uploadTriggerBtn.addEventListener(eventName, (e) => {
    e.preventDefault();
    uploadTriggerBtn.classList.add('border-[#fdd302]', 'bg-[#fdd302]/10');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  uploadTriggerBtn.addEventListener(eventName, (e) => {
    e.preventDefault();
    uploadTriggerBtn.classList.remove('border-[#fdd302]', 'bg-[#fdd302]/10');
  });
});
uploadTriggerBtn.addEventListener('drop', (e) => {
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// Crosshair Pan Pad
let isPanPadDragging = false;

function updatePanFromPad(e) {
  const rect = panPad.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

  panCursor.style.left = `${x}px`;
  panCursor.style.top = `${y}px`;

  state.panX = ((x / rect.width) - 0.5) * 500;
  state.panY = ((y / rect.height) - 0.5) * 500;
  render();
}

panPad.addEventListener('mousedown', (e) => {
  isPanPadDragging = true;
  updatePanFromPad(e);
});
window.addEventListener('mousemove', (e) => {
  if (isPanPadDragging) updatePanFromPad(e);
});
window.addEventListener('mouseup', () => {
  isPanPadDragging = false;
});
panPad.addEventListener('touchstart', (e) => {
  isPanPadDragging = true;
  updatePanFromPad(e);
});
window.addEventListener('touchmove', (e) => {
  if (isPanPadDragging) updatePanFromPad(e);
});
window.addEventListener('touchend', () => {
  isPanPadDragging = false;
});

// Sliders: Zoom & Rotate
zoomRange.addEventListener('input', (e) => {
  state.zoom = parseFloat(e.target.value);
  zoomVal.innerText = `${state.zoom.toFixed(2)}×`;
  sound.tick();
  render();
});

rotateRange.addEventListener('input', (e) => {
  state.rotate = parseInt(e.target.value, 10);
  rotateVal.innerText = `${state.rotate}°`;
  sound.tick();
  render();
});

btnRotateCCW.addEventListener('click', () => {
  state.rotate = (state.rotate - 90 + 360) % 360;
  if (state.rotate > 180) state.rotate -= 360;
  rotateRange.value = state.rotate;
  rotateVal.innerText = `${state.rotate}°`;
  sound.click();
  render();
});

btnRotateCW.addEventListener('click', () => {
  state.rotate = (state.rotate + 90) % 360;
  if (state.rotate > 180) state.rotate -= 360;
  rotateRange.value = state.rotate;
  rotateVal.innerText = `${state.rotate}°`;
  sound.click();
  render();
});

btnFillFrame.addEventListener('click', () => {
  state.zoom = 1.35;
  zoomRange.value = 1.35;
  zoomVal.innerText = '1.35×';
  sound.click();
  showToast('Fit to frame', '🔍');
  render();
});

btnResetTransform.addEventListener('click', () => {
  state.zoom = 1.0;
  state.rotate = 0;
  state.panX = 0;
  state.panY = 0;
  zoomRange.value = 1.0;
  zoomVal.innerText = '1.00×';
  rotateRange.value = 0;
  rotateVal.innerText = '0°';
  panCursor.style.left = '50%';
  panCursor.style.top = '50%';
  sound.click();
  showToast('Position reset', '🎯');
  render();
});

// Role Pills Selector
document.querySelectorAll('.role-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const roleText = pill.innerText.trim();
    state.role = roleText;
    inputRole.value = roleText;
    sound.click();
    showToast(`Role: ${roleText}`, '❖');
    render();
  });
});

// Form Inputs
inputName.addEventListener('input', (e) => {
  state.name = e.target.value;
  state.serial = `#GOA-2026-${Math.abs(generator.hashCode(state.name || 'BUILDER')).toString(16).toUpperCase().padStart(4, '0')}A`;
  render();
});

inputRole.addEventListener('input', (e) => {
  state.role = e.target.value;
  render();
});

inputTeam.addEventListener('input', (e) => {
  state.teamName = e.target.value;
  render();
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
  const enabled = sound.toggle();
  soundIcon.innerText = enabled ? '🔊' : '🔇';
  soundText.innerText = enabled ? 'SFX' : 'MUTED';
  sound.click();
  showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted', enabled ? '🔊' : '🔇');
});

// Download Handlers
function triggerDownload(canvas, filename) {
  sound.success();

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#10b981', '#fdd302', '#ff007a', '#00f2fe']
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  showToast('Downloaded in HD!', '🎉');
}

btnDownloadFront.addEventListener('click', () => {
  if (state.mode === 'card') {
    const canvas = generator.renderCardFront(state, 1.5);
    triggerDownload(canvas, `HHGoa2026_ID_Front_${(state.name || 'Builder').replace(/\s+/g, '_')}.png`);
  } else {
    const canvas = generator.renderPFP(state, 2.0);
    triggerDownload(canvas, `HHGoa2026_PFP_${(state.name || 'Builder').replace(/\s+/g, '_')}.png`);
  }
});

btnDownloadBack.addEventListener('click', () => {
  const canvas = generator.renderCardBack(state, 1.5);
  triggerDownload(canvas, `HHGoa2026_ID_Back_${(state.name || 'Builder').replace(/\s+/g, '_')}.png`);
});

btnDownloadBoth.addEventListener('click', () => {
  const canvas = generator.renderXPostShowcase(state);
  triggerDownload(canvas, `HHGoa2026_BothSides_${(state.name || 'Builder').replace(/\s+/g, '_')}.png`);
});

// Share to X (Option 3 Pure Human Vibe)
btnShareX.addEventListener('click', () => {
  sound.click();
  const tweetText = `ready for Hacker House Goa 🪪\n\ncooked up a custom 3D builder ID maker for the squad.\n\ntry it here and flex yours:\nhttps://hacker-house-goa-id-maker.vercel.app/\n\n#FrameInGoa @247pmstudio`;

  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  showToast('Opening X with official caption...', '🐦');
});

// Initialize on Load
async function init() {
  await generator.loadTemplates();
  await generator.generateQRCode(state.qrUrl);
  await generator.setUserImage('/sample-avatar.jpg');
  render();
}

init();

// ----------------------------------------------------
// FLOW TIMELINE: day-jump tabs <-> horizontal scroll-snap track
// ----------------------------------------------------
const timelineTrack = document.getElementById('timelineTrack');
const timelineTabs = document.querySelectorAll('.timeline-tab');
const timelineDays = document.querySelectorAll('.timeline-day');

if (timelineTrack && timelineTabs.length && timelineDays.length) {
  timelineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const dayEl = document.querySelector(`.timeline-day[data-day="${tab.dataset.day}"]`);
      if (!dayEl) return;
      sound.click();
      dayEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
  });

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const day = entry.target.dataset.day;
      timelineTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.day === day));
    });
  }, { root: timelineTrack, threshold: 0.6 });

  timelineDays.forEach(day => timelineObserver.observe(day));
}
