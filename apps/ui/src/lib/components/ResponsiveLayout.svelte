<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  export let breakpoint = 768;

  const isMobile = writable(false);
  const isTablet = writable(false);
  const isDesktop = writable(true);

  function updateLayout() {
    const width = window.innerWidth;
    isMobile.set(width < 640);
    isTablet.set(width >= 640 && width < 1024);
    isDesktop.set(width >= 1024);
  }

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  });
</script>

<div
  class="responsive-layout"
  class:mobile={$isMobile}
  class:tablet={$isTablet}
  class:desktop={$isDesktop}
>
  <slot {isMobile} {isTablet} {isDesktop} />
</div>

<style>
  .responsive-layout {
    width: 100%;
    height: 100%;
  }

  .mobile {
    --spacing: 0.5rem;
    --font-size: 14px;
  }

  .tablet {
    --spacing: 1rem;
    --font-size: 16px;
  }

  .desktop {
    --spacing: 1.5rem;
    --font-size: 16px;
  }
</style>
