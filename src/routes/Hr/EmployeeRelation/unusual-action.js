import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Tabs, Input, Button, Tag, Icon, Breadcrumb, Badge, Select} from 'antd';
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
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import Styles from './index.less'
import TableActionBar from "../../../myComponents/Table/TableActionBar";

const unusualActionTypeData = fetchDictSync({typeCode: 'unusual-action-type'});
const unusualActionTypeList = {};
unusualActionTypeData.forEach(x => {
  unusualActionTypeList[x.itemCode] = x.itemName;
});

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const departmentObj={};
departmentList.forEach(x=>{
  departmentObj[x.depID]=x.depName;
})


const Fragment = React.Fragment;
const Option = Select.Option;
const modelNameSpace = 'employee-unusual-action';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  componentDidMount() {
    this.getList(1);
  }

  ref = {
    searchForm: null,
    editDateForm: null,
  }

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    const searchForm = this.ref.searchForm.props.form;
    const {getFieldsValue} = searchForm;
    const searchValues = getFieldsValue();
    const {entryDate, createDate} = searchValues;
    const entryStartDate = entryDate && entryDate.length > 0 ? entryDate[0].format('YYYY-MM-DD') : null;
    const entryEndDate = entryDate && entryDate.length > 0 ? entryDate[1].format('YYYY-MM-DD') : null;
    const startDate = createDate && createDate.length > 0 ? createDate[0].format('YYYY-MM-DD') : null;
    const endDate = createDate && createDate.length > 0 ? createDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...searchValues,
        pageIndex,
        pageSize,
        entryStartDate,
        entryEndDate,
        startDate,
        endDate,
      });
    });
  }

  renderSearchForm() {
    const {resetFields} = this.ref.searchForm ? this.ref.searchForm.props.form : {};
    const advProps = {
      formItem: [
        {
          label: '姓名',
          key: 'userName',
          render: () => {
            return (
              <Input placeholder="输入员工姓名模糊查询"/>
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
          label: '异动类型',
          key: 'unusualActionType',
          render: () => {
            return (
              <AutoSelect typeCode='unusual-action-type'/>
            )
          }
        },
        {
          label: '异动状态',
          key: 'status',
          render: () => {
            return (
              <AutoSelect>
                <Option value={0}>进行中</Option>
                <Option value={1}>已生效</Option>
                <Option value={2}>已撤销</Option>
              </AutoSelect>
            )
          }
        },
        {
          label: '异动日期',
          key: 'createDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
      ],
      onSearch: e => this.getList(1),
      reset: () => {
        resetFields();
        this.getList(1);
      }

    }
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  renderTable() {
    const {loading} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '姓名',
        dataIndex: 'userName',
        key: 'userName',
        fixed: 'left',
      },
      {
        title: '部门',
        dataIndex: 'depID',
        key: 'depID',
        render:(text)=>{
          return departmentObj[text]
        }
      },
      {
        title: '岗位',
        dataIndex: 'positionList',
        key: 'positionList',
        render: (value) => {
          value = value || [];
          return (
            <Fragment>{value.map((position, idx) => {
              return <Tag key={idx}>{position}</Tag>
            })}</Fragment>
          )
        }
      },
      {
        title: '异动类型',
        dataIndex: 'unusuaActionType',
        render: (text) => {
          return text ? unusualActionTypeList[text] : null;
        }
      },
      {
        title: '异动日期',
        dataIndex: 'createDate',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '异动详情',
        dataIndex: 'desc',
      },
      {
        title: '异动状态',
        dataIndex: 'status',
        render: (text) => {
          let obj = {};
          switch (text) {
            case 0:
              obj = {
                text: '进行中',
                status: 'processing',
              };
              break;
            case 1:
              obj = {
                text: '已生效',
                status: 'success',
              };
              break;
            case 2:
              obj = {
                text: '已撤销',
                status: 'error',
              };
              break;
          }
          return (<Badge text={obj.text} status={obj.status}/>)
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        columns={columns}
        dataSource={list}
        page={false}
        loading={loading.effects[`${modelNameSpace}/get`]}
        scroll={{x: 1200}}
        emptyProps={{type: 'img', text: '无异动记录'}}
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
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
      </Fragment>
    )
  }
}
