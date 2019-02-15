import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  Button,
  Input,
  Modal,
  Select,
  Tabs,
  Steps,
  Form,
  message,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import SearchForm from '../../../myComponents/Form/Search';
import {formatDate, formatNumber} from '../../../utils/utils';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import StandardDatePicker from "../../../myComponents/Date/StandardDatePicker";
const modelNameSpace = "supply-purchase_order_pay";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_purchase_order_pay')
@Form.create()
export default class extends PureComponent {
  state = {
    type: 'purchase',
  }

  componentDidMount() {
    this.getList();
  }

  ref = {
    searchForm: null,
  }

  getList = () => {
    const {model} = this.props;
    const {type} = this.state;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    let{instockStartDate, instockEndDate,serialNo,submitPayStartDate,submitPayEndDate}=getFieldsValue();
    instockStartDate = instockStartDate ? instockStartDate.format('YYYY-MM-DD HH:mm:ss') : null;
    instockEndDate = instockEndDate ? instockEndDate.format('YYYY-MM-DD HH:mm:ss') : null;
    submitPayStartDate=submitPayStartDate?submitPayStartDate.format('YYYY-MM-DD HH:mm:ss') : null;
    submitPayEndDate=submitPayEndDate?submitPayEndDate.format('YYYY-MM-DD HH:mm:ss') : null;
    model.call(type === 'purchase' ? 'getIsPayPurchaseItem' : 'getIsPayBulkItem', {
      type,
      instockStartDate,
      instockEndDate,
      submitPayStartDate,
      submitPayEndDate,
      serialNo,
    });
  }


  createInstockOrder=()=>{
    const {list}=this.props[modelNameSpace];
    const {type}=this.state;
    const {model}=this.props;
    const itemIDList=[];
    list.forEach(x=>{
      itemIDList.push(x.id);
    });
    const {getFieldsValue} = this.ref.searchForm.props.form;
    let{instockStartDate, instockEndDate}=getFieldsValue();
    const startDate = instockStartDate ? instockStartDate.format('YYYY-MM-DD HH:mm:ss') : null;
    const endDate = instockEndDate ? instockEndDate.format('YYYY-MM-DD HH:mm:ss') : null;
    if(!startDate||!endDate){
      message.warning('请先选择入库时间区间');
      return;
    }
    if(list.length===0){
      message.warning('数据项为0，无法生成入库单');
      return;
    }
    Modal.confirm({
      title:'生成采购入库单',
      onOk:()=>{
        model.call('createInstockOrder',{
          type,
          itemIDList,
          startDate,
          endDate,
        })
      }
    })
  }

  renderSearchForm() {
    const item = [
      [
        {
          key: 'instockStartDate',
          label: '入库开始日期',
          initialValue: moment().startOf('day'),
          render: () => {
            return (<StandardDatePicker allowClear style={{width: 200}} format='YYYY-MM-DD HH:mm:ss' showTime/> )
          }
        },
        {
          key: 'instockEndDate',
          label: '入库结束日期',
          initialValue: moment().endOf('day'),
          render: () => {
            return (<StandardDatePicker allowClear style={{width: 200}} format='YYYY-MM-DD HH:mm:ss' showTime/>)
          }
        },
      ],
      [
        {
          key: 'submitPayStartDate',
          label: '确认付款开始日期',
          render: () => {
            return (<StandardDatePicker allowClear style={{width: 200}} format='YYYY-MM-DD HH:mm:ss' showTime/> )
          }
        },
        {
          key: 'submitPayEndDate',
          label: '确认付款结束日期',
          render: () => {
            return (<StandardDatePicker allowClear style={{width: 200}} format='YYYY-MM-DD HH:mm:ss' showTime/>)
          }
        },
        {
          key: 'serialNo',
          label: '采购单号',
          render: () => {
            return (<Input style={{width: 200}}/>)
          }
        },
      ]
    ];
    return (
      <SearchForm
        item={item}
        wrappedComponentRef={node => this.ref.searchForm = node}
        onSearch={this.getList}
      />
    )
  }

  renderTable() {
    const {loading} = this.props;
    const {list} = this.props[modelNameSpace];
    const {type}=this.state;
    const purchaseColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        width:55,
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '图片',
        dataIndex: 'img',
        width: 70,
        render: (text, row, index) => {
          return <ProductInfo proId={row.pro_id}/>
        }
      },
      {
        title:'采购单号',
        dataIndex:'serialNo'
      },
      {
        title: '商品ID',
        dataIndex: 'pro_id',
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
        title: '供应商',
        dataIndex: 'suppliers_name',
      },
      {
        title: '供应商单号',
        dataIndex: 'suppliers_number'
      },
      {
        title: '采购单价',
        dataIndex: type==='purchase'?'purchase_amount':'purchase_price',
        render: (text) => {
          return Format.Money.Rmb(text, 2);
        }
      },
      {
        title: '采购数量',
        dataIndex:'num',
      },
      {
        title: '采购总金额',
        dataIndex: 'all',
        render: (text, row) => {
          return Format.Money.Rmb(row.purchase_amount * row.num, 2);
        }
      },
      {
        title:'入库数量',
        dataIndex:'instockNum',
        render:(text,row)=>{
          return row.num;
        }
      },
    ];
    const bulkColumns= [
      {
        title: '序号',
        dataIndex: 'index',
        width:55,
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '图片',
        dataIndex: 'img',
        width: 70,
        render: (text, row, index) => {
          return <ProductInfo proId={row.pro_id}/>
        }
      },
      {
        title:'采购单号',
        dataIndex:'serialNo'
      },
      {
        title: '商品ID',
        dataIndex: 'pro_id',
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
        title: '供应商',
        dataIndex: 'suppliers_name',
      },
      {
        title: '供应商单号',
        dataIndex: 'suppliers_number'
      },
      {
        title: '采购单价',
        dataIndex: 'purchase_price',
        render: (text) => {
          return Format.Money.Rmb(text, 2);
        }
      },
      {
        title: '采购数量',
        dataIndex: 'purchase_num',
      },
      {
        title: '采购总金额',
        dataIndex: 'all',
        render: (text, row) => {
          return Format.Money.Rmb(row.purchase_price*row.purchase_num, 2);
        }
      },
      {
        title:'区间入库数量',
        dataIndex:'instockNum',
      },
      {
        title:'总入库数量',
        dataIndex:'historyInstockNum',
      },
      {
        title:'还需入库数量',
        dataIndex:'needInstockNum',
        render:(text,row,)=>{
          return row.purchase_num<=row.historyInstockNum?0:row.purchase_num-row.historyInstockNum;
        }
      }
    ];
    return (
      <div>
        <Tabs activeKey={this.state.type} type='card' onChange={type => this.setState({type}, e => this.getList())}>
          <TabPane tab='散单采购' key='purchase'/>
          <TabPane tab='大货采购' key='bulk'/>
        </Tabs>
        <Button type='primary' icon='save' style={{marginBottom:12}} onClick={e=>this.createInstockOrder()}>保存为入库单</Button>
        <StandardTable
          columns={type==='purchase'?purchaseColumns:bulkColumns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/${this.state.type === 'purchase' ? "getIsPayPurchaseItem" : "getIsPayBulkItem"}`]}
          rowKey={record => record.id}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '商品采购已付款',
      },
      header: {
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
    };
    return (
      <div>
        <FxLayout {...fxLayoutProps} />
      </div>
    )
  }
}
