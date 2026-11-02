/**
 * TabKitty - Persistent Storage Layer
 * Uses chrome.storage.local when available with localStorage fallback.
 */

const DEFAULT_SETTINGS = {
  theme: 'light',
  soundEnabled: true,
  soundVolume: 0.6,
  animationsEnabled: true,
  defaultBreed: 'mochi',
  compactView: false,
  syncWithChromeGroups: true,
};

const DEFAULT_ROOMS = [
  { id: 'all', name: 'All Cats', icon: '🐱', color: '#B99AFF', isDefault: true },
  { id: 'work', name: 'Work', icon: '💼', color: '#74C0FC', isDefault: false },
  { id: 'study', name: 'Study', icon: '📚', color: '#C8F2DF', isDefault: false },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#FFD6E7', isDefault: false },
];

class StorageManager {
  constructor() {
    this.isChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  async get(key, defaultValue) {
    if (this.isChromeStorage) {
      try {
        const result = await chrome.storage.local.get([key]);
        return result[key] !== undefined ? result[key] : defaultValue;
      } catch (err) {
        console.warn('Chrome storage read error, falling back to localStorage:', err);
      }
    }
    try {
      const item = localStorage.getItem(`tabkitty_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set(key, value) {
    if (this.isChromeStorage) {
      try {
        await chrome.storage.local.set({ [key]: value });
      } catch (err) {
        console.warn('Chrome storage write error, falling back to localStorage:', err);
      }
    }
    try {
      localStorage.setItem(`tabkitty_${key}`, JSON.stringify(value));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  async getSettings() {
    const saved = await this.get('settings', {});
    return { ...DEFAULT_SETTINGS, ...saved };
  }

  async saveSettings(settings) {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await this.set('settings', updated);
    return updated;
  }

  async getRooms() {
    const rooms = await this.get('rooms', null);
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      await this.set('rooms', DEFAULT_ROOMS);
      return DEFAULT_ROOMS;
    }
    return rooms;
  }

  async saveRooms(rooms) {
    await this.set('rooms', rooms);
    return rooms;
  }

  async addRoom(name, icon = '🐾', color = '#B99AFF') {
    const rooms = await this.getRooms();
    const newRoom = {
      id: 'room_' + Date.now().toString(36),
      name: name.trim(),
      icon,
      color,
      isDefault: false
    };
    rooms.push(newRoom);
    await this.saveRooms(rooms);
    return newRoom;
  }

  async deleteRoom(roomId) {
    if (roomId === 'all') return false;
    let rooms = await this.getRooms();
    rooms = rooms.filter(r => r.id !== roomId);
    await this.saveRooms(rooms);
    return true;
  }

  async renameRoom(roomId, newName, newColor, newIcon) {
    const rooms = await this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room && !room.isDefault) {
      if (newName) room.name = newName.trim();
      if (newColor) room.color = newColor;
      if (newIcon) room.icon = newIcon;
      await this.saveRooms(rooms);
      return room;
    }
    return null;
  }

  async getTabRoomAssignments() {
    return await this.get('tab_rooms', {});
  }

  async assignTabToRoom(tabIdOrUrl, roomId) {
    const assignments = await this.getTabRoomAssignments();
    assignments[String(tabIdOrUrl)] = roomId;
    await this.set('tab_rooms', assignments);
    return assignments;
  }

  async getSessions() {
    return await this.get('sessions', []);
  }

  async saveSession(name, tabs) {
    const sessions = await this.getSessions();
    const cleanTabs = (tabs || []).map(t => ({
      title: t.title || 'Untitled Tab',
      url: t.url || 'about:blank',
      favIconUrl: t.favIconUrl || '',
      pinned: Boolean(t.pinned),
      room: t.room || 'all',
      breed: t.breed || 'mochi'
    }));

    const newSession = {
      id: 'session_' + Date.now().toString(36),
      name: (name || 'Cozy Session ' + new Date().toLocaleDateString()).trim(),
      createdAt: new Date().toISOString(),
      tabsCount: cleanTabs.length,
      tabs: cleanTabs
    };

    sessions.unshift(newSession);
    await this.set('sessions', sessions);
    return newSession;
  }

  async deleteSession(sessionId) {
    let sessions = await this.getSessions();
    sessions = sessions.filter(s => s.id !== sessionId);
    await this.set('sessions', sessions);
    return sessions;
  }

  async getUnlockedCats() {
    return await this.get('unlocked_cats', ['mochi', 'oreo', 'marmalade', 'storm']);
  }

  async unlockCat(breedId) {
    const unlocked = await this.getUnlockedCats();
    if (!unlocked.includes(breedId)) {
      unlocked.push(breedId);
      await this.set('unlocked_cats', unlocked);
    }
    return unlocked;
  }
}

const storageInstance = new StorageManager();

if (typeof window !== 'undefined') {
  window.TabKittyStorage = storageInstance;
}

export default storageInstance;
export { StorageManager, DEFAULT_SETTINGS, DEFAULT_ROOMS };
