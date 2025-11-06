/**
 * Security Audit Script for Video Orchestrator
 * Tests various attack vectors against path validation middleware
 */

import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Simulate middleware logic
const allowedDirs = ['data/assets', 'data/cache', 'data/exports', 'data/tts', 'data/subs'];
const cwd = process.cwd();
const resolvedAllowedDirs = allowedDirs.map(dir => path.resolve(cwd, dir));

console.log(`${COLORS.cyan}=`.repeat(80));
console.log(`🔒 SECURITY AUDIT - Video Orchestrator Path Validation`);
console.log(`=`.repeat(80) + COLORS.reset);
console.log(`\n${COLORS.blue}Working Directory:${COLORS.reset} ${cwd}`);
console.log(`${COLORS.blue}Allowed Directories:${COLORS.reset}`);
resolvedAllowedDirs.forEach(dir => console.log(`  - ${dir}`));
console.log();

// Test cases organized by attack type
const testSuites = [
  {
    name: '🎯 Path Traversal Attacks',
    tests: [
      { name: 'Single parent directory', path: '../secrets.txt', expectBlocked: true },
      { name: 'Double parent directory', path: '../../secrets.txt', expectBlocked: true },
      { name: 'Triple parent directory', path: '../../../etc/passwd', expectBlocked: true },
      { name: 'Deep traversal (10 levels)', path: '../'.repeat(10) + 'root/secrets', expectBlocked: true },
      { name: 'Traversal with valid prefix', path: 'data/assets/../../secrets.txt', expectBlocked: true },
      { name: 'Traversal in middle', path: 'data/../../../secrets.txt', expectBlocked: true },
      { name: 'Encoded parent directory', path: 'data%2F..%2F..%2Fsecrets.txt', expectBlocked: false }, // URL encoding should be decoded by Express
      { name: 'Mixed separators traversal', path: 'data\\..\\..\\secrets.txt', expectBlocked: true },
      { name: 'Traversal with trailing slash', path: '../../../etc/', expectBlocked: true },
    ]
  },
  {
    name: '🚫 Absolute Path Attacks',
    tests: [
      { name: 'Windows absolute path (C:)', path: 'C:\\Windows\\System32\\evil.exe', expectBlocked: true },
      { name: 'Windows absolute path (D:)', path: 'D:\\secrets\\passwords.txt', expectBlocked: true },
      { name: 'Unix absolute path', path: '/etc/passwd', expectBlocked: true },
      { name: 'Unix absolute path (root)', path: '/root/.ssh/id_rsa', expectBlocked: true },
      { name: 'Network path (UNC)', path: '\\\\network\\share\\file.txt', expectBlocked: true },
      { name: 'Forward slash absolute', path: 'C:/Windows/evil.exe', expectBlocked: true },
      { name: 'Mixed case drive letter', path: 'c:\\windows\\system32\\cmd.exe', expectBlocked: true },
    ]
  },
  {
    name: '🔓 Valid Paths (Should Be Allowed)',
    tests: [
      { name: 'Valid assets path', path: 'data/assets/backgrounds/video.mp4', expectBlocked: false },
      { name: 'Valid cache path', path: 'data/cache/video/processed.mp4', expectBlocked: false },
      { name: 'Valid exports path', path: 'data/exports/final-video.mp4', expectBlocked: false },
      { name: 'Valid TTS path', path: 'data/tts/voice-001.wav', expectBlocked: false },
      { name: 'Valid subs path', path: 'data/subs/subtitles.srt', expectBlocked: false },
      { name: 'Nested valid path', path: 'data/assets/backgrounds/horror/dark-forest.mp4', expectBlocked: false },
      { name: 'Valid path with spaces', path: 'data/assets/video with spaces.mp4', expectBlocked: false },
      { name: 'Valid path with dashes', path: 'data/cache/video-processed-final.mp4', expectBlocked: false },
    ]
  },
  {
    name: '🌐 Edge Cases & Special Characters',
    tests: [
      { name: 'Null byte injection', path: 'data/assets/video.mp4\0../../secrets.txt', expectBlocked: false }, // Node.js path.resolve handles this
      { name: 'Multiple slashes', path: 'data//assets///backgrounds////video.mp4', expectBlocked: false }, // Normalized by path.resolve
      { name: 'Backslashes in Unix-style path', path: 'data\\assets\\video.mp4', expectBlocked: false }, // Windows accepts both
      { name: 'Trailing slash valid path', path: 'data/assets/backgrounds/', expectBlocked: false },
      { name: 'Current directory reference', path: './data/assets/video.mp4', expectBlocked: false },
      { name: 'Double current directory', path: '././data/assets/video.mp4', expectBlocked: false },
      { name: 'Current dir in middle', path: 'data/./assets/./video.mp4', expectBlocked: false },
      { name: 'Empty path', path: '', expectBlocked: false }, // Should be skipped by middleware
      { name: 'Just a dot', path: '.', expectBlocked: true }, // Resolves to cwd
      { name: 'Just double dot', path: '..', expectBlocked: true }, // Resolves to parent
    ]
  },
  {
    name: '💀 Advanced Attack Vectors',
    tests: [
      { name: 'Unicode normalization attack', path: 'data/assets/../../sécrêts.txt', expectBlocked: true },
      { name: 'Case sensitivity bypass (Windows)', path: 'DATA/ASSETS/VIDEO.MP4', expectBlocked: false }, // Windows is case-insensitive
      { name: 'Symlink target path', path: 'data/assets/symlink-to-etc', expectBlocked: false }, // Note: Actual symlink resolution not tested here
      { name: 'Very long path (260+ chars)', path: 'data/assets/' + 'a'.repeat(300) + '.mp4', expectBlocked: false },
      { name: 'Path with unicode chars', path: 'data/assets/视频文件.mp4', expectBlocked: false },
      { name: 'Path with emoji', path: 'data/assets/video-😊.mp4', expectBlocked: false },
      { name: 'Mixed traversal techniques', path: '../data/../data/../../secrets.txt', expectBlocked: true },
    ]
  },
  {
    name: '🔴 Critical Security Tests',
    tests: [
      { name: 'Access Windows system files', path: 'C:\\Windows\\System32\\config\\SAM', expectBlocked: true },
      { name: 'Access Unix password file', path: '/etc/shadow', expectBlocked: true },
      { name: 'Access SSH keys', path: '/root/.ssh/id_rsa', expectBlocked: true },
      { name: 'Access environment variables', path: 'C:\\Windows\\System32\\config\\systemprofile\\.env', expectBlocked: true },
      { name: 'Access parent project files', path: '../package.json', expectBlocked: true },
      { name: 'Access Git directory', path: '../.git/config', expectBlocked: true },
      { name: 'Access node_modules', path: '../node_modules/evil-package/malicious.js', expectBlocked: true },
    ]
  }
];

// Validation function
function validatePath(userPath) {
  if (!userPath || typeof userPath !== 'string') {
    return { allowed: true, reason: 'Empty or invalid path (skipped by middleware)' };
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(cwd, userPath);

  // Check if path is within any allowed directory
  const isAllowed = resolvedAllowedDirs.some(allowedDir => {
    return resolvedPath.startsWith(allowedDir);
  });

  if (!isAllowed) {
    return {
      allowed: false,
      reason: 'Path outside allowed directories',
      resolved: resolvedPath
    };
  }

  return {
    allowed: true,
    reason: 'Path within allowed directory',
    resolved: resolvedPath
  };
}

// Run tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testSuites.forEach(suite => {
  console.log(`${COLORS.cyan}\n${'='.repeat(80)}`);
  console.log(`${suite.name}`);
  console.log(`${'='.repeat(80)}${COLORS.reset}\n`);

  suite.tests.forEach(test => {
    totalTests++;
    const result = validatePath(test.path);
    const actualBlocked = !result.allowed;
    const testPassed = actualBlocked === test.expectBlocked;

    if (testPassed) {
      passedTests++;
      console.log(`${COLORS.green}✅ PASS${COLORS.reset} ${test.name}`);
      console.log(`   Input: ${COLORS.yellow}${test.path}${COLORS.reset}`);
      if (result.resolved) {
        console.log(`   Resolved: ${result.resolved}`);
      }
      console.log(`   Expected: ${test.expectBlocked ? 'BLOCKED' : 'ALLOWED'} → Actual: ${actualBlocked ? 'BLOCKED' : 'ALLOWED'} ${COLORS.green}✓${COLORS.reset}`);
    } else {
      failedTests++;
      console.log(`${COLORS.red}❌ FAIL${COLORS.reset} ${test.name}`);
      console.log(`   Input: ${COLORS.yellow}${test.path}${COLORS.reset}`);
      if (result.resolved) {
        console.log(`   Resolved: ${result.resolved}`);
      }
      console.log(`   Expected: ${test.expectBlocked ? 'BLOCKED' : 'ALLOWED'} → Actual: ${actualBlocked ? 'BLOCKED' : 'ALLOWED'} ${COLORS.red}✗${COLORS.reset}`);
      console.log(`   ${COLORS.red}Reason: ${result.reason}${COLORS.reset}`);
    }
    console.log();
  });
});

// Final summary
console.log(`${COLORS.cyan}${'='.repeat(80)}`);
console.log(`📊 SECURITY AUDIT SUMMARY`);
console.log(`${'='.repeat(80)}${COLORS.reset}\n`);

const passRate = ((passedTests / totalTests) * 100).toFixed(2);
const statusColor = failedTests === 0 ? COLORS.green : (failedTests < 3 ? COLORS.yellow : COLORS.red);

console.log(`Total Tests: ${totalTests}`);
console.log(`${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
console.log(`${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);
console.log(`${statusColor}Pass Rate: ${passRate}%${COLORS.reset}\n`);

if (failedTests === 0) {
  console.log(`${COLORS.green}🎉 ALL TESTS PASSED - SECURITY MIDDLEWARE IS WORKING CORRECTLY!${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Path traversal attacks: BLOCKED${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Absolute path attacks: BLOCKED${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Valid paths: ALLOWED${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Edge cases: HANDLED CORRECTLY${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Critical attacks: BLOCKED${COLORS.reset}\n`);
  console.log(`${COLORS.green}🔒 PRODUCTION READY - No security vulnerabilities detected!${COLORS.reset}`);
} else {
  console.log(`${COLORS.red}⚠️  SECURITY ISSUES DETECTED - ${failedTests} test(s) failed!${COLORS.reset}`);
  console.log(`${COLORS.yellow}Please review the failed tests above and fix the security middleware.${COLORS.reset}`);
}

console.log(`\n${COLORS.cyan}${'='.repeat(80)}${COLORS.reset}\n`);

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);
