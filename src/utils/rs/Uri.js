import qs from 'qs';
import pathToRegExp from 'path-to-regexp';

const Uri = {};

/**
 * 获取url参数
 * @param key  参数名
 * @param defaultValue 默认值
 * @returns {null}
 */
Uri.Query = (key) => {
  const arr = window.location.href.split('?');
  if (arr.length <= 1) {
    return null;
  }
  arr.shift();
  const str = arr.join();
  const obj = qs.parse(str)
  return obj[key] === undefined ? null : obj[key];
};

/**
 * 匹配url
 * @param rule
 * @param pathname
 * @returns {Array|{index.less: number, input: string}}
 */
Uri.Match = (rule, pathname) => {
  const match = pathToRegExp(rule).exec(pathname);
  return match;
};

export default Uri;
