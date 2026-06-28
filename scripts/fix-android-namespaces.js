/**
 * postinstall script: Fix missing namespace in third-party Android libraries
 * Required for AGP 8.x compatibility
 *
 * Libraries that need namespace added:
 * - react-native-linear-gradient (namespace already added in newer versions, but ensure it's present)
 *
 * Note: react-native-camera and react-native-iap are excluded from autolinking
 * via react-native.config.js, so their namespace issues don't affect the build.
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'node_modules/react-native-linear-gradient/android/build.gradle',
    check: 'namespace',
    // Insert namespace after 'android {' line
    pattern: /^(android\s*\{)/m,
    replacement: '$1\n    namespace "com.reactnative.lineargradient"',
  },
];

const root = path.resolve(__dirname, '..');

let fixCount = 0;

for (const fix of fixes) {
  const filePath = path.join(root, fix.file);

  if (!fs.existsSync(filePath)) {
    console.log(`[fix-namespaces] SKIP (not found): ${fix.file}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(fix.check)) {
    console.log(`[fix-namespaces] OK (already fixed): ${fix.file}`);
    continue;
  }

  const fixed = content.replace(fix.pattern, fix.replacement);

  if (fixed === content) {
    console.log(`[fix-namespaces] WARN (pattern not matched): ${fix.file}`);
    continue;
  }

  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log(`[fix-namespaces] FIXED: ${fix.file}`);
  fixCount++;
}

console.log(`[fix-namespaces] Done. Fixed ${fixCount} file(s).`);
