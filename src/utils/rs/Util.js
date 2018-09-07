import {IQueryable} from '../rs/Linq';

const IsArray = function (ary) {
  return Object.prototype.toString.call(ary) == '[object Array]';
}

function createRowSpan(list, index, column, value) {
  const obj = {
    children: value,
    props: {},
  };
  const _list = IQueryable(list).ToList();
  const valueList = [];
  _list.forEach((x, idx) => {
    if (x[column] === value) {
      valueList.push(idx);
    }
  });
  if (index === valueList[0]) {
    obj.props.rowSpan = valueList.length;
  } else {
    obj.props.rowSpan = 0;
  }
  return obj;
}

function authShow({auth, text}) {
  return auth ? text : '******';
}

function expandChildrenFromObj(obj) {
  let array = [];
  array.push(obj);
  const {children} = obj;
  if (children) {
    children.forEach(child => {
      array = array.concat(expandChildrenFromObj(child));
    });
  }
  return array;
}

function treeToObj(data) {
  const _data = IQueryable(data);
  let array = [];
  _data.ToList().forEach(item => {
    array = array.concat(expandChildrenFromObj(item));
  });
  return array;
}

export function uuid(len = 8, radix = 16) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

/**
 * 数组洗牌
 * @param arr
 * @returns {*}
 */
export function shuffle(arr) {
  var len = arr.length;
  for (var i = 0; i < len - 1; i++) {
    var idx = Math.floor(Math.random() * (len - i));
    var temp = arr[idx];
    arr[idx] = arr[len - i - 1];
    arr[len - i - 1] = temp;
  }
  return arr;
}

/**
 * 数字转换字母 0 对应 A
 * @param num
 * @returns {string}
 */
export function changeNum2Letter(num) {
  return String.fromCharCode(65 + num);
}

const string = {};
string.IsNullOrEmpty = function (str) {
  if (str === null || str === '' || str === undefined) {
    return true;
  }
  return false;
}

export {
  IsArray,
  string as String,
  createRowSpan,
  authShow,
  treeToObj,
};

