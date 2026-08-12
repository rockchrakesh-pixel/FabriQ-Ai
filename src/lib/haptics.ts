export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([15, 35, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  } catch {
    // ignore vibration errors on unsupported or policy-restricted devices
  }
}
