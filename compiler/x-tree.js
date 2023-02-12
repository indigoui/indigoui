function xTree(name, attrs, ...children) {
  return (name === null) ? children : { attrs, children, name };
};

export default xTree;
