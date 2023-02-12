[|% ../template : { ...context, attrs: ['filled', 'name'], includeOnChange: true } |]
  #onChange(attr, newValue, oldValue) {
    const svg = this.#shadow.children[1];

    while (svg.children.length > 1) {
      svg.removeChild(svg.lastChild);
    }

    [|# local.source = shared.fs.readdirSync('components/icon/source') |]
    [|# local.sourceFilled = shared.fs.readdirSync('components/icon/source-filled') |]

    switch (this.getAttribute('name')) {
      [|@ icon : local.source |]
        [|? shared.include === null || shared.include.includes(icon.split('.')[0]) |]
          case '[| icon.split('.')[0] |]':
            {
              if (this.getAttribute('filled') === null) {
                [| shared.fs.readFileSync(`components/icon/source/${icon}`) |]
              }
              [|? local.sourceFilled.includes(icon) === true |]
                else {
                  [| shared.fs.readFileSync(`components/icon/source-filled/${icon}`) |]
                }
              [|end|]
            }
            break;
        [|end|]
      [|end|]
    }
  }
[|end|]
