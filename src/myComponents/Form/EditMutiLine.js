import React, {PureComponent} from 'react';
import {Form, Button, Popconfirm, Row, Col} from 'antd';

const FormItem = Form.Item;

@Form.create()
export default class extends React.Component {

  submit = () => {
    const {form, onSubmit} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSubmit(fieldsValue);
    });
  }

  resetForm = () => {
    const {form} = this.props;
    form.resetFields();
  }


  getRow(row, idx) {
    const {form: {getFieldDecorator}} = this.props;
    return (
      <Row key={idx} gutter={16}>
        {row.map((i) => {
          const {config, span} = i;
          return (
            <Col key={i.key} span={span ? span : 24 / row.length}>
              <FormItem key={i.key} label={i.label}>
                {getFieldDecorator(i.key,
                  {
                    initialValue: i.value,
                    ...config,
                  })(i.render())}
              </FormItem>
            </Col>
          );
        })}
      </Row>
    );
  }

  render() {
    const {item, onSubmit, reset, ref} = this.props;
    const _ref = ref ? {ref} : {};
    return (
      <Form layout="vertical" {..._ref} className='ant-form-8'>
        {item.map((row, index) => {
          return this.getRow(row, index);
        })}
        {
          onSubmit ?
            <Row>
              <FormItem
              >
                <Button type='primary' icon="save" style={{marginRight: 10}} onClick={e => this.submit()}>保存</Button>
                {reset ?
                  <Popconfirm
                    placement="top"
                    title={'确定要重置吗，操作后将无法撤回。'}
                    onConfirm={e => this.resetForm()}>
                    <Button icon="reload">重置</Button>
                  </Popconfirm>
                  : null
                }
              </FormItem></Row> : null
        }
      </Form>
    );
  }
}
