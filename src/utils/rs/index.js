const IsArray = function (ary) {
  return Object.prototype.toString.call(ary) == '[object Array]';
}

export {
  IsArray,
}

