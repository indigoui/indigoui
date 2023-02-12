import css from '@swc/css';

import eryn from 'eryn';
import fs from 'fs';

import env from '../.env.js';

import compilePragma from './compile-pragma.js';
import compileTransform from './compile-transform.js';

import utilEnv from './util-env.js';
import utilPascalCase from './util-pascal-case.js';

const engine = eryn({
  bypassCache: true
});

async function compileComponent(name, options) {
  const compiled = await compileJs(name, options);

  if (compiled === null) {
    return null;
  }

  return await compileTransform(compiled);
}

async function compileCss(name, options) {
  if (fs.existsSync(`components/${name}/${name}.css`) === false) {
    return null;
  }

  const rendered = engine.render(`components/${name}/${name}.css`, {
    className: utilPascalCase(name), name
  }, { ...env, ...await utilEnv(name), ...options, fs });

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
    className: utilPascalCase(name), name
  }, { ...env, ...await utilEnv(name), ...options, fs });

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

  let render = await compileHtml(name, options);

  if (render !== null) {
    render = await compilePragma(render);
  }

  return engine.render(`components/${name}/${name}.js`, {
    className: utilPascalCase(name), name, render
  }, { ...env, ...await utilEnv(name), ...options, fs });
}

export default compileComponent;
