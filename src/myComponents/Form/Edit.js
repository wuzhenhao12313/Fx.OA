import React, {PureComponent} from 'react';
import {Form, Button, Popconfirm} from 'antd';

const FormItem = Form.Item;
const Fragment=React.Fragment;

@Form.create()
export default class extends React.Component {

  submit = () => {
    const {form, onSubmit} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSubmit(fieldsValue);
    });
  }

  getFormLayout = (label) => {
    const {labelCol = 4, wrapperCol,} = this.props;
    const formItemLayout = {
      labelCol: {span: labelCol},
      wrapperCol: wrapperCol ? {span: wrapperCol} : label ? {span: 24 - labelCol} : 24,
    };
    return formItemLayout;
  }

  resetForm = () => {
    const {form} = this.props;
    form.resetFields();
  }

  render() {
    const {form: {getFieldDecorator}, item, onSubmit, submitButton, labelCol = 4, wrapperCol, reset, ref} = this.props;
    const _ref = ref ? {ref} : {};
    const buttonLayout = {
      wrapperCol: {span: 24 - labelCol, offset: labelCol},
    }
    return (
      <Form layout="horizontal" className="ant-form-edit" {..._ref}>
        {item.map(i => {
          let {key, label, isShow, value, initialValue, hasFeedback, config,children, ...restProps} = i;
          isShow = isShow === undefined ? true : isShow;
          if (isShow) {
            return (
              <FormItem
                key={key}
                label={label}
                hasFeedback={!!hasFeedback}
                {...this.getFormLayout(label)}
              >
                {children?children:
                  <Fragment>
                   {getFieldDecorator(key, {
                      initialValue: value || initialValue,
                      ...config,
                      ...restProps,
                    }
                  )(i.render())}
                </Fragment>}
              </FormItem>
            )
          }
          return null;
        })}
        {
          onSubmit ?
            <FormItem
              {...buttonLayout}
            >
              <Button type='primary' icon="save" style={{marginRight: 10}} {...submitButton}
                      onClick={e => this.submit()}>
                {submitButton && submitButton.text ? submitButton.text : '保存'}
              </Button>
              {/*{reset ?*/}
              {/*<Popconfirm*/}
              {/*placement="top"*/}
              {/*title={'确定要重置吗，操作后将无法撤回。'}*/}
              {/*onConfirm={e => this.resetForm()}>*/}
              {/*<Button icon="reload">重置</Button>*/}
              {/*</Popconfirm>*/}
              {/*: null*/}
              {/*}*/}
            </FormItem> : null
        }
      </Form>
    );
  }
}
