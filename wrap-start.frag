// wrap-start.frag.js
(function (root, factory) {
  if (typeof define === 'function') {
  var requacity = {
  define: define
  };
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.tenacity = factory();
  }
}(this, function () {