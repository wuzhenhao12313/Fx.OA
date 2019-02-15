import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  message,
  Progress,
  Button,
  Input,
  Badge,
  Modal,
  Drawer,
  InputNumber,
  Icon,
  Select,
  Tabs,
  Card,
  Row,
  Col,
  Divider,
  Collapse,
  List,
  Steps,
  Form,
  Switch,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import cloneDeep from 'lodash/cloneDeep';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import SearchForm from '../../../myComponents/Form/Search';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import style from './index.less';
import StandardDatePicker from "../../../myComponents/Date/StandardDatePicker";

const modelNameSpace = "assess-config";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Step = Steps.Step;

const departmentData = fetchApiSync({url: '/Department/Get',});
console.log(departmentData)
const departmentList = departmentData.data.toObject().list.toObject();
const formatter = {
  department: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_assess_user')
@Form.create()
export default class extends PureComponent {

  state = {
    currentDep: 0,
    depList: [],
    settingModalProps:{
      visible:false,
      row:{},
      index:-1,
      isSet:false,
    }
  }

  ref={
    settingForm:{},
  };

  componentDidMount() {
    var depList = departmentList.filter(x => x.isBusiness === 1).sort((x, y) => {
      return (x.showIndex - y.showIndex);
    });
    this.setState({
      depList,
      currentDep: depList[0].depID,
    }, () => this.getList());
  }

  getList = () => {
    const {model} = this.props;
    const {currentDep} = this.state;
    model.call('getUserConfig', {
      depID: currentDep,
    });
  };

  openSettingModal=(row,index)=>{
    const {model}=this.props;
    model.call('getConfigByUserID',{
      userID:row.userID,
    }).then(res=>{
      const {currentConfig}=this.props[modelNameSpace];
      this.setState({
        settingModalProps:{
          visible:true,
          row,
          index,
          isSet:!!currentConfig,
        }
      });
    });
  };

  setConfig=()=> {
    const {row} = this.state.settingModalProps;
    const {userID} = row;
    const {model} = this.props;
    const {getFieldsValue} = this.ref.settingForm.props.form;
    const {isProfit,isExtension}=getFieldsValue();
    model.call("setConfig",{
      userID,
      isProfit:isProfit?1:0,
      isExtension:isExtension?1:0,
    }).then(()=>{
      this.getList();
      this.setState({
        settingModalProps:{visible:false},
      });
    });
  };

  renderSettingModal(){
    const {visible,isSet}=this.state.settingModalProps;
    const {currentConfig}=this.props[modelNameSpace];
    const item=[
      {
        key:'isProfit',
        label:'是否盈利',
        initialValue:isSet?!!currentConfig.isProfit:true,
        valuePropName:'checked',
        render:()=>{
          return <Switch />
        }
      },
      {
        key:'isExtension',
        label:'是否是推广人员',
        valuePropName:'checked',
        initialValue:isSet?!!currentConfig.isExtension:false,
        render:()=>{
          return <Switch />
        }
      },
    ];
    return(
      <EditModal
        visible={visible}
        title='设置'
        onCancel={e=>this.setState({settingModalProps:{visible:false}})}
        item={item}
        refForm={node=>this.ref.settingForm=node}
        labelCol={6}
        footer={true}
        onOk={this.setConfig}
      />
    )
  }

  renderSearchForm() {
    return (
      <div></div>
    )
  }

  getScoreRate=(row)=>{
    const {assessUserList}=this.props[modelNameSpace];
    let allScore=0;
    assessUserList.forEach(x=>{
      const _workMonth=moment().startOf('month').diff(moment(x.entryDate), 'month');
      if((x.workStatus==='working'||(x.workStatus==='waiting-quit'
        &&moment().startOf('month')>=moment(x.correctionDate)))
        &&x.isProfit&&moment().startOf('month')>=moment(x.correctionDate)){
        allScore+=(_workMonth >= 10 ? 1 : formatNumber(_workMonth * 0.1, 1))*1 + (x.positionLevel?x.positionLevel.substring(1, 2) * 1:0);
      }
    });
    const {entryDate,workStatus,correctionDate,isProfit} = row;
    if((workStatus==='working'||(workStatus==='waiting-quit'
        &&moment().startOf('month')>=moment(correctionDate)))
        &&isProfit&&moment().startOf('month')>=moment(correctionDate)){
      const workMonth = moment().startOf('month').diff(moment(entryDate), 'month');
      let score= (workMonth >= 10 ? 1 : formatNumber(workMonth * 0.1, 1))*1 + (row.positionLevel?row.positionLevel.substring(1, 2) * 1:0);
      return `${formatNumber((score/allScore)*100,2)}%`;
    }else {
      return "不参与统计";
    }
  }

  renderTable() {
    const {loading} = this.props;
    const {depList, currentDep} = this.state;
    const {assessUserList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
      },
      {
        title: '入职时间',
        dataIndex: 'entryDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD');
        }
      },
      {
        title: '转正时间',
        dataIndex: 'correctionDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD');
        }
      },
      {
        title: '工龄',
        dataIndex: 'workMonth',
        render: (text, row) => {
          const {entryDate} = row;
          return moment().startOf('month').diff(moment(entryDate), 'month');
        }
      },
      {
        title: '职级',
        dataIndex: 'positionLevel',
      },
      {
        title: '工分',
        dataIndex: 'workMonthScore',
        render: (text, row) => {
          const {entryDate} = row;
          const workMonth = moment().startOf('month').diff(moment(entryDate), 'month');
          return workMonth >= 10 ? 1 : formatNumber(workMonth * 0.1, 1);
        }
      },
      {
        title: '职分',
        dataIndex: 'positionLevelScore',
        render: (text, row) => {
          if(!row.positionLevel){
            return 0;
          }
          return row.positionLevel.substring(1, 2);
        }
      },
      {
        title:'状态',
        dataIndex:'workStatus',
        render:(text,row)=>{
          const {correctionDate}=row;
          if(text==='working'){
            return "转正";
          }
          if(text==='trial'){
            return '试用'
          }
          if(text==='waiting-quit'){
            if(moment().startOf('month')>moment(correctionDate)){
              return "转正";
            }else {
              return "试用";
            }
          }
        }
      },
      {
        title:'盈利节点',
        dataIndex:'isProfit',
        render:(text)=>{
          return text===null?"未设置":text===1?'是':'否'
        }
      },
      {
        title:'是否为推广',
        dataIndex:'isExtension',
        render:(text)=>{
          return text===null?"未设置":text===1?'是':'否';
        }
      },
      {
        title:'截止日期',
        dataIndex:'endDate',
        render:()=>{
          return moment().startOf('month').format('YYYY-MM-DD');
        }
      },
      {
        title: '工职得分',
        dataIndex: 'score',
        render: (text, row) => {
          const {entryDate} = row;
          const workMonth = moment().startOf('month').diff(moment(entryDate), 'month');
          return (workMonth >= 10 ? 1 : formatNumber(workMonth * 0.1, 1))*1 + (row.positionLevel?row.positionLevel.substring(1, 2) * 1:0);
        }
      },
      {
        title:'工职得分占比',
        dataIndex:'scoreRate',
        render:(text,row)=>{
          return this.getScoreRate(row);
        }
      },
      {
        title:'操作',
        dataIndex:'op',
        render:(text,row,index)=>{
          return <a onClick={e=>this.openSettingModal(row,index)}>设置</a>
        }
      }
    ];
    return (
      <div>
        <Tabs type='card' activeKey={currentDep.toString()}
              onChange={currentDep => this.setState({currentDep: currentDep.toInt()}, this.getList)}>
          {depList.map(x => {
            return (<TabPane tab={x.depName} key={x.depID.toString()}/>)
          })}
        </Tabs>
        <StandardTable
          rowKey={record => record.userID}
          columns={columns}
          dataSource={assessUserList}
          loading={loading.effects[`${modelNameSpace}/getUserConfig`]}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '考评人员表'
      },
      header: {
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
      // footer: {
      //   pagination: pagination({pageIndex, total}, this.getList),
      // }
    };
    return (
      <div>
        <FxLayout {...fxLayoutProps} />
        {this.state.settingModalProps.visible?this.renderSettingModal():null}
      </div>
    )
  }
}
