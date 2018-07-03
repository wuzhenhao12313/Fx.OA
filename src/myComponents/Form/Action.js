import React, {PureComponent} from 'react';
import {Form,Button} from 'antd';

const FormItem = Form.Item;
const Fragment = React.Fragment;

export default class extends React.Component {
  render() {
    const {actions} = this.props;
    return (
      <Fragment>
        {actions && actions.length > 0 ?
          <Form layout="inline" style={{marginBottom: 3}}>
            {actions.map((tool, idx) => {
              let {isShow, render, button} = tool;
              isShow = isShow === undefined ? true : isShow;
              if (isShow) {
                return (
                  <FormItem key={idx}>
                    {render ? render() : null}
                    {button ? <Button {...button}>{button.text}</Button> : null}
                  </FormItem>
                )
              }
              return null;
            })}
          </Form> : null}
      </Fragment>
    )
  }
}


