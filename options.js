/**
 * TabKitty - Options Page Controller
 */

import storage from './storage.js';

const settingTheme = document.getElementById('setting-theme');
const settingSound = document.getElementById('setting-sound');
const settingAnimations = document.getElementById('setting-animations');
const settingTabGroups = document.getElementById('setting-tab-groups');
const settingDefaultCat = document.getElementById('setting-default-cat');
const btnBackDashboard = document.getElementById('btn-back-dashboard');
const saveStatus = document.getElementById('save-status');

async function init() {
  const settings = await storage.getSettings();

  settingTheme.value = settings.theme || 'light';
  settingSound.checked = Boolean(settings.soundEnabled);
  settingAnimations.checked = Boolean(settings.animationsEnabled);
  settingTabGroups.checked = Boolean(settings.syncWithChromeGroups);
  settingDefaultCat.value = settings.defaultBreed || 'mochi';

  applyTheme(settings.theme);

  // Event Listeners
  [settingTheme, settingDefaultCat].forEach(el => {
    el.addEventListener('change', saveAllSettings);
  });

  [settingSound, settingAnimations, settingTabGroups].forEach(el => {
    el.addEventListener('change', saveAllSettings);
  });

  btnBackDashboard.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'dashboard.html' });
    } else {
      window.location.href = 'dashboard.html';
    }
  });
}

async function saveAllSettings() {
  const updated = {
    theme: settingTheme.value,
    soundEnabled: settingSound.checked,
    animationsEnabled: settingAnimations.checked,
    syncWithChromeGroups: settingTabGroups.checked,
    defaultBreed: settingDefaultCat.value,
  };

  await storage.saveSettings(updated);
  applyTheme(updated.theme);

  saveStatus.style.display = 'inline';
  setTimeout(() => {
    saveStatus.style.display = 'none';
  }, 2000);
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

document.addEventListener('DOMContentLoaded', init);
