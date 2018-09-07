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
  Breadcrumb,
  Switch,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import classNames from 'classnames';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import DescriptionList from '../../../components/DescriptionList';
import StandardModal from '../../../myComponents/Modal/Standard';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import SearchForm from '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import ShopSelect from '../../../myComponents/Select/Shop';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Color from '../../../utils/rs/Color';
import Config from "../../../utils/rs/Config";
import style from './index.less';
import Uri from "../../../utils/rs/Uri";
import NotDownloadAsin from './notDownloadAsin';
import DataCount from './data';
import LoadingService from '../../../utils/rs/LoadingService';


const modelNameSpace = "grounding-asin";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const {Description} = DescriptionList;
const {Meta} = Card;

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();

const shopData = fetchApiSync({url: '/Shop/GetAllOpenShop',});
const shopList = shopData.data.toObject().list;
const formatter = {
  department: {},
  shop: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});
shopList.forEach(shop => {
  formatter.shop[`${shop['shopId']}`] = shop['shop_name'];
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    detailDrawerProps: {
      visible: false,
      currentPAsin: {},
      showNoSale: false,
      hideHistoryAsin:true,
    },
    isSale: '1',
    activeKey: 'download',
    isTabBar: true,
    sorterColumn: 'firstSaleDate',
    sorterType: 'descend',
  }

  componentDidMount() {
    const activeKey = Uri.Query('key') || 'download';
    const isTabBar = Uri.Query('isTabBar') ? false : true;
    this.setState({
      activeKey,
      isTabBar,
    });
    this.getList(1);
  }

  ref = {
    searchForm: null,
  }

  getList = (page) => {
    const {model, role} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    const {getFieldsValue} = this.ref.searchForm.props.form;
    let {isSale, sorterColumn, sorterType} = this.state;
    isSale=isSale==='isUnder'?null:isSale==="1";
    const {date, firstSaleDate} = getFieldsValue();
    const startDate = date ? date[0].format('YYYY-MM-DD') : null;
    const endDate = date ? date[1].format('YYYY-MM-DD') : null;
    const firstSaleStartDate = firstSaleDate && firstSaleDate.length > 0 ? firstSaleDate[0].format('YYYY-MM-DD') : null;
    const firstSaleEndDate = firstSaleDate && firstSaleDate.length > 0 ? firstSaleDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        pageIndex,
        pageSize,
        startDate,
        endDate,
        firstSaleStartDate,
        firstSaleEndDate,
        role,
        isSale,
        isUnder:isSale===null,
        ...getFieldsValue(),
        shopType: 'amazon',
        sorterColumn,
        sorterType,
      })
    })
  }

  getDetailList = (page) => {
    const {model} = this.props;
    const {currentPAsin: {P_ASIN}, showNoSale,hideHistoryAsin} = this.state.detailDrawerProps;
    const {detailPageIndex, pageSize, detailData: {total}} = this.props[modelNameSpace];
    model.setState({
      detailPageIndex: page || detailPageIndex,
      detailData: {
        list: [],
        total,
      }
    }).then(() => {
      model.call('getPAsinDetail', {
        pageIndex: page || detailPageIndex,
        pageSize,
        pAsin: P_ASIN,
        showNoSale,
        hideHistoryAsin,
      })
    })
  }

  openDetailDrawer = (pAsin) => {
    const {model} = this.props;
    this.setState({
      detailDrawerProps: {
        visible: true,
        currentPAsin: pAsin,
        showNoSale: false,
        hideHistoryAsin:true,
      }
    }, e => this.getDetailList(1))
  }

  renderSearchForm() {
    const {resetFields} = this.ref.searchForm ? this.ref.searchForm.props.form : {};
    const right = (
      <Button
        type='primary'
        icon='retweet'
        onClick={e => this.getList()}
      >
        刷新
      </Button>)
    const advProps = {
      formItem: [
        {
          label: '父ASIN',
          key: 'pAsin',
          render: () => {
            return (
              <Input placeholder="输入父ASIN查询"/>
            )
          }
        },
        {
          label: '子ASIN',
          key: 'asin',
          render: () => {
            return (
              <Input placeholder="输入子ASIN查询"/>
            )
          }
        },
        {
          label: '上架人员',
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
          label: '上架日期',
          key: 'date',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '店铺',
          key: 'shopID',
          render: () => {
            return (<ShopSelect isAllOpen={true}/>)
          }
        },
        {
          label: '平台',
          key: 'shopType',
          render: () => <AutoSelect typeCode='shop-type' placeholder='请选择平台'/>
        },
        {
          label: '首单日期',
          key: 'firstSaleDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        // {
        //   label: '是否出单',
        //   key: 'isSale',
        //   render: () =>
        //     (
        //       <AutoSelect typeCode='shop-type' placeholder='请选择是否出单'>
        //         <Option value={true}>已出单</Option>
        //         <Option value={false}>未出单</Option>
        //       </AutoSelect>
        //     )
        // },
      ],
      onSearch: e => this.getList(1),
      reset: () => {
        resetFields();
        this.getList(1);
      }
    };
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
        right={right}
      />
    )
  }

  getCodeList = (shopType) => {
    let list = [];
    switch (shopType) {
      case 'amazon':
        list = [
          {
            name: '北美站(简码：US/CA/MX)',
            code: 'US',
            url: 'www.amazon.com/dp/',
          },
          {
            name: '英国站(简码：UK)',
            code: 'UK',
            url: 'www.amazon.co.uk/dp/',
          },
          {
            name: '法国站(简码：FR)',
            code: 'FR',
            url: 'www.amazon.fr/dp/',
          },
          {
            name: '德国站(简码：DE)',
            code: 'DE',
            url: 'www.amazon.de/dp/',
          },
          {
            name: '意大利(简码：IT)',
            code: 'IT',
            url: 'www.amazon.it/dp/',
          },
          {
            name: '西班牙(简码：ES)',
            code: 'ES',
            url: 'www.amazon.es/dp/',
          },
          {
            name: '日本站(简码：JP)',
            code: 'JP',
            url: 'www.amazon.co.jp/dp/',
          },
          {
            name: '澳洲站(简码：AU)',
            code: 'AU',
            url: 'www.amazon.com.au/dp/'
          },
          {
            name: '其它',
            code: null,
            url: 'www.amazon.com/dp/'
          }
        ];
        break;
      case 'ebay':
        list = [
          {
            name: 'Ebay-US',
            code: 'us',
            url: 'www.ebay.com/itm/',
          },
          {
            name: 'Ebay-UK',
            code: 'uk',
            url: 'www.ebay.co.uk/itm/',
          },
          {
            name: 'Ebay-AU',
            code: 'au',
            url: 'www.ebay.au/itm/',
          },
          {
            name: 'Ebay-DE',
            code: 'de',
            url: 'www.ebay.de/itm/',
          },
          {
            name: 'Ebay-FR',
            code: 'fr',
            url: 'www.ebay.fr/itm/',
          },
          {
            name: '其他',
            code: null,
            url: 'www.ebay.com/itm/',
          }
        ];
        break;
      case "cdiscount":
        list = [
          {
            name: '其他',
            code: null,
            url: 'www.cdiscount.com/dp.aspx?sku=',
          }
        ];
        break;
      case "wish":
        list = [
          {
            name: '其他',
            code: null,
            url: 'www.wish.com/c/'
          }
        ];
        break;
      case "shopee":
        list = [
          {
            name: 'Shopee-TW',
            code: 'tw',
            url: 'shopee.tw/product/74663392/',
          },
          {
            name: 'Shopee-MY',
            code: 'my',
            url: 'shopee.com.my/product/62637884/',
          },
          {
            name: 'Shopee-SG',
            code: 'sg',
            url: 'shopee.com.sg/product/69429374/',
          },
          {
            name: 'Shopee-ID',
            code: 'id',
            url: 'shopee.co.id/product/74663392/',
          },
          {
            name: 'Shopee-TH',
            code: 'th',
            url: 'shopee.co.th/product/74663392/',
          },
          {
            name: 'Shopee-VN',
            code: 'vn',
            url: 'shopee.vn/product/74663392/',
          },
          {
            name: '其他',
            code: null,
            url: '',
          }
        ];
        break;
    }
    return list;
  }

  changeTab = (tab) => {
    const {model, role} = this.props;
    let url = '';
    switch (role) {
      case "admin":
        url = '/shop/grounding/track';
        break;
      case "manager":
        url = '/shop/grounding/plan';
        break;
      case "employee":
        url = '/shop/grounding/task';
        break;
    }
    model.push(`${url}?tag=asin&key=${tab}`);
    // this.setState({
    //   activeKey:tab,
    // });
  }

  switchUnder = (asinID) => {
    const {model} = this.props;
    model.call('switchUnder', {
      asinID,
    }).then(success => {
      if (success) {
        this.getList();
      }
    })
  }

  refreshAsinByID=(asinID)=>{
    const {model}=this.props;
    LoadingService.Start("正在刷新数据，请稍后...");
    model.call("refreshAsinByID",{asinID,})
         .then(success=>{
            LoadingService.Done();
          });
  }

  renderTableHeader() {
    const {data: {isSaleNum = 0, all = 0}} = this.props[modelNameSpace];
    var isSaleRate = formatNumber(isSaleNum / (all) * 100, 2);
    return (
      <Card style={{marginBottom: 24, marginTop: 8}}>
        <Row>
          <Col span={6}>
            <div className='headerInfo'>
              <span>已出单数量</span>
              <p style={{color: Color.Success}}>{isSaleNum}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>未出单数量</span>
              <p style={{color: Color.Error}}>{all - isSaleNum}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>总ASIN数量</span>
              <p>{all}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>出单率</span>
              <p style={{color: Color.Processing}}>{`${isSaleRate}%`}</p>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }

  renderTable() {
    const {loading} = this.props;
    const columns = [
      {
        title: '图片',
        dataIndex: 'imgUrl',
        align: 'center',
        fixed: 'left',
        width: 70,
        render: (text) => {
          return (<img src={text} style={{width: 40}}/>)
        }
      },
      {
        title: 'ASIN',
        dataIndex: 'P_ASIN',
        width:100,
        render: (text, row) => {
          const codeList = this.getCodeList(row.shopType);
          const obj = codeList.filter(x => x.code === row.code)[0];
          return (<a href={`http://${obj.url}${row.ASIN}`} target='_blank'>{text}</a>)
        }
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        width:240,
        render: (text) => {
          return (
            <div>{text}</div>
          )
        }
      },
      {
        title: '商品类别',
        dataIndex: 'category',
        width:180,
        render: (text) => {
          if (text) {
            return (
              <ul >
                {text.toList('%').map(x => {
                  x=x.replace('&amp;amp; ','& ');
                  return (<li style={{listStyle:'disc'}}>{x}</li>)
                })}
              </ul>
            )
          }
          return null;
        }
      },
      {
        title: '部门',
        dataIndex: 'depID',
        width:100,
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '店铺',
        dataIndex: 'shopID',
        width:200,
        render: (text) => {
          return formatter.shop[text];
        }
      },
      {
        title: '平台',
        dataIndex: 'shopType',
        width:60,
      },
      {
        title: '站点',
        dataIndex: 'code',
        width:160,
        render: (text, row) => {
          const codeList = this.getCodeList(row.shopType);
          const obj = codeList.filter(x => x.code === row.code)[0];
          return obj.name;
        }
      },
      {
        title: '上架人员',
        dataIndex: 'createUserName',
        width:60,
      },
      {
        title: '上架时间',
        dataIndex: 'createDate',
        width:150,
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM')
        }
      },
      {
        title: '首单时间',
        dataIndex: 'firstSaleDate',
        width:150,
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM')
        }
      },
      {
        title: '状态',
        dataIndex: 'isSale',
        width:100,
        render: (text, row) => {
          return (
            <div>
              <p><Badge status={text === 1 ? 'success' : 'default'} text={text === 1 ? '已出单' : '未出单'}/></p>
              <p>{row.isUnder === 1 ? <Badge status='error' text='已下架'/> : null}</p>
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        fixed: 'right',
        width:150,
        render: (text, row, index) => {
          const action = [
            {
              label: '查看详情',
              submit: () => {
                this.openDetailDrawer(row);
              }
            }
          ];
          const more = [
            {
              label: row.isUnder === 1 ? "重新上架" : '下架',
              submit: () => {
                this.switchUnder(row.id);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>);
        }
      },
    ];
    const {data: {list}} = this.props[modelNameSpace];
    return (
      <div>
        {this.renderTableHeader()}
        <Tabs
          activeKey={this.state.isSale}
          onChange={isSale => {
            this.setState({isSale,}, e => this.getList(1))
          }}
          type='card'
          tabBarExtraContent={
            <div>
              <Select value={this.state.sorterColumn} style={{marginRight: 16}}
                      onChange={sorterColumn => this.setState({sorterColumn}, e => this.getList(1))}>
                <Option value='firstSaleDate'>首单时间</Option>
                <Option value='createDate'>上架时间</Option>
              </Select>
              <Select value={this.state.sorterType}
                      onChange={sorterType => this.setState({sorterType}, e => this.getList(1))}>
                <Option value='ascend'>升序</Option>
                <Option value='descend'>降序</Option>
              </Select>
            </div>
          }
        >
          <TabPane key='1' tab='已出单'/>
          <TabPane key='0' tab='未出单'/>
          <TabPane key='isUnder' tab='已下架'/>
        </Tabs>
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          scroll={{x: 1300}}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>
    )
  }

  renderDetailHeader() {
    const {detailData: {orderTotal, productTotal, asinNum}} = this.props[modelNameSpace];
    return (
      <Card style={{marginBottom: 24, marginTop: 16}}>
        <Row>
          <Col span={8}>
            <div className='headerInfo'>
              <span>总订单数量</span>
              <p>{orderTotal}</p>
              <em/>
            </div>
          </Col>
          <Col span={8}>
            <div className='headerInfo'>
              <span>总商品数量</span>
              <p>{productTotal}</p>
              <em/>
            </div>
          </Col>
          <Col span={8}>
            <div className='headerInfo'>
              <span>变体数量</span>
              <p>{asinNum}</p>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }

  renderDetailDrawer() {
    const {visible, currentPAsin: {P_ASIN, depID, shopID, shopType, code, createUserName,}} = this.state.detailDrawerProps;
    const {loading, pagination} = this.props;
    const {detailPageIndex, detailData: {total, list, orderTotal, productTotal,}} = this.props[modelNameSpace];
    const codeList = this.getCodeList(shopType);
    const columns = [
      {
        title: '图片',
        dataIndex: 'pro_id',
        render: (text) => {
          return (<ProductInfo proId={text}/>)
        }
      },
      {
        title: '变体ASIN',
        dataIndex: 'ASIN',
        render: (text) => {
          return (
            <a href={`http://${codeList.filter(x => x.code === code)[0].url}${text}`} target='_blank'>{text}</a>
          )
        }
      },
      {
        title: '颜色',
        dataIndex: 'color_code',
      },
      {
        title: '尺码',
        dataIndex: 'size_code'
      },
      {
        title: '订单数量',
        dataIndex: 'orderNum'
      },
      {
        title: '商品数量',
        dataIndex: 'productNum',
      },
      {
        title: '首单时间',
        dataIndex: 'firstOrderDate',
        render: (text) => {
          return Format.Date.Format(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, row) => {
          let obj = {};
          switch (text) {
            case 0:
              obj = {text: '初始', status: 'success'};
              break;
            case 1:
              obj = {text: '新上架', status: 'processing'};
              break;
            case 2:
              obj = {text: '已下架', status: 'error'};
              break;
          }
          return (
            <div>
              <p><Badge text={obj.text} status={obj.status}/></p>
              <p>{moment(row.firstOrderDate)<moment('2018-7-30')? <Badge text='历史变体' status='warning'/>:null}</p>
            </div>

          )
        }
      },
    ];
    return (
      <Drawer
        width={1000}
        visible={visible}
        title='已出单的ASIN详情'
        onClose={e => this.setState({detailDrawerProps: {visible: false}})}
      >
        <div style={{float:'right'}}>
          <span style={{marginRight:10}}>隐藏历史变体</span>
          <Switch
            checked={this.state.detailDrawerProps.hideHistoryAsin}
            onChange={hideHistoryAsin=>this.setState({detailDrawerProps:{...this.state.detailDrawerProps,hideHistoryAsin,}},e=>this.getDetailList(1))}
          />
        </div>
        <div style={{clear:'both'}} />
        {this.renderDetailHeader()}
        <DescriptionList style={{marginBottom: 24}} col="3">
          <Description term="父ASIN">{P_ASIN}</Description>
          <Description term="部门">{formatter.department[depID]}</Description>
          <Description term="店铺">{formatter.shop[shopID]}</Description>
        </DescriptionList>
        <DescriptionList style={{marginBottom: 24}} col="3">
          <Description term="平台">{shopType}</Description>
          <Description term="站点">{codeList.filter(x => x.code === code)[0].name}</Description>
          <Description term="上传人员">{createUserName}</Description>
        </DescriptionList>
        <StandardTable
          rowKey={record => record.ASIN}
          columns={columns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/getPAsinDetail`]}
          page={pagination({pageIndex: detailPageIndex, total}, this.getDetailList)}
        />
      </Drawer>
    )
  }

  renderBreadcrumb() {
    const {model, role} = this.props;
    const {activeKey} = this.state;
    let obj = {};
    switch (role) {
      case "admin":
        obj = {
          url: '/shop/grounding/track',
          name: '铺货跟踪',
        };
        break;
      case "manager":
        obj = {
          url: '/shop/grounding/plan',
          name: '铺货计划',
        };
        break;
      case "employee":
        obj = {
          url: '/shop/grounding/task',
          name: '我的铺货任务',
        };
        break;
    }
    let keyName = '';
    switch (activeKey) {
      case 'download':
        keyName = '已下载ASIN列表';
        break;
      case 'data':
        keyName = '数据统计';
        break;
      case 'not-download':
        keyName = '未下载ASIN列表';
        break;
      default:
        keyName = '已下载ASIN列表';
        break;
    }
    return (
      <Breadcrumb style={{padding: '8px 24px 0px 24px', fontSize: 13}}>
        <Breadcrumb.Item><a onClick={e => {
          window.history.back()
        }}>返回</a></Breadcrumb.Item>
        <Breadcrumb.Item><a onClick={e => {
          model.push(obj.url)
        }}>{obj.name}</a></Breadcrumb.Item>
        <Breadcrumb.Item>{keyName}</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  renderDownLoad() {
    const {pagination, role} = this.props;
    const {pageIndex, data: {total}} = this.props[modelNameSpace];
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
      <div>
        {this.renderBreadcrumb()}
        <FxLayout
          {...fxLayoutProps}
        />
      </div>
    )
  }

  renderDataCount() {
    return (
      <div className={style.asinDataCount}>
        <div>
          {this.renderBreadcrumb()}
          <DataCount/>
        </div>
      </div>
    )
  }

  render() {
    const {pagination, role} = this.props;
    const {pageIndex, data: {total}} = this.props[modelNameSpace];
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
      <div className={classNames({
        ['white-body']: true,
        [style.asin]: this.state.activeKey === 'data',
      })}>
        {
          this.state.isTabBar ?
            <Tabs className='ant-tab-title-bar' activeKey={this.state.activeKey} onChange={this.changeTab}>
              <TabPane key='download' tab='已下载ASIN列表'/>
              {role === 'admin' ? <TabPane key='data' tab='数据统计'/> : null}
              <TabPane key='not-download' tab='未下载ASIN列表'/>
            </Tabs> : null
        }
        {this.state.activeKey === 'download' ? this.renderDownLoad() : null}
        {this.state.activeKey === 'data' ? this.renderDataCount() : null}
        {this.state.activeKey === 'not-download' ?
          <div>{this.renderBreadcrumb()}<NotDownloadAsin role={role}/></div> : null}
        {this.state.detailDrawerProps.visible ? this.renderDetailDrawer() : null}
      </div>
    )
  }
}
