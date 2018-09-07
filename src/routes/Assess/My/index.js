import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Input, Form, Button, Card, Row, Col} from 'antd';
import {fetchApiSync, fetchDictSync} from '../../../utils/rs/Fetch';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import Component from "../../../utils/rs/Component";
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';

const modelNameSpace = "assess-my";
const Fragment = React.Fragment;
const FormItem = Form.Item;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_assess_my')
@Form.create()
export default class extends PureComponent {
  componentDidMount() {
    const {model} = this.props;
    model.call("getMyAssess");
  }

  updateManagerScore() {
    const {isDepManager, list} = this.props[modelNameSpace];
    const {validateFields} = this.props.form;
    const {model} = this.props;
    const {id, recordID} = list[0];
    validateFields((err, values) => {
      if (!err) {
        model.call("updateManager", {
          assessID: recordID,
          managerID: id,
          ...values,
        });
      }
    });
  }

  updateEmployeeScore() {
    const {list} = this.props[modelNameSpace];
    const {model} = this.props;
    model.call("updateEmployee", {
      employeeList: list,
    });
  }


  changeEditData = (record) => {
    const {key, value, index} = record;
    const {model} = this.props;
    const {list} = this.props[modelNameSpace];
    list[index][key] = !isNaN(value) ? value : null;
    model.setState({
      list,
    });
  }

  renderBody() {
    const {loading} = this.props;
    const {isDepManager, list = []} = this.props[modelNameSpace];
    console.log(list[0])
    const {getFieldDecorator} = this.props.form;
    const currentYear = (moment().format('M')) === "1" ? (moment().format('YYYY')) * 1 - 1 : (moment().format('YYYY')) * 1;
    const currentMonth = (moment().format('M')) === "1" ? "12" : ((moment().format('M')) * 1 - 1).toString();
    if (!isDepManager) {
      return (
        <div style={{padding:24}}>
        <Row>
          <Col span={8}>
            <Card bordered title={`当月考评-${currentYear}年${currentMonth}月`}
                  loading={loading.effects[`${modelNameSpace}/getMyAssess`]}>
              {list.length === 0 ? <div>暂无考评</div> : null}
              {list.length === 1 ?
                <div>
                  <Form>
                    <FormItem label='部门经理得分'>
                      {getFieldDecorator("score", {
                        initialValue: list[0].score,
                        rules: [
                          {required: true, message: '请输入得分'},
                          {pattern: /^[1-9]\d*$/, message: '只能输入数字'}
                        ],
                      })(
                        <Input addonBefore={list[0].userName}/>
                      )}
                    </FormItem>
                    <FormItem label='意见'>
                      {getFieldDecorator("memberRemark", {
                        initialValue: list[0].remark,
                        rules: [
                          {required: true, message: '请输入意见'},
                          {pattern: /^[\s\S]{2,200}$/, message: '输入长度需要在2到200之间'}
                        ],
                      })(
                        <Input.TextArea autosize={{minRows: 4}}/>
                      )}
                    </FormItem>
                    <FormItem>
                      <Button type='primary' icon='save' onClick={e => this.updateManagerScore()}>保存</Button>
                    </FormItem>
                  </Form>

                </div> : null
              }
            </Card>
          </Col>
        </Row>
       </div>
      )
    }

    const columns = [
      {
        title: '组员姓名',
        dataIndex: 'userName',
      },
      {
        title: '综合素质评分',
        dataIndex: 'allRoundScore',
        render: (text, row, index) => {
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.changeEditData({key: 'allRoundScore', value: e.target.value, index})}
            />
          )
        }
      },
      {
        title: '部门经理评分',
        dataIndex: 'gmScore',
        render: (text, row, index) => {
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.changeEditData({key: 'gmScore', value: e.target.value, index})}
            />
          )
        }
      },
      {
        title: '工作评分',
        dataIndex: 'workingScore',
        render: (text, row, index) => {
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.changeEditData({key: 'workingScore', value: e.target.value, index})}
            />
          )
        }
      }
    ];
    const actions = [
      {
        button: {
          type: 'primary',
          text: '保存',
          icon: 'save',
          onClick: () => this.updateEmployeeScore(),
        }
      }
    ]
    return (
      <div style={{padding:24}}>
        <Row gutter={24}>
          <Card
            bordered={true}
            title={`当月考评-${currentYear}年${currentMonth}月`}
            loading={loading.effects[`${modelNameSpace}/getMyAssess`]}>
            {list.length === 0 ?
              <Col span={8}>
                <div>暂无考评</div>
              </Col> : null}
            {
              list.length !== 0 ?
                <Col span={16}>
                  <StandardTable
                    actions={actions}
                    rowKey={record => record.id}
                    columns={columns}
                    bordered={true}
                    tools={null}
                    mode='simple'
                    dataSource={list}
                  /></Col> : null
            }
          </Card>
        </Row>
      </div>
    )
  }

  render() {
    const {loading} = this.props;
    const actions = [
      {
        button: {
          icon: "retweet",
          type: 'primary',
          text: '刷新',
          onClick: () => {
            const {model} = this.props;
            model.call("getMyAssess");
          },
          loading: loading.effects[`${modelNameSpace}/updateEmployee`],
        },
      },
    ];
    const fxLayoutProps = {
      header: {
        title: `我的考评`,
        actions,
      },
      body: {
        render: this.renderBody(),
      },
    }
    return (
      <Fragment>
        <div className='ant-layout-top-50'>
          <FxLayout
            {...fxLayoutProps}
          />
        </div>
      </Fragment>
    )
  }
}
