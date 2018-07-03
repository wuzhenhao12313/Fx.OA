import React, {PureComponent} from 'react';
import {Card, Steps, List, Button, message, Row, Col, Modal, Tag, Input, Form, Divider, Badge, Alert} from 'antd';
import {connect} from 'dva';
import classNames from 'classnames';
import {fetchApiSync} from '../../../utils/rs/Fetch';
import {formatDate} from '../../../utils/utils';
import moment from 'moment';
import FxLayout from '../../../myComponents/Layout/';
import Component from '../../../utils/rs/Component';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditForm from '../../../myComponents/Form/Edit';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import LoadingService from '../../../utils/rs/LoadingService';

const Fragment = React.Fragment;
const modelNameSpace = "recruit";
const TextArea = Input.TextArea;
const FormItem=Form.Item;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_hr_recruit')
@Component.Pagination({model: modelNameSpace})
@Form.create()
export default class extends PureComponent {

  state = {
    modal: {
      visible: false,
      record: {},
      index: -1,
      isAdd: false,
    }
  };

  getList = (page) => {

  }


  renderModal() {
    const {modal: {visible, record = {}}} = this.state;
    const {name, mobile, email} = record;
    const {form: {getFieldDecorator}} = this.props;
    return (
      <StandardModal
        visible={visible}
        title='编辑'
        width={600}
        onCancel={e => this.setState({modal: {visible: false}})}
      >
        <Form layout='vertical' className="ant-form-slim">
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label='姓名'>
                {getFieldDecorator('name', {
                  rules: [
                    {required: true, message: '请输入姓名!', type: 'string'},
                  ],
                  initialValue: name,
                })(
                  <Input placeholder="请输入姓名!"/>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='手机'>
                {getFieldDecorator('mobile', {
                  rules: [
                    {required: true, message: '请输入手机号!', type: 'string'},
                  ],
                  initialValue: mobile,
                })(
                  <Input placeholder="请输入手机号!"/>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='邮箱'>
                {getFieldDecorator('email', {
                  initialValue: email,
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col></Col>
            <Col></Col>
            <Col></Col>
          </Row>
        </Form>
      </StandardModal>
    )
  }

  renderBody() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '手机',
        dataIndex: 'mobile',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
      },
      {
        title: '渠道',
        dataIndex: 'recruitChannel',
      },
      {
        title: '面试岗位',
        dataIndex: 'position',
      },
      {
        title: '预约面试时间',
        dataIndex: 'orderDate'
      }
      ,
      {
        title: '是否已面试',
        dataIndex: 'isInterview',
      },
      {
        title: '面试时间',
        dataIndex: 'interviewDate',
      }, {
        title: '复试人员',
        dataIndex: 'reexamineUserName',
      },
      {
        title: '是否通过',
        dataIndex: 'isPass',
      },
      {
        title: '具体理由',
        dataIndex: 'reason',
      }, {
        title: '分配小组',
        dataIndex: 'depID',
      },
      {
        title: '入职日期',
        dataIndex: 'entryDate',
      }, {
        title: '入职情况跟进',
        dataIndex: 'entryCondition',
      },
      {
        title: '性格测试结果',
        dataIndex: 'FPA',
      }

    ];
    const {data: {list}, pageIndex,} = this.props[modelNameSpace];
    const actions = [
      {
        button: {
          type: 'primary',
          text: '登记',
          icon: 'plus',
          onClick:()=>{
            this.setState({
              modal:{
                visible:true,
                isAdd:true,
                index:-1,
                record:{},
              }
            })
          }
        }
      }
    ]
    return (
      <div>
        <StandardTable
          actions={actions}
          mode='simple'
          tools={['export']}
          dataSource={list}
          columns={columns}
        />
      </div>
    )
  }

  render() {
    const {loading, pagination} = this.props;
    const {data: {total}, pageIndex,} = this.props[modelNameSpace];
    const fxLayoutProps = {
      header: {
        title: '招聘登记列表',
        actions: [
          {
            button: {
              type: 'primary',
              text: '刷新',
              icon: 'retweet',
              onClick: e => this.getList(),
            }
          }

        ]
      },
      body: {
        center: this.renderBody(),
        loading: loading.effects[`${modelNameSpace}/get`],
      },
      footer: {
        pagination: pagination({total, pageIndex}, this.getList),
      }
    }

    return (
      <Fragment>
        <FxLayout  {...fxLayoutProps}/>
        {this.state.modal.visible?this.renderModal():null}
      </Fragment>
    )
  }
}
