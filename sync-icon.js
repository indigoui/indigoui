import fs from 'fs/promises';
import compilePragma from './compiler/compile-pragma.js';

await fs.mkdir('components/icon/source', { recursive: true });
await fs.mkdir('components/icon/source-filled', { recursive: true });

const response = await (
  await fetch('https://api.github.com/repos/tabler/tabler-icons/git/trees/master?recursive=true')
).json();

const icons = response.tree.filter(
  (entry) => (entry.path.startsWith('src/_icons/') === true)
).map(
  (entry) => entry.path.slice(11, -4)
);

const filled = [];

for (let i = 0; i < icons.length; i++) {
  console.log(`[compile] ${icons[i]}`);

  const raw = await (
    await fetch(`https://raw.githubusercontent.com/tabler/tabler-icons/${response.sha}/src/_icons/${icons[i]}.svg`)
  ).text();

  if (raw.includes('category: Filled') === true) {
    filled.push(icons[i]);
  }

  const source = raw.split(/<svg>|<\/svg>/g)[1].trim();

  const pragma = await compilePragma(`<>${source}</>`, 'http://www.w3.org/2000/svg');

  const compiled = pragma.replace(/this\.#shadow/g, 'this.#shadow.children[1]');

  await fs.writeFile(`components/icon/source/${icons[i]}.js`, compiled, 'utf-8');

  await new Promise((resolve) => setTimeout(resolve, 50));
}

for (let i = 0; i < filled.length; i++) {
  const name = filled[i].slice(0, -7);

  if (filled[i].endsWith('-filled') === false || icons.includes(name) === false) {
    await fs.rename(`components/icon/source/${filled[i]}.js`, `components/icon/__ERROR__${filled[i]}.js`);
  } else {
    await fs.rename(`components/icon/source/${filled[i]}.js`, `components/icon/source-filled/${name}.js`);
  }
}

const readdirSource = await fs.readdir('components/icon/source');

for (let i = 0; i < readdirSource.length; i++) {
  if (icons.includes(readdirSource[i].split('.')[0]) === false) {
    await fs.unlink(`components/icon/source/${readdirSource[i]}`);
  }
}

const readdirSourceFilled = await fs.readdir('components/icon/source-filled');

for (let i = 0; i < readdirSourceFilled.length; i++) {
  if (icons.includes(readdirSourceFilled[i].split('.')[0]) === false) {
    await fs.unlink(`components/icon/source-filled/${readdirSourceFilled[i]}`);
  }
}
