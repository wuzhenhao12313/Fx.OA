import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Badge,
  Modal,
  Select,
  Tabs,
  Steps,
  Form,
  Breadcrumb,
  Alert,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import SearchForm from '../../../myComponents/Form/Search';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Uri from '../../../utils/rs/Uri';
import StandardRangePicker from "../../../myComponents/Date/StandardRangePicker";
import RcPrint from 'rc-print';
import {exportExcel} from '../../../utils/rs/Excel';

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
  state = {
    printModalProps: {
      visible: false,
    },
    type: 'purchase',
  }

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

  removeOrder = (orderID) => {
    Modal.confirm({
      title: '确定要删除采购单吗？',
      onOk: () => {
        const {model} = this.props;
        model.call('removeOrder', {
          orderID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    })
  }

  startPrint = () => {
    this.refs.rcPrint.onPrint();
    this.setState({
      printModalProps: {
        visible: false,
      }
    });
  }

  exportExcel = () => {
    const rowType = Uri.Query('type');
    const rowStatus = Uri.Query('status');
    const {purchaseItemList, bulkItemList} = this.props[modelNameSpace];
    let allMoney = 0, allReturnMoney = 0;
    if (rowType === 'purchase') {
      purchaseItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.purchase_amount : 0;
        allMoney += x.purchase_amount;
      });
    } else {
      bulkItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.pruchase_price * x.purchase_num : 0;
        allMoney += x.purchase_price * x.purchase_num;
      });
    }
    const list = rowType === 'purchase' ? purchaseItemList : bulkItemList;
    const title = [
      {"value": "订单编号"},
      {"value": "商品ID"},
      {"value": "颜色"},
      {"value": "尺码"},
      {"value": "供应商"},
      {"value": "采购单价"},
      {"value": "采购数量"},
      {"value": "总金额"},
    ];

    let dataArr = [];
    list.forEach(x => {
      const obj = [
        {value: x.order_bid,},
        {value: x.pro_id},
        {value: x.color_code},
        {value: x.size_code},
        {value: x.suppliers_name},
        {value: Format.Money.Rmb(x.purchase_amount, 2)},
        {value: x.num},
        {value: Format.Money.Rmb(x.purchase_amount, 2)}
      ];
      dataArr.push(obj);
    });
    exportExcel(dataArr, '商品采购单', title);
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
                model.push(`/supply/purchase-order?id=${row.id}&type=${row.type}&status=${row.status}`);
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
            {
              label: '删除',
              submit: () => {
                this.removeOrder(row.id);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      }
    ];

    return (
      <div>
        <Alert style={{marginBottom: 12}} message={
          <div>
            <p>1、每通过excel导入下单会生成对应的采购单</p>
            <p>2、采购单分为散单采购单和大货采购单</p>
            <p>3、采购单生成之后无法被删除</p>
            <p>4、采购端确认付款完成之后，采购单内采购项才会生效</p>
          </div>
        }/>
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
    const rowStatus = Uri.Query('status');
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
          return Format.Money.Rmb(row.purchase_amount, 2);
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        render: (text) => {
          if (text === 0) {
            return <Badge text='待付款' status='processing'/>;
          }
          if (text === 1) {
            return <Badge text='已付款' status='success'/>;
          }
          if (text === 2) {
            return <Badge text='已退款' status='error'/>;
          }
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
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        render: (text) => {
          if (text === 0) {
            return "待付款";
          }
          if (text === 1) {
            return "已付款";
          }
          if (text === 2) {
            return "已退款";
          }
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
    let allMoney = 0, allReturnMoney = 0;
    if (rowType === 'purchase') {
      purchaseItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.purchase_amount : 0;
        allMoney += x.purchase_amount;
      });
    } else {
      bulkItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.pruchase_price * x.purchase_num : 0;
        allMoney += x.purchase_price * x.purchase_num;
      });
    }
    return (
      <div>
        <div style={{width: '100%', textAlign: 'right'}}>
          {rowStatus === 'wait-submit-pay' ?
            <Button type='primary' icon='check' style={{marginBottom: 12, marginRight: 10}}
                    onClick={e => this.submitPay(Uri.Query('id'))}>确认付款</Button> : null
          }
          <Button type='dashed' style={{marginBottom: 12, marginRight: rowType === 'purchase' ? 10 : 0}} icon='printer'
                  onClick={e => this.setState({printModalProps: {visible: true}})}>打印</Button>
          {rowType === 'purchase' ? <Button type='primary' style={{marginBottom: 12}} icon='export'
                                            onClick={this.exportExcel} ghost>导出</Button> : null}

        </div>
        <Alert message={`总采购金额：${Format.Money.Rmb(allMoney, 2)},
                           总退款金额：${Format.Money.Rmb(allReturnMoney, 2)},
                           总金额：${Format.Money.Rmb(allMoney - allReturnMoney, 2)}`}
               style={{marginBottom: 12}}/>
        <StandardTable
          columns={rowType === 'purchase' ? purchaseColumns : bulkColumns}
          rowKey={record => record.id}
          dataSource={rowType === 'purchase' ? purchaseItemList : bulkItemList}
          loading={loading.effects[`${modelNameSpace}/${rowType === 'purchase' ? 'getPurchaseItemListByID' : 'getBulkItemListByID'}`]}
        />
      </div>
    )
  }

  renderPrintModal() {
    const {printModalProps: {visible}} = this.state;
    const type = Uri.Query('type');
    const {purchaseItemList, bulkItemList} = this.props[modelNameSpace];
    const tableStyle = {
      borderTop: '1px solid',
      borderLeft: '1px solid',
      borderRight: '1px solid',
      width: 1200,
      webkitPrintColorAdjust: 'exact',
      fontFamily: '微软雅黑',
    }
    const tdCommon = {
      padding: '5px 4px',
      borderRight: '1px solid',
      borderBottom: '1px solid',
      textAlign: 'center',
      fontSize: 13,
      webkitPrintColorAdjust: 'exact',
      color: '#111'
    }
    const list = type === 'purchase' ? purchaseItemList : bulkItemList;
    let allMoney = 0, allReturnMoney = 0;
    if (type === 'purchase') {
      purchaseItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.purchase_amount : 0;
        allMoney += x.purchase_amount;
      });
    } else {
      bulkItemList.forEach(x => {
        allReturnMoney += x.status === 2 ? x.pruchase_price * x.purchase_num : 0;
        allMoney += x.purchase_price * x.purchase_num;
      });
    }
    return (
      <StandardModal
        style={{top: 20}}
        title='预览'
        visible={visible}
        onCancel={e => this.setState({printModalProps: {visible: false}})}
        width={1249}
        onOk={e => this.startPrint()}
      >
        <RcPrint ref="rcPrint" clearIframeCache>
          <div>
            <h1 style={{textAlign: 'center', fontWeight: 'bold'}}>商品采购单</h1>
            <table style={tableStyle}>
              <tr>
                <td style={{...tdCommon, width: 50, maxWidth: 50, textAlign: 'center', fontWeight: 'bold'}}>序号</td>
                <td style={{...tdCommon, width: 70, maxWidth: 70, textAlign: 'center', fontWeight: 'bold'}}>图片</td>
                <td style={{...tdCommon, width: 80, maxWidth: 80, textAlign: 'center', fontWeight: 'bold'}}>商品ID</td>
                <td style={{...tdCommon, width: 100, maxWidth: 100, textAlign: 'center', fontWeight: 'bold'}}>颜色</td>
                <td style={{...tdCommon, width: 100, maxWidth: 100, textAlign: 'center', fontWeight: 'bold'}}>尺码</td>
                <td style={{...tdCommon, width: 120, maxWidth: 120, textAlign: 'center', fontWeight: 'bold'}}>供应商</td>
                <td style={{...tdCommon, width: 200, maxWidth: 200, textAlign: 'center', fontWeight: 'bold'}}>供应商单号</td>
                <td style={{...tdCommon, width: 100, maxWidth: 100, textAlign: 'right', fontWeight: 'bold'}}>采购单价</td>
                <td style={{...tdCommon, width: 100, maxWidth: 100, textAlign: 'right', fontWeight: 'bold'}}>采购数量</td>
                <td style={{...tdCommon, width: 160, maxWidth: 160, textAlign: 'right', fontWeight: 'bold'}}>总金额</td>
              </tr>
              {list.map((value, index) => {
                return (
                  <tr>
                    <td
                      style={{...tdCommon, width: 50, maxWidth: 50, height: 31, textAlign: 'center',}}>{index + 1}</td>
                    <td style={{...tdCommon, width: 70, maxWidth: 70, height: 31, textAlign: 'center',}}><ProductInfo
                      proId={value.pro_id}/></td>
                    <td
                      style={{
                        ...tdCommon,
                        width: 80,
                        maxWidth: 80,
                        height: 31,
                        textAlign: 'center'
                      }}>{value.pro_id}</td>
                    <td style={{
                      ...tdCommon,
                      width: 100,
                      maxWidth: 100,
                      height: 31,
                      textAlign: 'center'
                    }}>{value.color_code}</td>
                    <td style={{
                      ...tdCommon,
                      width: 100,
                      maxWidth: 100,
                      height: 31,
                      textAlign: 'center'
                    }}>{value.size_code}</td>
                    <td style={{
                      ...tdCommon,
                      width: 120,
                      maxWidth: 120,
                      height: 31,
                      textAlign: 'center'
                    }}>{value.suppliers_name}</td>
                    <td style={{
                      ...tdCommon,
                      width: 200,
                      maxWidth: 200,
                      height: 31,
                      textAlign: 'center'
                    }}>{value.suppliers_number}</td>
                    <td style={{
                      ...tdCommon,
                      width: 100,
                      maxWidth: 100,
                      height: 31,
                      textAlign: 'right'
                    }}>{Format.Money.Rmb(type === 'purchase' ? value.purchase_amount : value.purchase_price, 2)}</td>
                    <td style={{
                      ...tdCommon,
                      width: 80,
                      maxWidth: 80,
                      height: 31,
                      textAlign: 'right'
                    }}>{formatNumber(type === 'purchase' ? value.num : value.purchase_num)}</td>
                    <td style={{...tdCommon, width: 160, maxWidth: 160, height: 31, textAlign: 'right'}}>
                      <p>{Format.Money.Rmb(type === 'purchase' ? (value.num * value.purchase_amount) : (value.purchase_num * value.purchase_price), 2)}</p>
                      {value.status === 2 ? <p
                        style={{color: 'red'}}>-{Format.Money.Rmb(type === 'purchase' ? (value.num * value.purchase_amount)
                        : (value.purchase_num * value.purchase_price), 2)}</p> : null}
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td style={{
                  ...tdCommon,
                  width: 50,
                  maxWidth: 50,
                  height: 31,
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>合计


                </td>
                <td style={{...tdCommon, width: 70, maxWidth: 70, height: 31, textAlign: 'center',}}/>
                <td style={{...tdCommon, width: 80, maxWidth: 80, height: 31, textAlign: 'center'}}/>
                <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'center'}}/>
                <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'center'}}/>
                <td style={{...tdCommon, width: 120, maxWidth: 120, height: 31, textAlign: 'center'}}/>
                <td style={{...tdCommon, width: 200, maxWidth: 200, height: 31, textAlign: 'center'}}/>
                <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'right'}}/>
                <td style={{
                  ...tdCommon,
                  width: 80,
                  maxWidth: 80,
                  height: 31,
                  textAlign: 'right'
                }}/>
                <td style={{
                  ...tdCommon,
                  width: 160,
                  maxWidth: 160,
                  height: 31,
                  textAlign: 'right'
                }}>
                  <p>总采购：{Format.Money.Rmb(allMoney, 2)}</p>
                  <p style={{color: 'red'}}>总退款：{`-${Format.Money.Rmb(allReturnMoney, 2)}`}</p>
                  <p>总金额：{Format.Money.Rmb(allMoney - allReturnMoney, 2)}</p>
                </td>
              </tr>
            </table>
          </div>
        </RcPrint>
      </StandardModal>
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
        {this.state.printModalProps.visible ? this.renderPrintModal() : null}
      </div>
    )
  }
}
