# Hacker House Goa 2026 - ID & PFP Generator

Client-side badge and profile frame generator built for Hacker House Goa 2026. Generates high-resolution builder identification passes, circular avatar overlays, and 16:9 social showcase cards with real-time 3D orbit controls.

Live App: https://hacker-house-goa-id-maker.vercel.app

## Overview

The application runs entirely in the browser using the HTML5 Canvas 2D API. It supports client-side image transformations, HEIC decoding for iOS uploads, and vector procedural rendering for crisp output at any resolution.

## Features

- Format Options:
  - Builder ID Card: Dual-sided pass (998 x 1436 px) with photo clipping, verification QR code, security hash, and laser barcode.
  - PFP Frame: Circular avatar badge (1024 x 1024 px) with proportional curved typography.
  - 16:9 Showcase: Combined front/back presentation canvas (2400 x 1350 px) formatted for X timeline posts.
- Interactive 3D Preview: Pointer and touch drag-to-spin controls with momentum decay and realistic tilt physics.
- Image Editor: Client-side crop, zoom (0.5x - 3.0x), 360-degree rotation, and 2D pan controls.
- File Format Support: Supports PNG, JPG, WEBP, AVIF, and Apple HEIC (converted client-side via heic2any).
- Dynamic QR Generation: Generates scannable Devfolio verification links per badge.
- Audio Synthesis: Procedural UI click and feedback sounds synthesized via Web Audio API without external audio assets.
- Export Formats: High-resolution PNG exports with zero server-side processing.

## Tech Stack

- Runtime: Vanilla JavaScript (ES Modules)
- Styling: Tailwind CSS v4, CSS 3D Transforms
- Canvas Engine: HTML5 Canvas 2D API
- QR Engine: qrcode
- Image Decoder: heic2any
- FX: canvas-confetti
- Bundler: Vite 6

## Project Structure

```
hhgoa-frame-generator/
├── index.html          # Main application markup and studio interface
├── src/
│   ├── generator.js    # Canvas rendering engine and vector drawing routines
│   ├── main.js         # UI state management, 3D orbit engine, and file handlers
│   ├── sound.js        # Web Audio API procedural sound synthesizer
│   └── style.css       # Layout styles, 3D perspective, and theme definitions
├── public/             # Static assets and sample avatars
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
git clone https://github.com/Mahesh-Nandigam/hacker-house-goa-id-maker.git
cd hacker-house-goa-id-maker
npm install
```

### Development

```bash
npm run dev
```

The development server starts at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

The production output is generated in the `dist/` directory.

## License

MIT
