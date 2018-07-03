import cloneDeep from 'lodash/cloneDeep';
import {IsArray} from '../rs/';
class _IQueryable {
  constructor(array) {
    array = IsArray(array) ? array : [];
    this.array = cloneDeep(array);
  }

  Where(expression) {
    this.array = this.array.filter(expression);
    return this;
  }

  OrderBy(orderColumn) {
    if (this.array.length === 0) {
      return this;
    }
    this.array = this.array.sort(function (a, b) {
      return a[orderColumn] - b[orderColumn];
    });
    return this;
  }

  OrderByDescending(orderColumn) {
    if (this.array.length === 0) {
      return this;
    }
    this.array = this.array.sort(function (a, b) {
      return b[orderColumn] - a[orderColumn];
    });
    return this;
  }

  First() {
    if (this.array.length === 0) {
      return null;
    }
    return this.array[0];
  }

  ToList() {
    return this.array;
  }
}

const IQueryable = (array) => {
  return new _IQueryable(array);
}

export{
  IQueryable,
}
