/**
 * TabKitty - Dashboard & New Tab Page Controller
 * Full-featured browser tab management with virtual cat companions.
 */

import tabManager from './tabs.js';
import storage from './storage.js';
import { createCatSvg, CAT_BREEDS } from './cats.js';

let allTabs = [];
let rooms = [];
let activeRoomId = 'all';
let searchQuery = '';
let settings = {};
let selectedTabToMove = null;
let soundMuted = false;

class CozyAudioPlayer {
  constructor() {
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  purr() {
    if (soundMuted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  meow() {
    if (soundMuted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  pop() {
    if (soundMuted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }
}

const audio = new CozyAudioPlayer();

const navTime = document.getElementById('nav-time');
const navDate = document.getElementById('nav-date');
const userGreeting = document.getElementById('user-greeting');
const greetingKicker = document.getElementById('greeting-kicker');
const greetingStats = document.getElementById('greeting-stats-summary');
const heroMascot = document.getElementById('hero-mascot-container');
const statTotalCats = document.getElementById('stat-total-cats');
const statAwakeCats = document.getElementById('stat-awake-cats');
const statRoomsCount = document.getElementById('stat-rooms-count');
const statSessionsCount = document.getElementById('stat-sessions-count');
const roomsTabsContainer = document.getElementById('rooms-tabs-container');
const tabsGrid = document.getElementById('tabs-grid');
const gridEmptyState = document.getElementById('grid-empty-state');
const emptyCatArtLarge = document.getElementById('empty-cat-art-large');
const toastContainer = document.getElementById('toast-container');
const dashboardSearch = document.getElementById('dashboard-search');
const btnClearSearch = document.getElementById('btn-clear-search');

const themeToggle = document.getElementById('theme-toggle');
const themeIconSun = document.getElementById('theme-icon-sun');
const themeIconMoon = document.getElementById('theme-icon-moon');
const soundToggle = document.getElementById('sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
const btnAddTab = document.getElementById('btn-add-tab');
const btnSaveCurrentSession = document.getElementById('btn-save-current-session');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnEmptyAdopt = document.getElementById('btn-empty-adopt');
const btnCollectionModal = document.getElementById('btn-collection-modal');
const btnSessionsModal = document.getElementById('btn-sessions-modal');
const btnOpenOptionsPage = document.getElementById('btn-open-options-page');

const modalCreateRoom = document.getElementById('modal-create-room');
const inputNewRoomName = document.getElementById('input-new-room-name');
const btnSaveNewRoom = document.getElementById('btn-save-new-room');
const modalMoveRoom = document.getElementById('modal-move-room');
const moveRoomOptions = document.getElementById('move-room-options');
const modalCatCollection = document.getElementById('modal-cat-collection');
const catCollectionGrid = document.getElementById('cat-collection-grid');
const modalSessions = document.getElementById('modal-sessions');
const sessionsListContainer = document.getElementById('sessions-list-container');
const btnExportSessions = document.getElementById('btn-export-sessions');
const btnSaveNewSessionModal = document.getElementById('btn-save-new-session-modal');

async function init() {
  settings = await storage.getSettings();
  soundMuted = !settings.soundEnabled;
  updateSoundUI();
  applyTheme(settings.theme);

  heroMascot.innerHTML = createCatSvg({ breed: settings.defaultBreed || 'mochi', isActive: true, isHappy: true, size: 'lg' });
  emptyCatArtLarge.innerHTML = createCatSvg({ breed: 'storm', isActive: false, size: 'lg' });

  updateClockAndGreeting();
  setInterval(updateClockAndGreeting, 1000);

  rooms = await storage.getRooms();
  renderRooms();

  await refreshTabs();

  tabManager.on((event, data) => {
    refreshTabs();
  });

  setInterval(triggerRandomBlink, 4500);

  setupEventListeners();
  checkUnlockAchievements();
}

function updateClockAndGreeting() {
  const now = new Date();
  navTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  navDate.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const hour = now.getHours();
  if (hour < 12) {
    greetingKicker.textContent = 'Morning Sunbeam Sanctuary';
    userGreeting.textContent = 'Good morning, Human! Your cats are awake and ready.';
  } else if (hour < 18) {
    greetingKicker.textContent = 'Cozy Afternoon Catnap';
    userGreeting.textContent = 'Good afternoon, Human! Perfect hour for organized tabs.';
  } else {
    greetingKicker.textContent = 'Twilight Purr Lounge';
    userGreeting.textContent = 'Good evening, Human! Rest your tabs under the stars.';
  }
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    themeIconSun.classList.add('hidden');
    themeIconMoon.classList.remove('hidden');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeIconSun.classList.remove('hidden');
    themeIconMoon.classList.add('hidden');
  }
}

function updateSoundUI() {
  soundIconOn.classList.toggle('hidden', soundMuted);
  soundIconOff.classList.toggle('hidden', !soundMuted);
}

async function refreshTabs() {
  allTabs = await tabManager.getAllTabs();
  updateStats();
  renderTabs();
}

async function updateStats() {
  const awake = allTabs.filter(t => t.active).length;
  statTotalCats.textContent = allTabs.length;
  statAwakeCats.textContent = awake;
  statRoomsCount.textContent = rooms.length;

  const sessions = await storage.getSessions();
  statSessionsCount.textContent = sessions.length;

  greetingStats.textContent = `You have ${allTabs.length} companion cats across ${rooms.length} rooms (${awake} awake & focused).`;
}

function renderRooms() {
  roomsTabsContainer.innerHTML = '';
  rooms.forEach(r => {
    const btn = document.createElement('button');
    btn.className = `room-tab-btn ${r.id === activeRoomId ? 'active' : ''}`;
    btn.innerHTML = `<span>${r.icon}</span> <span>${escapeHtml(r.name)}</span>`;
    btn.addEventListener('click', () => {
      activeRoomId = r.id;
      audio.purr();
      renderRooms();
      renderTabs();
    });
    roomsTabsContainer.appendChild(btn);
  });
}

function renderTabs() {
  tabsGrid.innerHTML = '';

  const filtered = allTabs.filter(t => {
    if (activeRoomId !== 'all' && t.room !== activeRoomId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDomain = (t.domain || '').toLowerCase().includes(q);
      const matchUrl = (t.url || '').toLowerCase().includes(q);
      return matchTitle || matchDomain || matchUrl;
    }
    return true;
  });

  if (filtered.length === 0) {
    gridEmptyState.classList.remove('hidden');
    return;
  }

  gridEmptyState.classList.add('hidden');

  filtered.forEach(tab => {
    const card = document.createElement('div');
    card.className = `cat-card ${tab.active ? 'active-tab' : ''}`;
    card.dataset.tabId = tab.id;

    const faviconUrl = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${tab.domain}&sz=32`;

    card.innerHTML = `
      <div class="cat-card-stage" title="Click to pet this kitty!">
        ${tab.pinned ? `<div class="cat-pinned-badge"><span>🔔 Pinned</span></div>` : ''}
        <div class="cat-status-pill ${tab.active ? 'awake' : 'napping'}">
          <span>${tab.active ? '✨ Awake' : '💤 Napping'}</span>
        </div>
        <div class="cat-stage-svg" data-cat-id="${tab.id}">
          ${createCatSvg({
            breed: tab.breed || 'mochi',
            isActive: tab.active,
            isPinned: tab.pinned,
            isAudible: tab.audible,
            size: 'md'
          })}
        </div>
      </div>

      <div class="cat-card-body">
        <div class="cat-card-header">
          <img class="tab-fav" src="${faviconUrl}" onerror="this.style.display='none'" alt="" />
          <span class="tab-title-text" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</span>
        </div>
        <div class="tab-meta-row">
          <span class="tab-domain-tag">${escapeHtml(tab.domain)}</span>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(getRoomName(tab.room))}</span>
        </div>
      </div>

      <div class="cat-card-actions">
        <div class="card-action-group">
          <button class="btn-card-action btn-move" title="Move to Room">
            <span>🏠 Move</span>
          </button>
          <button class="btn-card-action btn-pin ${tab.pinned ? 'pinned' : ''}" title="${tab.pinned ? 'Unpin' : 'Pin'}">
            <span>${tab.pinned ? '🔔 Pinned' : '📌 Pin'}</span>
          </button>
        </div>
        <div class="card-action-group">
          <button class="btn-card-action btn-activate" title="Activate Tab">
            <span>Switch</span>
          </button>
          <button class="btn-card-action btn-close" title="Close Tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    const catStage = card.querySelector('.cat-card-stage');
    catStage.addEventListener('click', (e) => {
      if (e.target.closest('.cat-pinned-badge') || e.target.closest('.cat-status-pill')) return;
      audio.meow();
      showToast(`Purr! ${tab.title.slice(0, 24)} loves being petted ❤️`);
      const svgContainer = card.querySelector('.cat-stage-svg');
      svgContainer.innerHTML = createCatSvg({
        breed: tab.breed || 'mochi',
        isActive: true,
        isHappy: true,
        size: 'md'
      });
      setTimeout(() => {
        svgContainer.innerHTML = createCatSvg({
          breed: tab.breed || 'mochi',
          isActive: tab.active,
          isPinned: tab.pinned,
          isAudible: tab.audible,
          size: 'md'
        });
      }, 1500);
    });

    const activateBtn = card.querySelector('.btn-activate');
    const titleText = card.querySelector('.tab-title-text');
    [activateBtn, titleText].forEach(el => {
      el.addEventListener('click', () => {
        audio.purr();
        tabManager.activateTab(tab.id, tab.windowId);
      });
    });

    const pinBtn = card.querySelector('.btn-pin');
    pinBtn.addEventListener('click', async () => {
      audio.purr();
      const newPinned = await tabManager.togglePinTab(tab.id, tab.pinned);
      showToast(newPinned ? `Tab pinned with a golden bell!` : `Tab unpinned.`);
      await refreshTabs();
    });

    const moveBtn = card.querySelector('.btn-move');
    moveBtn.addEventListener('click', () => {
      openMoveRoomModal(tab);
    });

    const closeBtn = card.querySelector('.btn-close');
    closeBtn.addEventListener('click', async () => {
      audio.pop();
      card.classList.add('poof-out');
      showToast(`Tab tucked in for a good catnap.`);
      setTimeout(async () => {
        await tabManager.closeTab(tab.id);
        await refreshTabs();
      }, 200);
    });

    tabsGrid.appendChild(card);
  });
}

function getRoomName(roomId) {
  const r = rooms.find(rm => rm.id === roomId);
  return r ? r.name : 'All Cats';
}

function triggerRandomBlink() {
  const catCards = document.querySelectorAll('.cat-stage-svg');
  if (catCards.length === 0) return;
  const randIdx = Math.floor(Math.random() * catCards.length);
  const target = catCards[randIdx];
  const tabId = target.dataset.catId;
  const tab = allTabs.find(t => String(t.id) === String(tabId));
  if (tab) {
    target.innerHTML = createCatSvg({
      breed: tab.breed || 'mochi',
      isActive: tab.active,
      isPinned: tab.pinned,
      isAudible: tab.audible,
      isBlinking: true,
      size: 'md'
    });
    setTimeout(() => {
      target.innerHTML = createCatSvg({
        breed: tab.breed || 'mochi',
        isActive: tab.active,
        isPinned: tab.pinned,
        isAudible: tab.audible,
        isBlinking: false,
        size: 'md'
      });
    }, 180);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🐾</span><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

function openMoveRoomModal(tab) {
  selectedTabToMove = tab;
  moveRoomOptions.innerHTML = '';
  rooms.forEach(r => {
    const item = document.createElement('button');
    item.className = 'session-item';
    item.style.width = '100%';
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">${r.icon}</span>
        <span style="font-weight:700;">${escapeHtml(r.name)}</span>
      </div>
      <span>${tab.room === r.id ? '✓ Current' : 'Select'}</span>
    `;
    item.addEventListener('click', async () => {
      await tabManager.setTabRoom(selectedTabToMove.id, r.id);
      modalMoveRoom.classList.add('hidden');
      audio.purr();
      showToast(`Moved "${selectedTabToMove.title.slice(0, 20)}" to ${r.name}`);
      await refreshTabs();
    });
    moveRoomOptions.appendChild(item);
  });
  modalMoveRoom.classList.remove('hidden');
}

async function openCatCollectionModal() {
  const unlocked = await storage.getUnlockedCats();
  catCollectionGrid.innerHTML = '';

  Object.values(CAT_BREEDS).forEach(breed => {
    const isUnlocked = unlocked.includes(breed.id) || breed.unlocked;
    const isDefault = (settings.defaultBreed || 'mochi') === breed.id;

    const card = document.createElement('div');
    card.className = `breed-card ${isDefault ? 'active-selection' : ''}`;
    card.innerHTML = `
      <div style="width:100px;height:90px;display:flex;align-items:center;justify-content:center;">
        ${createCatSvg({ breed: breed.id, isActive: isUnlocked, isHappy: isDefault, size: 'md' })}
      </div>
      <div class="breed-name">${escapeHtml(breed.name)}</div>
      <div class="breed-desc">${escapeHtml(breed.desc)}</div>
      <div class="breed-status-tag ${isUnlocked ? '' : 'locked'}">
        ${isUnlocked ? (isDefault ? '★ Favorite Mascot' : '✓ Unlocked') : `🔒 ${breed.unlockCondition || 'Locked'}`}
      </div>
      ${isUnlocked && !isDefault ? `<button class="btn-card-action btn-set-default" style="margin-top:10px;">Set as Favorite</button>` : ''}
    `;

    if (isUnlocked && !isDefault) {
      card.querySelector('.btn-set-default').addEventListener('click', async () => {
        settings.defaultBreed = breed.id;
        await storage.saveSettings(settings);
        audio.purr();
        showToast(`Default cat mascot set to ${breed.name}!`);
        heroMascot.innerHTML = createCatSvg({ breed: breed.id, isActive: true, isHappy: true, size: 'lg' });
        openCatCollectionModal();
      });
    }

    catCollectionGrid.appendChild(card);
  });

  modalCatCollection.classList.remove('hidden');
}

async function openSessionsModal() {
  const sessions = await storage.getSessions();
  sessionsListContainer.innerHTML = '';

  if (sessions.length === 0) {
    sessionsListContainer.innerHTML = `
      <div style="text-align:center;padding:30px;color:var(--text-muted);">
        No saved sessions yet. Save your current tab collection to restore them anytime!
      </div>
    `;
  } else {
    sessions.forEach(sess => {
      const item = document.createElement('div');
      item.className = 'session-item';
      item.innerHTML = `
        <div>
          <div class="session-name">${escapeHtml(sess.name)}</div>
          <div class="session-meta">
            ${sess.tabsCount || sess.tabs?.length || 0} tabs · Saved ${new Date(sess.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div class="session-actions">
          <button class="btn-cozy-primary btn-restore-sess" style="padding:6px 12px;font-size:12px;">Restore</button>
          <button class="btn-card-action btn-delete-sess" style="padding:6px 8px;">Delete</button>
        </div>
      `;

      item.querySelector('.btn-restore-sess').addEventListener('click', async () => {
        audio.meow();
        showToast(`Restoring ${sess.tabs.length} tabs from "${sess.name}"...`);
        await tabManager.restoreSession(sess);
        modalSessions.classList.add('hidden');
        await refreshTabs();
      });

      item.querySelector('.btn-delete-sess').addEventListener('click', async () => {
        await storage.deleteSession(sess.id);
        showToast(`Deleted session "${sess.name}".`);
        openSessionsModal();
        updateStats();
      });

      sessionsListContainer.appendChild(item);
    });
  }

  modalSessions.classList.remove('hidden');
}

async function checkUnlockAchievements() {
  const sessions = await storage.getSessions();
  if (sessions.length > 0) {
    await storage.unlockCat('cocoa');
  }
  if (rooms.length >= 4) {
    await storage.unlockCat('wasabi');
  }
  if (allTabs.length >= 8) {
    await storage.unlockCat('luna');
  }
  const pinnedTabs = allTabs.filter(t => t.pinned);
  if (pinnedTabs.length >= 2) {
    await storage.unlockCat('blossom');
  }
}

function setupEventListeners() {
  themeToggle.addEventListener('click', async () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    settings.theme = newTheme;
    await storage.saveSettings(settings);
    applyTheme(newTheme);
    audio.purr();
  });

  soundToggle.addEventListener('click', async () => {
    soundMuted = !soundMuted;
    settings.soundEnabled = !soundMuted;
    await storage.saveSettings(settings);
    updateSoundUI();
    if (!soundMuted) audio.meow();
  });

  dashboardSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    btnClearSearch.classList.toggle('hidden', !searchQuery);
    renderTabs();
  });

  dashboardSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchQuery) {
      let dest = searchQuery;
      if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
        if (dest.includes('.') && !dest.includes(' ')) {
          dest = 'https://' + dest;
        } else {
          dest = `https://www.google.com/search?q=${encodeURIComponent(dest)}`;
        }
      }
      tabManager.createTab(dest, activeRoomId);
      dashboardSearch.value = '';
      searchQuery = '';
      btnClearSearch.classList.add('hidden');
    }
  });

  btnClearSearch.addEventListener('click', () => {
    dashboardSearch.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderTabs();
  });

  const handleAdopt = async () => {
    const url = prompt('Enter a URL or search term for the new cat tab:', 'https://google.com');
    if (url) {
      audio.meow();
      await tabManager.createTab(url, activeRoomId);
      showToast('Adopted a new cat tab!');
      await refreshTabs();
    }
  };
  btnAddTab.addEventListener('click', handleAdopt);
  btnEmptyAdopt.addEventListener('click', handleAdopt);

  const handleSaveSession = async () => {
    const name = prompt('Name this cozy cat collection:', 'Session ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    if (name) {
      await storage.saveSession(name, allTabs);
      audio.purr();
      showToast(`Purr-fect! Saved ${allTabs.length} tabs to "${name}".`);
      await checkUnlockAchievements();
      updateStats();
    }
  };
  btnSaveCurrentSession.addEventListener('click', handleSaveSession);
  btnSaveNewSessionModal.addEventListener('click', handleSaveSession);

  btnExportSessions.addEventListener('click', async () => {
    const sessions = await storage.getSessions();
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabkitty-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnCreateRoom.addEventListener('click', () => {
    modalCreateRoom.classList.remove('hidden');
    inputNewRoomName.focus();
  });

  let selectedEmoji = '🐾';
  document.querySelectorAll('.emoji-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEmoji = btn.dataset.emoji;
    });
  });

  let selectedColor = '#B99AFF';
  document.querySelectorAll('.color-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  btnSaveNewRoom.addEventListener('click', async () => {
    const name = inputNewRoomName.value.trim();
    if (!name) return;
    const newRoom = await storage.addRoom(name, selectedEmoji, selectedColor);
    rooms.push(newRoom);
    inputNewRoomName.value = '';
    modalCreateRoom.classList.add('hidden');
    activeRoomId = newRoom.id;
    audio.purr();
    showToast(`Created new room "${newRoom.name}"!`);
    await checkUnlockAchievements();
    renderRooms();
    renderTabs();
    updateStats();
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      document.getElementById(modalId)?.classList.add('hidden');
    });
  });

  btnCollectionModal.addEventListener('click', openCatCollectionModal);
  btnSessionsModal.addEventListener('click', openSessionsModal);

  btnOpenOptionsPage.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

document.addEventListener('DOMContentLoaded', init);
