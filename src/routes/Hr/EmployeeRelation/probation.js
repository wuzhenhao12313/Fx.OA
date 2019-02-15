import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Tabs, Input, Button, Tag, Icon,Breadcrumb,Select} from 'antd';
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
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchDictSync, fetchService} from "../../../utils/rs/Fetch";
import Styles from './index.less'
import TableActionBar from "../../../myComponents/Table/TableActionBar";

const jobNatureData = fetchDictSync({typeCode: 'job-nature'});
const jobNatureList = {};
jobNatureData.forEach(x => {
  jobNatureList[x.itemCode]=x.itemName;
});
const Fragment = React.Fragment;
const modelNameSpace = 'employee-probation';
const Option=Select.Option;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    probationModalProps:{
      visible: false,
      currentUserID: 0,
      date:null,
      row:{},
      index:-1,
    },
    editDateModalProps: {
      visible: false,
      currentUserID: 0,
      index:-1,
    },
    positionLevelList: [],
  }

  ref = {
    searchForm: null,
    editDateForm:null,
    probationForm:null,
  }

  renderProbationModal() {
    const {visible,date,row,} = this.state.probationModalProps;
    const userPosition = [];
    row.positionList.forEach(i => {
      userPosition.push({label: i.positionName, value: i.position.toString()});
    });
    const item = [
      {
        label: '预计转正日期',
        key: 'date',
        render: () => {
          return (<div>{moment(date).format('YYYY-MM-DD')}</div>);
        }
      },
      {
        label: '实际转正日期',
        key: 'probationDate',
        initialValue: moment(date),
        rules: [
          { required: true, message: '请选择需要调整的转正日期' }
        ],
        render: () => {
          return (<StandardDatePicker style={{ width: '100%' }} />)
        }
      },
      {
        label:'职位',
        key:'userPositionList',
        initialValue:userPosition,
        render:()=>{
          return(<PositionSelect />)
        }
      },
      {
        label: '职位等级',
        key: 'positionLevel',
        initialValue:row.positionLevel,
        render:()=>{
          return (
            <AutoSelect >
            {this.state.positionLevelList.map(positionLevel => {
              const {levelCode} = positionLevel;
              return (<Option value={levelCode} key={levelCode}>{levelCode}</Option>)
            })}
          </AutoSelect>
          )
        }
      }
    ];
    return (
      <EditModal
        labelCol={6}
        width={500}
        item={item}
        title='办理转正'
        visible={visible}
        onCancel={e => this.setState({probationModalProps: {visible: false}})}
        refForm={node => this.ref.probationForm=node}
        onOk={e => this.probationUser()}
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
    const {entryDate,probationDate,leaveDate}=searchValues;
    const entryStartDate=entryDate&&entryDate.length>0?entryDate[0].format('YYYY-MM-DD'):null;
    const entryEndDate=entryDate&&entryDate.length>0?entryDate[1].format('YYYY-MM-DD'):null;
    const probationStartDate=probationDate&&probationDate.length>0?probationDate[0].format('YYYY-MM-DD'):null;
    const probationEndDate=probationDate&&probationDate.length>0?probationDate[1].format('YYYY-MM-DD'):null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...searchValues,
        workStatus: ['trial'],
        pageIndex,
        pageSize,
        entryStartDate,
        entryEndDate,
        probationStartDate,
        probationEndDate,
        sorterColumn: 'correctionDate',
        sorterType: 'asc',
      });
    });
  }

  changeCorrectionDate= () => {
    const {getFieldsValue}=this.ref.editDateForm.props.form;
    const {model}=this.props;
    const {currentUserID,}=this.state.editDateModalProps;
    let {probationDate}=getFieldsValue();
    probationDate=probationDate.format('YYYY-MM-DD');
    model.call('editProbationDate',{
       userID:currentUserID,
       probationDate,
    }).then(success => {
      if (success) {
         this.setState({
           editDateModalProps:{
             visible:false,
           }
         });
         this.getList();
      }
    });
  }

  probationUser= () => {
    const {currentUserID,}=this.state.probationModalProps;
    const {getFieldsValue}=this.ref.probationForm.props.form;
    const {model}=this.props;
    let {probationDate,positionLevel,userPositionList}=getFieldsValue();
    probationDate=probationDate.format('YYYY-MM-DD');
    userPositionList=userPositionList.map(x=>x.value.toInt());
    model.call('probationUser',{
      userID:currentUserID,
      probationDate,
      positionLevel,
      userPositionList,
    }).then(success => {
      if (success) {
        this.setState({
          probationModalProps:{
            visible:false,
          }
        });
        this.getList();
      }
    });
  }

  componentDidMount() {
    this.getList(1);
    fetchService({
      url: '/OA/PositionLevel/Get',
    }).then(data => {
      const {list} = data;
      this.setState({
        positionLevelList: list,
      });
    });
  }

  renderEditDateModal() {
    const {visible} = this.state.editDateModalProps;
    const item = [
      {
        label: '调整转正日期',
        key: 'probationDate',
        rules: [
          {required: true, message: '请选择需要调整的转正日期'}
        ],
        render:() => {
          return (<StandardDatePicker style={{width:'100%'}}/>)
        }
      }
    ];
    return (
      <EditModal
        labelCol={6}
        item={item}
        title='调整转正日期'
        visible={visible}
        onCancel={e => this.setState({editDateModalProps: {visible: false}})}
        refForm={node => this.ref.editDateForm=node}
        onOk={e => this.changeCorrectionDate()}
        footer={true}
      />
    )
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
        title: '转正日期',
        dataIndex: 'correctionDate',
        key: 'correctionDate',
        render: (value, row,index) => {
          if (!value) {
            return null;
          }
          return (
            <div>
              {Format.Date.Format(value, 'YYYY-MM-DD')}
              <Icon
                type='edit'
                size='small'
                className={Styles.editDateIcon}
                onClick={e => this.setState({
                  editDateModalProps: {
                    visible: true,
                    currentUserID: row.empID,
                    index,
                  }
                })}/>
            </div>
          );
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
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        width: 100,
        fixed: 'right',
        render: (text,row,index) => {
          const action = [
            {
              label: '办理转正',
              submit: () => {
                 this.setState({
                   probationModalProps:{
                     visible:true,
                     currentUserID:row.empID,
                     row,
                     date:row.correctionDate,
                     index,
                   }
                 })
              }
            }
          ]
          return (
            <TableActionBar action={action}/>
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
          emptyProps={{type: 'img', text: '无待转正人员'}}
        />
      </div>
    )
  }

  renderSearchForm() {
    const {resetFields}=this.ref.searchForm?this.ref.searchForm.props.form:{};
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
          label: '转正日期',
          key: 'probationDate',
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
      reset:() => {
        resetFields();
        this.getList(1);
      }
    };
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  render() {
    const {pagination} = this.props;
    const {pageIndex, data: {total}} = this.props[modelNameSpace];
    const fxLayoutProps = {
      pageHeader:false,
      header: {
        extra: this.renderSearchForm(),
        style:{paddingTop:24},
      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };

    return (
      <div className={Styles.employeeRelation}>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.editDateModalProps.visible ? this.renderEditDateModal() : null}
        {this.state.probationModalProps.visible?this.renderProbationModal():null}
      </div>
    )
  }
}
