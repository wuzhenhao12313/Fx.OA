String.prototype.IsEmpty = function () {
  if (this === '' || this === null || this === undefined) {
    return true;
  }
  return false;
}

String.prototype.ToObject = function () {
  if (this === undefined || this === null) {
    return null;
  }
  return JSON.parse(this);
}

String.prototype.ToList = function (sep = ',') {
  if (this === '' || this === null || this === undefined) {
    return [];
  }
  return this.split(sep);
}

String.prototype.ToInt = function () {
  return parseInt(this);
}


String.prototype.isEmpty = function () {
  if (this === '' || this === null || this === undefined) {
    return true;
  }
  return false;
}

String.prototype.toObject = function () {
  if (this === undefined || this === null) {
    return null;
  }
  return JSON.parse(this);
}

String.prototype.toList = function (sep = ',') {
  if (this === '' || this === null || this === undefined) {
    return [];
  }
  return this.split(sep);
}

String.prototype.toInt = function () {
  return parseInt(this);
}


Array.prototype.contains = function (key) {
  if (this.indexOf(key) !== -1) {
    return true;
  }
  return false;
}

Array.prototype.remove = function (index) {
  this.splice(index, 1);
}
