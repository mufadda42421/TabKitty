/**
 * TabKitty - Cat-Themed Browser Tab Manager
 * "Every tab deserves a little catnap."
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Volume2, VolumeX, FolderArchive, Settings as SettingsIcon, 
  Download, Plus, Search, Pin, X, ExternalLink, Sparkles, 
  ShieldCheck, Check, RefreshCw, Heart, Copy, Upload, Trash2, 
  ArrowUpDown, Moon as MoonIcon, Globe, CloudSun, Bookmark, 
  FileText, SlidersHorizontal, Layers, Compass
} from 'lucide-react';
import { sounds } from './lib/audio';
import { downloadExtensionZip } from './lib/extensionPacker';

// Cat Breeds definition
export interface CatBreed {
  id: string;
  name: string;
  nickname: string;
  desc: string;
  primaryColor: string;
  patchColor1: string;
  patchColor2: string;
  earColor: string;
  eyeColor: string;
  blushColor: string;
  personality: string;
  favoriteToy: string;
  unlocked: boolean;
  unlockCondition?: string;
}

export const CAT_BREEDS: Record<string, CatBreed> = {
  mochi: {
    id: 'mochi',
    name: 'Mochi',
    nickname: 'Calico Dreamer',
    desc: 'Sweet, curious with cozy tri-color patches. Loves afternoon sunbeams.',
    primaryColor: '#FFF8EF',
    patchColor1: '#B99AFF',
    patchColor2: '#FFB877',
    earColor: '#FFD6E7',
    eyeColor: '#29213F',
    blushColor: '#FFB7D5',
    personality: 'Curious & Cuddly',
    favoriteToy: 'Yarn Ball',
    unlocked: true,
  },
  oreo: {
    id: 'oreo',
    name: 'Oreo',
    nickname: 'Tuxedo Gentleman',
    desc: 'Dapper and focused, always in formal black-and-white attire.',
    primaryColor: '#29213F',
    patchColor1: '#FFF8EF',
    patchColor2: '#FFF8EF',
    earColor: '#FFD6E7',
    eyeColor: '#C8F2DF',
    blushColor: '#FF94B8',
    personality: 'Sophisticated & Orderly',
    favoriteToy: 'Bowtie Bell',
    unlocked: true,
  },
  marmalade: {
    id: 'marmalade',
    name: 'Marmalade',
    nickname: 'Ginger Sunshine',
    desc: 'Warm and sunny with playful tiger stripes and endless energy.',
    primaryColor: '#FFC078',
    patchColor1: '#FFA94D',
    patchColor2: '#E8590C',
    earColor: '#FFE8CC',
    eyeColor: '#29213F',
    blushColor: '#FF8787',
    personality: 'Cheerful & Mischievous',
    favoriteToy: 'Feather Wand',
    unlocked: true,
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    nickname: 'Russian Blue Whisper',
    desc: 'Mysterious, calm and loves a good undisturbed afternoon snooze.',
    primaryColor: '#8C92B5',
    patchColor1: '#6E749C',
    patchColor2: '#A4AACD',
    earColor: '#BFC3DC',
    eyeColor: '#C8F2DF',
    blushColor: '#B99AFF',
    personality: 'Serene & Contemplative',
    favoriteToy: 'Velvet Mouse',
    unlocked: true,
  },
  cocoa: {
    id: 'cocoa',
    name: 'Cocoa',
    nickname: 'Siamese Sovereign',
    desc: 'Cream coat with rich cocoa ears, inquisitive paws, and sapphire eyes.',
    primaryColor: '#FDFBF7',
    patchColor1: '#4A3728',
    patchColor2: '#694E38',
    earColor: '#4A3728',
    eyeColor: '#74C0FC',
    blushColor: '#FFD6E7',
    personality: 'Vocal & Attentive',
    favoriteToy: 'Silver Ribbon',
    unlocked: false,
    unlockCondition: 'Save your first session',
  },
  wasabi: {
    id: 'wasabi',
    name: 'Wasabi',
    nickname: 'Matcha Blossom',
    desc: 'Fresh, zen-like pastel green imbued with tranquility and calm focus.',
    primaryColor: '#E6FCF5',
    patchColor1: '#C8F2DF',
    patchColor2: '#63E6BE',
    earColor: '#C8F2DF',
    eyeColor: '#29213F',
    blushColor: '#B99AFF',
    personality: 'Zen & Grounded',
    favoriteToy: 'Catnip Leaf',
    unlocked: false,
    unlockCondition: 'Create 5 custom rooms',
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    nickname: 'Lavender Starlight',
    desc: 'Celestial kitten imbued with starlight, lavender aura, and cosmic dreams.',
    primaryColor: '#EBE4FF',
    patchColor1: '#B99AFF',
    patchColor2: '#9775FA',
    earColor: '#FFD6E7',
    eyeColor: '#FFE066',
    blushColor: '#FF94B8',
    personality: 'Mystical & Dreamy',
    favoriteToy: 'Laser Pointer',
    unlocked: false,
    unlockCondition: 'Keep 6 or more active tabs organized',
  },
  blossom: {
    id: 'blossom',
    name: 'Blossom',
    nickname: 'Sakura Petal',
    desc: 'Gentle petal-pink coat reminiscent of springtime cherry blossoms.',
    primaryColor: '#FFF0F6',
    patchColor1: '#FFD6E7',
    patchColor2: '#FF8787',
    earColor: '#FCC2D7',
    eyeColor: '#29213F',
    blushColor: '#FF6B6B',
    personality: 'Graceful & Affectionate',
    favoriteToy: 'Sakura Flower',
    unlocked: false,
    unlockCondition: 'Pin at least 2 important tabs',
  }
};

export interface CatRoom {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface CatTab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  domain: string;
  favIconUrl: string;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  room?: string;
  breed?: string;
  blinking?: boolean;
  closing?: boolean;
  pettedUntil?: number;
}

export interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  tabsCount: number;
  tabs: Array<{
    title: string;
    url: string;
    favIconUrl?: string;
    pinned?: boolean;
    room?: string;
    breed?: string;
  }>;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  domain: string;
  icon: string;
}

// Initial Real Tab Data (Starts cleanly with real window session, zero dummy lorem ipsum)
function getInitialTabs(): CatTab[] {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://tabkitty.local';
  let domain = 'tabkitty.local';
  try {
    domain = new URL(currentUrl).hostname.replace(/^www\./, '');
  } catch {}

  return [
    {
      id: 1,
      windowId: 1,
      title: 'TabKitty Workspace - Cat Tab Manager',
      url: currentUrl,
      domain: domain,
      favIconUrl: '/icons/icon16.svg',
      active: true,
      pinned: false,
      audible: false,
      room: 'all',
      breed: 'mochi',
    }
  ];
}

// SVG Cat Component
export function CatIllustration({
  breedId = 'mochi',
  isActive = false,
  isPinned = false,
  isBlinking = false,
  isHappy = false,
  size = 'md',
  className = '',
}: {
  breedId?: string;
  isActive?: boolean;
  isPinned?: boolean;
  isAudible?: boolean;
  isBlinking?: boolean;
  isHappy?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const breed = CAT_BREEDS[breedId] || CAT_BREEDS.mochi;

  const dims = {
    sm: { w: 48, h: 44 },
    md: { w: 96, h: 86 },
    lg: { w: 140, h: 120 },
    xl: { w: 180, h: 154 }
  }[size];

  return (
    <svg 
      viewBox="0 0 96 86" 
      width={dims.w} 
      height={dims.h} 
      className={`select-none transition-transform duration-200 ${className}`}
    >
      <defs>
        <radialGradient id={`rug_${breed.id}_${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD6E7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#B99AFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rug / Cushion Shadow */}
      <ellipse cx="48" cy="74" rx="34" ry="8" fill={`url(#rug_${breed.id}_${size})`} />

      {/* Sleeping or relaxed paws */}
      <ellipse cx="38" cy="67" rx="6" ry="4" fill={breed.primaryColor} stroke={breed.eyeColor} strokeWidth="1.6" />
      <ellipse cx="58" cy="67" rx="6" ry="4" fill={breed.primaryColor} stroke={breed.eyeColor} strokeWidth="1.6" />

      {/* Tail */}
      <path 
        d="M 76 64 C 84 62, 88 54, 84 48 C 82 46, 78 48, 80 52 C 82 56, 78 60, 72 62" 
        fill={breed.primaryColor} 
        stroke={breed.eyeColor} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />

      {/* Ears */}
      <polygon points="24,38 32,10 48,28" fill={breed.primaryColor} stroke={breed.eyeColor} strokeWidth="2" />
      <polygon points="27,35 33,16 45,28" fill={breed.earColor} />
      <polygon points="72,38 64,10 48,28" fill={breed.primaryColor} stroke={breed.eyeColor} strokeWidth="2" />
      <polygon points="69,35 63,16 51,28" fill={breed.earColor} />

      {/* Head */}
      <ellipse cx="48" cy="48" rx="28" ry="22" fill={breed.primaryColor} stroke={breed.eyeColor} strokeWidth="2" />

      {/* Distinct Breed Coat Patterns */}
      {breed.id === 'mochi' && (
        <>
          <path d="M 24 38 Q 32 30 42 36 Q 36 48 24 48 Z" fill={breed.patchColor1} opacity="0.85" />
          <path d="M 72 38 Q 62 30 54 36 Q 60 48 72 48 Z" fill={breed.patchColor2} opacity="0.85" />
        </>
      )}
      {breed.id === 'marmalade' && (
        <>
          <path d="M 46 25 L 48 33 L 50 25" stroke={breed.patchColor1} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 43 28 L 48 35 L 53 28" stroke={breed.patchColor2} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <line x1="26" y1="46" x2="32" y2="46" stroke={breed.patchColor2} strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1="46" x2="70" y2="46" stroke={breed.patchColor2} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {breed.id === 'oreo' && (
        <path d="M 40 58 Q 48 64 56 58 Q 52 70 48 70 Q 44 70 40 58 Z" fill="#FFF8EF" />
      )}
      {breed.id === 'luna' && (
        <polygon points="48,28 50,33 55,33 51,36 53,41 48,38 43,41 45,36 41,33 46,33" fill={breed.patchColor2} opacity="0.8" />
      )}
      {breed.id === 'blossom' && (
        <>
          <circle cx="64" cy="28" r="3.5" fill="#FF8787" opacity="0.75" />
          <circle cx="68" cy="30" r="3" fill="#FFD6E7" />
        </>
      )}

      {/* Cheeks */}
      <ellipse cx="32" cy="52" rx="4.5" ry="2.8" fill={breed.blushColor} opacity="0.65" />
      <ellipse cx="64" cy="52" rx="4.5" ry="2.8" fill={breed.blushColor} opacity="0.65" />

      {/* Eyes: Blinking vs Awake vs Sleeping */}
      {isBlinking ? (
        <>
          <line x1="33" y1="46" x2="43" y2="46" stroke={breed.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="53" y1="46" x2="63" y2="46" stroke={breed.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : isActive || isHappy ? (
        <g>
          <circle cx="38" cy="45" r="4.5" fill={breed.eyeColor} />
          <circle cx="40" cy="43.5" r="1.6" fill="#FFFFFF" />
          <circle cx="58" cy="45" r="4.5" fill={breed.eyeColor} />
          <circle cx="60" cy="43.5" r="1.6" fill="#FFFFFF" />
        </g>
      ) : (
        /* Sleeping Closed Eyes ˘ω˘ */
        <g>
          <path d="M 32 46 Q 38 41 44 46" fill="none" stroke={breed.eyeColor} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 52 46 Q 58 41 64 46" fill="none" stroke={breed.eyeColor} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {/* Nose */}
      <polygon points="46,51 50,51 48,54" fill="#FF8787" />

      {/* Cute Mouth :3 */}
      <path d="M 44 54 Q 46 57 48 54 Q 50 57 52 54" fill="none" stroke={breed.eyeColor} strokeWidth="1.6" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="22" y1="48" x2="12" y2="46" stroke={breed.eyeColor} strokeWidth="1.3" opacity="0.75" />
      <line x1="22" y1="53" x2="11" y2="54" stroke={breed.eyeColor} strokeWidth="1.3" opacity="0.75" />
      <line x1="74" y1="48" x2="84" y2="46" stroke={breed.eyeColor} strokeWidth="1.3" opacity="0.75" />
      <line x1="74" y1="53" x2="85" y2="54" stroke={breed.eyeColor} strokeWidth="1.3" opacity="0.75" />

      {/* Golden Bell Collar for Pinned Tabs */}
      {isPinned && (
        <g>
          <path d="M 34 60 Q 48 68 62 60" fill="none" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="65" r="4.2" fill="#FFD43B" stroke="#F08C00" strokeWidth="1.2" />
          <circle cx="48" cy="66" r="1.2" fill="#E8590C" />
        </g>
      )}

      {/* Sleep Zzz Floating Bubble */}
      {!isActive && !isHappy && (
        <g className="opacity-75">
          <text x="68" y="24" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="11" fill="#B99AFF">Z</text>
          <text x="76" y="15" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="8" fill="#B99AFF">z</text>
          <text x="82" y="8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="6" fill="#B99AFF">z</text>
        </g>
      )}

      {/* Heart indicator if happy */}
      {isHappy && (
        <path d="M 72 18 C 72 14, 76 12, 79 16 C 82 12, 86 14, 86 18 C 86 23, 79 26, 79 26 C 79 26, 72 23, 72 18 Z" fill="#FF6B6B" />
      )}
    </svg>
  );
}

// Sample extension source files for code explorer
const EXTENSION_CODE_SAMPLES: Record<string, { desc: string; code: string }> = {
  'manifest.json': {
    desc: 'Chrome Extension Manifest V3 configuration with permissions and actions',
    code: `{
  "manifest_version": 3,
  "name": "TabKitty",
  "version": "1.0.0",
  "description": "Every tab deserves a little catnap. Cat-themed browser tab manager.",
  "permissions": [
    "tabs",
    "tabGroups",
    "storage",
    "sessions"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.svg",
      "48": "icons/icon48.svg",
      "128": "icons/icon128.svg"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "options_page": "options.html",
  "chrome_url_overrides": {
    "newtab": "dashboard.html"
  }
}`
  },
  'background.js': {
    desc: 'Service worker syncing tab counts to toolbar badge in real-time',
    code: `// TabKitty Background Service Worker
chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onActivated.addListener(updateBadge);

async function updateBadge() {
  const tabs = await chrome.tabs.query({});
  chrome.action.setBadgeText({ text: tabs.length.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#B99AFF' });
}`
  },
  'cats.js': {
    desc: 'Mathematical SVG cat rendering engine for breeds and animation states',
    code: `// Pure Vector SVG Generator with 8 distinct feline breeds
export function getCatSvg(breedId, options = {}) {
  const { isSleeping = false, isBlinking = false, isPinned = false } = options;
  // Dynamic eyes, ears, markings, and collar accessories
  return \`<svg viewBox="0 0 96 86">...</svg>\`;
}`
  },
  'storage.js': {
    desc: 'Universal storage layer with fallback for native Chrome and browser local storage',
    code: `export const TabStorage = {
  async get(key, fallback = null) {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get([key]);
      return res[key] ?? fallback;
    }
    const val = localStorage.getItem('tabkitty_' + key);
    return val ? JSON.parse(val) : fallback;
  }
};`
  }
};

export default function App() {
  // Theme & Sound State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.7);

  // Navigation
  const [activeTabNav, setActiveTabNav] = useState<'sanctuary' | 'newTabMode' | 'popupDemo' | 'playroom' | 'sessions' | 'install'>('sanctuary');

  // Filter & Sort State
  const [activeFilterState, setActiveFilterState] = useState<'all' | 'awake' | 'sleeping' | 'pinned'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'domain' | 'title' | 'room'>('default');

  // Rooms & Tabs
  const [rooms, setRooms] = useState<CatRoom[]>([
    { id: 'all', name: 'All Cats', icon: '🐱', color: '#B99AFF', isDefault: true },
    { id: 'work', name: 'Work', icon: '💼', color: '#74C0FC', isDefault: false },
    { id: 'study', name: 'Study', icon: '📚', color: '#C8F2DF', isDefault: false },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#FFD6E7', isDefault: false },
  ]);
  const [activeRoomId, setActiveRoomId] = useState<string>('all');
  const [tabs, setTabs] = useState<CatTab[]>(() => {
    try {
      const saved = localStorage.getItem('tabkitty_tabs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialTabs();
  });

  // Sessions
  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    try {
      const saved = localStorage.getItem('tabkitty_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Unlocked Cat Breeds
  const [unlockedCats, setUnlockedCats] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tabkitty_unlocked_cats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['mochi', 'oreo', 'marmalade', 'storm'];
  });

  const [defaultBreed, setDefaultBreed] = useState<string>('mochi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [purrScore, setPurrScore] = useState<number>(0);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState<boolean>(false);
  const [activeCodeFile, setActiveCodeFile] = useState<string>('manifest.json');

  // Playroom Toy State
  const [activePlayToy, setActivePlayToy] = useState<'yarn' | 'feather' | 'laser' | 'catnip'>('yarn');
  const [toyAnimationState, setToyAnimationState] = useState<string | null>(null);

  // New Tab Page Search Engine
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const [newTabSearchQuery, setNewTabSearchQuery] = useState<string>('');

  // Quick Links
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { id: '1', title: 'GitHub', url: 'https://github.com', domain: 'github.com', icon: '🐙' },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', domain: 'youtube.com', icon: '📺' },
    { id: '3', title: 'Wikipedia', url: 'https://wikipedia.org', domain: 'wikipedia.org', icon: '📚' },
    { id: '4', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', domain: 'mozilla.org', icon: '🦖' },
  ]);

  // Modals
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState<boolean>(false);
  const [adoptInputUrl, setAdoptInputUrl] = useState<string>('');
  const [adoptTargetRoom, setAdoptTargetRoom] = useState<string>('all');
  const [adoptTargetBreed, setAdoptTargetBreed] = useState<string>('mochi');
  const [adoptTargetPinned, setAdoptTargetPinned] = useState<boolean>(false);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchUrlsInput, setBatchUrlsInput] = useState<string>('');

  const [isSaveSessionModalOpen, setIsSaveSessionModalOpen] = useState<boolean>(false);
  const [sessionNameInput, setSessionNameInput] = useState<string>('');

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);
  const [isMoveRoomOpen, setIsMoveRoomOpen] = useState<boolean>(false);
  const [selectedTabForMove, setSelectedTabForMove] = useState<CatTab | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // New Room Form
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('🐾');
  const [newRoomColor, setNewRoomColor] = useState('#B99AFF');

  // Clock & Ambient Greeting
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [ambientGreeting, setAmbientGreeting] = useState<{ kicker: string; title: string }>({
    kicker: 'Morning Sunbeam Sanctuary',
    title: 'Good morning, Human! Your cats are awake and ready.'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Clock & Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));

      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setAmbientGreeting({
          kicker: 'Morning Sunbeam Sanctuary',
          title: 'Good morning, Human! Your cats are awake and ready to explore.'
        });
      } else if (hour >= 12 && hour < 17) {
        setAmbientGreeting({
          kicker: 'Afternoon Catnap Parlor',
          title: 'Good afternoon, Human! Warm rays are perfect for organizing tabs.'
        });
      } else if (hour >= 17 && hour < 22) {
        setAmbientGreeting({
          kicker: 'Twilight Purr Lounge',
          title: 'Good evening, Human! Rest your tabs under the pastel sunset.'
        });
      } else {
        setAmbientGreeting({
          kicker: 'Celestial Midnight Haven',
          title: 'Cozy night hours. Your idle tabs are fast asleep on their cushions.'
        });
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme synchronization with html tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync sound volume
  useEffect(() => {
    sounds.volume = soundVolume;
    sounds.enabled = soundEnabled;
  }, [soundVolume, soundEnabled]);

  // Persist tabs
  useEffect(() => {
    try {
      localStorage.setItem('tabkitty_tabs', JSON.stringify(tabs));
    } catch {}
  }, [tabs]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('tabkitty_sessions', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Persist unlocked cats
  useEffect(() => {
    try {
      localStorage.setItem('tabkitty_unlocked_cats', JSON.stringify(unlockedCats));
    } catch {}
  }, [unlockedCats]);

  // Check achievements
  useEffect(() => {
    if (sessions.length > 0 && !unlockedCats.includes('cocoa')) {
      setUnlockedCats(prev => [...prev, 'cocoa']);
      showToast('New cat unlocked! Cocoa (Siamese) joined your collection!');
    }
    if (rooms.length >= 5 && !unlockedCats.includes('wasabi')) {
      setUnlockedCats(prev => [...prev, 'wasabi']);
      showToast('New cat unlocked! Wasabi (Matcha Cat) joined your collection!');
    }
    if (tabs.length >= 6 && !unlockedCats.includes('luna')) {
      setUnlockedCats(prev => [...prev, 'luna']);
      showToast('New cat unlocked! Luna (Lavender Dream) joined your collection!');
    }
    const pinnedCount = tabs.filter(t => t.pinned).length;
    if (pinnedCount >= 2 && !unlockedCats.includes('blossom')) {
      setUnlockedCats(prev => [...prev, 'blossom']);
      showToast('New cat unlocked! Blossom (Sakura) joined your collection!');
    }
  }, [tabs, sessions, rooms, unlockedCats]);

  // Random blink ambient animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (tabs.length === 0) return;
      const randIdx = Math.floor(Math.random() * tabs.length);
      const targetId = tabs[randIdx].id;

      setTabs(prev => prev.map(t => t.id === targetId ? { ...t, blinking: true } : t));
      setTimeout(() => {
        setTabs(prev => prev.map(t => t.id === targetId ? { ...t, blinking: false } : t));
      }, 200);
    }, 4500);

    return () => clearInterval(interval);
  }, [tabs.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.meow();
  };

  // Switch Active Tab
  const handleActivateTab = (tabId: number) => {
    sounds.purr();
    setTabs(prev => prev.map(t => ({
      ...t,
      active: t.id === tabId
    })));
    showToast('Switched to active cat tab!');
  };

  // Toggle Pin
  const handleTogglePin = (tabId: number) => {
    setTabs(prev => prev.map(t => {
      if (t.id === tabId) {
        const nextPinned = !t.pinned;
        if (nextPinned) {
          sounds.bell();
          showToast('Tab pinned with a golden bell collar!');
        } else {
          sounds.purr();
          showToast('Tab unpinned.');
        }
        return { ...t, pinned: nextPinned };
      }
      return t;
    }));
  };

  // Close Tab with poof animation
  const handleCloseTab = (tabId: number) => {
    sounds.pop();
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, closing: true } : t));
    setTimeout(() => {
      setTabs(prev => prev.filter(t => t.id !== tabId));
      showToast('Tab tucked in for a good catnap.');
    }, 220);
  };

  // Pet Cat
  const handlePetCat = (tabId: number) => {
    sounds.meow();
    setPurrScore(prev => prev + 1);
    const now = Date.now();
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, pettedUntil: now + 1800 } : t));
    showToast('Purr! Kitty feels so loved ❤️');
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, pettedUntil: undefined } : t));
    }, 1800);
  };

  // Open Adopt Tab Modal
  const openAdoptModal = (presetUrl?: string) => {
    setAdoptInputUrl(presetUrl || '');
    setAdoptTargetRoom(activeRoomId);
    setAdoptTargetBreed(defaultBreed);
    setAdoptTargetPinned(false);
    setIsAdoptModalOpen(true);
  };

  // Submit Adopt Tab
  const handleAdoptModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptInputUrl.trim()) return;

    let cleanUrl = adoptInputUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = 'https://' + cleanUrl;
      } else {
        cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanUrl)}`;
      }
    }

    let domain = 'web';
    try {
      domain = new URL(cleanUrl).hostname.replace(/^www\./, '');
    } catch {}

    const newId = Date.now();
    const newCatTab: CatTab = {
      id: newId,
      windowId: 1,
      title: domain.charAt(0).toUpperCase() + domain.slice(1),
      url: cleanUrl,
      domain: domain,
      favIconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      active: true,
      pinned: adoptTargetPinned,
      audible: false,
      room: adoptTargetRoom,
      breed: adoptTargetBreed,
    };

    sounds.meow();
    setTabs(prev => [...prev.map(t => ({ ...t, active: false })), newCatTab]);
    setIsAdoptModalOpen(false);
    setAdoptInputUrl('');
    showToast(`Adopted new tab companion for ${domain}!`);
  };

  // Submit Batch Adopt
  const handleBatchModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchUrlsInput.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const breedKeys = Object.keys(CAT_BREEDS);
    const newTabs: CatTab[] = lines.map((line, idx) => {
      let cleanUrl = line;
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      let domain = 'web';
      try {
        domain = new URL(cleanUrl).hostname.replace(/^www\./, '');
      } catch {}

      return {
        id: Date.now() + idx,
        windowId: 1,
        title: domain.charAt(0).toUpperCase() + domain.slice(1),
        url: cleanUrl,
        domain: domain,
        favIconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        active: idx === 0,
        pinned: false,
        audible: false,
        room: activeRoomId,
        breed: breedKeys[(Date.now() + idx) % breedKeys.length],
      };
    });

    sounds.meow();
    setTabs(prev => [...prev, ...newTabs]);
    setIsBatchModalOpen(false);
    setBatchUrlsInput('');
    showToast(`Adopted ${newTabs.length} companion tabs into ${rooms.find(r => r.id === activeRoomId)?.name || 'Sanctuary'}!`);
  };

  // Chrome Tabs Real Synchronization
  const handleSyncChromeTabs = async () => {
    const chromeGlobal = (window as unknown as { chrome?: { tabs?: { query: (q: object, cb: (res: any[]) => void) => void } } }).chrome;
    if (chromeGlobal?.tabs?.query) {
      chromeGlobal.tabs.query({}, (realTabs) => {
        if (realTabs && realTabs.length > 0) {
          const breedKeys = Object.keys(CAT_BREEDS);
          const synced: CatTab[] = realTabs.map((t, idx) => {
            let domain = 'tab';
            try {
              domain = new URL(t.url || '').hostname.replace(/^www\./, '');
            } catch {}
            return {
              id: t.id || Date.now() + idx,
              windowId: t.windowId || 1,
              title: t.title || domain,
              url: t.url || 'about:blank',
              domain: domain || 'browser',
              favIconUrl: t.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
              active: Boolean(t.active),
              pinned: Boolean(t.pinned),
              audible: Boolean(t.audible),
              room: 'all',
              breed: breedKeys[idx % breedKeys.length],
            };
          });
          setTabs(synced);
          sounds.purr();
          showToast(`Synced ${synced.length} live browser tabs from Chrome!`);
          return;
        }
      });
    } else {
      // In web preview environment, inform user gracefully
      sounds.purr();
      showToast('In browser preview: TabKitty is managing your real active window tab.');
    }
  };

  // Batch actions
  const handleTuckInAll = () => {
    sounds.purr();
    setTabs(prev => prev.map((t, idx) => ({ ...t, active: idx === 0 })));
    showToast('All idle companion cats tucked in for a catnap!');
  };

  const handleWakeAll = () => {
    sounds.meow();
    setTabs(prev => prev.map(t => ({ ...t, active: true })));
    showToast('All companion cats are now wide awake!');
  };

  // Open Save Session Modal
  const openSaveSessionModal = () => {
    const defaultName = `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setSessionNameInput(defaultName);
    setIsSaveSessionModalOpen(true);
  };

  // Submit Save Session
  const handleSaveSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionNameInput.trim()) return;

    const newSession: SavedSession = {
      id: 'session_' + Date.now().toString(36),
      name: sessionNameInput.trim(),
      createdAt: new Date().toISOString(),
      tabsCount: tabs.length,
      tabs: tabs.map(t => ({
        title: t.title,
        url: t.url,
        favIconUrl: t.favIconUrl,
        pinned: t.pinned,
        room: t.room,
        breed: t.breed,
      }))
    };

    sounds.purr();
    setSessions(prev => [newSession, ...prev]);
    setIsSaveSessionModalOpen(false);
    showToast(`Saved ${tabs.length} tabs to session "${newSession.name}"!`);
  };

  // Restore Session
  const handleRestoreSession = (sess: SavedSession) => {
    sounds.meow();
    const restoredTabs: CatTab[] = sess.tabs.map((t, idx) => {
      let domain = 'web';
      try {
        domain = new URL(t.url).hostname.replace(/^www\./, '');
      } catch {}

      return {
        id: Date.now() + idx,
        windowId: 1,
        title: t.title,
        url: t.url,
        domain: domain,
        favIconUrl: t.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        active: idx === 0,
        pinned: Boolean(t.pinned),
        audible: false,
        room: t.room || 'all',
        breed: t.breed || 'mochi',
      };
    });

    setTabs(prev => [...prev, ...restoredTabs]);
    showToast(`Restored ${restoredTabs.length} tabs from "${sess.name}"!`);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Deleted saved session.');
  };

  // Export sessions JSON
  const handleExportSessions = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabkitty-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.purr();
    showToast('Exported sessions to JSON!');
  };

  // Import sessions JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setSessions(prev => [...parsed, ...prev]);
          sounds.meow();
          showToast(`Imported ${parsed.length} sessions successfully!`);
        } else {
          showToast('Invalid session JSON format.');
        }
      } catch {
        showToast('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: CatRoom = {
      id: 'room_' + Date.now().toString(36),
      name: newRoomName.trim(),
      icon: newRoomIcon,
      color: newRoomColor,
      isDefault: false
    };

    setRooms(prev => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
    setNewRoomName('');
    setIsCreateRoomOpen(false);
    sounds.purr();
    showToast(`Created new room "${newRoom.name}"!`);
  };

  // Play with Toy
  const handlePlayWithToy = (toy: 'yarn' | 'feather' | 'laser' | 'catnip') => {
    setActivePlayToy(toy);
    setToyAnimationState(toy);
    setPurrScore(prev => prev + 2);

    if (toy === 'yarn') {
      sounds.pop();
      showToast('Yarn ball tossed! Cats are batting it playfully 🧶');
    } else if (toy === 'feather') {
      sounds.chirp();
      showToast('Feather wand swished! Little paws are leaping 🪶');
    } else if (toy === 'laser') {
      sounds.laser();
      showToast('Red laser dot dancing! Cats are in full stealth mode 🔴');
    } else {
      sounds.purr();
      showToast('Organic Catnip sprinkled! Euphoric felines rolling around 🌿');
    }

    setTimeout(() => {
      setToyAnimationState(null);
    }, 2400);
  };

  // New Tab Search Submission
  const handleNewTabSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabSearchQuery.trim()) return;
    const query = encodeURIComponent(newTabSearchQuery.trim());
    let url = `https://www.google.com/search?q=${query}`;
    if (searchEngine === 'duckduckgo') url = `https://duckduckgo.com/?q=${query}`;
    if (searchEngine === 'bing') url = `https://www.bing.com/search?q=${query}`;
    
    // Add as active tab
    const newId = Date.now();
    const newCatTab: CatTab = {
      id: newId,
      windowId: 1,
      title: `${newTabSearchQuery.trim()} - Search`,
      url: url,
      domain: searchEngine,
      favIconUrl: `https://www.google.com/s2/favicons?domain=${searchEngine}.com&sz=32`,
      active: true,
      pinned: false,
      audible: false,
      room: 'all',
      breed: defaultBreed,
    };
    setTabs(prev => [...prev.map(t => ({ ...t, active: false })), newCatTab]);
    sounds.meow();
    showToast(`Opened search query for "${newTabSearchQuery.trim()}"`);
    setNewTabSearchQuery('');
  };

  // Filtered & Sorted Tabs
  const filteredTabs = tabs
    .filter(t => {
      // Room filter
      if (activeRoomId !== 'all' && t.room !== activeRoomId) return false;
      // State filter
      if (activeFilterState === 'awake' && !t.active) return false;
      if (activeFilterState === 'sleeping' && t.active) return false;
      if (activeFilterState === 'pinned' && !t.pinned) return false;
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDomain = t.domain.toLowerCase().includes(q);
        const matchUrl = t.url.toLowerCase().includes(q);
        return matchTitle || matchDomain || matchUrl;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'domain') return a.domain.localeCompare(b.domain);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'room') return (a.room || '').localeCompare(b.room || '');
      return 0; // default order
    });

  const awakeCount = tabs.filter(t => t.active).length;
  const sleepingCount = tabs.filter(t => !t.active).length;
  const pinnedCount = tabs.filter(t => t.pinned).length;

  return (
    <div className="min-h-screen bg-[#FFF8EF] dark:bg-[#1C162E] text-[#29213F] dark:text-[#F3EDFF] transition-colors duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#29213F] text-[#FFF8EF] rounded-xl shadow-xl border-l-4 border-[#B99AFF] text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>🐾</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar: Exhaustive 3-Zone Contract */}
      <header className="border-b border-[#F0E6D8] dark:border-[#3A3156] bg-white/85 dark:bg-[#241D38]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          
          {/* Zone 1: Wordmark with scalable cat mascot */}
          <div className="flex items-center gap-3 shrink-0">
            <img src="/icons/icon48.svg" alt="TabKitty" className="w-8 h-8 rounded-xl shadow-xs" />
            <div className="flex flex-col">
              <span className="font-['Quicksand'] font-bold text-xl text-[#29213F] dark:text-white tracking-tight leading-none">
                TabKitty
              </span>
              <span className="text-[10px] text-[#B99AFF] font-bold tracking-tight">Every tab deserves a catnap</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#8C84A0] dark:text-[#A79EB8]">
            <button 
              onClick={() => { setActiveTabNav('sanctuary'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'sanctuary' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Sanctuary</span>
            </button>
            <button 
              onClick={() => { setActiveTabNav('newTabMode'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'newTabMode' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>New Tab Page</span>
            </button>
            <button 
              onClick={() => { setActiveTabNav('popupDemo'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'popupDemo' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toolbar Popover</span>
            </button>
            <button 
              onClick={() => { setActiveTabNav('playroom'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'playroom' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cat Playroom ({unlockedCats.length}/8)</span>
            </button>
            <button 
              onClick={() => { setActiveTabNav('sessions'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'sessions' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Session Vault ({sessions.length})</span>
            </button>
            <button 
              onClick={() => { setActiveTabNav('install'); sounds.purr(); }}
              className={`hover:text-[#29213F] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTabNav === 'install' ? 'text-[#B99AFF] font-bold border-b-2 border-[#B99AFF] pb-0.5' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2B8A3E]" />
              <span>Install Extension</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action + Quick Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSyncChromeTabs}
              className="p-2 rounded-xl text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Sync with Chrome Tabs"
              aria-label="Sync tabs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Toggle Light / Twilight Theme"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title={soundEnabled ? 'Cat Synthesizer On' : 'Muted'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#B99AFF]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Preferences"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <button
              onClick={downloadExtensionZip}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#B99AFF] hover:bg-[#A680FF] text-white shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Extension (.zip)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Viewport */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* =========================================================================
            VIEW 1: PRIMARY SANCTUARY DASHBOARD
           ========================================================================= */}
        {activeTabNav === 'sanctuary' && (
          <>
            {/* Ambient Hero Sanctuary Banner */}
            <section className="relative overflow-hidden rounded-3xl border border-[#F0E6D8] dark:border-[#3A3156] bg-gradient-to-r from-[#B99AFF]/15 via-[#FFD6E7]/25 to-[#C8F2DF]/15 dark:from-[#241D38] dark:to-[#2D2545] p-6 md:p-8 flex items-center justify-between shadow-xs">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#B99AFF] uppercase mb-1.5">
                  <span>{ambientGreeting.kicker}</span>
                  <span className="text-[#8C84A0]">·</span>
                  <span className="text-[#8C84A0] font-mono tabular-nums">{currentTime}</span>
                  <span className="text-[#8C84A0]">·</span>
                  <span className="text-[#8C84A0]">{currentDate}</span>
                </div>
                <h1 className="font-['Quicksand'] font-bold text-2xl md:text-3xl text-[#29213F] dark:text-white leading-tight">
                  {ambientGreeting.title}
                </h1>
                <p className="text-sm text-[#8C84A0] dark:text-[#A79EB8] mt-2 leading-relaxed">
                  Every tab corresponds to a virtual feline companion. Awake tabs focus with bright eyes and purrs, while idle tabs take a tranquil catnap on their pastel cushions.
                </p>

                {/* Quick Interactive Actions Strip */}
                <div className="flex items-center gap-2.5 mt-4 flex-wrap">
                  <button
                    onClick={() => openAdoptModal()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B99AFF] hover:bg-[#A680FF] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adopt Tab</span>
                  </button>

                  <button
                    onClick={() => setIsBatchModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B99AFF]" />
                    <span>Batch Add URLs</span>
                  </button>

                  <button
                    onClick={handleTuckInAll}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    <MoonIcon className="w-3.5 h-3.5 text-[#B99AFF]" />
                    <span>Tuck In Idle Cats</span>
                  </button>

                  <button
                    onClick={handleWakeAll}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB877]" />
                    <span>Wake All</span>
                  </button>
                </div>
              </div>

              {/* Interactive Mascot in Hero */}
              <div 
                className="hidden md:flex flex-col items-center justify-center shrink-0 w-44 h-40 cursor-pointer p-3 rounded-2xl bg-white/50 dark:bg-black/25 hover:scale-105 transition-all shadow-xs" 
                onClick={() => {
                  sounds.meow();
                  setPurrScore(prev => prev + 1);
                  showToast('Primary mascot says: Meow! Have a purr-fect session!');
                }} 
                title="Click to pet your sanctuary mascot!"
              >
                <CatIllustration breedId={defaultBreed} isActive={true} isHappy={true} size="lg" />
                <span className="text-[11px] font-bold text-[#8C84A0] dark:text-[#A79EB8] mt-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#FF6B6B] fill-[#FF6B6B]" />
                  <span>{purrScore} Sanctuary Pets</span>
                </span>
              </div>
            </section>

            {/* Quantitative Overview Strip */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveFilterState('all')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#241D38] border transition-all cursor-pointer shadow-xs ${activeFilterState === 'all' ? 'border-[#B99AFF] ring-1 ring-[#B99AFF]' : 'border-[#F0E6D8] dark:border-[#3A3156]'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#B99AFF]/15 text-[#B99AFF] flex items-center justify-center text-xl shrink-0">
                    🐱
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-[#29213F] dark:text-white">{tabs.length}</div>
                    <div className="text-xs text-[#8C84A0]">Open Companion Cats</div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveFilterState('awake')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#241D38] border transition-all cursor-pointer shadow-xs ${activeFilterState === 'awake' ? 'border-[#2B8A3E] ring-1 ring-[#2B8A3E]' : 'border-[#F0E6D8] dark:border-[#3A3156]'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#C8F2DF]/50 text-[#2B8A3E] flex items-center justify-center text-xl shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-[#29213F] dark:text-white">{awakeCount}</div>
                    <div className="text-xs text-[#8C84A0]">Awake & Focused</div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveFilterState('sleeping')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#241D38] border transition-all cursor-pointer shadow-xs ${activeFilterState === 'sleeping' ? 'border-[#8C84A0] ring-1 ring-[#8C84A0]' : 'border-[#F0E6D8] dark:border-[#3A3156]'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#FFD6E7]/40 text-[#D6336C] flex items-center justify-center text-xl shrink-0">
                    💤
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-[#29213F] dark:text-white">{sleepingCount}</div>
                    <div className="text-xs text-[#8C84A0]">Taking a Catnap</div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveFilterState('pinned')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#241D38] border transition-all cursor-pointer shadow-xs ${activeFilterState === 'pinned' ? 'border-[#D9480F] ring-1 ring-[#D9480F]' : 'border-[#F0E6D8] dark:border-[#3A3156]'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF3BF] text-[#D9480F] flex items-center justify-center text-xl shrink-0">
                    🔔
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-[#29213F] dark:text-white">{pinnedCount}</div>
                    <div className="text-xs text-[#8C84A0]">Collared (Pinned)</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Search, Filter & Quick Launcher Bar */}
            <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl shadow-xs focus-within:border-[#B99AFF]">
                <Search className="w-4 h-4 text-[#8C84A0] shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cats by page title or domain..."
                  className="w-full bg-transparent border-none outline-none text-xs text-[#29213F] dark:text-white placeholder-[#8C84A0]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer text-xs">
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter Chips & Sort Dropdown */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl p-1 gap-1">
                  {(['all', 'awake', 'sleeping', 'pinned'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => { setActiveFilterState(st); sounds.purr(); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                        activeFilterState === st 
                          ? 'bg-[#B99AFF] text-white' 
                          : 'text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#8C84A0]" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none outline-none text-xs font-semibold text-[#29213F] dark:text-white cursor-pointer"
                  >
                    <option value="default" className="bg-white dark:bg-[#241D38]">Default Order</option>
                    <option value="domain" className="bg-white dark:bg-[#241D38]">Domain (A-Z)</option>
                    <option value="title" className="bg-white dark:bg-[#241D38]">Title (A-Z)</option>
                    <option value="room" className="bg-white dark:bg-[#241D38]">Room</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Cat Rooms Bar */}
            <section className="flex items-center justify-between gap-3 border-b border-[#F0E6D8] dark:border-[#3A3156] pb-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {rooms.map(r => {
                  const countInRoom = tabs.filter(t => r.id === 'all' || t.room === r.id).length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => { setActiveRoomId(r.id); sounds.purr(); }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                        activeRoomId === r.id
                          ? 'bg-[#B99AFF] text-white shadow-xs'
                          : 'bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] text-[#8C84A0] dark:text-[#A79EB8] hover:text-[#29213F] dark:hover:text-white hover:border-[#B99AFF]'
                      }`}
                    >
                      <span className="text-sm">{r.icon}</span>
                      <span>{r.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        activeRoomId === r.id ? 'bg-white/25 text-white' : 'bg-black/5 dark:bg-white/10 text-[#8C84A0]'
                      }`}>
                        {countInRoom}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCreateRoomOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-dashed border-[#B99AFF] text-[#B99AFF] hover:bg-[#B99AFF]/10 cursor-pointer shrink-0 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>
            </section>

            {/* Cat Tab Cards Grid */}
            <section className="min-h-[340px]">
              {filteredTabs.length === 0 ? (
                /* Empty Room State with Cozy Sleeping Cat */
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#241D38] border border-dashed border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl">
                  <div className="w-36 h-32 flex items-center justify-center mb-3">
                    <CatIllustration breedId="storm" isActive={false} size="lg" />
                  </div>
                  <h3 className="font-['Quicksand'] font-bold text-xl text-[#29213F] dark:text-white">This room is peaceful and quiet</h3>
                  <p className="text-xs text-[#8C84A0] max-w-md mt-1 mb-5">
                    No tabs match the current filter or room. Adopt a new tab or paste URLs to keep them organized!
                  </p>
                  <button
                    onClick={() => openAdoptModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#B99AFF] hover:bg-[#A680FF] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adopt a New Tab</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredTabs.map(tab => {
                    const isPetted = Boolean(tab.pettedUntil && Date.now() < tab.pettedUntil);

                    return (
                      <div
                        key={tab.id}
                        className={`flex flex-col bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#B99AFF] transition-all duration-200 group relative ${
                          tab.active ? 'ring-2 ring-[#B99AFF]' : ''
                        } ${tab.closing ? 'scale-90 opacity-0' : ''}`}
                      >
                        {/* Visual Stage Area (Click to pet kitty) */}
                        <div 
                          onClick={() => handlePetCat(tab.id)}
                          className="p-4 flex items-center justify-center bg-gradient-to-b from-[#FFD6E7]/15 to-[#B99AFF]/5 dark:from-[#2D2545] dark:to-[#241D38] relative cursor-pointer"
                          title="Click to pet this kitty!"
                        >
                          {/* Pinned Collar Badge */}
                          {tab.pinned && (
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFF3BF] text-[#D9480F] border border-[#FFE066] text-[10px] font-bold">
                              <span>🔔 Pinned</span>
                            </div>
                          )}

                          {/* Status indicator */}
                          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                            tab.active 
                              ? 'bg-[#C8F2DF] text-[#135438]' 
                              : 'bg-[#B99AFF]/20 text-[#6741D9] dark:text-[#E2D9FF]'
                          }`}>
                            <span>{tab.active ? '✨ Awake' : '💤 Napping'}</span>
                          </div>

                          {/* Cat SVG Illustration */}
                          <div className="w-28 h-24 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <CatIllustration
                              breedId={tab.breed}
                              isActive={tab.active}
                              isPinned={tab.pinned}
                              isAudible={tab.audible}
                              isBlinking={tab.blinking}
                              isHappy={isPetted || tab.active}
                              size="md"
                            />
                          </div>
                        </div>

                        {/* Card Body Info */}
                        <div className="p-3.5 flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <img 
                              src={tab.favIconUrl} 
                              alt="" 
                              className="w-4 h-4 rounded-xs shrink-0" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                            />
                            <span 
                              onClick={() => handleActivateTab(tab.id)}
                              className="text-xs font-bold text-[#29213F] dark:text-white truncate cursor-pointer hover:text-[#B99AFF]" 
                              title={tab.title}
                            >
                              {tab.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#8C84A0] dark:text-[#A79EB8]">
                            <span className="font-mono text-[10.5px] truncate">{tab.domain}</span>
                            <span className="text-[#B99AFF]">·</span>
                            <span className="truncate">{rooms.find(r => r.id === tab.room)?.name || 'All Cats'}</span>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#201933] border-t border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTabForMove(tab);
                                setIsMoveRoomOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white bg-white dark:bg-[#2D2545] border border-[#F0E6D8] dark:border-[#3A3156] rounded-lg cursor-pointer"
                              title="Move to another room"
                            >
                              🏠 Room
                            </button>
                            <button
                              onClick={() => handleTogglePin(tab.id)}
                              className={`px-2 py-1 text-[11px] font-semibold border rounded-lg cursor-pointer transition-colors ${
                                tab.pinned 
                                  ? 'bg-[#FFF3BF] border-[#FFE066] text-[#D9480F]' 
                                  : 'bg-white dark:bg-[#2D2545] border-[#F0E6D8] dark:border-[#3A3156] text-[#8C84A0] hover:text-[#29213F]'
                              }`}
                              title={tab.pinned ? 'Unpin tab' : 'Pin tab'}
                            >
                              📌 Pin
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleActivateTab(tab.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-lg shadow-2xs cursor-pointer"
                            >
                              Switch
                            </button>
                            <button
                              onClick={() => handleCloseTab(tab.id)}
                              className="p-1 text-[#8C84A0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer transition-colors"
                              title="Close tab"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* =========================================================================
            VIEW 2: NEW TAB PAGE REPLICA (NEW TAB EXPERIENCE)
           ========================================================================= */}
        {activeTabNav === 'newTabMode' && (
          <section className="flex flex-col items-center justify-center min-h-[640px] py-10 px-4 rounded-3xl bg-gradient-to-b from-[#FFF8EF] via-white to-[#FFD6E7]/20 dark:from-[#1C162E] dark:via-[#241D38] dark:to-[#201933] border border-[#F0E6D8] dark:border-[#3A3156] shadow-sm relative overflow-hidden">
            
            {/* Top Bar with Weather & Ambient Mood */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-8 text-xs text-[#8C84A0]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#29213F]/70 border border-[#F0E6D8] dark:border-[#3A3156] backdrop-blur-xs">
                <CloudSun className="w-4 h-4 text-[#FFB877]" />
                <span className="font-semibold text-[#29213F] dark:text-white">72°F / 22°C</span>
                <span>· Warm Sunbeam Breeze</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px]">Primary Mascot:</span>
                <span className="font-bold text-[#B99AFF]">{CAT_BREEDS[defaultBreed]?.name}</span>
              </div>
            </div>

            {/* Huge Cozy Time & Date */}
            <div className="text-center flex flex-col items-center gap-1">
              <div className="text-5xl md:text-7xl font-bold font-mono tracking-tight text-[#29213F] dark:text-white tabular-nums drop-shadow-xs">
                {currentTime || '12:00 PM'}
              </div>
              <div className="text-sm md:text-base font-semibold text-[#8C84A0] dark:text-[#A79EB8] mt-1">
                {currentDate}
              </div>
            </div>

            {/* Mascot Relaxing on Cushion */}
            <div 
              onClick={() => {
                sounds.meow();
                setPurrScore(prev => prev + 1);
                showToast(`Purr! ${CAT_BREEDS[defaultBreed]?.name} stretches happily!`);
              }}
              className="my-5 cursor-pointer transform hover:scale-105 transition-transform"
              title="Click to pet your mascot!"
            >
              <CatIllustration breedId={defaultBreed} isActive={true} isHappy={true} size="xl" />
            </div>

            {/* Multi-Engine Web Search Bar */}
            <form onSubmit={handleNewTabSearch} className="w-full max-w-xl flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#241D38] border-2 border-[#B99AFF]/50 focus-within:border-[#B99AFF] rounded-2xl shadow-md transition-all">
                <Search className="w-5 h-5 text-[#B99AFF]" />
                <input 
                  type="text" 
                  value={newTabSearchQuery}
                  onChange={(e) => setNewTabSearchQuery(e.target.value)}
                  placeholder={`Search with ${searchEngine.toUpperCase()} or enter a website address...`}
                  className="w-full bg-transparent border-none outline-none text-sm text-[#29213F] dark:text-white placeholder-[#8C84A0]"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#B99AFF] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#A680FF]"
                >
                  Search
                </button>
              </div>

              {/* Search Engine Selector */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#8C84A0]">
                <span>Engine:</span>
                {(['google', 'duckduckgo', 'bing'] as const).map(eng => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => setSearchEngine(eng)}
                    className={`capitalize font-semibold cursor-pointer ${searchEngine === eng ? 'text-[#B99AFF] underline font-bold' : 'hover:text-[#29213F] dark:hover:text-white'}`}
                  >
                    {eng}
                  </button>
                ))}
              </div>
            </form>

            {/* Quick Links Grid */}
            <div className="w-full max-w-2xl mt-8">
              <div className="text-xs font-bold text-[#8C84A0] uppercase tracking-wider mb-3 text-center">
                Cozy Quick Links
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickLinks.map(link => (
                  <div
                    key={link.id}
                    onClick={() => openAdoptModal(link.url)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] dark:bg-[#1C162E] flex items-center justify-center text-lg shrink-0">
                      {link.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-[#29213F] dark:text-white">{link.title}</div>
                      <div className="text-[10px] text-[#8C84A0] font-mono truncate">{link.domain}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Room Summary */}
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-[#8C84A0]">
              <span>Active Sanctuary:</span>
              <span className="text-[#29213F] dark:text-white font-bold">{tabs.length} tabs open</span>
              <span>·</span>
              <span>{awakeCount} awake</span>
              <span>·</span>
              <span>{rooms.length} cat rooms</span>
            </div>
          </section>
        )}

        {/* =========================================================================
            VIEW 3: TOOLBAR POPOVER DEMO
           ========================================================================= */}
        {activeTabNav === 'popupDemo' && (
          <section className="flex flex-col lg:flex-row items-center justify-center gap-12 py-8">
            <div className="max-w-md">
              <div className="text-xs font-bold text-[#B99AFF] uppercase tracking-wider mb-2">Real Toolbar Popover</div>
              <h2 className="font-['Quicksand'] font-bold text-2xl text-[#29213F] dark:text-white leading-tight">
                Inspect the Chrome Extension Popup in Real-Time
              </h2>
              <p className="text-sm text-[#8C84A0] dark:text-[#A79EB8] mt-2 leading-relaxed">
                This simulator mirrors the exact 380×560px popover rendered when you click the TabKitty icon in Google Chrome. Any tabs, pins, or rooms changed here sync immediately with your sanctuary.
              </p>

              <div className="mt-6 flex flex-col gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C8F2DF] text-[#135438] flex items-center justify-center font-bold">1</div>
                  <span>Instant search across open tabs by domain or name</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD6E7] text-[#D6336C] flex items-center justify-center font-bold">2</div>
                  <span>Quick room filtering to inspect tabs by context</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#B99AFF]/20 text-[#6741D9] dark:text-[#E2D9FF] flex items-center justify-center font-bold">3</div>
                  <span>Single-click pin or gentle catnap close</span>
                </div>
              </div>
            </div>

            {/* Authentic 380x560 Chrome Popover Container */}
            <div className="w-[380px] h-[560px] bg-[#FFF8EF] dark:bg-[#1C162E] border-2 border-[#B99AFF] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-3.5 bg-white dark:bg-[#261F3D] border-b border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src="/icons/icon48.svg" alt="" className="w-7 h-7 rounded-lg" />
                  <div>
                    <h2 className="text-sm font-bold leading-tight">TabKitty</h2>
                    <p className="text-[11px] text-[#8C84A0] dark:text-[#A79EB8] font-medium">{tabs.length} tabs ({awakeCount} awake)</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setActiveTabNav('sanctuary')}
                    className="p-1.5 text-[#8C84A0] hover:text-[#29213F] hover:bg-[#FFD6E7] rounded-lg transition-colors cursor-pointer"
                    title="Open Full Dashboard"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 text-[#8C84A0] hover:text-[#29213F] hover:bg-[#FFD6E7] rounded-lg transition-colors cursor-pointer"
                    title="Settings"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Popover Search */}
              <div className="mx-3.5 my-2.5 px-3 py-1.5 bg-white dark:bg-[#261F3D] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#8C84A0]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter cats by name or domain..."
                  className="bg-transparent border-none outline-none text-xs w-full text-[#29213F] dark:text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#8C84A0] text-xs cursor-pointer">×</button>
                )}
              </div>

              {/* Popover Room Pills */}
              <div className="px-3.5 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {rooms.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setActiveRoomId(r.id); sounds.purr(); }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-all ${
                      activeRoomId === r.id 
                        ? 'bg-[#B99AFF] text-white shadow-xs' 
                        : 'bg-white dark:bg-[#261F3D] border border-[#F0E6D8] dark:border-[#3A3156] text-[#8C84A0] hover:text-[#29213F]'
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.name}</span>
                  </button>
                ))}
              </div>

              {/* Popover Tabs List */}
              <div className="flex-1 overflow-y-auto px-3.5 py-1 flex flex-col gap-2">
                {filteredTabs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <CatIllustration breedId="storm" isActive={false} size="md" />
                    <p className="text-xs font-bold mt-2">All cats are fast asleep</p>
                    <p className="text-[11px] text-[#8C84A0] mt-1">No open tabs in this room.</p>
                    <button onClick={() => openAdoptModal()} className="mt-3 px-3 py-1.5 text-xs bg-[#B99AFF] text-white font-bold rounded-lg cursor-pointer">
                      + Adopt New Tab
                    </button>
                  </div>
                ) : (
                  filteredTabs.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => handleActivateTab(t.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#29213F] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] cursor-pointer shadow-2xs transition-all ${t.active ? 'ring-1 ring-[#B99AFF] bg-[#B99AFF]/5' : ''}`}
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                        <CatIllustration 
                          breedId={t.breed} 
                          isActive={t.active} 
                          isPinned={t.pinned} 
                          isAudible={t.audible} 
                          isBlinking={t.blinking} 
                          size="sm" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <img src={t.favIconUrl} alt="" className="w-3.5 h-3.5 rounded-xs shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                          <span className="text-xs font-bold truncate text-[#29213F] dark:text-white">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#8C84A0] font-mono mt-0.5">
                          <span>{t.domain}</span>
                          <span className="text-[#B99AFF]">·</span>
                          <span className={t.active ? 'text-[#2B8A3E] font-semibold' : ''}>{t.active ? 'Awake' : 'Sleeping'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleTogglePin(t.id)} 
                          className={`p-1 rounded-md text-[#8C84A0] hover:text-[#F59F00] cursor-pointer ${t.pinned ? 'text-[#F59F00]' : ''}`}
                          title={t.pinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleCloseTab(t.id)} 
                          className="p-1 rounded-md text-[#8C84A0] hover:text-red-500 cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Bottom Bar */}
              <div className="p-3 bg-white dark:bg-[#261F3D] border-t border-[#F0E6D8] dark:border-[#3A3156] flex items-center gap-2">
                <button 
                  onClick={() => openAdoptModal()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#B99AFF] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#A680FF]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adopt Tab</span>
                </button>
                <button 
                  onClick={openSaveSessionModal}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-[#29213F] border border-[#F0E6D8] dark:border-[#3A3156] text-xs font-bold rounded-xl cursor-pointer hover:border-[#B99AFF]"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-[#B99AFF]" />
                  <span>Save Session</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            VIEW 4: CAT PLAYROOM & INTERACTIVE TOY DECK
           ========================================================================= */}
        {activeTabNav === 'playroom' && (
          <section className="flex flex-col gap-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Quicksand'] font-bold text-2xl text-[#29213F] dark:text-white">
                  Cat Playroom & Companion Sanctuary
                </h2>
                <p className="text-sm text-[#8C84A0] dark:text-[#A79EB8] mt-1">
                  Interact with real synthesized audio, use cat toys to make companions leap, and unlock rare breeds!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] text-xs font-bold flex items-center gap-2.5 shadow-xs">
                  <Heart className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B]" />
                  <span>Sanctuary Purr Level: {purrScore < 10 ? 'Level 1: Kitten Whisperer' : purrScore < 30 ? 'Level 2: Cozy Caretaker' : 'Level 3: Arch-Guardian'} ({purrScore} Pets)</span>
                </div>
              </div>
            </div>

            {/* Interactive Toys Deck */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFD6E7]/30 via-white to-[#C8F2DF]/30 dark:from-[#241D38] dark:to-[#2D2545] border border-[#F0E6D8] dark:border-[#3A3156] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B99AFF]">Interactive Play Deck</span>
                <span className="text-sm font-bold text-[#29213F] dark:text-white">Select a feline toy to activate all cats in the sanctuary:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePlayWithToy('yarn')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activePlayToy === 'yarn' ? 'bg-[#FFB877] text-white shadow-xs' : 'bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156]'
                  }`}
                >
                  <span className="text-base">🧶</span>
                  <span>Yarn Ball</span>
                </button>

                <button
                  onClick={() => handlePlayWithToy('feather')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activePlayToy === 'feather' ? 'bg-[#74C0FC] text-white shadow-xs' : 'bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156]'
                  }`}
                >
                  <span className="text-base">🪶</span>
                  <span>Feather Wand</span>
                </button>

                <button
                  onClick={() => handlePlayWithToy('laser')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activePlayToy === 'laser' ? 'bg-[#FF6B6B] text-white shadow-xs' : 'bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156]'
                  }`}
                >
                  <span className="text-base">🔴</span>
                  <span>Laser Pointer</span>
                </button>

                <button
                  onClick={() => handlePlayWithToy('catnip')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activePlayToy === 'catnip' ? 'bg-[#63E6BE] text-[#135438] shadow-xs' : 'bg-white dark:bg-[#201933] border border-[#F0E6D8] dark:border-[#3A3156]'
                  }`}
                >
                  <span className="text-base">🌿</span>
                  <span>Catnip Leaf</span>
                </button>
              </div>
            </div>

            {/* Breeds Collection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.values(CAT_BREEDS).map(b => {
                const isUnlocked = unlockedCats.includes(b.id) || b.unlocked;
                const isDefault = defaultBreed === b.id;

                return (
                  <div 
                    key={b.id}
                    className={`flex flex-col rounded-3xl border p-5 transition-all duration-200 relative group ${
                      isDefault 
                        ? 'border-[#B99AFF] bg-[#B99AFF]/10 ring-2 ring-[#B99AFF] shadow-sm' 
                        : 'border-[#F0E6D8] dark:border-[#3A3156] bg-white dark:bg-[#241D38] hover:border-[#B99AFF] shadow-xs'
                    }`}
                  >
                    {/* Cat Presentation Avatar */}
                    <div 
                      onClick={() => {
                        if (isUnlocked) {
                          sounds.meow();
                          setPurrScore(prev => prev + 1);
                          showToast(`Purr! ${b.name} (${b.nickname}) loves being petted ❤️`);
                        } else {
                          showToast(`Locked: ${b.unlockCondition}`);
                        }
                      }}
                      className="w-full h-36 flex items-center justify-center cursor-pointer bg-gradient-to-b from-[#FFD6E7]/20 to-transparent rounded-2xl mb-3 group-hover:scale-105 transition-transform"
                      title="Click to pet!"
                    >
                      <CatIllustration 
                        breedId={b.id} 
                        isActive={isUnlocked} 
                        isHappy={isDefault || toyAnimationState !== null} 
                        size="lg" 
                      />
                    </div>

                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-['Quicksand'] font-bold text-base text-[#29213F] dark:text-white">{b.name}</h3>
                      <span className="text-[10px] font-bold text-[#B99AFF]">{b.nickname}</span>
                    </div>

                    <p className="text-xs text-[#8C84A0] dark:text-[#A79EB8] leading-relaxed mb-3 flex-1">{b.desc}</p>

                    <div className="flex flex-col gap-1.5 text-[11px] text-[#8C84A0] dark:text-[#A79EB8] pt-2.5 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                      <div className="flex justify-between">
                        <span>Personality:</span>
                        <span className="font-semibold text-[#29213F] dark:text-white">{b.personality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Favorite Toy:</span>
                        <span className="font-semibold text-[#29213F] dark:text-white">{b.favoriteToy}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
                      {isUnlocked ? (
                        isDefault ? (
                          <span className="text-xs font-bold text-[#B99AFF] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Primary Mascot</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setDefaultBreed(b.id);
                              sounds.purr();
                              showToast(`Set ${b.name} as your primary sanctuary mascot!`);
                            }}
                            className="px-3 py-1.5 text-xs font-bold bg-[#FAF6F0] dark:bg-[#2D2545] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white rounded-xl cursor-pointer"
                          >
                            Set as Mascot
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-[#E8590C]">
                          🔒 {b.unlockCondition}
                        </span>
                      )}

                      <button
                        onClick={() => {
                          sounds.meow();
                          setPurrScore(prev => prev + 1);
                        }}
                        className="p-1.5 text-[#8C84A0] hover:text-[#FF6B6B] rounded-lg cursor-pointer"
                        title="Pet this cat"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            VIEW 5: SESSION VAULT
           ========================================================================= */}
        {activeTabNav === 'sessions' && (
          <section className="flex flex-col gap-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-['Quicksand'] font-bold text-2xl text-[#29213F] dark:text-white">
                  Session Vault & Backup
                </h2>
                <p className="text-sm text-[#8C84A0] dark:text-[#A79EB8] mt-1">
                  Snapshot all open companion tabs, restore previous collections, or export to standard JSON format.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportFile} 
                  accept=".json" 
                  className="hidden" 
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B99AFF]" />
                  <span>Import JSON</span>
                </button>

                <button
                  onClick={handleExportSessions}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF] text-[#29213F] dark:text-white cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B99AFF]" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={openSaveSessionModal}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#B99AFF] hover:bg-[#A680FF] text-white shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Snapshot Open Tabs ({tabs.length})</span>
                </button>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#241D38] border border-dashed border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl">
                <CatIllustration breedId="cocoa" isActive={false} size="lg" />
                <h3 className="font-['Quicksand'] font-bold text-xl text-[#29213F] dark:text-white mt-3">No Saved Sessions Yet</h3>
                <p className="text-xs text-[#8C84A0] max-w-sm mt-1 mb-5">
                  Save your current collection of open tabs to restore them whenever you want, or export them to share across devices.
                </p>
                <button
                  onClick={openSaveSessionModal}
                  className="px-4 py-2 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Snapshot Current Tabs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map(s => (
                  <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] shadow-xs flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-bold text-[#29213F] dark:text-white">{s.name}</h3>
                        <span className="text-[11px] font-mono tabular-nums text-[#8C84A0]">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-[#8C84A0] font-mono tabular-nums mt-0.5">
                        {s.tabsCount} companion tabs in collection
                      </p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {s.tabs.slice(0, 5).map((t, i) => (
                          <span key={i} className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] text-[#8C84A0] font-mono truncate max-w-[140px]">
                            {t.title}
                          </span>
                        ))}
                        {s.tabs.length > 5 && (
                          <span className="text-[10px] text-[#8C84A0] font-mono">+{s.tabs.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        onClick={() => handleRestoreSession(s)}
                        className="px-4 py-1.5 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restore ({s.tabsCount} Tabs)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VIEW 6: EXTENSION INSTALLATION & CODE INSPECTOR
           ========================================================================= */}
        {activeTabNav === 'install' && (
          <section className="flex flex-col gap-6 py-4">
            <div className="p-7 md:p-8 rounded-3xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2B8A3E] uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Chrome Manifest V3 Verified</span>
                </div>
                <h2 className="font-['Quicksand'] font-bold text-2xl text-[#29213F] dark:text-white leading-tight">
                  Install TabKitty into Google Chrome in 30 Seconds
                </h2>
                <p className="text-sm text-[#8C84A0] dark:text-[#A79EB8] mt-2 leading-relaxed">
                  TabKitty is built as a complete standalone Chrome Extension. You can download the zip package, load it unpacked into Chrome, and enjoy your companion cats on all your browsing sessions!
                </p>
              </div>

              <div className="flex flex-col gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={downloadExtensionZip}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B99AFF] hover:bg-[#A680FF] text-white text-sm font-bold rounded-2xl shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download TabKitty-Extension.zip</span>
                </button>
                <span className="text-[11px] text-[#8C84A0] text-center font-mono">Includes icons, manifest.json & service worker</span>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#B99AFF] text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-bold text-sm text-[#29213F] dark:text-white">Unzip Downloaded Archive</h3>
                <p className="text-xs text-[#8C84A0] leading-relaxed">
                  Extract the downloaded <code>TabKitty-Extension-v1.0.0.zip</code> file to any folder on your computer.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#FFB877] text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-bold text-sm text-[#29213F] dark:text-white">Open Chrome Extensions</h3>
                <p className="text-xs text-[#8C84A0] leading-relaxed">
                  Navigate to <code>chrome://extensions</code> in your Chrome browser and toggle on <strong>Developer mode</strong> in the top-right.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('chrome://extensions');
                    setCopiedInstallCmd(true);
                    sounds.purr();
                    showToast('Copied chrome://extensions to clipboard!');
                    setTimeout(() => setCopiedInstallCmd(false), 2000);
                  }}
                  className="mt-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span className="font-mono">chrome://extensions</span>
                  <span className="text-[#B99AFF]">{copiedInstallCmd ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#63E6BE] text-[#135438] font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-bold text-sm text-[#29213F] dark:text-white">Click "Load Unpacked"</h3>
                <p className="text-xs text-[#8C84A0] leading-relaxed">
                  Select the unzipped TabKitty folder containing <code>manifest.json</code>. TabKitty will immediately appear in your browser toolbar!
                </p>
              </div>
            </div>

            {/* In-Browser Extension Source Explorer */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D8] dark:border-[#3A3156] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#29213F] dark:text-white">Extension Source Code Inspector</h3>
                  <p className="text-xs text-[#8C84A0]">Inspect the actual bundled Manifest V3 files</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  {Object.keys(EXTENSION_CODE_SAMPLES).map(filename => (
                    <button
                      key={filename}
                      onClick={() => setActiveCodeFile(filename)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg cursor-pointer transition-colors ${
                        activeCodeFile === filename 
                          ? 'bg-[#B99AFF] text-white font-bold' 
                          : 'bg-[#FAF6F0] dark:bg-[#1C162E] text-[#8C84A0] hover:text-[#29213F] dark:hover:text-white'
                      }`}
                    >
                      {filename}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-[#8C84A0] italic">
                {EXTENSION_CODE_SAMPLES[activeCodeFile]?.desc}
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-[#1C162E] text-[#C8F2DF] text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {EXTENSION_CODE_SAMPLES[activeCodeFile]?.code}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(EXTENSION_CODE_SAMPLES[activeCodeFile]?.code || '');
                    sounds.purr();
                    showToast(`Copied ${activeCodeFile} to clipboard!`);
                  }}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono rounded-lg cursor-pointer transition-colors"
                >
                  Copy File
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ADOPT TAB MODAL */}
      {isAdoptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B99AFF]/20 text-[#B99AFF] flex items-center justify-center font-bold">
                  🐾
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29213F] dark:text-white">Adopt New Tab Companion</h3>
                  <p className="text-[11px] text-[#8C84A0]">Add a real website to your feline sanctuary</p>
                </div>
              </div>
              <button onClick={() => setIsAdoptModalOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdoptModalSubmit} className="p-5 flex flex-col gap-4">
              {/* Live Preview */}
              <div className="flex items-center justify-center py-2 bg-[#FAF6F0] dark:bg-[#1C162E] rounded-2xl">
                <CatIllustration breedId={adoptTargetBreed} isActive={true} isPinned={adoptTargetPinned} size="md" />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Website Domain or URL</label>
                <input 
                  type="text" 
                  value={adoptInputUrl}
                  onChange={(e) => setAdoptInputUrl(e.target.value)}
                  placeholder="e.g. github.com, wikipedia.org, news.ycombinator.com"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none focus:border-[#B99AFF] text-[#29213F] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Assign to Room</label>
                  <select
                    value={adoptTargetRoom}
                    onChange={(e) => setAdoptTargetRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none text-[#29213F] dark:text-white"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Cat Breed</label>
                  <select
                    value={adoptTargetBreed}
                    onChange={(e) => setAdoptTargetBreed(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none text-[#29213F] dark:text-white"
                  >
                    {Object.values(CAT_BREEDS).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="pinCheck"
                  checked={adoptTargetPinned}
                  onChange={(e) => setAdoptTargetPinned(e.target.checked)}
                  className="accent-[#B99AFF] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs font-medium cursor-pointer select-none text-[#29213F] dark:text-white">
                  Pin tab with golden bell collar (always stays open)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                <button
                  type="button"
                  onClick={() => setIsAdoptModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Adopt Tab Companion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH IMPORT MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#B99AFF]" />
                <h3 className="text-base font-bold text-[#29213F] dark:text-white">Batch Add Real URLs</h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchModalSubmit} className="p-5 flex flex-col gap-4">
              <p className="text-xs text-[#8C84A0]">
                Paste multiple web links (one URL per line). TabKitty will assign a cute cat companion to each link!
              </p>

              <textarea
                value={batchUrlsInput}
                onChange={(e) => setBatchUrlsInput(e.target.value)}
                placeholder="https://news.ycombinator.com&#10;https://github.com&#10;https://wikipedia.org"
                rows={5}
                required
                className="w-full p-3.5 text-xs font-mono bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none focus:border-[#B99AFF] text-[#29213F] dark:text-white"
              />

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Import Companion Tabs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAVE SESSION MODAL */}
      {isSaveSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#B99AFF]" />
                <h3 className="text-base font-bold text-[#29213F] dark:text-white">Save Current Session</h3>
              </div>
              <button onClick={() => setIsSaveSessionModalOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Session Name</label>
                <input 
                  type="text" 
                  value={sessionNameInput}
                  onChange={(e) => setSessionNameInput(e.target.value)}
                  placeholder="e.g. Morning Sprint, Research, Weekend Reads"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none focus:border-[#B99AFF] text-[#29213F] dark:text-white"
                />
              </div>

              <div className="p-3 bg-[#FAF6F0] dark:bg-[#1C162E] rounded-xl text-xs text-[#8C84A0] flex items-center justify-between">
                <span>Tabs to snapshot:</span>
                <span className="font-bold text-[#29213F] dark:text-white font-mono">{tabs.length} tabs</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                <button
                  type="button"
                  onClick={() => setIsSaveSessionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {isCreateRoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#F0E6D8] dark:border-[#3A3156] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#29213F] dark:text-white">Create New Cat Room</h3>
              <button onClick={() => setIsCreateRoomOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Room Name</label>
                <input 
                  type="text" 
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Design, Research, Finance, Music"
                  maxLength={24}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF6F0] dark:bg-[#1C162E] border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl outline-none focus:border-[#B99AFF] text-[#29213F] dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Room Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {['🐾', '🎨', '☕', '🌿', '💻', '🎧', '🍜', '🌙'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewRoomIcon(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border cursor-pointer ${
                        newRoomIcon === emoji ? 'border-[#B99AFF] bg-[#B99AFF]/15 scale-110' : 'border-[#F0E6D8] dark:border-[#3A3156]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5 text-[#29213F] dark:text-white">Room Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['#B99AFF', '#74C0FC', '#C8F2DF', '#FFD6E7', '#FFC078', '#FF8787'].map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewRoomColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-xl cursor-pointer transition-transform ${
                        newRoomColor === color ? 'ring-2 ring-offset-2 ring-[#29213F] scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0E6D8] dark:border-[#3A3156]">
                <button
                  type="button"
                  onClick={() => setIsCreateRoomOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#F0E6D8] dark:border-[#3A3156] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#B99AFF] hover:bg-[#A680FF] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVE TAB ROOM MODAL */}
      {isMoveRoomOpen && selectedTabForMove && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-2xl w-full max-w-sm shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#3A3156] mb-3">
              <h3 className="text-sm font-bold text-[#29213F] dark:text-white">Move Cat to Room</h3>
              <button onClick={() => setIsMoveRoomOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8C84A0] mb-3">
              Assign "{selectedTabForMove.title.slice(0, 24)}" to:
            </p>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {rooms.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setTabs(prev => prev.map(t => t.id === selectedTabForMove.id ? { ...t, room: r.id } : t));
                    setIsMoveRoomOpen(false);
                    sounds.purr();
                    showToast(`Moved to ${r.name}!`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    selectedTabForMove.room === r.id 
                      ? 'border-[#B99AFF] bg-[#B99AFF]/10 text-[#B99AFF]' 
                      : 'border-[#F0E6D8] dark:border-[#3A3156] hover:border-[#B99AFF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.icon}</span>
                    <span>{r.name}</span>
                  </div>
                  {selectedTabForMove.room === r.id && <span className="text-[11px] font-bold">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241D38] border border-[#F0E6D8] dark:border-[#3A3156] rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0E6D8] dark:border-[#3A3156] mb-4">
              <h3 className="font-['Quicksand'] font-bold text-lg text-[#29213F] dark:text-white">TabKitty Preferences</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-[#8C84A0] hover:text-[#29213F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#F0E6D8] dark:border-[#3A3156]">
                <div>
                  <div className="font-bold text-[#29213F] dark:text-white">Appearance Theme</div>
                  <div className="text-[11px] text-[#8C84A0]">Cozy cream or twilight dark</div>
                </div>
                <button
                  onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  className="px-3 py-1.5 rounded-lg border border-[#F0E6D8] dark:border-[#3A3156] font-bold cursor-pointer"
                >
                  {theme === 'dark' ? 'Twilight Dark' : 'Cozy Light'}
                </button>
              </div>

              <div className="flex flex-col gap-2 py-2 border-b border-[#F0E6D8] dark:border-[#3A3156]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#29213F] dark:text-white">Cat Synthesizer Volume</div>
                    <div className="text-[11px] text-[#8C84A0]">Soft synthesized meows, purrs, and bell chimes</div>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`px-3 py-1 rounded-lg border font-bold cursor-pointer ${soundEnabled ? 'bg-[#C8F2DF] text-[#135438] border-[#C8F2DF]' : 'border-[#F0E6D8] text-[#8C84A0]'}`}
                  >
                    {soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>
                {soundEnabled && (
                  <div className="flex items-center gap-3 pt-1">
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSoundVolume(val);
                        sounds.volume = val;
                        sounds.purr();
                      }}
                      className="w-full accent-[#B99AFF]"
                    />
                    <span className="font-mono text-[10.5px] tabular-nums shrink-0">{Math.round(soundVolume * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-[#29213F] dark:text-white">Default Mascot Cat</div>
                  <div className="text-[11px] text-[#8C84A0]">Greets you on the sanctuary page</div>
                </div>
                <select
                  value={defaultBreed}
                  onChange={(e) => setDefaultBreed(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#F0E6D8] dark:border-[#3A3156] bg-transparent text-xs font-semibold text-[#29213F] dark:text-white"
                >
                  {Object.values(CAT_BREEDS).map(b => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-[#241D38]">{b.name} ({b.nickname})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[#F0E6D8] dark:border-[#3A3156] flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#B99AFF] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
