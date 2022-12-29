import fs from 'fs/promises';
import compile from './compile.js';

await fs.mkdir('dist', { recursive: true });

const components = await fs.readdir('components');

for (let i = 0; i < components.length; i++) {
  if (components[i] === 'template') {
    continue;
  }

  const compiled = await compile(components[i]);

  await fs.writeFile(`dist/${components[i]}.js`, compiled, 'utf-8');

  console.log(`[compile] ${components[i]}`);
}

const dist = await fs.readdir('dist');

for (let i = 0; i < dist.length; i++) {
  if (components.includes(dist[i].split('.')[0]) === false) {
    await fs.unlink(`dist/${dist[i]}`);
  }
}
