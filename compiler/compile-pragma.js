import swc from '@swc/core';

import xCode from './x-code.js';
import xTree from './x-tree.js';

async function compilePragma(source, xCodeNs = null) {
  const transformed = await swc.transform(source.toString(), {
    jsc: {
      parser: {
        jsx: true
      },
      target: 'es2022',
      transform: {
        react: {
          pragma: 'xTree',
          pragmaFrag: 'xNull'
        }
      }
    }
  });

  xCodeNs = JSON.stringify(xCodeNs);

  return eval(`
    ${xCode.toString()}
    const xNull = null;
    ${xTree.toString()}

    const transformed = ${transformed.code};
    xCode(transformed, ${xCodeNs});
  `);
}

export default compilePragma;
