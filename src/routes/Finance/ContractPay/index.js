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
  Avatar,
  Steps,
  Form,
  Alert,
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
import {formatDate, formatMoney, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import style from './index.less';
import StandardDatePicker from "../../../myComponents/Date/StandardDatePicker";
import StandardRangePicker from "../../../myComponents/Date/StandardRangePicker";

const modelNameSpace = "finance_contract-pay";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Step = Steps.Step;

const supplierData=fetchApiSync({url: '/Supply/GetAllSupplier',});
const supplierList=supplierData.data.toObject().list;
const formatter = {
  supplier:{},
};
supplierList.forEach(supplier=>{
  formatter.supplier[`${supplier['id']}`]=supplier['name'];
})


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_supply_take_record')
@Form.create()
export default class extends PureComponent {
  state = {
    payModalProps: {
      visible: false,
      row: {},
      isAdd: true,
    },
    payType: "1",
  }

  ref = {
    payForm: {},
    imagesUploader: {},
  }

  componentDidMount() {
    this.getList(1,{});
  }

  getList = (page,value) => {
    const {model} = this.props;
    const {pageIndex, pageSize} = this.props[modelNameSpace];
    const {date}=value||{};
    const startDate=date&&date.length>0?date[0].format('YYYY-MM-DD'):null;
    const endDate=date&&date.length>0?date[1].format('YYYY-MM-DD'):null;
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
        startDate,
        endDate,
        ...value,
      });
    });
  }

  changeImageList = (questionImageList) => {
    const {setFieldsValue} = this.ref.payForm.props.form;
    setFieldsValue({
      payFileUrl: questionImageList[0],
    });
  }

  payTakeMoney = () => {
    const {row} = this.state.payModalProps;
    const {getFieldsValue} = this.ref.payForm.props.form;
    const {payType} = this.state;
    const {payFileUrl, payMoney} = getFieldsValue();
    const {model} = this.props;
    const obj = payType === "1" ? {takeID: row.id} : {contractID: row.id};
    model.call('payMoney', {
      ...obj,
      payMoney: payMoney * 1,
      payFileUrl: payFileUrl ? payFileUrl[0] : null,
      payType,
    }).then(success => {
      if (success) {
        this.setState({payModalProps: {visible: false}});
        this.getList();
      }
    });
  }

  editPay = () => {
    const {getFieldsValue} = this.ref.payForm.props.form
    ;
    const {payFileUrl, payMoney} = getFieldsValue();
    const {model} = this.props;
    const {payRecord} = this.props[modelNameSpace];
    model.call('editPay', {
      payID: payRecord.id,
      payMoney: payMoney * 1,
      payFileUrl: payFileUrl ? payFileUrl[0] : null,
    }).then(success => {
      if (success) {
        this.setState({payModalProps: {visible: false}});
        this.getList();
      }
    });
  }

  renderSearchForm() {
    const item=[
      [
        {
          key:'supplierID',
          label:'供应商',
          render:()=>{
            return(
              <AutoSelect style={{width:200}} allowClear>
                {supplierList.map(x=>{
                  return(<Option key={x.id} value={x.id}>{x.name}</Option>)
                })}
              </AutoSelect>
            )
          }
        },
        {
          key:'contractCustomNo',
          label:'合同编号',
          render:()=>{
            return(<Input style={{width:200}}/>)
          }
        },
        {
          key:'asin',
          label:'ASIN',
          render:()=>{
            return(<Input style={{width:200}}/>)
          }
        },
      ],
      [
        {
          key:'date',
          label:'收货日期',
          render:()=>{
            return(<StandardRangePicker allowClear style={{width:300}}/>)
          }
        }
      ]
    ];
    return (
      <SearchForm
        item={item}
        onSearch={value=>this.getList(1,value)}
      />
    )
  }

  renderPayModal() {
    const {visible, isAdd} = this.state.payModalProps;
    const {payRecord} = this.props[modelNameSpace];
    const item = [
      {
        label: '付款金额',
        key: 'payMoney',
        initialValue: isAdd ? undefined : payRecord.actualPayMoney,
        rules: [
          {required: true, message: '请输入付款金额'}
        ],
        render: () => {
          return <Input placeholder='请输入付款金额'/>
        }
      },
      {
        label: '付款凭证',
        key: 'payFileUrl',
        initialValue: isAdd ? undefined : payRecord.payFileUrl ? [payRecord.payFileUrl] : undefined,
        render: () => {
          return (
            <PicturesUploader
              ref={node => this.ref.imagesUploader = node}
              type="question"
              defaultFileList={isAdd ? undefined : payRecord.payFileUrl ? [payRecord.payFileUrl] : undefined}
              onChange={this.changeImageList}
              max={1}
            />)
        },
      },
    ];
    return (
      <EditModal
        item={item}
        title='付款'
        visible={visible}
        refForm={node => this.ref.payForm = node}
        footer={true}
        onCancel={e => this.setState({payModalProps: {visible: false}})}
        onOk={isAdd ? this.payTakeMoney : this.editPay}
      />
    )
  }

  renderTable() {
    const {data: {list, total,takeCount,money}, pageIndex,pageSize} = this.props[modelNameSpace];
    const {pagination, loading, model} = this.props;
    const takeColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        align: 'center',
        width: 55,
        render: (text, row, index) => {
          return (pageIndex - 1) * pageSize + 1 + index;
        }
      },
      {
        title: '图片',
        dataIndex: 'pro_id',
        render: (text) => {
          return <ProductInfo proId={text}/>
        }
      },
      {
        title: '合同自定义编号',
        dataIndex: 'contractNo',
      },
      {
        title:'供应商',
        dataIndex:'supplierID',
        render:(text)=>{
          return formatter.supplier[text];
        }
      },
      {
        title: 'ASIN',
        dataIndex: 'from_code',
      },
      {
        title: '颜色',
        dataIndex: 'color_code',
      },
      {
        title: '尺码',
        dataIndex: 'size_code',
      },
      {
        title: '收货数量',
        dataIndex: 'received_num',
      },
      {
        title: '收货人',
        dataIndex: 'received_userName',
      },
      {
        title: '收货时间',
        dataIndex: 'received_date',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title:'单价',
        dataIndex:'purchase_price',
        render:(text)=>{
          return Format.Money.Rmb(text);
        }
      },
      {
        title: '收货总金额',
        dataIndex: 'needPayMoney',
        render: (text, row) => {
          return Format.Money.Rmb(row.purchase_price * row.received_num);
        }
      },
      // {
      //   title:'操作时间',
      //   dataIndex:'received_date',
      //   render: (text) => {
      //     return formatDate(text, 'YYYY-MM-DD HH:MM');
      //   }
      // }
    ];
    return (
      <div>
        <Alert  style={{marginBottom:12}} message={
          <div>
            <span>收货总数量: <span style={{fontWeight:'bold'}}>{Format.Number.Fix(takeCount)}</span></span>
            <span style={{marginLeft:20}}>收货总金额: <span style={{fontWeight:'bold'}}>{Format.Money.Rmb(money)}</span></span>
          </div>}/>
        <StandardTable
          rowKey={record => record.id}
          dataSource={list}
          columns={takeColumns}
          page={pagination({pageIndex, total}, this.getList)}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '采购收货记录'
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
        <FxLayout {...fxLayoutProps}/>
        {this.state.payModalProps.visible ? this.renderPayModal() : null}
      </div>
    )
  }
}
