<script>
  import Tabs from './components/tabs/Tabs.svelte';
  import { writable } from 'svelte/store';
  
  // Application state store
  export const appState = writable({
    currentTab: 'home',
  });

  // Main App component
  const App = () => {
    return (
      <main>
        <h1>Video Orchestrator</h1>
        <Tabs />
      </main>
    );
  };

  export default App;
</script>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 20px;
  }

  h1 {
    color: #333;
  }
</style>