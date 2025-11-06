<script>
  /**
   * InteractionHandler.svelte - Universal interaction handler
   * Supports touch, mouse, and keyboard with accessibility
   */
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let disabled = false;
  export let hapticFeedback = false;

  const dispatch = createEventDispatcher();

  let element;
  let isPressed = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let pressTimer = null;
  let rippleElement = null;

  // Touch/Mouse event handlers
  function handlePointerDown(event) {
    if (disabled) return;

    isPressed = true;
    startX = event.clientX || event.touches?.[0].clientX;
    startY = event.clientY || event.touches?.[0].clientY;

    // Haptic feedback on supported devices
    if (hapticFeedback && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    // Create ripple effect
    createRipple(event);

    // Long press detection (500ms)
    pressTimer = setTimeout(() => {
      if (isPressed && !isDragging) {
        dispatch("longPress", { originalEvent: event });
      }
    }, 500);

    dispatch("pressStart", { originalEvent: event });
  }

  function handlePointerMove(event) {
    if (!isPressed || disabled) return;

    const currentX = event.clientX || event.touches?.[0].clientX;
    const currentY = event.clientY || event.touches?.[0].clientY;
    const deltaX = Math.abs(currentX - startX);
    const deltaY = Math.abs(currentY - startY);

    // Detect dragging (threshold: 10px)
    if (deltaX > 10 || deltaY > 10) {
      isDragging = true;
      clearTimeout(pressTimer);
    }
  }

  function handlePointerUp(event) {
    if (disabled) return;

    clearTimeout(pressTimer);

    if (isPressed && !isDragging) {
      dispatch("tap", { originalEvent: event });
      dispatch("click", { originalEvent: event });
    }

    isPressed = false;
    isDragging = false;

    dispatch("pressEnd", { originalEvent: event });
  }

  function handlePointerCancel() {
    clearTimeout(pressTimer);
    isPressed = false;
    isDragging = false;
  }

  // Keyboard event handlers
  function handleKeyDown(event) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      isPressed = true;
      dispatch("pressStart", { originalEvent: event });
    }

    // Emit keyboard navigation events
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      dispatch("navigate", { direction: event.key, originalEvent: event });
    }
  }

  function handleKeyUp(event) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isPressed) {
        dispatch("tap", { originalEvent: event });
        dispatch("click", { originalEvent: event });
      }

      isPressed = false;
      dispatch("pressEnd", { originalEvent: event });
    }
  }

  // Ripple effect for visual feedback
  function createRipple(event) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX || event.touches?.[0].clientX) - rect.left;
    const y = (event.clientY || event.touches?.[0].clientY) - rect.top;

    if (rippleElement) {
      rippleElement.remove();
    }

    rippleElement = document.createElement("span");
    rippleElement.className = "ripple-effect";
    rippleElement.style.left = `${x}px`;
    rippleElement.style.top = `${y}px`;
    element.appendChild(rippleElement);

    setTimeout(() => {
      if (rippleElement) {
        rippleElement.remove();
        rippleElement = null;
      }
    }, 600);
  }

  // Context menu (right-click / long-press)
  function handleContextMenu(event) {
    if (disabled) return;
    dispatch("contextMenu", { originalEvent: event });
  }

  onMount(() => {
    if (!element) return;

    // Add passive event listeners for better scroll performance
    element.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    element.addEventListener("touchmove", handlePointerMove, { passive: true });
    element.addEventListener("touchend", handlePointerUp, { passive: true });
    element.addEventListener("touchcancel", handlePointerCancel, {
      passive: true,
    });
  });

  onDestroy(() => {
    clearTimeout(pressTimer);
    if (rippleElement) {
      rippleElement.remove();
    }
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  bind:this={element}
  role="presentation"
  class="interaction-handler {isPressed ? 'is-pressed' : ''} {disabled
    ? 'is-disabled'
    : ''}"
  class:is-dragging={isDragging}
  on:mousedown={handlePointerDown}
  on:mousemove={handlePointerMove}
  on:mouseup={handlePointerUp}
  on:mouseleave={handlePointerCancel}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  on:contextmenu={handleContextMenu}
>
  <slot />
</div>

<style>
  .interaction-handler {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 0.1s ease,
      opacity 0.1s ease;
  }

  .interaction-handler.is-pressed {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .interaction-handler.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .interaction-handler.is-dragging {
    cursor: grabbing;
  }

  /* Ripple effect */
  .interaction-handler :global(.ripple-effect) {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%) scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: translate(-50%, -50%) scale(4);
      opacity: 0;
    }
  }

  /* Focus visible for keyboard navigation */
  .interaction-handler:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Hover effect (only for devices with hover capability) */
  @media (hover: hover) {
    .interaction-handler:hover:not(.is-disabled) {
      opacity: 0.95;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .interaction-handler:focus-visible {
      outline-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .interaction-handler,
    .interaction-handler :global(.ripple-effect) {
      transition: none;
      animation: none;
    }
  }
</style>
