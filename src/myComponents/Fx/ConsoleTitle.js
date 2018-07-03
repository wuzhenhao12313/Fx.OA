import React, {PureComponent} from 'react';
import {Button} from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const Fragment = React.Fragment;

export default class extends React.Component {
  renderActions() {
    const {actions} = this.props;
    return (
      <div style={{marginRight: -10}}>
        {actions && actions.length > 0 ?
          <Fragment>
            {actions.map((tool, idx) => {
              let {isShow, render, button} = tool;
              isShow = isShow === undefined ? true : isShow;
              if (isShow) {
                return (
                  <div key={idx} style={{marginRight: 10, float: 'left'}}>
                    {render ? render() : <Button {...button}>{button.text}</Button>}
                  </div>
                )
              }
              return null;
            })}
          </Fragment> : null}
      </div>
    )
  }

  render() {
    const {bordered, title, left, actions, type = 'h1', titleSize, ...restProps} = this.props;
    return (
      <div
        className={classNames({
          [styles.consoleTitle]: true,
          [styles.consoleTitleBordered]: !!bordered,

          'console-title': true,
        })}
        {...restProps}
      >
        <div className="float-left">
          {title && type === 'h1' ? <h1 style={{fontSize: titleSize}}>{title}</h1> : null}
          {title && type === 'h2' ? <h2 style={{fontSize: titleSize}}>{title}</h2> :null}
          {title && type === 'h3' ? <h3 style={{fontSize: titleSize}}>{title}</h3> : null}
          {title && type === 'h4' ? <h4 style={{fontSize: titleSize}}>{title}</h4> : null}
          {title && type === 'h5' ? <h5 style={{fontSize: titleSize}}>{title}</h5> : null}
          {left ? left : null}
        </div>
        <div className="float-right">
          {this.renderActions()}
        </div>
      </div>
    )
  }
}
