import React, {PureComponent} from 'react';
import {Card, Button, Spin} from 'antd';

const Fragment = React.Fragment;
const ButtonGroup = Button.Group;

export default class extends PureComponent {
  renderExtra() {
    const {onBack, onReload, showTitle} = this.props;
    return (
      <Fragment>
        {showTitle ?
          <ButtonGroup>
            {onBack ? <Button
              ghost
              type='dashed'
              onClick={onBack}
              icon="rollback"
            >返回</Button> : null}
            {onReload ? <Button
              ghost
              type='dashed'
              onClick={onReload}
              icon="reload"
            >刷新</Button> : null}
          </ButtonGroup> : null
        }
      </Fragment>
    );
  };

  render() {
    const {showTitle, title, style, loading} = this.props;
    const props = showTitle ? {
      title,
      extra: this.renderExtra(),
    } : {};
    return (
      <Card
        className="fx-view-card"
        bordered={false}
        style={style}
        {...props}
      >{loading ?
        <Spin spinning={loading}>
          {this.props.children}
        </Spin>
        : this.props.children
      }
      </Card>
    )
  }

}
