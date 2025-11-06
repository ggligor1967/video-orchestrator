/**
 * Universal Interaction Utilities
 * Handles touch, mouse, and keyboard events
 */

/**
 * Detect input method
 */
export function detectInputMethod() {
  // Safe guards for Node.js test environment (SSR/testing)
  const isBrowser = !!(
    globalThis.window &&
    globalThis.navigator &&
    globalThis.matchMedia
  );
  if (!isBrowser) {
    return { hasTouch: false, hasMouse: true, hasKeyboard: true };
  }

  const hasTouch =
    "ontouchstart" in globalThis.window ||
    globalThis.navigator.maxTouchPoints > 0;
  const hasMouse = globalThis.matchMedia("(pointer: fine)").matches;
  const hasKeyboard = !globalThis.matchMedia("(pointer: coarse)").matches;

  return { hasTouch, hasMouse, hasKeyboard };
}

/**
 * Universal click handler (touch + mouse + keyboard)
 */
export function onInteract(node, callback) {
  const handleClick = (e) => callback(e);
  const handleKeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback(e);
    }
  };

  node.addEventListener("click", handleClick);
  node.addEventListener("keydown", handleKeydown);
  node.setAttribute("tabindex", "0");
  node.setAttribute("role", "button");

  return {
    destroy() {
      node.removeEventListener("click", handleClick);
      node.removeEventListener("keydown", handleKeydown);
    },
  };
}

/**
 * Swipe gesture detector
 */
export function onSwipe(node, { onSwipeLeft, onSwipeRight, threshold = 50 }) {
  let startX = 0;
  let startY = 0;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) onSwipeRight();
      if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
    }
  };

  node.addEventListener("touchstart", handleTouchStart);
  node.addEventListener("touchend", handleTouchEnd);

  return {
    destroy() {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchend", handleTouchEnd);
    },
  };
}

/**
 * Long press detector
 */
export function onLongPress(node, callback, duration = 500) {
  let timer;

  const start = () => {
    timer = setTimeout(() => callback(), duration);
  };

  const cancel = () => {
    clearTimeout(timer);
  };

  node.addEventListener("mousedown", start);
  node.addEventListener("touchstart", start);
  node.addEventListener("mouseup", cancel);
  node.addEventListener("mouseleave", cancel);
  node.addEventListener("touchend", cancel);

  return {
    destroy() {
      cancel();
      node.removeEventListener("mousedown", start);
      node.removeEventListener("touchstart", start);
      node.removeEventListener("mouseup", cancel);
      node.removeEventListener("mouseleave", cancel);
      node.removeEventListener("touchend", cancel);
    },
  };
}

/**
 * Focus trap for modals
 */
export function trapFocus(node) {
  const focusableElements = node.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeydown = (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === "Escape") {
      node.dispatchEvent(new CustomEvent("escape"));
    }
  };

  node.addEventListener("keydown", handleKeydown);
  firstElement?.focus();

  return {
    destroy() {
      node.removeEventListener("keydown", handleKeydown);
    },
  };
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}
