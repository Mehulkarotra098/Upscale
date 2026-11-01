// Editor state: the current design, undo history and autosave. Designs stay in this browser, nothing goes to a server.
import { validateDesign } from '../core/schema.js';

const DB = 'us-card-maker';
const KEY = 'current';
const HISTORY = 60;

function deepCopy(v) {
  // Strings stay shared, so undo history doesn't hold a separate copy of every logo.
  if (Array.isArray(v)) return v.map(deepCopy);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = deepCopy(v[k]);
    return o;
  }
  return v;
}

const listeners = new Set();
export const state = {
  doc: null,
  side: 'front',
  selection: [],
  past: [],
  future: [],
  warnings: [],
  saved: true,
  sheet: 'details',
  sheetOpen: false,
  uiLang: 'en',
};

try {
  const l = localStorage.getItem('us-card-ui-lang');
  if (l === 'en' || l === 'hl') state.uiLang = l;
} catch (e) {
  state.uiLang = 'en';
}

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const emit = () => listeners.forEach((fn) => fn());
export function setUi(patch) {
  Object.assign(state, patch);
  emit();
}

let saveTimer = 0;
function scheduleSave() {
  state.saved = false;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDoc(state.doc).then(
      () => {
        state.saved = true;
        emit();
      },
      () => {
        state.saved = false;
        emit();
      },
    );
  }, 500);
}

/** Change the design. Each call is one undo step. */
export function commit(mutate) {
  const next = deepCopy(state.doc);
  mutate(next);
  state.past.push(state.doc);
  if (state.past.length > HISTORY) state.past.shift();
  state.future = [];
  state.doc = next;
  scheduleSave();
  emit();
}

/** Change the design without a new undo step, for typing in the same field. */
let lastTypingKey = '';
export function commitTyping(key, mutate) {
  if (key !== lastTypingKey) {
    lastTypingKey = key;
    commit(mutate);
    return;
  }
  const next = deepCopy(state.doc);
  mutate(next);
  state.doc = next;
  scheduleSave();
  emit();
}
/** True while someone is typing in the Details boxes. */
export const typingDetails = () => lastTypingKey.startsWith('field:');
export const endTyping = () => {
  lastTypingKey = '';
};

export function replaceDoc(doc, { keepHistory = true } = {}) {
  if (keepHistory && state.doc) state.past.push(state.doc);
  state.future = keepHistory ? [] : state.future;
  state.doc = doc;
  state.selection = [];
  scheduleSave();
  emit();
}

export function undo() {
  if (!state.past.length) return;
  state.future.push(state.doc);
  state.doc = state.past.pop();
  state.selection = [];
  endTyping();
  scheduleSave();
  emit();
}

export function redo() {
  if (!state.future.length) return;
  state.past.push(state.doc);
  state.doc = state.future.pop();
  state.selection = [];
  endTyping();
  scheduleSave();
  emit();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('designs');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

/** Whole design goes in IndexedDB, because logos are too big for localStorage. */
export async function saveDoc(doc) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('designs', 'readwrite');
    tx.objectStore('designs').put(JSON.stringify(doc), KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadSaved() {
  try {
    const db = await openDb();
    const text = await new Promise((resolve, reject) => {
      const r = db.transaction('designs').objectStore('designs').get(KEY);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    db.close();
    return text ? validateDesign(JSON.parse(text)) : null;
  } catch (e) {
    return null; // private window, blocked storage or an old file: start fresh
  }
}

export const newId = (type) => `${type.slice(0, 3)}${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
export const activeElements = () => state.doc.sides[state.side].elements.filter((e) => state.selection.includes(e.id));
