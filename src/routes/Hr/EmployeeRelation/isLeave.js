import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Tabs, Input, Button, Tag, Icon, Breadcrumb, Modal,Switch} from 'antd';
import classNames from 'classnames';
import Component from "../../../utils/rs/Component";
import Format from '../../../utils/rs/Format';
import SearchForm from '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import PositionSelect from '../../../myComponents/Select/Position';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import Styles from './index.less'
import TableActionBar from "../../../myComponents/Table/TableActionBar";
import UserSelect from '../../../myComponents/Select/User';

const jobNatureData = fetchDictSync({typeCode: 'job-nature'});
const jobNatureList = {};
jobNatureData.forEach(x => {
  jobNatureList[x.itemCode] = x.itemName;
});
const Fragment = React.Fragment;
const modelNameSpace = 'employee-leave';
const TextArea = Input.TextArea;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    leaveModalProps: {
      visible: false,
      row: null,
      index: -1,
      isAdd: false,
      title: null,
    },
    modalProps: {
      visible: false,
      currentUserID: 0,
      isReEntry:false,
    }
  }

  ref = {
    searchForm: null,
    editForm:null,
  }


  renderModal() {
    const {visible,isReEntry} = this.state.modalProps;
    const item = [
      {
        label: '工作状态',
        key: 'status',
        rules:[
          {required:true,message:'请先选择工作状态'}
        ],
        render: () => {
          return (<AutoSelect typeCode='job-status' ignore={['quit','waiting-quit','retire']}/>);
        }
      },
      {
        label: '是否重新入职',
        key: 'isReEntry',
        initialValue: isReEntry,
        valuePropName: 'checked',
        render: () => {
          return (
            <Switch
              checkedChildren={<Icon type="check"/>}
              unCheckedChildren={<Icon type="cross"/>}
              onChange={value=>this.setState({modalProps:{...this.state.modalProps,isReEntry:value}})}
            />)
        }
      },
      {
        label:'重新入职日期',
        key:'reEntryDate',
        isShow:isReEntry,
        initialValue:moment(),
        render:()=>{
          return(<StandardDatePicker style={{width:'100%'}}/>)
        }
      }
    ];
    return (
      <EditModal
        labelCol={5}
        width={500}
        item={item}
        title={isReEntry?"重新入职":'撤销离职'}
        visible={visible}
        onCancel={e => this.setState({modalProps: {visible: false}})}
        refForm={node => this.ref.editForm = node}
        onOk={this.reEntry}
        footer={true}
      />
    )
  }

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    const searchForm = this.ref.searchForm.props.form;
    const {getFieldsValue} = searchForm;
    const searchValues = getFieldsValue();
    const {entryDate, leaveDate} = searchValues;
    const entryStartDate = entryDate && entryDate.length > 0 ? entryDate[0].format('YYYY-MM-DD') : null;
    const entryEndDate = entryDate && entryDate.length > 0 ? entryDate[1].format('YYYY-MM-DD') : null;
    const leaveStartDate = leaveDate && leaveDate.length > 0 ? leaveDate[0].format('YYYY-MM-DD') : null;
    const leaveEndDate = leaveDate && leaveDate.length > 0 ? leaveDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...searchValues,
        workStatus: ['quit'],
        pageIndex,
        pageSize,
        entryStartDate,
        entryEndDate,
        leaveStartDate,
        leaveEndDate,
        sorterColumn: 'leaveDate',
        sorterType: 'desc',
      });
    });
  }

  openModal=(currentUserID,isReEntry)=>{
    this.setState({
      modalProps:{
        currentUserID,
        isReEntry,
        visible:true,
      }
    });
  }

  reEntry = () => {
    const {getFieldsValue} = this.ref.editForm.props.form;
    const {model} = this.props;
    const {currentUserID} = this.state.modalProps;
    let {isReEntry,reEntryDate,status} = getFieldsValue();
    reEntryDate = reEntryDate?reEntryDate.format('YYYY-MM-DD'):null;
    model.call('reEntry', {
      userID:currentUserID,
      reEntryDate,
      isReEntry,
      status,
    }).then(success => {
      if (success) {
        this.setState({
          modalProps: {
            visible: false,
          }
        });
        this.getList();
      }
    });
  }

  componentDidMount() {
    this.getList(1);
  }

  renderTable() {
    const {loading} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '姓名',
        dataIndex: 'empName',
        key: 'empName',
        fixed: 'left',
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
        key: 'jobNumber',
      },
      {
        title: '部门',
        dataIndex: 'depName',
        key: 'depName',
      },
      {
        title: '岗位',
        dataIndex: 'positionList',
        key: 'positionList',
        render: (value) => {
          value = value || [];
          return (
            <Fragment>{value.map((position, idx) => {
              return <Tag key={idx}>{position.positionName}</Tag>
            })}</Fragment>
          )
        }
      },
      {
        title: '工作性质',
        dataIndex: 'jobNature',
        render: (text) => {
          return text ? jobNatureList[text] : null;
        }
      },
      {
        title: '入职日期',
        dataIndex: 'entryDate',
        key: 'entryDate',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '工龄(月)',
        key: 'workMonth',
        dataIndex: 'workMonth',
        render: (value, row,) => {
          const {entryDate, workStatus, leaveDate} = row;
          if (workStatus === 'retire' || workStatus === 'quit') {
            return moment(leaveDate).diff(moment(entryDate), 'month');
          }
          return moment().diff(moment(entryDate), 'month');
        }
      },
      {
        title: '离职日期',
        dataIndex: 'leaveDate',
        key: 'leaveDate',
        render: (value, row, index) => {
          return Format.Date.Format(value, 'YYYY-MM-DD')
        }
      },
      {
        title: '离职原因',
        dataIndex: 'leaveResult',
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        width: 50,
        fixed: 'right',
        render: (text, row, index) => {
          const more = [
            {
              label: '撤销离职',
              submit: () => {
                 this.openModal(row.empID,false);
              }
            },
            {
              label: '重新入职',
              submit: () => {
                this.openModal(row.empID,true);
              }
            },
          ];
          return (
            <TableActionBar more={more} type='custom' customMore={<Icon style={{fontSize:18}} type='setting'/>}/>
          )
        }
      },
    ];
    return (
      <div className={Styles.list}>
        <StandardTable
          rowKey={record => record.empID}
          columns={columns}
          dataSource={list}
          page={false}
          loading={loading.effects[`${modelNameSpace}/get`]}
          scroll={{x: 1200}}
          emptyProps={{type: 'img', text: '无待离职人员'}}
        />
      </div>
    )
  }

  renderSearchForm() {
    const {resetFields} = this.ref.searchForm ? this.ref.searchForm.props.form : {};
    const advProps = {
      formItem: [
        {
          label: '姓名',
          key: 'empName',
          render: () => {
            return (
              <Input placeholder="输入员工姓名模糊查询"/>
            )
          }
        },
        {
          label: '工号',
          key: 'jobNumber',
          render: () => {
            return (
              <Input placeholder='输入员工工号精确查询，多个用 "," 隔开'/>
            )
          }
        },
        {
          label: "部门",
          key: 'depID',
          render: () => {
            return (<DepartmentSelect allowClear placeholder="选择部门查询部门及其子部门所有人员"/>);
          }
        },
        {
          label: '入职日期',
          key: 'entryDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '离职日期',
          key: 'leaveDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '职位',
          key: 'userPosition',
          render: () => {
            return (
              <PositionSelect
                allowClear
                treeCheckable={false}
                treeCheckStrictly={false}
              />);
          }
        },
      ],
      onSearch: e => this.getList(1),
      reset: () => {
        resetFields();
        this.getList(1);
      }
    };
    const right = (
      <Button
        type='primary'
      >
        导出
      </Button>)
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
        right={right}
      />
    )
  }

  renderBreadcrumb(){
    const {model}=this.props;
    return(
      <Breadcrumb style={{padding:'24px 24px 8px 24px',fontSize:13}}>
        <Breadcrumb.Item><a onClick={e=>{window.history.back()}}>返回</a></Breadcrumb.Item>
        <Breadcrumb.Item><a onClick={e=>{model.push('/hr/employee/relation?activeKey=waiting-quit')}}>离职管理</a></Breadcrumb.Item>
        <Breadcrumb.Item>已离职员工</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  render() {
    const {pagination} = this.props;
    const {pageIndex, data: {total}, employeeCountModel} = this.props[modelNameSpace];
    const {waitingLeaveCount, leaveCount} = employeeCountModel;
    const fxLayoutProps = {
      header: {
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };

    return (
      <div className={Styles.leave}>
        {this.renderBreadcrumb()}
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.modalProps.visible ? this.renderModal() : null}
      </div>
    )
  }
}
