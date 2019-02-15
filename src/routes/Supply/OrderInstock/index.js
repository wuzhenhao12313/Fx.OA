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
import RcPrint from 'rc-print';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';

const modelNameSpace = "supply-purchase_order_instock";
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
@Component.Role('erp_purchase_order_instock')
@Form.create()
export default class extends PureComponent {
  state = {
    type: 'purchase',
    modalProps: {
      visible: false,
      row: {},
    }
  }

  componentDidMount() {
    this.getList(1);
  }

  ref = {
    searchForm: null,
  }

  getList = (page) => {
    const {model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const {type} = this.state;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    model.setState({
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        pageIndex,
        pageSize,
        type,
        ...getFieldsValue(),
      })
    })
  }

  startPrint = () => {
    this.refs.rcPrint.onPrint();
    this.setState({
      modalProps: {
        visible: false,
      }
    });
  }

  openModal = (row) => {
    const {model} = this.props;
    const {type} = this.state;
    this.setState({
      modalProps: {
        visible: true,
        row,
      }
    });
    if (type === 'purchase') {
      model.call('getPurchaseInstockItem', {
        instockID: row.id,
      })
    } else {
      let {startDate, endDate} = row;
      let instockStartDate =startDate ? moment(startDate).format('YYYY-MM-DD HH:mm:ss') : null;
      let instockEndDate = endDate ? moment(endDate).format('YYYY-MM-DD HH:mm:ss') : null;
      model.call('getIsPayBulkItem', {
        type,
        instockStartDate,
        instockEndDate,
      });
    }

  }

  renderSearchForm() {
    const item = [
      [
        {
          key: 'serialNo',
          label: '入库单号',
          render: () => {
            return (<Input style={{width: 200}}/>)
          }
        },
      ],
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
    const {type} = this.state;
    const {loading, pagination} = this.props;
    const {data: {list, total}, pageIndex} = this.props[modelNameSpace];
    const columns = [
      {
        title: '入库单号',
        dataIndex: 'serialNo',
      },
      {
        title: '创建日期',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '创建人员',
        dataIndex: 'createUserName',
      },
      {
        title: '入库开始日期',
        dataIndex: 'startDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '入库结束日期',

        dataIndex: 'endDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '是否确认',
        dataIndex: 'isSubmit',
        render: (text) => {
          return text ? "是" : "否";
        }
      },
      {
        title: '确认日期',
        dataIndex: 'submitDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '确认人员',
        dataIndex: 'submitUserName',
      },
      {
        title: '操作',
        dataIndex: 'op',
        width: 200,
        align: 'right',
        render: (text, row) => {
          const action = [
            {
              label: '预览',
              submit: () => {
                this.openModal(row)
              },
            }
          ];
          const more = [
            {
              label: '确认',
              submit: () => {

              }
            }
          ];
          return <TableActionBar action={action} more={more}/>
        }
      }
    ]
    return (
      <div>
        <Tabs activeKey={this.state.type} type='card' onChange={type => this.setState({type}, e => this.getList(1))}>
          <TabPane tab='散单采购' key='purchase'/>
          <TabPane tab='大货采购' key='bulk'/>
        </Tabs>
        <StandardTable
          columns={columns}
          dataSource={list}
          rowKey={record => record.id}
          pagination={pagination({pageIndex, total}, this.getList)}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>
    )
  }

  renderModal() {
    const {visible, row} = this.state.modalProps;
    const {bulkInstockList, purchaseInstockList} = this.props[modelNameSpace];
    console.log(purchaseInstockList)
    const {type} = this.state;
    let list = type === 'purchase' ? purchaseInstockList : bulkInstockList;
    let blankLength = list.length >= 20 ? 0 : 20 - list.length;
    let blankList = [];
    let allPurchaseNum = 0;
    let allInstockNum = 0;
    let allInstockMoney = 0;
    for (let i = 0; i < blankLength; i++) {
      blankList.push(i);
    }
    list.forEach(x => {
      allPurchaseNum += type === 'purchase' ? x.num : x.purchase_num;
      allInstockNum += type === 'purchase' ? x.num : x.instockNum;
      allInstockMoney = type === 'purchase' ? (x.num * x.purchase_amount) : (x.instockNum * x.purchase_price);
    });
    const tableStyle = {
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
    const footerCommon = {
      webkitPrintColorAdjust: 'exact',
      color: '#111',
      height: 70,
      width: 1200,
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderLeft: '1px solid',
      position: 'relative',
    }
    const nameFrame = {
      webkitPrintColorAdjust: 'exact',
      position: 'absolute',
      right: 10,
      bottom: 10,
      height: 50,
      top: 20,
      width: 360,
    }

    const div1 = {
      webkitPrintColorAdjust: 'exact',
      position: 'absolute',
      left: 10,
      bottom: 10,
      width: 170,
    }

    const div2 = {
      webkitPrintColorAdjust: 'exact',
      position: 'absolute',
      left: 180,
      bottom: 10,
      width: 170,
    }

    const span = {
      webkitPrintColorAdjust: 'exact',
      fontWeight: 'bold',
      fontSize: 14,
    }


    return (
      <StandardModal
        style={{top: 20}}
        title='预览'
        visible={visible}
        onCancel={e => this.setState({modalProps: {visible: false}})}
        width={1249}
        onOk={e => this.startPrint()}
      >
        <RcPrint ref="rcPrint" clearIframeCache>
          <div>
            <h1 style={{textAlign: 'center', fontWeight: 'bold'}}>商品采购入库单</h1>
            <table style={{...tableStyle, borderTop: '1px solid'}}>
              <tr>
                <td style={{...tdCommon, width: 120, maxWidth: 120, textAlign: 'left', fontWeight: 'bold'}}>入库单号</td>
                <td style={{...tdCommon, width: 280, maxWidth: 280, textAlign: 'left'}}>{row.serialNo}</td>
                <td style={{...tdCommon, width: 120, maxWidth: 120, textAlign: 'left', fontWeight: 'bold'}}>创建时间</td>
                <td style={{
                  ...tdCommon,
                  width: 300,
                  maxWidth: 300,
                  textAlign: 'left'
                }}>{formatDate(row.createDate, 'YYYY-MM-DD HH:mm')}</td>
                <td style={{...tdCommon, width: 80, maxWidth: 80, textAlign: 'left', fontWeight: 'bold'}}>创建人员</td>
                <td style={{...tdCommon, width: 300, maxWidth: 300, textAlign: 'left'}}>{row.createUserName}</td>
              </tr>
            </table>
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
                <td style={{...tdCommon, width: 80, maxWidth: 80, textAlign: 'right', fontWeight: 'bold'}}>采购数量</td>
                <td style={{...tdCommon, width: 80, maxWidth: 80, textAlign: 'right', fontWeight: 'bold'}}>入库数量</td>
                <td style={{...tdCommon, width: 100, maxWidth: 100, textAlign: 'right', fontWeight: 'bold'}}>入库金额</td>
                <td style={{...tdCommon, width: 120, maxWidth: 120, textAlign: 'center', fontWeight: 'bold'}}>入库日期</td>
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
                    <td style={{
                      ...tdCommon,
                      width: 80,
                      maxWidth: 80,
                      height: 31,
                      textAlign: 'right'
                    }}>{formatNumber(type === 'purchase' ? value.num : value.instockNum)}</td>
                    <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'right'}}>
                      {Format.Money.Rmb(type === 'purchase' ? (value.num * value.purchase_amount) : (value.instockNum * value.purchase_price), 2)}
                    </td>
                    <td style={{...tdCommon, width: 120, maxWidth: 120, height: 31, textAlign: 'center'}}>
                      {formatDate(type === 'purchase' ? value.qualified_date : value.instock_all_date, 'YYYY-MM-DD HH:mm')}
                    </td>
                  </tr>
                )
              })}
              {
                blankList.map((value, index) => {
                  return (
                    <tr>
                      <td style={{
                        ...tdCommon,
                        width: 50,
                        maxWidth: 50,
                        height: 31,
                        textAlign: 'center',
                      }}>{index + 1 + (20 - blankLength)}</td>
                      <td style={{...tdCommon, width: 70, maxWidth: 70, height: 31, textAlign: 'center',}}/>
                      <td style={{...tdCommon, width: 80, maxWidth: 80, height: 31, textAlign: 'center'}}/>
                      <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'center'}}/>
                      <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'center'}}/>
                      <td style={{...tdCommon, width: 120, maxWidth: 120, height: 31, textAlign: 'center'}}/>
                      <td style={{...tdCommon, width: 200, maxWidth: 200, height: 31, textAlign: 'center'}}/>
                      <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'right'}}/>
                      <td style={{...tdCommon, width: 80, maxWidth: 80, height: 31, textAlign: 'right'}}/>
                      <td style={{...tdCommon, width: 80, maxWidth: 80, height: 31, textAlign: 'right'}}/>
                      <td style={{...tdCommon, width: 100, maxWidth: 100, height: 31, textAlign: 'right'}}/>
                      <td style={{...tdCommon, width: 120, maxWidth: 120, height: 31, textAlign: 'center'}}/>
                    </tr>
                  )
                })
              }
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
                }}>{formatNumber(allPurchaseNum)}</td>
                <td style={{
                  ...tdCommon,
                  width: 80,
                  maxWidth: 80,
                  height: 31,
                  textAlign: 'right'
                }}>{formatNumber(allInstockNum)}</td>
                <td style={{
                  ...tdCommon,
                  width: 100,
                  maxWidth: 100,
                  height: 31,
                  textAlign: 'right'
                }}>{Format.Money.Rmb(allInstockMoney, 2)}</td>
                <td style={{...tdCommon, width: 120, maxWidth: 120, height: 31, textAlign: 'center'}}/>
              </tr>
            </table>
            <div style={footerCommon}>
              <div style={nameFrame}>
                <div style={div1}>
                  <span style={span}>人员签字</span>
                </div>
                <div style={div2}>
                  <span style={span}>填写日期</span>
                </div>
              </div>
            </div>
          </div>
        </RcPrint>
      </StandardModal>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '商品采购入库单',
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
        {this.state.modalProps.visible ? this.renderModal() : null}
      </div>
    )
  }
}
