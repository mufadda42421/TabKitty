/**
 * TabKitty - Popup Script
 * Handles real-time tab rendering, filtering, room selection and interactions.
 */

import tabManager from './tabs.js';
import storage from './storage.js';
import { createCatSvg, CAT_BREEDS } from './cats.js';

let allTabs = [];
let rooms = [];
let activeRoomId = 'all';
let searchQuery = '';
let settings = {};

// DOM Elements
const catCountBadge = document.getElementById('cat-count-badge');
const tabsContainer = document.getElementById('tabs-container');
const roomsContainer = document.getElementById('rooms-container');
const emptyState = document.getElementById('empty-state');
const emptyCatSvg = document.getElementById('empty-cat-svg');
const searchInput = document.getElementById('popup-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnOpenDashboard = document.getElementById('btn-open-dashboard');
const btnOpenOptions = document.getElementById('btn-open-options');
const btnQuickNewtab = document.getElementById('btn-quick-newtab');
const btnSaveSession = document.getElementById('btn-save-session-quick');
const btnEmptyNewtab = document.getElementById('btn-empty-newtab');

async function init() {
  settings = await storage.getSettings();
  applyTheme(settings.theme);

  emptyCatSvg.innerHTML = createCatSvg({ breed: 'mochi', isActive: false, size: 'md' });

  rooms = await storage.getRooms();
  renderRooms();

  await refreshTabs();

  tabManager.on((event, data) => {
    refreshTabs();
  });

  setupEventListeners();
}

function applyTheme(theme) {
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
}

async function refreshTabs() {
  allTabs = await tabManager.getAllTabs();
  updateBadge();
  renderTabs();
}

function updateBadge() {
  const awakeCount = allTabs.filter(t => t.active).length;
  catCountBadge.textContent = `${allTabs.length} cats (${awakeCount} awake)`;
}

function renderRooms() {
  roomsContainer.innerHTML = '';
  for (const r of rooms) {
    const chip = document.createElement('button');
    chip.className = `room-chip ${r.id === activeRoomId ? 'active' : ''}`;
    chip.innerHTML = `<span>${r.icon}</span> <span>${escapeHtml(r.name)}</span>`;
    chip.addEventListener('click', () => {
      activeRoomId = r.id;
      renderRooms();
      renderTabs();
    });
    roomsContainer.appendChild(chip);
  }
}

function renderTabs() {
  tabsContainer.innerHTML = '';

  const filtered = allTabs.filter(t => {
    if (activeRoomId !== 'all' && t.room !== activeRoomId) {
      return false;
    }
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
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(tab => {
    const card = document.createElement('div');
    card.className = `cat-tab-card ${tab.active ? 'active-tab' : ''}`;
    card.dataset.tabId = tab.id;

    const catSvgMarkup = createCatSvg({
      breed: tab.breed || 'mochi',
      isActive: tab.active,
      isPinned: tab.pinned,
      isAudible: tab.audible,
      size: 'sm'
    });

    const faviconUrl = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${tab.domain}&sz=32`;

    card.innerHTML = `
      <div class="cat-avatar-wrap" title="${tab.active ? 'Awake and purring' : 'Taking a catnap'}">
        ${catSvgMarkup}
      </div>
      <div class="tab-info">
        <div class="tab-header-row">
          <img class="tab-favicon" src="${faviconUrl}" onerror="this.style.display='none'" alt="" />
          <span class="tab-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</span>
        </div>
        <div class="tab-sub-row">
          <span class="tab-domain">${escapeHtml(tab.domain)}</span>
          <span class="tab-status-dot ${tab.active ? '' : 'sleeping'}" title="${tab.active ? 'Active' : 'Sleeping'}"></span>
          <span>${tab.active ? 'Awake' : 'Napping'}</span>
        </div>
      </div>
      <div class="tab-actions">
        <button class="action-btn pin-btn ${tab.pinned ? 'pinned' : ''}" title="${tab.pinned ? 'Unpin cat' : 'Pin cat'}" aria-label="Pin tab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="${tab.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="17" x2="12" y2="22"/>
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
          </svg>
        </button>
        <button class="action-btn close-btn" title="Close catnap tab" aria-label="Close tab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.action-btn')) return;
      tabManager.activateTab(tab.id, tab.windowId);
    });

    const pinBtn = card.querySelector('.pin-btn');
    pinBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await tabManager.togglePinTab(tab.id, tab.pinned);
      await refreshTabs();
    });

    const closeBtn = card.querySelector('.close-btn');
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      card.classList.add('poof-out');
      setTimeout(async () => {
        await tabManager.closeTab(tab.id);
        await refreshTabs();
      }, 180);
    });

    tabsContainer.appendChild(card);
  });
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    btnClearSearch.classList.toggle('hidden', !searchQuery);
    renderTabs();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderTabs();
  });

  btnOpenDashboard.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'dashboard.html' });
    } else {
      window.open('dashboard.html', '_blank');
    }
  });

  btnOpenOptions.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  });

  btnQuickNewtab.addEventListener('click', async () => {
    await tabManager.createTab('https://google.com', activeRoomId);
    await refreshTabs();
  });

  btnEmptyNewtab.addEventListener('click', async () => {
    await tabManager.createTab('https://google.com', activeRoomId);
    await refreshTabs();
  });

  btnSaveSession.addEventListener('click', async () => {
    const sessionName = prompt('Name this cozy cat collection:', 'Tab Collection ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    if (sessionName) {
      await storage.saveSession(sessionName, allTabs);
      alert(`Purr-fect! Saved ${allTabs.length} cats to session "${sessionName}"!`);
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
