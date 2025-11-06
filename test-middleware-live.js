import path from 'path';

// Simulate middleware logic
const allowedDirs = ['data/assets', 'data/cache', 'data/exports', 'data/tts', 'data/subs'];
const resolvedAllowedDirs = allowedDirs.map(dir => path.resolve(process.cwd(), dir));

console.log('CWD:', process.cwd());
console.log('Allowed dirs:', resolvedAllowedDirs);
console.log('');

// Test cases
const testCases = [
  { name: 'Valid path', path: 'data/tts/test.wav' },
  { name: 'Traversal attack', path: '../../../etc/passwd' },
  { name: 'Absolute Windows path', path: 'C:\\Windows\\evil.wav' },
  { name: 'Absolute path with backslash', path: 'C:/evil.wav' }
];

testCases.forEach(test => {
  const resolvedPath = path.resolve(test.path);
  const isAllowed = resolvedAllowedDirs.some(allowedDir => {
    return resolvedPath.startsWith(allowedDir);
  });
  
  console.log(`Test: ${test.name}`);
  console.log(`  Input: ${test.path}`);
  console.log(`  Resolved: ${resolvedPath}`);
  console.log(`  Allowed: ${isAllowed ? '✅ YES' : '❌ NO (403 Forbidden)'}`);
  console.log('');
});
