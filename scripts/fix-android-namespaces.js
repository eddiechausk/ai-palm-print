/**
 * postinstall script: Fix AGP 8.x namespace compatibility in third-party libraries
 *
 * AGP 8.x requires:
 * - namespace declared in library's build.gradle
 * - NO package attribute in library's AndroidManifest.xml
 *
 * Libraries that need fixing:
 * - react-native-linear-gradient
 * - react-native-reanimated
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    gradleFile: 'node_modules/react-native-linear-gradient/android/build.gradle',
    manifestFile: 'node_modules/react-native-linear-gradient/android/src/main/AndroidManifest.xml',
    namespace: 'com.reactnative.lineargradient',
    packageName: 'com.BV.LinearGradient',
  },
  {
    gradleFile: 'node_modules/react-native-reanimated/android/build.gradle',
    manifestFile: 'node_modules/react-native-reanimated/android/src/main/AndroidManifest.xml',
    namespace: 'com.swmansion.reanimated',
    packageName: 'com.swmansion.reanimated',
  },
];

const root = path.resolve(__dirname, '..');
let fixCount = 0;

function addNamespaceToGradle(filePath, ns) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(`namespace "${ns}"`)) return false;

  // Insert namespace after 'android {' block opening
  const match = content.match(/^(android\s*\{)/m);
  if (match) {
    content = content.replace(/^(android\s*\{)/m, `$1\n    namespace "${ns}"`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  // If no android block found, prepend
  content = `android {\n    namespace "${ns}"\n}\n\n` + content;
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function removePackageFromManifest(filePath, pkgName) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`\\s*package="${pkgName}"\\s*`, 'g');
  if (!pattern.test(content)) return false;
  content = content.replace(pattern, ' ');
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

for (const fix of fixes) {
  const gradlePath = path.join(root, fix.gradleFile);
  const manifestPath = path.join(root, fix.manifestFile);
  let fixed = false;

  if (addNamespaceToGradle(gradlePath, fix.namespace)) {
    console.log(`[fix-ns] +namespace: ${fix.gradleFile}`);
    fixed = true;
  } else {
    console.log(`[fix-ns] OK: ${fix.gradleFile}`);
  }

  if (removePackageFromManifest(manifestPath, fix.packageName)) {
    console.log(`[fix-ns] -package: ${fix.manifestFile}`);
    fixed = true;
  } else {
    console.log(`[fix-ns] OK: ${fix.manifestFile}`);
  }

  if (fixed) fixCount++;
}

console.log(`[fix-ns] Done. Fixed ${fixCount} lib(s).`);
