import swc from '@swc/core';
import css from '@swc/css';

import eryn from 'eryn';
import fs from 'fs';

import env from './.env.js'

const engine = eryn({
  bypassCache: true
});

async function compile(name, options) {
  const compiled = await compileJs(name, options);

  if (compiled === null) {
    return null;
  }

  const output = await swc.transform(compiled.toString(), {
    isModule: true,
    jsc: {
      minify: {
        compress: true,
        mangle: { keep_classnames: true }
      },
      target: 'es2022'
    },
    minify: true,
    module: {
      type: 'commonjs'
    }
  });

  return output.code;
}

async function compileCss(name, options) {
  if (fs.existsSync(`components/${name}/${name}.css`) === false) {
    return null;
  }

  const rendered = engine.render(`components/${name}/${name}.css`, {
    className: pascalCase(name), name
  }, { ...env, ...await scoped(name), ...options });

  const minified = await css.minify(
    Buffer.from(`@charset "utf-8";${rendered}`)
  );

  return `<style>{\`${minified.code}\`}</style>`;
}

async function compileHtml(name, options) {
  if (fs.existsSync(`components/${name}/${name}.html`) === false) {
    return await compileCss(name, options);
  }

  const rendered = engine.render(`components/${name}/${name}.html`, {
    className: pascalCase(name), name
  }, { ...env, ...await scoped(name), ...options });

  const compiled = await compileCss(name, options);

  if (compiled === null) {
    return `<>${rendered}</>`;
  }

  return `<>${compiled}${rendered}</>`;
}

async function compileJs(name, options) {
  if (fs.existsSync(`components/${name}/${name}.js`) === false) {
    return null;
  }

  return engine.render(`components/${name}/${name}.js`, {
    className: pascalCase(name), name, render: await compilePragma(name, options)
  }, { ...env, ...await scoped(name), ...options });
}

async function compilePragma(name, options) {
  const compiled = await compileHtml(name, options);

  if (compiled === null) {
    return null;
  }

  const transformed = await swc.transform(compiled, {
    jsc: {
      parser: {
        jsx: true
      },
      target: 'es2015',
      transform: {
        react: {
          pragma: 'xTree',
          pragmaFrag: 'xNull'
        }
      }
    }
  });

  return eval(`
    ${xCode.toString()}
    const xNull = null;
    ${xTree.toString()}

    const transformed = ${transformed.code};
    xCode(transformed);
  `);
}

function pascalCase(name) {
  return name.split('-').map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

async function scoped(name) {
  return (await import(`./components/${name}/.env.js`)).default;
}

function xCode(children, parent = 'this.#shadow') {
  let output = '';

  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === 'string') {
      output += `
        ${parent}.appendChild(
          document.createTextNode('${children[i]}')
        );
      `;

      continue;
    }

    if (children[i].attrs === null && children[i].children.length === 0) {
      output += `
        ${parent}.appendChild(
          document.createElement('${children[i].name}')
        );
      `;

      continue;
    }

    const current = (parent === 'this.#shadow' ? `_${i}` : `${parent}${i}`);

    output += `const ${current} = document.createElement('${children[i].name}');`;

    if (children[i].attrs !== null) {
      const keys = Object.keys(children[i].attrs);

      for (let j = 0; j < keys.length; j++) {
        const value = JSON.stringify(children[i].attrs[keys[j]]);
        output += `${current}.${keys[j]} = ${value};`;
      }
    }

    if (children[i].children.length !== 0) {
      output += `${xCode(children[i].children, current)}`;
    }

    output += `${parent}.appendChild(${current});`;
  }

  return output;
}

function xTree(name, attrs, ...children) {
  return (name === null) ? children : { attrs, children, name };
};

export default compile;
