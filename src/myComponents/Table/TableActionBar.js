import React, {PureComponent} from 'react';
import {Divider, Popconfirm} from 'antd';
import MoreBtn from '../Fx/MoreBtn';

const Fragment = React.Fragment;

export default class extends React.Component {
  renderWrap(child, idx, divider) {
    const {href, target, submit} = child;
    const linkProps = href ? {href, target} : {onClick: submit};
    return (
      <Fragment key={idx}>
        {child.pop ?
          <Popconfirm
            placement="left"
            title={'确定要删除吗，操作后将无法撤回。'}
            onConfirm={e => child.submit()}
            {...child.pop}
          >
            <a>{child.label}</a>
          </Popconfirm> : <a {...linkProps}>{child.label}</a>
        }
        {divider ? <Divider type="vertical"/> : null}
      </Fragment>
    )
  }

  render() {
    const {action=[], more,...restProps} = this.props;
    const length = action.length;
    return (
      <div>
        {action&&action.map((child, idx) => {
          let {isShow} = child;
          isShow = isShow === undefined ? true : isShow;
          if (isShow) {
            if (length - 1 === idx) {
              if (more) {
                return this.renderWrap(child, idx, true);
              }
              return this.renderWrap(child, idx, false);
            }
            return this.renderWrap(child, idx, true);
          }
        })
        }
        {more ? <MoreBtn items={more} {...restProps}/> : null}
      </div>
    );
  }
}
