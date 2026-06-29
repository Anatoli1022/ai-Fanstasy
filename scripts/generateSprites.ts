const fs = require('fs');
const path = require('path');

const races = ['elf', 'dwarf', 'orc', 'human', 'fae', 'troll'];
const roles = ['warrior', 'worker', 'scout', 'mage', 'builder', 'leader'];
const animations = ['idle', 'walk', 'work', 'fight'];

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'sprites');

for (const race of races) {
  for (const role of roles) {
    for (const anim of animations) {
      const dir = path.join(outputDir, race, role);
      fs.mkdirSync(dir, { recursive: true });
      const filename = path.join(dir, `${anim}.png`);
      if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, Buffer.from([]));
      }
    }
  }
}

console.log('Sprite directories generated.');
