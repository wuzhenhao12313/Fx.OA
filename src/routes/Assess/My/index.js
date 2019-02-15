import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Input, Form, Button, Card, Row, Col} from 'antd';
import {fetchApiSync, fetchDictSync} from '../../../utils/rs/Fetch';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import InLineForm from '../../../myComponents/Form/InLine';
import Component from "../../../utils/rs/Component";
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import YearSelect from '../../../myComponents/Select/Year';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import EditModal from "../../../myComponents/Fx/EditModal";

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
  state = {
    modalProps: {
      visible: false,
      row: {},
    }
  }

  componentDidMount() {
    this.getMyAssess();
  }

  getMyAssess = () => {
    const {model} = this.props;
    if (this.ref.searchForm) {
      const {getFieldsValue} = this.ref.searchForm.props.form;
      model.call("getMyAssess", {
        ...getFieldsValue(),
      });
    }
  }


  ref = {
    searchForm: null,
    modalForm:{},
  }

  updateManagerScore=()=> {
    const {row} = this.state.modalProps;
    const {getFieldsValue} = this.ref.modalForm.props.form;
    const {model} = this.props;
    const {id, recordID} = row;
    model.call("updateManager", {
      assessID: recordID,
      managerID: id,
      ...getFieldsValue(),
    }).then(success=>{
      if(success){
        this.getMyAssess();
        this.setState({modalProps:{visible:false}});
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

  renderModal() {
    const {visible, row} = this.state.modalProps;
    const item = [
      {
        label: '部门经理得分',
        key: 'score',
        initialValue: row.score,
        rules: [
          {required: true, message: '请输入得分'},
          {pattern: /^[1-9]\d*$/, message: '只能输入数字'}
        ],
        render: () => {
          return (
            <Input addonBefore={row.userName}/>
          )
        }
      },
      {
        label: '意见',
        key: 'memberRemark',
        initialValue: row.remark,
        rules: [
          {required: true, message: '请输入意见'},
          {pattern: /^[\s\S]{2,200}$/, message: '输入长度需要在2到200之间'}
        ],
        render: () => {
          return (
            <Input.TextArea autosize={{minRows: 4}}/>
          )
        }
      }
    ];
    return (
      <EditModal
        labelCol={6}
        visible={visible}
        title='评分'
        onCancel={e => this.setState({modalProps: {visible: false}})}
        footer={true}
        item={item}
        onOk={this.updateManagerScore}
        refForm={node=>this.ref.modalForm=node}
      />
    )
  }

  renderBody() {
    const {loading} = this.props;
    const {isDepManager, list = [],type} = this.props[modelNameSpace];
    const currentYear = (moment().format('M')) === "1" ? (moment().format('YYYY')) * 1 - 1 : (moment().format('YYYY')) * 1;
    const currentMonth = (moment().format('M')) === "1" ? 12 : ((moment().format('M')) * 1 - 1) * 1;
    const item = [
      {
        key: 'year',
        label: '考评年份',
        initialValue: currentYear,
        render: () => {
          return (<YearSelect style={{width: 100}}/>)
        }
      },
      {
        key: 'month',
        label: '考评月份',
        initialValue: currentMonth,
        render: () => {
          return (<AutoSelect typeCode='month' style={{width: 100}}/>)
        }
      },
      {
        key: 'search',
        label: '',
        render: () => {
          return <Button type='dashed' icon='search' onClick={e => this.getMyAssess()}>搜索</Button>
        }
      },
      {
        key: 'save',
        label: '',
        isShow:isDepManager,
        render: () => {
          return <Button type='primary'  icon='save' onClick={e => this.updateEmployeeScore()}>保存</Button>
        }
      }
    ];
    const managerColumns = [
      {
        title: '部门经理',
        dataIndex: 'userName',
      },
      {
        title: '年份',
        dataIndex: 'year',
      },
      {
        title: '月份',
        dataIndex: 'month',
        render: (text) => {
          return `${text < 10 ? 0 : ''}${text}`;
        }
      },
      {
        title: '得分',
        dataIndex: 'score',
      },
      {
        title: '意见',
        dataIndex: 'remark',
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          if (row.year !== currentYear || row.month !== currentMonth) {
            return null;
          }
          return (<a onClick={e=>this.setState({modalProps:{visible:true,row}})}>评分</a>)
        }
      }
    ];
    const employeeColumns = [
      {
        title: '组员姓名',
        dataIndex: 'userName',
      },
      {
        title: '年份',
        dataIndex: 'year',
      },
      {
        title: '月份',
        dataIndex: 'month',
        render: (text) => {
          return `${text < 10 ? 0 : ''}${text}`;
        }
      },
      {
        title: type===2?'工作经验&能力':'工作态度',
        dataIndex: 'targetScore',
        render: (text, row, index) => {
          if(currentYear!==row.year||currentMonth!==row.month){
            return text;
          }
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.changeEditData({key: 'targetScore', value: e.target.value, index})}
            />
          )
        }
      },
      {
        title: type===2?'绩效目标得分':'执行力',
        dataIndex: 'cooScore',
        render: (text, row, index) => {
          if(currentYear!==row.year||currentMonth!==row.month){
            return text;
          }
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.changeEditData({key: 'cooScore', value: e.target.value, index})}
            />
          )
        }
      },
      {
        title: type===2?'工作质量&效率':'工作效率',
        dataIndex: 'gmScore',
        render: (text, row, index) => {
          if(currentYear!==row.year||currentMonth!==row.month){
            return text;
          }
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
        title: type===2?'工作态度':'工作质量',
        dataIndex: 'workingScore',
        render: (text, row, index) => {
          if(currentYear!==row.year||currentMonth!==row.month){
            return text;
          }
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
    return (
      <div style={{padding: 24}}>
        <InLineForm
          item={item}
          style={{marginBottom: 16}}
          wrappedComponentRef={node => this.ref.searchForm = node}/>
        {!isDepManager ?
          <div>
            <StandardTable
              columns={managerColumns}
              rowKey={record => record.id}
              dataSource={list}
              loading={loading.effects[`${modelNameSpace}/getMyAssess`]}
            />
          </div> :
          <div>
            <StandardTable
              rowKey={record => record.id}
              columns={employeeColumns}
              bordered={true}
              dataSource={list}
            />
          </div>
        }
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
      pageHeader: {
        title: '我的考评'
      },
      body: {
        render: this.renderBody(),
      },
    }
    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.modalProps.visible?this.renderModal():null}
      </Fragment>
    )
  }
}
