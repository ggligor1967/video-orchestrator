<script>
  import { onInteract } from "$lib/utils/interactions.js";

  export let clickable = true;
  export let ariaLabel = "";

  function handleInteract(node) {
    if (!clickable) return;
    return onInteract(node, (e) => {
      node.dispatchEvent(new CustomEvent("cardClick", { detail: e }));
    });
  }
</script>

<div
  class="card-interactive bg-white rounded-xl shadow-md p-6 transition-all duration-200"
  class:clickable
  use:handleInteract
  aria-label={ariaLabel}
  role={clickable ? "button" : "article"}
>
  <slot />
</div>

<style>
  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .clickable:active {
    transform: translateY(-2px);
  }

  .clickable:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
