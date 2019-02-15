import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  Button,
  Input,
  Select,
  Tabs,
  Steps,
  Form,
  Alert,
  Modal,
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
import ImageModal from '../../../myComponents/Modal/Image';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import style from './index.less';
import StandardRangePicker from "../../../myComponents/Date/StandardRangePicker";


const modelNameSpace = "finance_contract-pay_record";
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
});



@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_supply_pay_record')
@Form.create()
export default class extends PureComponent {
  state={
    payModalProps:{
      visible:false,
      row:{},
    }
  }

  componentDidMount(){
    this.getList(1);
  }

  ref={
    searchForm:{},
    imagesUploader:{},
  }

  getList=(page)=>{
    const {getFieldsValue}=this.props.form;
    const {payDate,contractCustomNo,supplierID}=getFieldsValue();
    const {model}=this.props;
    const {pageIndex,pageSize}=this.props[modelNameSpace];
    const startDate=payDate&&payDate.length>0?payDate[0].format('YYYY-MM-DD'):null;
    const endDate=payDate&&payDate.length>0?payDate[1].format('YYYY-MM-DD'):null;
    model.setState({
      pageIndex:page||pageIndex,
      data:{
        list:[],
        total:0,
      }
    }).then(()=>{
      model.get({
        pageIndex,
        pageSize,
        startDate,
        endDate,
        contractCustomNo,
        supplierID,
      });
    });
  }

  changeImageList = (questionImageList) => {
    const {setFieldsValue} = this.ref.payForm.props.form;
    setFieldsValue({
      payFileUrl: questionImageList[0],
    });
  }

  editPay = () => {
    const {getFieldsValue} = this.ref.payForm.props.form;
    const {payFileUrl} = getFieldsValue();
    const {model} = this.props;
    const {row}=this.state.payModalProps;
    model.call('editPay', {
      payID: row.id,
      payMoney: row.actualPayMoney * 1,
      payFileUrl: payFileUrl ? payFileUrl[0] : null,
    }).then(success => {
      if (success) {
        this.setState({payModalProps: {visible: false}});
        this.getList();
      }
    });
  }

  removePay=(payID)=>{
    const {model}=this.props;
    Modal.confirm({
      title:'删除付款记录',
      content:'确定要删除吗,删除了将无法恢复.',
      onOk:()=>{
        model.call('removePay',{
          payID,
        }).then(success=>{
          if(success){
            this.getList();
          }
        });
      }
    })
  }

  renderSearchForm(){
    const {getFieldDecorator}=this.props.form;
    return(
      <Form layout='inline' style={{marginBottom:12}}>
        <FormItem label='付款日期' >
          {
            getFieldDecorator('payDate')
            (<StandardRangePicker  style={{width:300}} allowClear/>)
          }

        </FormItem>
        <FormItem label='供应商' >
          {
            getFieldDecorator('supplierID')
            (<AutoSelect allowClear style={{width:250}}>
              {supplierList.map(x=>{
                return(<Option key={x.id} value={x.id}>{x.name}</Option>)
              })}
            </AutoSelect>)
          }

        </FormItem>
        <FormItem label='合同编号' >
          {
            getFieldDecorator('contractCustomNo')
            (<Input style={{width:200}}/>)
          }

        </FormItem>
        <FormItem>
          <Button type='primary' icon='search' onClick={e=>this.getList(1)}>搜索</Button>
        </FormItem>
      </Form>
    )
  }

  renderPayModal() {
    const {visible, row} = this.state.payModalProps;
    const item = [
      {
        label: '付款凭证',
        key: 'payFileUrl',
        initialValue: row.payFileUrl ? [row.payFileUrl] : undefined,
        render: () => {
          return (
            <PicturesUploader
              ref={node => this.ref.imagesUploader = node}
              type="question"
              defaultFileList={row.payFileUrl ? [row.payFileUrl] : undefined}
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
        onOk={this.editPay}
      />
    )
  }

  renderTable(){
    const {data:{list,total,payMoney},pageIndex}=this.props[modelNameSpace];
    const {pagination,loading}=this.props;
    const columns=[
      {
        title:'序号',
        dataIndex:'index',
        render:(text,row,index)=>{
          return index+1;
        }
      },
      {
        title:'合同编号',
        dataIndex:'contractCustomNo',
      },
      {
        title:'供应商',
        dataIndex:'supplierID',
        render:(text)=>{
          return formatter.supplier[text];
        }
      },
      {
        title:'付款人员',
        dataIndex:'payUserName',
      },
      {
        title:'付款时间',
        dataIndex:'payDate',
        render:(text)=>{
          return formatDate(text,'YYYY-MM-DD HH:MM');
        }
      },
      {
        title:'付款金额',
        dataIndex:'actualPayMoney',
        render:(text)=>{
          return Format.Money.Rmb(text);
        }
      },
      {
        title:'付款类型',
        dataIndex:'payType',
        render:(text)=>{
          return text==="1"?"收货付款":'预付款';
        }
      },
      {
        title:'付款凭证',
        dataIndex:'payFileUrl',
        render:(text,row)=>{
          if(!text){
            return <a onClick={e=>this.setState({payModalProps:{visible:true,row,}})}>点击上传</a>;
          }
          return(
            <ImageModal src={text} />
          )
        }
      },
      {
        title:'操作',
        dataIndex:'op',
        render:(text,row)=>{
          return <a onClick={e=>this.removePay(row.id)}>删除</a>
        }
      },
    ];
    return(
      <div> <Alert  style={{marginBottom:12}} message={
        <div>
          <span>付款总金额: <span style={{fontWeight:'bold'}}>{Format.Money.Rmb(payMoney)}</span></span>
        </div>}/>
        <StandardTable
          rowKey={record=>record.id}
          columns={columns}
          dataSource={list}
          page={pagination({pageIndex,total},this.getList)}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>

    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '商品采购付款记录'
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
        {this.state.payModalProps.visible?this.renderPayModal():null}
      </div>
    )
  }
}
