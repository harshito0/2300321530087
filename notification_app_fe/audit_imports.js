const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, 'src');

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function parseImports(fileContent) {
  const importRegex = /import\s+(?:[^'"{]+\s+from\s+)?["']([^"']+)["'];/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function resolveImport(importPath, importerDir) {
  // Handle absolute (starting with /) and relative paths.
  if (importPath.startsWith('.')) {
    // Resolve relative to importer directory.
    const resolved = path.resolve(importerDir, importPath);
    // Try extensions .js, .jsx, .json, .tsx, .ts, and index.js inside folder.
    const candidates = [resolved + '.js', resolved + '.jsx', resolved + '/index.js', resolved + '/index.jsx'];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  } else {
    // Assume module from node_modules – we ignore for this audit.
    return importPath;
  }
}

function main() {
  const files = getAllFiles(projectRoot);
  const missing = [];
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const imports = parseImports(content);
    const dir = path.dirname(file);
    imports.forEach(imp => {
      const resolved = resolveImport(imp, dir);
      if (resolved && !resolved.startsWith(projectRoot) && !resolved.startsWith('.') && !fs.existsSync(resolved)) {
        missing.push({ importer: file, importPath: imp, resolved });
      }
    });
  });
  if (missing.length === 0) {
    console.log('All imports resolved.');
  } else {
    console.log('Missing imports detected:');
    missing.forEach(m => {
      console.log(`${m.importer} -> ${m.importPath} (expected ${m.resolved})`);
    });
    // Output JSON for automated processing.
    console.log('JSON_OUTPUT_START');
    console.log(JSON.stringify(missing, null, 2));
    console.log('JSON_OUTPUT_END');
  }
}

main();
