/**
 * TabKitty - Cat Generation & SVG Engine
 * Provides cute customizable cat SVG illustrations, breeds, animations and emotions.
 */

const CAT_BREEDS = {
  mochi: {
    id: 'mochi',
    name: 'Mochi (Calico)',
    desc: 'Sweet and curious with cozy calico patches',
    primaryColor: '#FFF8EF',
    patchColor1: '#B99AFF',
    patchColor2: '#FFB877',
    earColor: '#FFD6E7',
    eyeColor: '#29213F',
    blushColor: '#FFB7D5',
    unlocked: true,
  },
  oreo: {
    id: 'oreo',
    name: 'Oreo (Tuxedo)',
    desc: 'Dapper and focused, always in formal attire',
    primaryColor: '#29213F',
    patchColor1: '#FFF8EF',
    patchColor2: '#FFF8EF',
    earColor: '#FFD6E7',
    eyeColor: '#C8F2DF',
    blushColor: '#FF94B8',
    unlocked: true,
  },
  marmalade: {
    id: 'marmalade',
    name: 'Marmalade (Ginger Tabby)',
    desc: 'Warm and sunny with playful tiger stripes',
    primaryColor: '#FFC078',
    patchColor1: '#FFA94D',
    patchColor2: '#E8590C',
    earColor: '#FFE8CC',
    eyeColor: '#29213F',
    blushColor: '#FF8787',
    unlocked: true,
  },
  storm: {
    id: 'storm',
    name: 'Storm (Russian Blue)',
    desc: 'Mysterious, calm and loves a good afternoon snooze',
    primaryColor: '#8C92B5',
    patchColor1: '#6E749C',
    patchColor2: '#A4AACD',
    earColor: '#BFC3DC',
    eyeColor: '#C8F2DF',
    blushColor: '#B99AFF',
    unlocked: true,
  },
  cocoa: {
    id: 'cocoa',
    name: 'Cocoa (Siamese)',
    desc: 'Elegant cream body with rich cocoa ears and paws',
    primaryColor: '#FDFBF7',
    patchColor1: '#4A3728',
    patchColor2: '#694E38',
    earColor: '#4A3728',
    eyeColor: '#74C0FC',
    blushColor: '#FFD6E7',
    unlocked: false,
    unlockCondition: 'Save your first session',
  },
  wasabi: {
    id: 'wasabi',
    name: 'Wasabi (Matcha Cat)',
    desc: 'Fresh, zen-like pastel green with herbal tranquility',
    primaryColor: '#E6FCF5',
    patchColor1: '#C8F2DF',
    patchColor2: '#63E6BE',
    earColor: '#C8F2DF',
    eyeColor: '#29213F',
    blushColor: '#B99AFF',
    unlocked: false,
    unlockCondition: 'Create 3 custom rooms',
  },
  luna: {
    id: 'luna',
    name: 'Luna (Lavender Dream)',
    desc: 'Celestial kitten imbued with starlight and dreams',
    primaryColor: '#EBE4FF',
    patchColor1: '#B99AFF',
    patchColor2: '#9775FA',
    earColor: '#FFD6E7',
    eyeColor: '#FFE066',
    blushColor: '#FF94B8',
    unlocked: false,
    unlockCondition: 'Keep 10 or more active tabs organized',
  },
  blossom: {
    id: 'blossom',
    name: 'Blossom (Sakura)',
    desc: 'Gentle petal-pink coat reminiscent of spring blooms',
    primaryColor: '#FFF0F6',
    patchColor1: '#FFD6E7',
    patchColor2: '#FF8787',
    earColor: '#FCC2D7',
    eyeColor: '#29213F',
    blushColor: '#FF6B6B',
    unlocked: false,
    unlockCondition: 'Pin at least 2 important tabs',
  }
};

function createCatSvg(options = {}) {
  const breedId = options.breed && CAT_BREEDS[options.breed] ? options.breed : 'mochi';
  const breed = CAT_BREEDS[breedId];
  const isActive = Boolean(options.isActive);
  const isPinned = Boolean(options.isPinned);
  const isAudible = Boolean(options.isAudible);
  const isBlinking = Boolean(options.isBlinking);
  const isHappy = Boolean(options.isHappy);
  const size = options.size || 'md';

  const dims = {
    sm: { w: 48, h: 48 },
    md: { w: 96, h: 86 },
    lg: { w: 140, h: 120 }
  }[size] || { w: 96, h: 86 };

  const earPointsLeft = "24,38 32,10 48,28";
  const innerEarLeft = "27,35 33,16 45,28";
  const earPointsRight = "72,38 64,10 48,28";
  const innerEarRight = "69,35 63,16 51,28";

  let eyesMarkup = '';
  if (isBlinking) {
    eyesMarkup = `
      <line x1="33" y1="46" x2="43" y2="46" stroke="${breed.eyeColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="53" y1="46" x2="63" y2="46" stroke="${breed.eyeColor}" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else if (isActive || isHappy) {
    eyesMarkup = `
      <g class="kitty-eyes">
        <circle cx="38" cy="45" r="4.5" fill="${breed.eyeColor}"/>
        <circle cx="40" cy="43.5" r="1.6" fill="#FFFFFF"/>
        <circle cx="58" cy="45" r="4.5" fill="${breed.eyeColor}"/>
        <circle cx="60" cy="43.5" r="1.6" fill="#FFFFFF"/>
      </g>
    `;
  } else {
    eyesMarkup = `
      <g class="kitty-eyes-sleeping">
        <path d="M 32 46 Q 38 41 44 46" fill="none" stroke="${breed.eyeColor}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M 52 46 Q 58 41 64 46" fill="none" stroke="${breed.eyeColor}" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    `;
  }

  let moodParticle = '';
  if (!isActive) {
    moodParticle = `
      <g class="zzz-particles opacity-70">
        <text x="68" y="24" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="#B99AFF">Z</text>
        <text x="76" y="15" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="8" fill="#B99AFF">z</text>
        <text x="82" y="8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="6" fill="#B99AFF">z</text>
      </g>
    `;
  } else if (isHappy) {
    moodParticle = `
      <g class="happy-heart">
        <path d="M 72 18 C 72 14, 76 12, 79 16 C 82 12, 86 14, 86 18 C 86 23, 79 26, 79 26 C 79 26, 72 23, 72 18 Z" fill="#FF8787"/>
      </g>
    `;
  }

  let collarMarkup = '';
  if (isPinned) {
    collarMarkup = `
      <g class="kitty-collar">
        <path d="M 36 68 Q 48 74 60 68" fill="none" stroke="#B99AFF" stroke-width="3" stroke-linecap="round"/>
        <circle cx="48" cy="72" r="4" fill="#FFD43B" stroke="#F59F00" stroke-width="1"/>
        <line x1="48" y1="71" x2="48" y2="74" stroke="#D9480F" stroke-width="1"/>
      </g>
    `;
  }

  let audioMarkup = '';
  if (isAudible) {
    audioMarkup = `
      <g class="kitty-headphones">
        <path d="M 22 40 A 28 28 0 0 1 74 40" fill="none" stroke="#FF94B8" stroke-width="3"/>
        <rect x="18" y="38" width="6" height="12" rx="3" fill="#B99AFF"/>
        <rect x="72" y="38" width="6" height="12" rx="3" fill="#B99AFF"/>
        <text x="78" y="28" font-size="10" fill="#FF94B8">♪</text>
      </g>
    `;
  }

  let patchesMarkup = '';
  if (breedId === 'mochi') {
    patchesMarkup = `
      <path d="M 24 38 Q 32 30 42 36 Q 36 48 24 48 Z" fill="${breed.patchColor1}" opacity="0.85"/>
      <path d="M 72 38 Q 62 30 54 36 Q 60 48 72 48 Z" fill="${breed.patchColor2}" opacity="0.85"/>
    `;
  } else if (breedId === 'marmalade') {
    patchesMarkup = `
      <path d="M 46 25 L 48 33 L 50 25" stroke="${breed.patchColor1}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 43 28 L 48 35 L 53 28" stroke="${breed.patchColor2}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="26" y1="46" x2="32" y2="46" stroke="${breed.patchColor2}" stroke-width="2" stroke-linecap="round"/>
      <line x1="64" y1="46" x2="70" y2="46" stroke="${breed.patchColor2}" stroke-width="2" stroke-linecap="round"/>
    `;
  } else if (breedId === 'oreo') {
    patchesMarkup = `
      <path d="M 40 58 Q 48 64 56 58 Q 52 70 48 70 Q 44 70 40 58 Z" fill="#FFF8EF"/>
    `;
  } else if (breedId === 'luna') {
    patchesMarkup = `
      <polygon points="48,28 50,33 55,33 51,36 53,41 48,38 43,41 45,36 41,33 46,33" fill="${breed.patchColor2}" opacity="0.8"/>
    `;
  } else if (breedId === 'blossom') {
    patchesMarkup = `
      <circle cx="64" cy="28" r="3.5" fill="#FF8787" opacity="0.75"/>
      <circle cx="68" cy="30" r="3" fill="#FFD6E7"/>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 86" width="${dims.w}" height="${dims.h}" class="tabkitty-svg select-none transition-transform duration-200">
      <defs>
        <radialGradient id="rugGrad_${breedId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD6E7" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#B99AFF" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <ellipse cx="48" cy="74" rx="34" ry="8" fill="url(#rugGrad_${breedId})"/>

      <g class="kitty-paws">
        <ellipse cx="38" cy="67" rx="6" ry="4" fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="1.6"/>
        <ellipse cx="58" cy="67" rx="6" ry="4" fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="1.6"/>
      </g>

      <path d="M 76 64 C 84 62, 88 54, 84 48 C 82 46, 78 48, 80 52 C 82 56, 78 60, 72 62" 
        fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="1.8" stroke-linecap="round"/>

      <polygon points="${earPointsLeft}" fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="2"/>
      <polygon points="${innerEarLeft}" fill="${breed.earColor}"/>
      <polygon points="${earPointsRight}" fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="2"/>
      <polygon points="${innerEarRight}" fill="${breed.earColor}"/>

      <ellipse cx="48" cy="48" rx="28" ry="22" fill="${breed.primaryColor}" stroke="${breed.eyeColor}" stroke-width="2"/>

      ${patchesMarkup}

      <ellipse cx="32" cy="52" rx="4.5" ry="2.8" fill="${breed.blushColor}" opacity="0.6"/>
      <ellipse cx="64" cy="52" rx="4.5" ry="2.8" fill="${breed.blushColor}" opacity="0.6"/>

      ${eyesMarkup}

      <polygon points="46,51 50,51 48,54" fill="#FF8787"/>

      <path d="M 48 54 Q 45 58 41 56 M 48 54 Q 51 58 55 56" fill="none" stroke="${breed.eyeColor}" stroke-width="1.8" stroke-linecap="round"/>

      <line x1="24" y1="50" x2="14" y2="49" stroke="${breed.eyeColor}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="24" y1="54" x2="13" y2="56" stroke="${breed.eyeColor}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="72" y1="50" x2="82" y2="49" stroke="${breed.eyeColor}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="72" y1="54" x2="83" y2="56" stroke="${breed.eyeColor}" stroke-width="1.5" stroke-linecap="round"/>

      ${collarMarkup}
      ${audioMarkup}
      ${moodParticle}
    </svg>
  `;
}

if (typeof window !== 'undefined') {
  window.TabKittyCats = {
    CAT_BREEDS,
    createCatSvg
  };
}

export { CAT_BREEDS, createCatSvg };
