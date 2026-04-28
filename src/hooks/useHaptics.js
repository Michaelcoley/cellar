// Tiny haptic helper. Falls back silently when the API is unavailable.

export function useHaptics() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  function tap(strength = 'light') {
    if (!supported) return;
    const pattern =
      strength === 'heavy' ? [18] : strength === 'medium' ? [12] : strength === 'success' ? [10, 30, 10] : [6];
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }

  return { tap, supported };
}
