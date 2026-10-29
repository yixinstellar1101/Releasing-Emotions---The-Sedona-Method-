const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8').replace(/^﻿/, '');
const html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '\n</style>')
  .replace('<link rel="stylesheet" href="enhancements.css">', () => '<style>\n' + read('enhancements.css') + '\n</style>')
  .replace('<link rel="stylesheet" href="themes.css">', () => '<style>\n' + read('themes.css') + '\n</style>')
  .replace('<link rel="stylesheet" href="practice-notes.css">', () => '<style>\n' + read('practice-notes.css') + '\n</style>')
  .replace('<link rel="stylesheet" href="motion-interactions.css">', () => '<style>\n' + read('motion-interactions.css') + '\n</style>')
  .replace('<script src="emotion-chart.js"></script>', () => '<script>\n' + read('emotion-chart.js').replace(/<\/script/gi, '<\\/script') + '\n</script>')
  .replace('<script src="theme-data.js"></script>', () => '<script>\n' + read('theme-data.js').replace(/<\/script/gi, '<\\/script') + '\n</script>')
  .replace('<script src="practice-notes.js"></script>', () => '<script>\n' + read('practice-notes.js').replace(/<\/script/gi, '<\\/script') + '\n</script>')
  .replace('<script src="app.js"></script>', () => '<script>\n' + read('app.js').replace(/<\/script/gi, '<\\/script') + '\n</script>');
fs.writeFileSync(path.join(__dirname, '松间-圣多纳释放.html'), html, 'utf8');
console.log('Standalone HTML built.');
