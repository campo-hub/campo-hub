import fs from 'fs';
const path = '\\\\?\\C:\\Users\\john\\OneDrive\\Desktop\\everything campus\\backend\\nul';
console.log('path', path);
console.log('exists', fs.existsSync(path));
try {
  fs.unlinkSync(path);
  console.log('removed');
} catch (err) {
  console.error('error', err && err.message ? err.message : err);
}
