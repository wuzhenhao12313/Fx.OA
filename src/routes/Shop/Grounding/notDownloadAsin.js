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
import {String} from "../../../utils/rs/Util";


const modelNameSpace = "grounding-asin-not-download";
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
    editModal: {
      isAdd: false,
      visible: false,
      currentAsin: {},
      index: -1,
      currentAddAsinCode: null,
    },
  }

  componentDidMount() {
    this.getList(1);
  }

  ref = {
    searchForm: null,
  }

  getList = (page) => {
    const {model, role} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {isSale} = this.state;
    const {date} = getFieldsValue();
    const startDate = date ? date[0].format('YYYY-MM-DD') : null;
    const endDate = date ? date[1].format('YYYY-MM-DD') : null;
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
        role,
        ...getFieldsValue(),
      })
    })
  };


  editAsin = () => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.editForm.props.form;
    const {pAsin, asin, shopID,code} = getFieldsValue();
    const {currentAsin:{planID,planItemID,id}} = this.state.editModal;
    if (String.IsNullOrEmpty(asin)) {
      message.warning("ASIN不能为空");
      return;
    }
    model.call("editAsin", {
      asinID: id,
      asin: asin.trim(),
      shopID,
      pAsin: pAsin.trim(),
      imgUrl: '',
      code,
    }).then(success => {
      if (success) {
        this.setState({
          editModal: {
            visible: false,
          }
        });
        this.getList();
      }
    });
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
          initialValue: 'amazon',
          render: () => <AutoSelect typeCode='shop-type' placeholder='请选择平台'/>
        },
        {
          label: '状态',
          key: 'status',
          render: () => (
            <AutoSelect placeholder='请选择状态'>
              <Option value={0}>等待下载</Option>
              <Option value={2}>下载失败</Option>
            </AutoSelect>
          )
        }
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

  renderEditModal() {
    const {visible, isAdd, currentAsin} = this.state.editModal;
    const item = [
      {
        key: 'pAsin',
        label: '父ASIN',
        initialValue: isAdd ? undefined : currentAsin.P_ASIN,
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        key: 'asin',
        label: '子ASIN',
        initialValue: isAdd ? undefined : currentAsin.ASIN,
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        key: 'shopID',
        label: '所属店铺',
        initialValue: isAdd ? undefined : currentAsin.shopID,
        render: () => {
          return (
            <ShopSelect isAllOpen={true}/>
          )
        }
      },
      {
         key:'code',
         label:'站点',
        initialValue:isAdd?undefined:currentAsin.code,
        render:()=>{
          const codeList = this.getCodeList(currentAsin.shopType);
           return(
             <AutoSelect >
               {codeList.map((x,idx)=>{
                 return(<Option key={idx} value={x.code}>{x.name}</Option>)
               })}
             </AutoSelect>
           )
        }
      },
    ];
    return (
      <EditModal
        title={isAdd ? '添加ASIN' : '编辑ASIN'}
        visible={visible}
        item={item}
        refForm={node => this.ref.editForm = node}
        onCancel={e => this.setState({editModal: {visible: false}})}
        zIndex={1001}
        footer={true}
        onOk={this.editAsin}
      />
    )
  }

  renderTable() {
    const {loading} = this.props;
    const columns = [
      {
        title: '父ASIN',
        dataIndex: 'P_ASIN',
        fixed: 'left',
        render: (text, row) => {
          const codeList = this.getCodeList(row.shopType);
          const obj = codeList.filter(x => x.code === row.code)[0];
          return (<a href={`http://${obj.url}${row.ASIN}`} target='_blank'>{text}</a>)
        }
      },
      {
        title: '子ASIN',
        dataIndex: 'ASIN',
        render: (text, row) => {
          const codeList = this.getCodeList(row.shopType);
          const obj = codeList.filter(x => x.code === row.code)[0];
          return (<a href={`http://${obj.url}${row.ASIN}`} target='_blank'>{text}</a>)
        }
      },
      {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '店铺',
        dataIndex: 'shopID',
        render: (text) => {
          return formatter.shop[text];
        }
      },
      {
        title: '平台',
        dataIndex: 'shopType',
      },
      {
        title: '站点',
        dataIndex: 'code',
        render: (text, row) => {
          const codeList = this.getCodeList(row.shopType);
          const obj = codeList.filter(x => x.code === row.code)[0];
          return obj.name;
        }
      },
      {
        title: '上架人员',
        dataIndex: 'createUserName',
      },
      {
        title: '上架时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM')
        }
      },
      {
        title: '状态',
        dataIndex: 'isRun',
        render: (text,row) => {
          let obj = {};
          switch (text) {
            case 0:
              obj = {text: '等待下载', status: 'processing'};
              break;
            case 2:
              obj = {text: '下载失败', status: 'error'}
              break;

          }
          return (
            <div>
              <p><Badge text={obj.text} status={obj.status}/></p>
              <p>{row.isUnder==1? <Badge text='已下架' status='error'/>:null}</p>
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        fixed: 'right',
        render: (text, row, index) => {
          const {role}=this.props;
          const action = [
            {
              label: '编辑',
              submit: () => {
                this.setState({
                  editModal:{
                    visible:true,
                    isAdd: false,
                    currentAsin: row,
                    index,
                  }
                });
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
        {/*{this.renderTableHeader()}*/}
        {/*<Tabs activeKey={this.state.isSale} onChange={isSale => {*/}
        {/*this.setState({isSale,}, e => this.getList(1))*/}
        {/*}} type='card'>*/}
        {/*<TabPane key='1' tab='已出单'/>*/}
        {/*<TabPane key='0' tab='未出单'/>*/}
        {/*</Tabs>*/}
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          scroll={{x: 1200}}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
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
      <div>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.editModal.visible?this.renderEditModal():null}
      </div>
    )
  }
}
