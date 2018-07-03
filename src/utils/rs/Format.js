import numeral from 'numeral';
import moment from 'moment';

function zero(num) {
  let str = '';
  for (let i = 0; i < num; i += 1) {
    str += '0';
  }
  return str;
};

const Format = {};

Format.Money = {
  /**
   * 格式化人民币
   * @param value
   * @param num
   * @returns {string}
   * @constructor
   */
  Rmb: (value, num) => {
    return `¥ ${numeral(value).format(`0,0.${zero(num || 2)}`)}`;
  },
  /**
   * 格式化美元
   * @param value
   * @param num
   * @returns {*}
   * @constructor
   */
  Dollar: (value, num) => {
    return numeral(value).format(`$ 0,0.${zero(num || 2)}`);
  }
};

Format.Number = {
  /**
   * 格式化数字逗号分隔
   * @param value
   * @param num
   * @returns {*}
   * @constructor
   */
  Fix: (value, num) => {
    num = num || 0;
    if (num === 0) {
      return numeral(value).format(`0,0`);
    }
    return numeral(value).format(`0,0.${zero(num || 0)}`);
  }
};

Format.Date = {
  /**
   * 格式化时间
   * @param dateObj
   * @param format
   * @returns {string}
   * @constructor
   */
  Format: (dateObj, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!dateObj) {
      return null;
    }
    return moment(dateObj).format(format);
  },
};


export default Format;
