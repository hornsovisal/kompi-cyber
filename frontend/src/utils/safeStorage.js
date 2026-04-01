/**
 * Safely access localStorage without throwing errors in private browsing mode
 * or when storage is disabled
 */
export function safeGetLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (e) {
    // localStorage might be blocked in private mode or restricted contexts
    console.warn(`Failed to access localStorage key "${key}":`, e.message);
    return defaultValue;
  }
}

export function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // localStorage might be blocked in private mode or restricted contexts
    console.warn(`Failed to set localStorage key "${key}":`, e.message);
    return false;
  }
}

export function safeRemoveLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Failed to remove localStorage key "${key}":`, e.message);
    return false;
  }
}
