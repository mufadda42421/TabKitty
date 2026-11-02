/**
 * TabKitty Extension Packager
 * Bundles all real Chrome Extension Manifest V3 files into a downloadable ZIP.
 */

import JSZip from 'jszip';

export async function downloadExtensionZip() {
  const zip = new JSZip();

  const filePaths = [
    '/manifest.json',
    '/background.js',
    '/popup.html',
    '/popup.css',
    '/popup.js',
    '/dashboard.html',
    '/dashboard.css',
    '/dashboard.js',
    '/options.html',
    '/options.js',
    '/tabs.js',
    '/storage.js',
    '/cats.js',
    '/icons/icon16.svg',
    '/icons/icon48.svg',
    '/icons/icon128.svg',
  ];

  for (const path of filePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const content = await res.text();
        const zipPath = path.startsWith('/') ? path.slice(1) : path;
        zip.file(zipPath, content);
      }
    } catch (e) {
      console.warn(`Could not bundle ${path}:`, e);
    }
  }

  // Include Quick Start Readme
  zip.file('README.txt', `TabKitty - Chrome Extension Manifest V3
"Every tab deserves a little catnap."

QUICK INSTALLATION IN CHROME:
1. Extract / Unzip this folder to your computer.
2. Open Google Chrome and go to: chrome://extensions
3. Enable "Developer mode" using the toggle in the top-right corner.
4. Click the "Load unpacked" button in the top-left corner.
5. Select the extracted folder containing manifest.json.
6. Meow! TabKitty is now active in your Chrome browser! Click the extension icon in your toolbar or open a New Tab to meet your companion cats.
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TabKitty-Extension-v1.0.0.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
