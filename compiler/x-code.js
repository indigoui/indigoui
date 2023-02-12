function xCode(children, ns = null, parent = 'this.#shadow') {
  let output = '';

  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === 'string') {
      const value = JSON.stringify(children[i]);

      output += `${parent}.appendChild(
        document.createTextNode(${value})
      );`;

      continue;
    }

    let namespace = ns;

    if (children[i].name === 'math') {
      namespace = 'http://www.w3.org/1998/Math/MathML';
    } else if (children[i].name === 'svg') {
      namespace = 'http://www.w3.org/2000/svg';
    }

    if (children[i].attrs === null && children[i].children.length === 0) {
      output += `${parent}.appendChild(`;

      if (namespace === null) {
        output += `document.createElement('${children[i].name}')`;
      } else {
        output += `document.createElementNS('${namespace}', '${children[i].name}')`;
      }

      output += `);`;
      continue;
    }

    const current = (parent === 'this.#shadow' ? `_${i}` : `${parent}${i}`);

    if (namespace === null) {
      output += `const ${current} = document.createElement('${children[i].name}');`;
    } else {
      output += `const ${current} = document.createElementNS('${namespace}', '${children[i].name}');`;
    }

    if (children[i].attrs !== null) {
      const keys = Object.keys(children[i].attrs);

      for (let j = 0; j < keys.length; j++) {
        const value = JSON.stringify(children[i].attrs[keys[j]]);

        if (typeof children[i].attrs[keys[j]] === 'string') {
          output += `${current}.setAttribute('${keys[j]}', ${value});`;
        } else {
          output += `${current}["${keys[j]}"] = ${value};`;
        }
      }
    }

    if (children[i].children.length !== 0) {
      output += `${xCode(children[i].children, namespace, current)}`;
    }

    output += `${parent}.appendChild(${current});`;
  }

  return output;
};

export default xCode;
