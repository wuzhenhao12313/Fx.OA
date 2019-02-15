import React, {PureComponent} from 'react';
import {Card, Steps, List, Button, message, Row, Col, Modal, Tag, Input, Form, Divider, Icon} from 'antd';
import {connect} from 'dva';
import classNames from 'classnames';
import {fetchApiSync} from '../../../utils/rs/Fetch';
import {createTree} from '../../../utils/utils';
import FxLayout from '../../../myComponents/Layout/';
import Component from '../../../utils/rs/Component';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import StandardTable from '../../../myComponents/Table/Standard';
import styles from './index.less';

const Step = Steps.Step;

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const formatter = {};
departmentList.forEach(department => {
  formatter[`${department['depID']}`] = department['depName'];
});


const modelNameSpace = 'assess-config';
const FormItem = Form.Item;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_assess_config')
export default class extends PureComponent {
  state = {}


  componentDidMount() {
    const {model} = this.props;
    model.call("getConfig");
    model.call("getRecordUserList");
  }

  renderForm() {
    const {config} = this.props[modelNameSpace];
    const {
      m_baseScoreRate, m_targetScoreRate, m_cooScoreRate, m_gmScoreRate, m_memberScoreRate
      , e_allRoundScoreRate, e_targetScoreRate, e_cooScoreRate, e_gmScoreRate, e_workingScoreRate
    } = config;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 20},
    }
    return (
      <div className={styles.assessConfig}>
        <div>
          <ConsoleTitle type='h2' title='部门经理分值比率'/>
          <Form className='ant-form-slim ant-form-label-left'>
            <FormItem label='基础评分' {...formItemLayout}>
              <Input value={m_baseScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='指标完成' {...formItemLayout}>
              <Input value={m_targetScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='运营总监考评' {...formItemLayout}>
              <Input value={m_cooScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='总经理考评' {...formItemLayout}>
              <Input value={m_gmScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='组员打分' {...formItemLayout}>
              <Input value={m_memberScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
          </Form>
        </div>
        <Divider/>
        <div>
          <ConsoleTitle type='h2' title='部门成员分值比率'/>
          <Form className='ant-form-slim ant-form-label-left'>
            <FormItem label='综合素质' {...formItemLayout}>
              <Input value={e_allRoundScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='指标完成' {...formItemLayout}>
              <Input value={e_targetScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='运营总监考评' {...formItemLayout}>
              <Input value={e_cooScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='部门经理考评' {...formItemLayout}>
              <Input value={e_gmScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
            <FormItem label='工作考评' {...formItemLayout}>
              <Input value={e_workingScoreRate * 100} addonAfter='%' style={{width: 100}}/>
            </FormItem>
          </Form>
        </div>
        <Divider/>
        {this.renderDepPanel()}
      </div>
    )
  }

  renderBody() {
    const {config} = this.props[modelNameSpace];
    const columns = [
      {
        title: '部门',
        dataIndex: 'depIDs',
        render: (text) => {
          text = text || '';
          return (
            <div>
              {
                text.toList().map(dep => {
                  return (
                    <Tag key={dep}>{formatter[dep]}</Tag>
                  )
                })
              }
            </div>
          )
        }
      },
      {
        title: '部门经理分值比率',
        dataIndex: 'manager',
        align: 'center',
        children: [
          {
            title: '指标1',
            dataIndex: 'm_baseScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标2',
            dataIndex: 'm_targetScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标3',
            dataIndex: 'm_cooScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标4',
            dataIndex: 'm_gmScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标5',
            dataIndex: 'm_memberScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
        ]
      },
      {
        title: '部门成员分值比率',
        dataIndex: 'employee',
        align: 'center',
        children: [
          {
            title: '指标1',
            dataIndex: 'e_allRoundScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标2',
            dataIndex: 'e_targetScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标3',
            dataIndex: 'e_cooScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标4',
            dataIndex: 'e_gmScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
          {
            title: '指标5',
            dataIndex: 'e_workingScoreRate',
            align: 'center',
            render: (text) => {
              return text * 100 + '%';
            }
          },
        ]
      }
    ];
    return (
      <div>
        <ConsoleTitle type='h2' title='部门考核分值比率'/>
        <StandardTable
          mode='simple'
          columns={columns}
          dataSource={config}
          rowKey={record => record.id}
          bordered={true}
        />
        <ConsoleTitle type='h2' title='部门考核人员'/>
        {this.renderRecordUserList()}
      </div>
    )
  }

  renderRecordUserList() {
    const {recordUserList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '姓名',
        dataIndex: 'userName',
      },
      {
        title: '部门',
        dataIndex: 'depIDs',
        render: (text) => {
          text = text || '';
          return (
            <div>
              {
                text.toList().map(dep => {
                  return (
                    <Tag key={dep}>{formatter[dep]}</Tag>
                  )
                })
              }
            </div>
          )
        }
      },
      {
        title: '部门经理评分项',
        dataIndex: 'manager',
        align: 'center',
        children: [
          {
            title: '指标1',
            dataIndex: 'm_baseScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标2',
            dataIndex: 'm_targetScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标3',
            dataIndex: 'm_cooScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标4',
            dataIndex: 'm_gmScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标5',
            dataIndex: 'm_memberScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
        ]
      },
      {
        title: '部门成员分值比率',
        dataIndex: 'employee',
        align: 'center',
        children: [
          {
            title: '指标1',
            dataIndex: 'e_allRoundScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标2',
            dataIndex: 'e_targetScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标3',
            dataIndex: 'e_cooScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标4',
            dataIndex: 'e_gmScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
          {
            title: '指标5',
            dataIndex: 'e_workingScore',
            align: 'center',
            render: (text) => {
              const list = text.toList();
              return (
                <div>
                  <span>查看</span>
                  <Icon type={list[0] === '1' ? 'check' : 'close'} style={{color:list[0] === '1'?'green':'red'}}/>
                  <span style={{marginLeft:10}}>编辑</span>
                  <Icon type={list[1] === '1' ? 'check' : 'close'} style={{color:list[1] === '1'?'green':'red'}}/>
                </div>
              );
            }
          },
        ]
      }
    ];
    return(
      <StandardTable
        mode='simple'
        columns={columns}
        dataSource={recordUserList}
        rowKey={record => record.id}
        bordered
      />
    )
  }

  renderDepPanel() {
    const {config} = this.props[modelNameSpace];
    const {depIDs} = config;
    let depList = depIDs ? depIDs.toList() : [];
    return (
      <div className={styles.depPanel}>
        <ConsoleTitle type='h2' title='考核部门列表'/>
        <Row>
          {depList.map(dep => {
            return (
              <Col span={6} style={{marginBottom: 8}}>
                <Tag>{formatter[dep]}</Tag>
              </Col>
            )
          })
          }
        </Row>
      </div>
    )
  }


  render() {
    const fxLayoutProps = {
      header: {
        title: '考核配置'
      },
      body: {
        center: this.renderBody(),
      },
    }
    return (
      <FxLayout
        {...fxLayoutProps}
      />
    )
  }
}
