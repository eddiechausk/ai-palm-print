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
 * - react-native-camera (also strips productFlavors to avoid MissingValueException)
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    gradleFile: 'node_modules/react-native-linear-gradient/android/build.gradle',
    manifestFile: 'node_modules/react-native-linear-gradient/android/src/main/AndroidManifest.xml',
    namespace: 'com.BV.LinearGradient',
    packageName: 'com.BV.LinearGradient',
  },
  {
    gradleFile: 'node_modules/react-native-reanimated/android/build.gradle',
    manifestFile: 'node_modules/react-native-reanimated/android/src/main/AndroidManifest.xml',
    namespace: 'com.swmansion.reanimated',
    packageName: 'com.swmansion.reanimated',
  },
  {
    gradleFile: 'node_modules/react-native-camera/android/build.gradle',
    manifestFile: 'node_modules/react-native-camera/android/src/main/AndroidManifest.xml',
    namespace: 'org.reactnative.camera',
    packageName: 'org.reactnative.camera',
    stripFlavors: true,
  },
];

const root = path.resolve(__dirname, '..');
let fixCount = 0;

function addNamespaceToGradle(filePath, ns) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(`namespace "${ns}"`)) return false;

  const match = content.match(/^(android\s*\{)/m);
  if (match) {
    content = content.replace(/^(android\s*\{)/m, `$1\n    namespace "${ns}"`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
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

function stripProductFlavors(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove flavorDimensions line
  const hadDimensions = /\s*\n\s*flavorDimensions\s+"[^"]+"\s*\n/.test(content);
  content = content.replace(/\s*\n\s*flavorDimensions\s+"[^"]+"\s*\n/, '\n');

  // Remove productFlavors block
  const hadFlavors = content.includes('productFlavors');
  content = content.replace(/\n\s*\n\s*productFlavors\s*\{[\s\S]*?\n\s*\}\s*\n/, '\n');

  // Convert flavor-specific dependencies to regular implementation
  content = content.replace(/generalImplementation /g, 'implementation ');
  content = content.replace(/mlkitImplementation /g, 'implementation ');

  if (hadDimensions || hadFlavors) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
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

  if (fix.stripFlavors && stripProductFlavors(gradlePath)) {
    console.log(`[fix-ns] -flavors: ${fix.gradleFile}`);
    fixed = true;
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
