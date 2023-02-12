import fs from 'fs/promises';

await fs.mkdir('components/flag/source', { recursive: true });
await fs.mkdir('components/flag/source-waving', { recursive: true });

const response = await (
  await fetch('https://flagcdn.com/en/codes.json')
).json();

const flags = Object.keys(response).filter(
  (entry) => (entry.length === 2 && entry !== 'eu' && entry !== 'un')
).sort((nameA, nameB) => {
  return response[nameA].localeCompare(response[nameB]);
});

await fs.writeFile(`components/flag/flag.json`, JSON.stringify(
  flags.reduce((previous, value) => {
    return { ...previous, [value]: response[value] };
  }, {})
),'utf-8');

const sizes = [
  '16x12'  , '20x15'  , '24x18'  , '28x21'  ,
  '32x24'  , '36x27'  , '40x30'  , '48x36'  ,
  '56x42'  , '60x45'  , '64x48'  , '72x54'  ,
  '80x60'  , '84x63'  , '96x72'  , '108x81' ,
  '112x84' , '120x90' , '128x96' , '144x108',
  '160x120', '192x144', '224x168', '256x192'
];

for (let i = 0; i < flags.length; i++) {
  console.log(`[download] ${flags[i]}`);

  const raw = await(
    await fetch(`https://flagcdn.com/${flags[i]}.svg`)
  ).arrayBuffer();

  const buffer = Buffer.from(new Uint8Array(raw));

  await fs.writeFile(`components/flag/source/${flags[i]}.svg`, buffer, 'binary');

  await new Promise((resolve) => setTimeout(resolve, 50));

  for (let j = 0; j < sizes.length; j++) {
    console.log(`[download] ${flags[i]}-${sizes[j]}`);

    const raw = await(
      await fetch(`https://flagcdn.com/${sizes[j]}/${flags[i]}.png`)
    ).arrayBuffer();

    const buffer = Buffer.from(new Uint8Array(raw));

    await fs.writeFile(`components/flag/source-waving/${flags[i]}-${sizes[j]}.png`, buffer, 'binary');

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const readdirSource = await fs.readdir('components/flag/source');

for (let i = 0; i < readdirSource.length; i++) {
  if (flags.includes(readdirSource[i].split('.')[0]) === false) {
    await fs.unlink(`components/icon/source/${readdirSource[i]}`);
  }
}

const readdirSourceWaving = await fs.readdir('components/flag/source-waving');

for (let i = 0; i < readdirSourceWaving.length; i++) {
  if (flags.includes(readdirSourceWaving[i].split('-')[0]) === false) {
    await fs.unlink(`components/icon/source-waving/${readdirSourceWaving[i]}`);
  }
}
