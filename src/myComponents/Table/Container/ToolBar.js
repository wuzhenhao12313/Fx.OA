import React, {PureComponent} from 'react';
import {Button, Form} from 'antd';
import styles from './ToolBar.less';

const FormItem = Form.Item;

export default class extends PureComponent {
  render() {
    const {tools} = this.props;
    const {tools: {layout = 'left', action,}} = this.props;
    return (
      <div className={styles.titleBar}>
        {tools ?
          <div className={layout === 'left' ? styles.toolLeft : styles.toolRight}>
            <Form layout="inline">
            {action.map((tool, idx) => {
              let {isShow, render, button} = tool;
              isShow = isShow === undefined ? true : isShow;
              if (isShow) {
                return (
                  <FormItem key={idx}>
                    {render ? render() : null}
                    {button ? <Button {...button}>{tool.text}</Button> : null}
                  </FormItem>
                )
              }
              return null;
            })}
          </Form>
          </div> : null}
      </div>
    )
  }
}


