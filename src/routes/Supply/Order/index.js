import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  message,
  Button,
  Input,
  Badge,
  Modal,
  Drawer,
  Icon,
  Select,
  Tabs,
  Row,
  Col,
  Steps,
  Form,
  Card,
  Breadcrumb,
  Alert,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import cloneDeep from 'lodash/cloneDeep';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import SearchForm from '../../../myComponents/Form/Search';
import InLineForm from '../../../myComponents/Form/InLine';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchServiceSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import style from './index.less';
import StandardDatePicker from "../../../myComponents/Date/StandardDatePicker";
import StandardRangePicker from "../../../myComponents/Date/StandardRangePicker";
import ImageModal from '../../../myComponents/Modal/Image';

const modelNameSpace = "supply-purchase_order";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Step = Steps.Step;


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_purchase_order')
@Form.create()
export default class extends PureComponent {

  componentDidMount() {
    const rowType = Uri.Query('type');
    const id = Uri.Query('id');
    if (id) {
      const {model} = this.props;
      model.call(rowType === 'purchase' ? 'getPurchaseItemListByID' : 'getBulkItemListByID', {
        orderID: id,
      });
    } else {
      if (rowType) {
        this.setState({
          type: rowType,
        }, e => this.getList(1));
      } else {
        this.getList(1);
      }
    }
  }

  state = {
    type: 'purchase',
  }

  getList = (page, value) => {
    const {type} = this.state;
    const {submitPayDate, submitInstockDate} = value || {};
    const submitPayStartDate = submitPayDate && submitPayDate.length > 0 ? submitPayDate[0] : null;
    const submitPayEndDate = submitPayDate && submitPayDate.length > 0 ? submitPayDate[0] : null;
    const submitInstockStartDate = submitInstockDate && submitInstockDate.length > 0 ? submitInstockDate[0] : null;
    const submitInstockEndDate = submitInstockDate && submitInstockDate.length > 0 ? submitInstockDate[0] : null;
    const {model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        type,
        submitPayStartDate,
        submitPayEndDate,
        submitInstockStartDate,
        submitInstockEndDate,
        pageIndex,
        pageSize,
      })
    });
  }

  submitPay = (orderID) => {
    Modal.confirm({
      title: '确定要确认付款吗？',
      onOk: () => {
        const {model} = this.props;
        model.call('submitPay', {
          orderID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        })
      }
    });

  }

  submitInstock = (orderID) => {
    Modal.confirm({
      title: '确定要确认完成吗？',
      onOk: () => {
        const {model} = this.props;
        model.call('submitInstock', {
          orderID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    })

  }

  renderSearchForm() {
    const right = (
      <Button type='primary' icon='retweet' style={{marginLeft: 10}} onClick={e => this.getList()}>刷新</Button>
    )
    const item = [[
      {
        key: 'submitPayDate',
        label: '付款确认时间',
        render: () => {
          return (<StandardRangePicker style={{width: 250}}/>)
        }
      },
      {
        key: 'submitInstockDate',
        label: '完成确认时间',
        render: () => {
          return (<StandardRangePicker style={{width: 250}}/>)
        }
      }
    ]];
    return (
      <SearchForm
        right={right}
        item={item}
        onSearch={value => this.getList(1, value)}
      />
    )
  }

  renderTable() {
    const {loading, pagination, model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 55,
        render: (text, row, index) => {
          return (pageIndex - 1) * pageSize + index + 1;
        }
      },
      {
        title: '采购单号',
        dataIndex: 'serialNo',
      },
      {
        title: '创建日期',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '创建人员',
        dataIndex: 'createUserName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          let result;
          switch (text) {
            case 'wait-submit-pay':
              result = "等待确认付款";
              break;
            case 'submit-pay-ok':
              result = "确认付款完成";
              break;
            case 'wait-submit-instock':
              result = "等待确认完成";
              break;
            case 'submit-instock-ok':
              result = "已完成";
              break;
          }
          return result;
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '查看详情',
              submit: () => {
                model.call(row.type === 'purchase' ? 'getPurchaseItemListByID' : 'getBulkItemListByID', {
                  orderID: row.id,
                });
                model.push(`/supply/purchase-order?id=${row.id}&type=${row.type}`);
              }
            }
          ];
          const more = [
            {
              label: '确认付款',
              isShow: row.status === 'wait-submit-pay',
              submit: () => {
                this.submitPay(row.id);
              }
            },
            {
              label: '确认完成',
              isShow: row.status === 'wait-submit-instock',
              submit: () => {
                this.submitInstock(row.id);
              }
            },
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      }
    ];

    return (
      <div>
        <Tabs activeKey={this.state.type} type='card' onChange={type => this.setState({type}, e => this.getList(1))}>
          <TabPane tab='散单采购' key='purchase'/>
          <TabPane tab='大货采购' key='bulk'/>
        </Tabs>
        <StandardTable
          columns={columns}
          rowKey={record => record.id}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/get`]}
          page={pagination({total, pageIndex}, this.getList)}
        />
      </div>
    )
  }

  renderBreadcrumb() {
    const {model,} = this.props;
    return (
      <Breadcrumb style={{padding: '24px 24px 0px 24px', fontSize: 14}}>
        <Breadcrumb.Item><a onClick={e => {
          model.push(`/supply/purchase-order?type=${Uri.Query('type')}`);
        }}>返回</a></Breadcrumb.Item>
        <Breadcrumb.Item><a onClick={e => {
          model.push(`/supply/purchase-order?type=${Uri.Query('type')}`);
        }}>商品采购单</a></Breadcrumb.Item>
        <Breadcrumb.Item>详情</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  renderItemTable() {
    const {loading} = this.props;
    const rowType = Uri.Query('type');
    const {purchaseItemList, bulkItemList} = this.props[modelNameSpace];
    const purchaseColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 55,
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
        dataIndex: 'purchase_amount',
        render: (text) => {
          return Format.Money.Rmb(text, 2);
        }
      },
      {
        title: '采购数量',
        dataIndex: 'num',
      },
      {
        title: '总金额',
        dataIndex: 'all',
        render: (text, row) => {
          return Format.Money.Rmb(row.purchase_amount * row.num, 2);
        }
      },
      {
        title: '是否已取消',
        dataIndex: 'order_status',
        align: 'center',
        render: (text) => {
          return text === 'cancle' || text === 'return' ? <span style={{color: 'red'}}>是</span> : '否'
        }
      },
      {
        title: '采购链接',
        dataIndex: 'buy_request',
        render: (text) => {
          if (!text) {
            return null;
          }
          return <a href={text} target='_blank'>点击查看</a>
        }
      },
    ];
    const bulkColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 55,
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '图片',
        dataIndex: 'img',
        width: 70,
        render: (text, row) => {
          return <ProductInfo proId={row.pro_id}/>
        }
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
        title: '总金额',
        dataIndex: 'all',
        render: (text, row) => {
          return Format.Money.Rmb(row.purchase_price * row.purchase_num, 2);
        }
      },
      {
        title: '是否已取消',
        dataIndex: 'bulk_status',
        align: 'center',
        render: (text) => {
          return text === 'cancle' ? <span style={{color: 'red'}}>是</span> : '否'
        }
      },
      {
        title: '采购链接',
        dataIndex: 'bulk_address',
        render: (text) => {
          return <a href={text} target='_blank'>点击查看</a>
        }
      },
    ];
    let allMoney = 0;
    if (rowType === 'purchase') {
      purchaseItemList.forEach(x => {
        allMoney += x.purchase_amount * x.num;
      });
    } else {
      bulkItemList.forEach(x => {
        allMoney += x.pruchase_price * x.purchase_num;
      });
    }
    return (
      <div>
        <div style={{width:'100%',textAlign: 'right'}}>
          <Button type='primary' icon='check' style={{marginBottom: 12}} onClick={e => this.submitPay(Uri.Query('id'))}>确认付款</Button>
        </div>
        <Alert message={`总采购金额：${Format.Money.Rmb(allMoney, 2)}`} style={{marginBottom: 12}}/>
        <StandardTable
          columns={rowType === 'purchase' ? purchaseColumns : bulkColumns}
          rowKey={record => record.id}
          dataSource={rowType === 'purchase' ? purchaseItemList : bulkItemList}
          loading={loading.effects[`${modelNameSpace}/${rowType === 'purchase' ? 'getPurchaseItemListByID' : 'getBulkItemListByID'}`]}
        />
      </div>
    )
  }

  render() {
    const id = Uri.Query('id');
    const fxLayoutProps = {
      pageHeader: {
        title: '商品采购单',
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
        {id ?
          <div>
            {this.renderBreadcrumb()}
            <div style={{padding: 24, margin: 24, backgroundColor: '#fff'}}>
              {this.renderItemTable()}
            </div>
          </div> :
          <FxLayout {...fxLayoutProps} />}

      </div>
    )
  }
}
