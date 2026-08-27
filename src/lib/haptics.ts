export type HapticType = 
  | 'light' | 'medium' | 'heavy' | 'success' | 'warning'
  | 'impactLight' | 'selection' | 'notificationSuccess' | 'notificationError';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light':
      case 'impactLight':
      case 'selection':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
      case 'notificationSuccess':
        navigator.vibrate([15, 35, 20]);
        break;
      case 'warning':
      case 'notificationError':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  } catch {
    // ignore vibration errors on unsupported or policy-restricted devices
  }
}
