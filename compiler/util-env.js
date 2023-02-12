async function utilEnv(name) {
  return (await import(`../components/${name}/.env.js`)).default;
}

export default utilEnv;
