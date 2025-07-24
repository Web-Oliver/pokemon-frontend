/**
 * Extension Detection Utilities
 * Detects common performance-impacting browser extensions
 * and provides adaptive behavior recommendations
 */

interface ExtensionDetectionResult {
  hasAdBlock: boolean;
  hasPasswordManager: boolean;
  hasRequestInterceptor: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * Detects if user has AdBlock-style extensions
 */
export const detectAdBlock = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a test element that AdBlock would typically hide
    const testElement = document.createElement('div');
    testElement.className = 'ads adsbox doubleclick ad-placement advertisement';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.height = '1px';
    testElement.innerHTML = '&nbsp;';

    document.body.appendChild(testElement);

    setTimeout(() => {
      const isBlocked =
        testElement.offsetHeight === 0 ||
        window.getComputedStyle(testElement).display === 'none';
      document.body.removeChild(testElement);
      resolve(isBlocked);
    }, 100);
  });
};

/**
 * Detects if network requests are being intercepted
 */
export const detectRequestInterception = (): boolean => {
  // Check for common request interceptor signatures
  return (
    // @ts-ignore - checking for extension globals
    (typeof window.chrome !== 'undefined' &&
      // @ts-ignore
      (window.chrome.webRequest || window.chrome.declarativeNetRequest)) ||
    // @ts-ignore - Requestly signature
    typeof window.RQ !== 'undefined' ||
    // @ts-ignore - Request Interceptor signature
    typeof window.requestInterceptor !== 'undefined'
  );
};

/**
 * Detects password manager extensions
 */
export const detectPasswordManager = (): boolean => {
  // Look for common password manager DOM modifications
  const pwManagerSelectors = [
    '[data-1p-ignore]', // 1Password
    '[data-bwignore]', // Bitwarden
    '[data-lpignore]', // LastPass
    '[data-dashlane-rid]', // Dashlane
  ];

  return pwManagerSelectors.some(
    (selector) => document.querySelector(selector) !== null
  );
};

/**
 * Main extension detection function
 */
export const detectExtensions = async (): Promise<ExtensionDetectionResult> => {
  const hasAdBlock = await detectAdBlock();
  const hasRequestInterceptor = detectRequestInterception();
  const hasPasswordManager = detectPasswordManager();

  let performanceImpact: 'low' | 'medium' | 'high' = 'low';
  const recommendations: string[] = [];

  if (hasAdBlock) {
    performanceImpact = 'high';
    recommendations.push(
      'AdBlock detected - DOM scanning may impact performance'
    );
  }

  if (hasRequestInterceptor) {
    performanceImpact = 'high';
    recommendations.push(
      'Request interceptor detected - network requests may be slower'
    );
  }

  if (hasPasswordManager) {
    if (performanceImpact === 'low') {
      performanceImpact = 'medium';
    }
    recommendations.push(
      'Password manager detected - form scanning may cause delays'
    );
  }

  return {
    hasAdBlock,
    hasPasswordManager,
    hasRequestInterceptor,
    performanceImpact,
    recommendations,
  };
};

/**
 * Get optimized settings based on detected extensions
 */
export const getExtensionOptimizedSettings = (
  detection: ExtensionDetectionResult
) => {
  return {
    // Reduce autoplay frequency if extensions detected
    autoplayDelay: detection.performanceImpact === 'high' ? 5000 : 3000,

    // Disable expensive animations if high impact extensions
    disableAnimations: detection.performanceImpact === 'high',

    // Use simpler rendering if AdBlock present
    useSimpleRendering: detection.hasAdBlock,

    // Batch DOM updates if request interceptors present
    batchDOMUpdates: detection.hasRequestInterceptor,

    // Disable autoplay if high performance impact
    disableAutoplay: detection.performanceImpact === 'high',
  };
};
