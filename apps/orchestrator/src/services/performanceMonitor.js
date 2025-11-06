import os from 'node:os';
import process from 'node:process';
import { EventEmitter } from 'node:events';

const METRICS_WINDOW = 60 * 1000; // 1 minute rolling window
const MAX_METRICS_PER_TYPE = 100; // Limit metrics array size
const ALERT_THRESHOLDS = {
  cpu: 80, // %
  memory: 85, // %
  queueDepth: 100,
  errorRate: 5 // %
};

export class PerformanceMonitor extends EventEmitter {
  constructor({ logger, options = {} }) {
    super();
    
    this.logger = logger;
    this.enabled = options.enabled !== false;
    this.alertThresholds = { ...ALERT_THRESHOLDS, ...options.thresholds };
    this.metricsWindow = options.metricsWindow || METRICS_WINDOW;
    
    // Enhanced metrics storage with timestamps
    this.metrics = {
      requests: [],
      errors: [],
      latencies: [],
      throughput: []
    };
    
    // System metrics
    this.systemMetrics = {
      cpu: [],
      memory: [],
      uptime: process.uptime()
    };
    
    // Active alerts
    this.activeAlerts = new Set();
    
    this.startTime = Date.now();
    
    // Start monitoring if enabled
    if (this.enabled) {
      this.startMonitoring();
    }
  }

  trackRequest(duration, success = true, endpoint = 'unknown') {
    const now = Date.now();
    
    // Add with size limit
    this.addMetricWithLimit(this.metrics.requests, {
      endpoint,
      duration,
      success,
      timestamp: now
    });
    
    if (!success) {
      this.addMetricWithLimit(this.metrics.errors, {
        endpoint,
        timestamp: now
      });
    }
    
    this.addMetricWithLimit(this.metrics.latencies, {
      value: duration,
      timestamp: now
    });
    
    // Check error rate after each request
    this.checkErrorRate();
  }

  /**
   * Collect system resource metrics
   */
  addMetricWithLimit(array, metric) {
    array.push(metric);
    if (array.length > MAX_METRICS_PER_TYPE) {
      array.shift(); // Remove oldest
    }
  }

  collectSystemMetrics() {
    // CPU usage (approximation based on load average)
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0];
    const cpuUsage = (loadAvg / cpus.length) * 100;
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    const now = Date.now();
    this.addMetricWithLimit(this.systemMetrics.cpu, { value: cpuUsage, timestamp: now });
    this.addMetricWithLimit(this.systemMetrics.memory, { value: memoryUsage, timestamp: now });
    
    // Check thresholds and trigger alerts
    if (cpuUsage > this.alertThresholds.cpu) {
      this.triggerAlert('cpu', cpuUsage);
    }
    
    if (memoryUsage > this.alertThresholds.memory) {
      this.triggerAlert('memory', memoryUsage);
    }
  }

  /**
   * Check error rate and trigger alert if needed
   */
  checkErrorRate() {
    const recentWindow = Date.now() - this.metricsWindow;
    const recentRequests = this.metrics.requests.filter(r => r.timestamp > recentWindow);
    const recentErrors = recentRequests.filter(r => !r.success);
    
    if (recentRequests.length > 10) { // Only check if enough samples
      const errorRate = (recentErrors.length / recentRequests.length) * 100;
      
      if (errorRate > this.alertThresholds.errorRate) {
        this.triggerAlert('errorRate', errorRate);
      }
    }
  }

  /**
   * Trigger performance alert
   */
  triggerAlert(type, value) {
    const alertKey = `${type}_${Math.floor(value)}`;
    
    if (!this.activeAlerts.has(alertKey)) {
      this.activeAlerts.add(alertKey);
      
      this.logger.warn('Performance alert triggered', {
        type,
        value: `${value.toFixed(2)}${type === 'cpu' || type === 'memory' || type === 'errorRate' ? '%' : ''}`,
        threshold: this.alertThresholds[type]
      });
      
      this.emit('alert', { type, value, threshold: this.alertThresholds[type] });
      
      // Clear alert after 5 minutes
      setTimeout(() => {
        this.activeAlerts.delete(alertKey);
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Clean up old metrics outside the window
   */
  cleanupOldMetrics() {
    const cutoff = Date.now() - this.metricsWindow;
    
    this.metrics.requests = this.metrics.requests.filter(m => m.timestamp > cutoff);
    this.metrics.errors = this.metrics.errors.filter(m => m.timestamp > cutoff);
    this.metrics.latencies = this.metrics.latencies.filter(m => m.timestamp > cutoff);
    this.metrics.throughput = this.metrics.throughput.filter(m => m.timestamp > cutoff);
    
    this.systemMetrics.cpu = this.systemMetrics.cpu.filter(m => m.timestamp > cutoff);
    this.systemMetrics.memory = this.systemMetrics.memory.filter(m => m.timestamp > cutoff);
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    };
  }

  getCPUUsage() {
    const cpus = os.cpus();
    const usage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return Math.round(((total - idle) / total) * 100);
    });
    return Math.round(usage.reduce((a, b) => a + b, 0) / usage.length);
  }

  /**
   * Calculate percentile from array of values
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate average from metric array
   */
  calculateAverage(metrics) {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  /**
   * Get current performance statistics with rolling window
   */
  getMetrics() {
    const now = Date.now();
    const windowStart = now - this.metricsWindow;
    
    // Filter to current window
    const recentRequests = this.metrics.requests.filter(r => r.timestamp > windowStart);
    const recentErrors = this.metrics.errors.filter(e => e.timestamp > windowStart);
    const recentLatencies = this.metrics.latencies.filter(l => l.timestamp > windowStart);
    
    // Calculate statistics
    const totalRequests = recentRequests.length;
    const successfulRequests = recentRequests.filter(r => r.success).length;
    const errorRate = totalRequests > 0 ? ((recentErrors.length / totalRequests) * 100).toFixed(2) : 0;
    
    const avgLatency = recentLatencies.length > 0
      ? recentLatencies.reduce((sum, l) => sum + l.value, 0) / recentLatencies.length
      : 0;
    
    const p95Latency = this.calculatePercentile(recentLatencies.map(l => l.value), 95);
    const p99Latency = this.calculatePercentile(recentLatencies.map(l => l.value), 99);
    
    // System metrics
    const avgCpu = this.calculateAverage(this.systemMetrics.cpu.filter(c => c.timestamp > windowStart));
    const avgMemory = this.calculateAverage(this.systemMetrics.memory.filter(m => m.timestamp > windowStart));
    
    const memory = this.getMemoryUsage();
    const cpu = this.getCPUUsage();
    const uptime = Math.round((Date.now() - this.startTime) / 1000);

    return {
      window: `${this.metricsWindow / 1000}s`,
      uptime,
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: recentErrors.length,
        errorRate: `${errorRate}%`,
        throughput: `${(totalRequests / (this.metricsWindow / 1000)).toFixed(2)} req/s`
      },
      latency: {
        avg: `${avgLatency.toFixed(2)}ms`,
        p95: `${p95Latency.toFixed(2)}ms`,
        p99: `${p99Latency.toFixed(2)}ms`,
        min: recentLatencies.length > 0 ? `${Math.min(...recentLatencies.map(l => l.value)).toFixed(2)}ms` : '0ms',
        max: recentLatencies.length > 0 ? `${Math.max(...recentLatencies.map(l => l.value)).toFixed(2)}ms` : '0ms'
      },
      memory,
      cpu,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024),
        cpuCount: os.cpus().length,
        avgCpu: `${avgCpu.toFixed(2)}%`,
        avgMemory: `${avgMemory.toFixed(2)}%`
      },
      alerts: {
        active: this.activeAlerts.size,
        types: Array.from(this.activeAlerts).map(a => a.split('_')[0])
      },
      recommendations: this.generateRecommendations(avgCpu, avgMemory, Number.parseFloat(errorRate), avgLatency)
    };
  }

  /**
   * Generate performance recommendations based on metrics
   */
  generateRecommendations(cpu, memory, errorRate, latency) {
    const recommendations = [];
    
    if (cpu > 70) {
      recommendations.push({
        type: 'cpu',
        severity: 'high',
        message: 'High CPU usage detected',
        action: 'Consider scaling horizontally or optimizing CPU-intensive operations'
      });
    }
    
    if (memory > 75) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected',
        action: 'Review cache sizes and enable aggressive garbage collection'
      });
    }
    
    if (errorRate > 3) {
      recommendations.push({
        type: 'errors',
        severity: 'critical',
        message: 'Elevated error rate detected',
        action: 'Check logs for recurring errors and implement retry mechanisms'
      });
    }
    
    if (latency > 1000) {
      recommendations.push({
        type: 'latency',
        severity: 'medium',
        message: 'High average latency detected',
        action: 'Enable caching, optimize database queries, or add CDN'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'health',
        severity: 'info',
        message: 'System operating within normal parameters',
        action: 'Continue monitoring'
      });
    }
    
    return recommendations;
  }

  /**
   * Get endpoint-specific statistics
   */
  getEndpointStats(endpoint) {
    const recentRequests = this.metrics.requests.filter(
      r => r.endpoint === endpoint && r.timestamp > Date.now() - this.metricsWindow
    );
    
    if (recentRequests.length === 0) {
      return null;
    }
    
    const successful = recentRequests.filter(r => r.success).length;
    const avgDuration = recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length;
    
    return {
      endpoint,
      requests: recentRequests.length,
      successRate: `${((successful / recentRequests.length) * 100).toFixed(2)}%`,
      avgDuration: `${avgDuration.toFixed(2)}ms`
    };
  }

  startMonitoring(interval = 10000) {
    // System metrics collection every 10 seconds
    this.systemInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, interval);
    
    // Metrics cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000);
    
    // Periodic logging reduced to every 5 minutes in development to avoid spam
    const logInterval = process.env.NODE_ENV === 'development' ? 5 * 60000 : 60000;
    this.loggingInterval = setInterval(() => {
      const metrics = this.getMetrics();
      this.logger.info('Performance metrics', {
        requests: metrics.requests,
        latency: metrics.latency,
        system: metrics.system
      });
    }, logInterval);
    
    this.logger.info('Performance monitoring started', {
      window: `${this.metricsWindow / 1000}s`,
      thresholds: this.alertThresholds,
      logInterval: `${logInterval / 1000}s`
    });
  }

  stopMonitoring() {
    if (this.systemInterval) {
      clearInterval(this.systemInterval);
      this.systemInterval = null;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.loggingInterval) {
      clearInterval(this.loggingInterval);
      this.loggingInterval = null;
    }
    
    this.logger.info('Performance monitoring stopped');
  }

  /**
   * Destroy monitoring and clean up resources
   */
  destroy() {
    this.stopMonitoring();
    this.reset();
    this.removeAllListeners();
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      requests: [],
      errors: [],
      latencies: [],
      throughput: []
    };
    
    this.systemMetrics = {
      cpu: [],
      memory: [],
      uptime: process.uptime()
    };
    
    this.activeAlerts.clear();
    this.startTime = Date.now();
    
    this.logger.info('Performance metrics reset');
  }
}
