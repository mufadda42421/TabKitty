/**
 * TabKitty - Background Service Worker (Manifest V3)
 * Tracks active tabs, updates toolbar badge, and synchronizes cat counts.
 */

// Update action badge with active cat count
async function updateTabBadge() {
  try {
    const tabs = await chrome.tabs.query({});
    const count = tabs.length;
    await chrome.action.setBadgeText({
      text: count > 0 ? String(count) : ''
    });
    await chrome.action.setBadgeBackgroundColor({
      color: '#B99AFF' // TabKitty Lavender
    });
  } catch (err) {
    // Non-fatal badge update
  }
}

// On Extension Installed / Updated
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize default storage values
    try {
      await chrome.storage.local.set({
        settings: {
          theme: 'light',
          soundEnabled: true,
          soundVolume: 0.6,
          animationsEnabled: true,
          defaultBreed: 'mochi',
          compactView: false,
          syncWithChromeGroups: true
        },
        rooms: [
          { id: 'all', name: 'All Cats', icon: '🐱', color: '#B99AFF', isDefault: true },
          { id: 'work', name: 'Work', icon: '💼', color: '#74C0FC', isDefault: false },
          { id: 'study', name: 'Study', icon: '📚', color: '#C8F2DF', isDefault: false },
          { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#FFD6E7', isDefault: false }
        ],
        unlocked_cats: ['mochi', 'oreo', 'marmalade', 'storm'],
        sessions: []
      });
    } catch (err) {
      console.warn('Initial storage setup:', err);
    }
  }
  updateTabBadge();
});

// Chrome tab lifecycle listeners to keep count updated
chrome.tabs.onCreated.addListener(() => updateTabBadge());
chrome.tabs.onRemoved.addListener(() => updateTabBadge());
chrome.tabs.onAttached.addListener(() => updateTabBadge());
chrome.tabs.onDetached.addListener(() => updateTabBadge());

// Message routing between popup/dashboard and service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TAB_COUNT') {
    chrome.tabs.query({}).then(tabs => {
      sendResponse({ count: tabs.length });
    });
    return true; // Asynchronous response
  }
});

// Initial badge update
updateTabBadge();
