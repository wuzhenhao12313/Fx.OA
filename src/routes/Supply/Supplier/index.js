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

const modelNameSpace = "supply-supplier";
const Fragment = React.Fragment;
const TextArea = Input.TextArea;

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
@Component.Role('erp_supply_supplier')
export default class extends PureComponent {
  state = {
    addModalProps: {
      visible: false,
      row: {},
      isAdd: true,

    }
  }
  ref = {
    editForm: {}
  }

  componentDidMount() {
    this.getList(1);

  }

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize} = this.props[modelNameSpace];
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        pageIndex,
        pageSize,
      });

    });
  }

  saveSupplier=()=>{
    const {row,isAdd}=this.state.addModalProps;
    const {getFieldsValue}=this.ref.editForm.props.form;
    const {model}=this.props;
    model.call(isAdd?'add':'edit',{
      supplierEntity:isAdd?{
        ...getFieldsValue(),
      }:{
        ...row,
        ...getFieldsValue(),
      }
    }).then(success=>{
      if(success){
        this.setState({
          addModalProps:{visible:false}
        });
        if(isAdd){
          this.getList(1);
        }else {
          this.getList();
        }
      }
    })
  }

  removeSupplier=(supplierID)=>{
    Modal.confirm({
      title:'删除供应商',
      content:'确定要删除供应商吗?,删除后将无法恢复。',
      onOk:()=>{
        const {model}=this.props;
        model.call('remove',{
          supplierID,
        }).then(success=>{
          if(success){
            this.getList();
          }
        })
      }
    })

  }

  renderTable() {
    const {pageIndex, pageSize, data: {list, total}} = this.props[modelNameSpace];
    const {loading, pagination} = this.props;
    const columns = [
      {
        title: '供应商名称',
        dataIndex: 'name',
      },
      {
        title: '统一社会信用代码',
        dataIndex: 'code',
      },
      {
        title: '联系人',
        dataIndex: 'contactUserName',
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
      },
      {
        title: '联系地址',
        dataIndex: 'address',
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row) => {
          const action = [
            {
              label: '编辑',
              submit: () => {
                this.setState({
                  addModalProps: {visible: true, isAdd: false, row,}
                });
              }
            }
          ];
          const more = [
            {
              label: '删除',
              submit: () => {
                this.removeSupplier(row.id);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>);
        }
      }
    ];
    return (
      <div>
        <Button
          style={{marginBottom: 12}}
          type='primary'
          icon='plus'
          onClick={e => this.setState({addModalProps: {visible: true, row: {}, isAdd: true}})}
        >
          添加供应商
        </Button>
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          loading={loading.effects[`${modelNameSpace}/get`]}
          dataSource={list}
          page={pagination({pageIndex, total}, this.getList)}
        />
      </div>
    )
  }

  renderAddModal() {
    const {visible, row, isAdd} = this.state.addModalProps;
    const item = [
      {
        label: '供应商名称',
        key: 'name',
        initialValue: row.name,
        render: () => {
          return <Input/>
        },
      },
      {
        label: '统一社会信用代码',
        key: 'code',
        initialValue: row.code,
        render: () => {
          return <Input/>
        }
      },
      {
        label: '联系人',
        key: 'contactUserName',
        initialValue: row.contactUserName,
        render: () => {
          return <Input/>
        }
      },
      {
        label: '联系人电话',
        key: 'mobile',
        initialValue: row.mobile,
        render: () => {
          return <Input/>
        }
      },
      {
        label: '联系地址',
        key: 'address',
        initialValue: row.address,
        render: () => {
          return (
            <TextArea autosize={{minRows: 4}}/>
          )
        }
      }
    ];
    return (
      <EditModal
        title={`${isAdd ? "添加" : '编辑'}供应商`}
        labelCol={7}
        item={item}
        visible={visible}
        onCancel={e => this.setState({addModalProps: {visible: false}})}
        footer={true}
        refForm={node => this.ref.editForm = node}
        onOk={this.saveSupplier}
      />
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '供应商管理'
      },

      body: {
        center: this.renderTable(),
      },
    };
    return (
      <div>
        <FxLayout {...fxLayoutProps} />
        {this.state.addModalProps.visible ? this.renderAddModal() : null}
      </div>
    )
  }
}
