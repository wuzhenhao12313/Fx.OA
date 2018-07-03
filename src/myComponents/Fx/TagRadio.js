import React, {PureComponent} from 'react';
import {Tag} from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const Fragment = React.Fragment;

export default class extends React.Component {
  render() {
    let {options, onSelect, current, mode, ...restProps} = this.props;
    options = options || [];
    if (mode === 'ant-tag') {
      return (
        <Fragment>
          {options.length > 0 ?
            <div className={classNames(styles.antTagRadio, styles.tagRadio)} {...restProps}>
              <div className={styles.radioNav}>
                {options.map(x => {
                  return <Tag className={classNames(
                    {
                      [styles.radioNavItem]: true,
                      [styles.tagItem]: true,
                      [styles.tagItemSelected]: current === x.key,
                    }
                  )} key={x.key} onClick={e => onSelect({key: x.key, value: x.value})}>{x.title}</Tag>
                })}</div>
            </div> : null
          }
        </Fragment>
      )
    }

    return (
      <div className={styles.tagRadio} {...restProps}>
        <ul className={styles.radioNav}>
          {options.map(option => {
            const {value, label} = option;
            return <li className={classNames({
              [styles.radioNavItem]: true,
              [styles.selected]: current === value,
            })} key={value} onClick={e => onSelect(current === value ? null : value)}><a>{label}</a></li>
          })}
        </ul>
      </div>
    )
  }
}
