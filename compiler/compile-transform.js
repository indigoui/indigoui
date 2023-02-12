import swc from '@swc/core';

async function compileTransform(source) {
  const output = await swc.transform(source.toString(), {
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

export default compileTransform;
