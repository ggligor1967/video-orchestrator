<script>
  import { onInteract } from "$lib/utils/interactions.js";

  export let variant = "primary";
  export let size = "md";
  export let disabled = false;
  export let loading = false;
  export let ariaLabel = "";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
</script>

<button
  class="interactive tap-target btn {variants[variant]} {sizes[
    size
  ]} rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  class:loading
  {disabled}
  aria-label={ariaLabel}
  on:click
>
  {#if loading}
    <span class="inline-block animate-spin mr-2">⏳</span>
  {/if}
  <slot />
</button>

<style>
  .loading {
    pointer-events: none;
  }
</style>
