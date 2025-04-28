/**
 * Browser detection utility
 * This utility provides functions to detect the device type (iOS, mobile, or PC)
 * and whether the application is running as a Progressive Web App (PWA).
 */
export function useUserAgent(): {
  getDeviceType: () => 'ios' | 'mobile' | 'PC';
  isPwa: () => boolean;
} {
  // Cache the user agent string to avoid repeated access
  const userAgent = navigator.userAgent;

  // Use constants for regex patterns to improve readability and reuse
  const IOS_PATTERN = /iPhone|iPod|iPad/i;
  const MOBILE_PATTERN = /Android|webOS|iPhone|iPod|iPad/i;
  const MAC_PATTERN = /Macintosh/i;

  const detectMobile = (): { isMobile: boolean; isIOS: boolean } => {
    let isIOS = IOS_PATTERN.test(userAgent);
    let isMobile = MOBILE_PATTERN.test(userAgent);

    // Check for iPad Pro with iOS 13+ (which reports as Mac)
    if (!isMobile) {
      const isMac = MAC_PATTERN.test(userAgent);
      if (isMac && navigator.maxTouchPoints > 2) {
        isMobile = true;
        isIOS = true;
      }
    }

    return { isMobile, isIOS };
  };

  // Cache the mobile detection result to avoid recalculating
  const deviceInfo = detectMobile();

  const getDeviceType = (): 'ios' | 'mobile' | 'PC' => {
    if (deviceInfo.isMobile) {
      return deviceInfo.isIOS ? 'ios' : 'mobile';
    }
    return 'PC';
  };

  const isPwa = (): boolean => {
    const displayModes = ['fullscreen', 'standalone', 'minimal-ui'];
    return displayModes.some(
      displayMode => window.matchMedia(`(display-mode: ${displayMode})`).matches
    );
  };

  return { getDeviceType, isPwa };
}
