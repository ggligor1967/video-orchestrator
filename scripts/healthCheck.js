import { HealthService } from '../apps/orchestrator/src/services/healthService.js';

const logger = {
  info: (msg, data) => console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
  error: (msg, data) => console.error(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
  warn: (msg, data) => console.warn(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : '')
};

async function runHealthCheck() {
  console.log('🔍 Running Video Orchestrator Health Check...\n');
  
  const healthService = new HealthService({ logger });
  const health = await healthService.getHealthStatus();
  
  // Display status
  const statusIcon = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  }[health.status];
  
  console.log(`${statusIcon} Overall Status: ${health.status.toUpperCase()}\n`);
  
  // Display tools
  console.log('🛠️  External Tools:');
  for (const [name, tool] of Object.entries(health.tools.tools)) {
    const icon = tool.available ? '✅' : '❌';
    console.log(`  ${icon} ${name.padEnd(8)} ${tool.available ? tool.path : tool.error}`);
  }
  
  // Display models
  console.log('\n🎭 Voice Models:');
  if (health.tools.models.piperVoices.length > 0) {
    health.tools.models.piperVoices.forEach(voice => {
      console.log(`  ✅ ${voice}`);
    });
  } else {
    console.log('  ❌ No Piper voice models found');
  }
  
  console.log('\n🎤 Whisper Models:');
  if (health.tools.models.whisperModels.length > 0) {
    health.tools.models.whisperModels.forEach(model => {
      console.log(`  ✅ ${model}`);
    });
  } else {
    console.log('  ❌ No Whisper models found');
  }
  
  // Display system info
  console.log('\n💻 System Information:');
  console.log(`  Platform: ${health.system.platform} (${health.system.architecture})`);
  console.log(`  Node.js: ${health.system.nodeVersion}`);
  console.log(`  Memory: ${health.system.memory.heapUsed} / ${health.system.memory.heapTotal}`);
  console.log(`  Uptime: ${health.system.uptime}`);
  
  // Display recommendations
  if (health.recommendations && health.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    health.recommendations.forEach(rec => {
      const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${rec.message}`);
      console.log(`     ${rec.action}\n`);
    });
  }
  
  // Summary
  console.log(`📊 Summary: ${health.tools.summary.availableTools}/${health.tools.summary.totalTools} tools available, ${health.tools.summary.availableModels}/${health.tools.summary.totalModels} model types available`);
  
  if (health.status === 'healthy') {
    console.log('\n🎉 All systems ready! Video Orchestrator can run at full capacity.');
  } else if (health.status === 'degraded') {
    console.log('\n⚠️  Some features may be limited. Install missing tools for full functionality.');
  } else {
    console.log('\n❌ Critical tools missing. Video Orchestrator cannot function properly.');
    process.exit(1);
  }
}

runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});