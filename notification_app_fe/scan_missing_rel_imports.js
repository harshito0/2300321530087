const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '.');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+(?:[^'";]+\s+from\s+)?["']([^"']+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // Only check relative paths
        if (importPath.startsWith('.')) {
          const resolved = path.resolve(path.dirname(fullPath), importPath);
          const tryExtensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
          const exists = tryExtensions.some(ext => fs.existsSync(resolved + ext));
          if (!exists) {
            console.log(JSON.stringify({ importer: fullPath, importPath }));
          }
        }
      }
    }
  }
}

scanDir(projectRoot);
