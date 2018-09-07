import React, {PureComponent} from 'react';
import {
  Icon,
  Menu,
  Dropdown,
  Popconfirm,
} from 'antd';

export default class extends React.Component {
  render() {
    const { items, text = '更多', type = 'drop', customMore } = this.props;
    if (!items) {
      return null;
    }
    if (items.length === 0) {
      return null;
    }
    const menu = (
      <Menu>
        {items.map((item, idx) => {
          let {isShow} = item;
          isShow = isShow === undefined ? true : isShow;
          if (isShow) {
            if (item.pop) {
              return (
                <Menu.Item key={idx}>
                  <Popconfirm
                    placement="left"
                    title={'确定要删除吗，操作后将无法撤回。'}
                    onConfirm={e => item.submit()}
                    {...item.pop}>
                    <a>{item.label}</a>
                  </Popconfirm>
                </Menu.Item>
              );
            }
            return (
              <Menu.Item key={idx}>
                <a onClick={e => item.submit()}>{item.label}</a>
              </Menu.Item>
            );
          }
        })}
      </Menu>
    );
    let content;
    if (type === 'drop') {
      content = (
        <a style={{width: 40, display: 'inline-block'}}>
          {text}<Icon type="down"/>
        </a>
      );
    } else if (type === 'ellipsis') {
      content = (
        <a>...</a>
      );
    } else if (type ==='custom') {
      content=customMore;
    }
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        {content}
      </Dropdown>
    );
  }
}
