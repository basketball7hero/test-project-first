require('@testing-library/jest-dom');

Object.defineProperty(global, 'TextEncoder', {
  value: function () {
    this.encode = function (arg) {
      return arg;
    }
  },
});
