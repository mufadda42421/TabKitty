/**
 * TabKitty - Real Chrome Tabs & TabGroups Manager
 * Handles tab querying, activation, closing, pinning, grouping and event synchronization.
 */

import storage from './storage.js';

class TabManager {
  constructor() {
    this.isChrome = typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query;
    this.listeners = new Set();
    this.simulatedTabs = null;

    if (this.isChrome) {
      this.initChromeListeners();
    }
  }

  initChromeListeners() {
    try {
      chrome.tabs.onCreated.addListener((tab) => this.notify('created', tab));
      chrome.tabs.onRemoved.addListener((tabId, removeInfo) => this.notify('removed', { tabId, removeInfo }));
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.notify('updated', { tabId, changeInfo, tab }));
      chrome.tabs.onActivated.addListener((activeInfo) => this.notify('activated', activeInfo));
      
      if (chrome.tabGroups) {
        chrome.tabGroups.onCreated?.addListener((group) => this.notify('group_created', group));
        chrome.tabGroups.onUpdated?.addListener((group) => this.notify('group_updated', group));
        chrome.tabGroups.onRemoved?.addListener((group) => this.notify('group_removed', group));
      }
    } catch (err) {
      console.warn('TabKitty: Chrome tabs listener initialization notice:', err);
    }
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (e) {
        console.error('Error in TabKitty listener:', e);
      }
    }
  }

  async getAllTabs() {
    const assignments = await storage.getTabRoomAssignments();

    if (this.isChrome) {
      try {
        const tabs = await chrome.tabs.query({});
        return tabs.map(t => {
          let domain = '';
          try {
            if (t.url) {
              const u = new URL(t.url);
              domain = u.hostname.replace(/^www\./, '');
            }
          } catch {}

          const room = assignments[String(t.id)] || assignments[domain] || 'all';
          return {
            id: t.id,
            windowId: t.windowId,
            title: t.title || 'New Tab',
            url: t.url || 'chrome://newtab',
            domain: domain || 'browser',
            favIconUrl: t.favIconUrl || '',
            active: Boolean(t.active),
            pinned: Boolean(t.pinned),
            audible: Boolean(t.audible),
            groupId: t.groupId !== undefined ? t.groupId : -1,
            room: room,
            breed: this.pickBreedForDomain(domain, t.id)
          };
        });
      } catch (err) {
        console.warn('chrome.tabs.query failed or blocked by permissions:', err);
      }
    }

    if (!this.simulatedTabs) {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://google.com';
      let currentDomain = '';
      try {
        currentDomain = new URL(currentUrl).hostname.replace(/^www\./, '');
      } catch {}

      this.simulatedTabs = [
        {
          id: 1,
          windowId: 1,
          title: typeof document !== 'undefined' ? (document.title || 'TabKitty Workspace') : 'TabKitty Workspace',
          url: currentUrl,
          domain: currentDomain || 'tabkitty.local',
          favIconUrl: '/icons/icon16.svg',
          active: true,
          pinned: false,
          audible: false,
          groupId: -1,
          room: 'all',
          breed: 'mochi'
        }
      ];
    }

    return this.simulatedTabs.map(t => ({
      ...t,
      room: assignments[String(t.id)] || t.room || 'all'
    }));
  }

  pickBreedForDomain(domain, id) {
    const breeds = ['mochi', 'oreo', 'marmalade', 'storm', 'cocoa', 'wasabi', 'luna', 'blossom'];
    if (!domain) return breeds[Number(id || 0) % breeds.length];
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = (hash << 5) - hash + domain.charCodeAt(i);
      hash |= 0;
    }
    return breeds[Math.abs(hash) % breeds.length];
  }

  async activateTab(tabId, windowId) {
    if (this.isChrome) {
      try {
        await chrome.tabs.update(tabId, { active: true });
        if (windowId) {
          await chrome.windows.update(windowId, { focused: true });
        }
        return true;
      } catch (err) {
        console.error('Failed to activate tab:', err);
      }
    }

    if (this.simulatedTabs) {
      this.simulatedTabs = this.simulatedTabs.map(t => ({
        ...t,
        active: t.id === tabId
      }));
      this.notify('activated', { tabId });
      return true;
    }
    return false;
  }

  async closeTab(tabId) {
    if (this.isChrome) {
      try {
        await chrome.tabs.remove(tabId);
        return true;
      } catch (err) {
        console.error('Failed to close tab:', err);
      }
    }

    if (this.simulatedTabs) {
      this.simulatedTabs = this.simulatedTabs.filter(t => t.id !== tabId);
      this.notify('removed', { tabId });
      return true;
    }
    return false;
  }

  async togglePinTab(tabId, currentPinned) {
    const newPinned = !currentPinned;
    if (this.isChrome) {
      try {
        await chrome.tabs.update(tabId, { pinned: newPinned });
        return newPinned;
      } catch (err) {
        console.error('Failed to toggle pin:', err);
      }
    }

    if (this.simulatedTabs) {
      this.simulatedTabs = this.simulatedTabs.map(t =>
        t.id === tabId ? { ...t, pinned: newPinned } : t
      );
      this.notify('updated', { tabId, changeInfo: { pinned: newPinned } });
      return newPinned;
    }
    return newPinned;
  }

  async createTab(url = 'https://google.com', room = 'all') {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('chrome://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (this.isChrome) {
      try {
        const newTab = await chrome.tabs.create({ url: cleanUrl });
        if (room && room !== 'all') {
          await storage.assignTabToRoom(newTab.id, room);
        }
        return newTab;
      } catch (err) {
        console.error('Failed to create Chrome tab:', err);
      }
    }

    let domain = '';
    try {
      domain = new URL(cleanUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = cleanUrl;
    }

    const newId = Date.now();
    const newTabObj = {
      id: newId,
      windowId: 1,
      title: domain || 'New Tab',
      url: cleanUrl,
      domain: domain || 'web',
      favIconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      active: true,
      pinned: false,
      audible: false,
      groupId: -1,
      room: room || 'all',
      breed: this.pickBreedForDomain(domain, newId)
    };

    if (this.simulatedTabs) {
      this.simulatedTabs = this.simulatedTabs.map(t => ({ ...t, active: false }));
      this.simulatedTabs.push(newTabObj);
    } else {
      this.simulatedTabs = [newTabObj];
    }

    await storage.assignTabToRoom(newId, room || 'all');
    this.notify('created', newTabObj);

    try {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch {}

    return newTabObj;
  }

  async setTabRoom(tabId, roomId) {
    await storage.assignTabToRoom(tabId, roomId);

    if (this.simulatedTabs) {
      this.simulatedTabs = this.simulatedTabs.map(t =>
        t.id === tabId ? { ...t, room: roomId } : t
      );
    }

    if (this.isChrome && chrome.tabGroups && roomId !== 'all') {
      try {
        const rooms = await storage.getRooms();
        const roomObj = rooms.find(r => r.id === roomId);
        if (roomObj) {
          const groupId = await chrome.tabs.group({ tabIds: [tabId] });
          const colorMap = {
            '#B99AFF': 'purple',
            '#74C0FC': 'blue',
            '#C8F2DF': 'green',
            '#FFD6E7': 'pink',
            '#FFC078': 'orange',
            '#FF8787': 'red'
          };
          const chromeColor = colorMap[roomObj.color] || 'purple';
          await chrome.tabGroups.update(groupId, {
            title: roomObj.name,
            color: chromeColor
          });
        }
      } catch (err) {
        console.warn('Tab group connection info:', err);
      }
    }

    this.notify('updated', { tabId, changeInfo: { room: roomId } });
  }

  async restoreSession(session) {
    if (!session || !session.tabs || !Array.isArray(session.tabs)) return;

    for (const t of session.tabs) {
      await this.createTab(t.url, t.room || 'all');
    }
  }
}

const tabManager = new TabManager();

if (typeof window !== 'undefined') {
  window.TabKittyTabs = tabManager;
}

export default tabManager;
export { TabManager };
