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
    const {action = [], more, ...restProps} = this.props;
    const length = action.filter(x => x.isShow === undefined ? true : x.isShow).length;
    return (
      <div>
        {action && action.filter(x => x.isShow === undefined ? true : x.isShow).map((child, idx) => {
          return this.renderWrap(child, idx, !(length - 1 === idx&&!more));
        })
        }
        {more ? <MoreBtn items={more} {...restProps}/> : null}
      </div>
    );
  }
}
