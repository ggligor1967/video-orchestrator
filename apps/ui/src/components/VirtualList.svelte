<script lang="ts">
  export let items: any[] = [];
  export let itemHeight: number = 100;

  let scrollTop = 0;
  let containerHeight = 0;

  $: visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  $: visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 5,
  );
  $: visibleItems = items.slice(visibleStart, visibleEnd);
  $: offsetY = visibleStart * itemHeight;
</script>

<div
  class="virtual-list-container"
  bind:clientHeight={containerHeight}
  on:scroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
>
  <div
    class="virtual-list-spacer"
    style="height: {items.length * itemHeight}px"
  >
    <div class="virtual-list-items" style="transform: translateY({offsetY}px)">
      {#each visibleItems as item, index (visibleStart + index)}
        <slot {item} index={visibleStart + index} />
      {/each}
    </div>
  </div>
</div>

<style>
  .virtual-list-container {
    overflow-y: auto;
    height: 100%;
    position: relative;
  }

  .virtual-list-spacer {
    position: relative;
  }

  .virtual-list-items {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
</style>
