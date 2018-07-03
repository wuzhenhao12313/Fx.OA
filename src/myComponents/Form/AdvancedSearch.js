import React from 'react';
import {Row, Col, Form, Input, Button} from 'antd';
import {IsArray} from '../../utils/rs/Util';

const FormItem = Form.Item;
const Fragment = React.Fragment;

export default class extends React.Component {

  filterKeys = {};

  renderColItem(item, index) {
    const formLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };
    const {label, key, render,span,...restProps} = item;
    const {getFieldDecorator} = this.props.form;
    if (item === 'split') {
      return (
        <Col span={2} key={index}>
          <FormItem {...formLayout}>
            <span>-</span>
          </FormItem>
        </Col>
      )
    }
    if (key) {
      this.filterKeys[key] = null;
    }
    return (
      <Col span={span} key={index}>
        <FormItem {...formLayout} label={label}>
          {key ? getFieldDecorator(key, {...restProps})(
            render && render()
          ) : render && render()}
        </FormItem>
      </Col>
    )
  }

  render() {
    const {formItem, reset,onSearch} = this.props;
    const formLayout = {
      wrapperCol: {span: 18, offset: 6},
    }
    return (
      <Form>
        <Row gutter={24}>
          {formItem.map((item, index) => {
            if (!IsArray(item)) {
              item = [item];
            }
            return (
              <Col span={8} key={index}>
                <Row>
                  {item.map((_item, _index) => {
                    return (
                      this.renderColItem(_item, _index)
                    )
                  })}
                </Row>
              </Col>
            )
          })}
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem {...formLayout} label=''>
              <Button type="primary" style={{marginRight: 8}} onClick={e=>onSearch()}>搜索</Button>
              <Button className="ant-btn-default" type="default" onClick={e => reset(this.filterKeys)}>重置</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}
