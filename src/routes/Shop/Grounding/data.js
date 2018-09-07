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
  Spin,
  Table,
  Radio,
} from 'antd';
import Component from '../../../utils/rs/Component';
import Pie from 'ant-design-pro/lib/Charts/Pie/';
import FxLayout from '../../../myComponents/Layout/';
import classNames from 'classnames';
import Format from '../../../utils/rs/Format';
import DescriptionList from '../../../components/DescriptionList';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import ShopSelect from '../../../myComponents/Select/Shop';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Color from '../../../utils/rs/Color';
import Config from "../../../utils/rs/Config";
import style from './data.less';
import Uri from "../../../utils/rs/Uri";
import InLineForm from '../../../myComponents/Form/InLine';


const modelNameSpace = "grounding-asin-data";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

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
    depCountKey: 'asinCount',
    saleShopType: 'all',
    asinShopType: 'all',
    depSaleDate: null,
    saleRateType: 'department',
    saleRateDate: null,
    saleRateSorterColumn:'saleRate',
    departmentCategoryDate:null,
    currentDepID:"0",
  }

  ref = {
    depDataCountForm: null,
  }

  componentDidMount() {
    this.getDepCount('saleCount');
    this.getSaleRate(1);
    this.getCategoryDataCount();
    this.getGroundingDepartment();
    this.getDepartmentAsinCategoryDataCount();
  }

  getDepCount = (type) => {
    const {model} = this.props;
    const {saleShopType, asinShopType, depSaleDate} = this.state;
    const startDate = depSaleDate && depSaleDate.length > 0 ? depSaleDate[0].format('YYYY-MM-DD') : null;
    const endDate = depSaleDate && depSaleDate.length > 0 ? depSaleDate[1].format('YYYY-MM-DD') : null;
    model.call(type === 'saleCount' ? `getDepartmentSaleCount` : 'getDepartmentAsinCount', {
      shopType: saleShopType === 'all' ? '' : saleShopType,
      startDate,
      endDate,
    });
  }

  getSaleRate = (pageIndex) => {
    const {model} = this.props;
    const {saleRateType,saleRateDate,saleRateSorterColumn} = this.state;
    const {saleRatePageIndex, saleRateList: {total}} = this.props[modelNameSpace];
    model.setState({
      saleRatePageIndex: pageIndex || saleRatePageIndex,
      saleRateList: {
        list: [],
        total,
      },
    }).then(() => {
      const startDate=saleRateDate&&saleRateDate.length>0?saleRateDate[0].format('YYYY-MM-DD'):null;
      const endDate=saleRateDate&&saleRateDate.length>0?saleRateDate[1].format('YYYY-MM-DD'):null;
      model.call("getGroundingAsinSaleRate", {
        type: saleRateType,
        pageIndex,
        pageSize: 5,
        startDate,
        endDate,
        sorterColumn:saleRateSorterColumn,
      });
    })

  }

  getCategoryDataCount=()=>{
    const {model}=this.props;
    model.call("getAsinCategoryDataCount");
  }

  getGroundingDepartment=()=>{
    const {model}=this.props;
    model.call("getGroundingDepartment");
  }

  getDepartmentAsinCategoryDataCount=()=>{
    const {model}=this.props;
    const {currentDepID,departmentCategoryDate}=this.state;
    const startDate=departmentCategoryDate&&departmentCategoryDate.length>0?departmentCategoryDate[0].format("YYYY-MM-DD"):null;
    const endDate=departmentCategoryDate&&departmentCategoryDate.length>0?departmentCategoryDate[1].format("YYYY-MM-DD"):null;
    model.call("getDepartmentAsinCategoryDataCount",{
      depID:currentDepID==0?null:currentDepID,
      startDate,
      endDate,
    });
  }

  renderDepDataCount = (type) => {
    const {loading} = this.props;
    const {departmentSaleCountList = [], departmentAsinCountList = []} = this.props[modelNameSpace];
    let saleTotal = 0;
    departmentSaleCountList.forEach(x => {
      saleTotal += x.y;
    });
    let asinTotal = 0;
    departmentAsinCountList.forEach(x => {
      asinTotal += x.y;
    });
    const {saleShopType, asinShopType} = this.state;
    return (
      <Card
        bordered={false}
        style={{width: '100%'}}
        title={type === 'saleCount' ? "出单数量占比" : '铺货数量占比'}

        bodyStyle={{padding: 24}}
        extra={
          <div className={style.dataCountCardExtra}>
            <div className={style.dataCountTypeRadio}>
              <Radio.Group
                value={type === 'saleCount' ? saleShopType : asinShopType}
                onChange={e => this.setState(type === 'saleCount' ? {saleShopType: e.target.value} : {asinShopType: e.target.value}, e => this.getDepCount('saleCount'))}>
                <Radio.Button value="all">全部平台</Radio.Button>
                <Radio.Button value="amazon">amazon</Radio.Button>
                <Radio.Button value="ebay">ebay</Radio.Button>
                <Radio.Button value="cdiscount">cdiscount</Radio.Button>
                <Radio.Button value="wish">wish</Radio.Button>
                <Radio.Button value="shopee">shopee</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        }
        style={{minHeight: 533, marginBottom: 24}}
      >
        <h4 style={{marginTop: 8, marginBottom: 32}}>
          ASIN上架日期：
          <StandardRangePicker
            style={{width: 250}}
            onChange={value => this.setState({depSaleDate: value}, e => this.getDepCount('saleCount'))}
            allowClear={true}
          />
        </h4>
        <Pie
          hasLegend
          subTitle={type === 'saleCount' ? "出单数量" : "铺货数量"}
          total={type === 'saleCount' ? saleTotal : asinTotal}
          data={type === 'saleCount' ? departmentSaleCountList : departmentAsinCountList}
          height={248}
          lineWidth={4}
        />
      </Card>
    )
  }

  renderCategoryDataCount(){
    const {categoryDataCountList=[]}=this.props[modelNameSpace];
    let total = 0;
    let other=0;
    let list=[];
    categoryDataCountList.forEach((x,idx) => {
      x.x=x.x?x.x.replace('&amp; ','& '):x.x;
      total += x.y;
    });
    categoryDataCountList.filter(x=>x.x!==null).forEach((x,idx) =>{
      if(idx<=9){
        list.push(x);
      }
      if(idx>9){
        other+=x.y;
      }
    });
    list.push({x:'其它',y:other});
    if(categoryDataCountList.filter(x=>x.x===null).length>0){
      list.push({x:'未知类别',y:categoryDataCountList.filter(x=>x.x===null)[0].y});
    }
    return (
      <Card
        bordered={false}
        style={{width: '100%'}}
        title="出单类别占比"
        bodyStyle={{padding: 24}}
        style={{minHeight: 633, marginBottom: 24}}
        className={style.categoryCard}
      >
        <Pie
          hasLegend
          subTitle="出单数量"
          total={total}
          data={list}
          height={248}
          lineWidth={4}
        />
      </Card>
    )
  }

  renderDepartmentCategoryDataCount(){
    const {departmentCategoryDataCountList=[],groundingDepartmentList=[]}=this.props[modelNameSpace];
    let total = 0;
    let other=0;
    let list=[];
    departmentCategoryDataCountList.forEach((x,idx) => {
      x.x=x.x?x.x.replace('&amp; ','& '):x.x;
      total += x.y;
    });
    departmentCategoryDataCountList.filter(x=>x.x!==null).forEach((x,idx) =>{
      if(idx<=9){
        list.push(x);
      }
      if(idx>9){
        other+=x.y;
      }
    });
    list.push({x:'其它',y:other});
    if(departmentCategoryDataCountList.filter(x=>x.x===null).length>0){
      list.push({x:'未知类别',y:departmentCategoryDataCountList.filter(x=>x.x===null)[0].y});
    }
    return (
      <Card
        bordered={false}
        style={{width: '100%'}}
        title="铺货类别占比"
        bodyStyle={{padding: 24}}
        style={{minHeight: 633, marginBottom: 24}}
        className={style.categoryCard}
        extra={
          <StandardRangePicker
            style={{width: 250}}
            onChange={value => this.setState({departmentCategoryDate: value}, e => this.getDepartmentAsinCategoryDataCount())}
            allowClear={true}
          />
        }
      >
        <Tabs
          type='card'
          activeKey={this.state.currentDepID}
          onChange={currentDepID=>this.setState({currentDepID,},e=>this.getDepartmentAsinCategoryDataCount())}>
          <TabPane key='0' tab='全部'/>
          {groundingDepartmentList.sort((a,b)=>
          {
            return departmentList.filter(_=>_.depID===a)[0]["showIndex"]-departmentList.filter(_=>_.depID===b)[0]["showIndex"]
          }).map(x=>{
            return(<TabPane key={x} tab={formatter.department[x]}/>)
          })}
        </Tabs>
        <Pie
          hasLegend
          subTitle="铺货数量"
          total={total}
          data={list}
          height={248}
          lineWidth={4}
        />
      </Card>
    )
  }

  renderSaleRateRank() {
    const {saleRatePageIndex, saleRateList: {list, total}} = this.props[modelNameSpace];
    const {loading} = this.props;
    const departmentColumns = [
      {
        title: '排名',
        dataIndex: 'ranking',
        width: 55,
        align: 'center',
        render: (text, row, index) => {
          return (saleRatePageIndex - 1) * 5 + index + 1;
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
        title: '铺货数量',
        dataIndex: 'allNum',
      },
      {
        title: '出单数量',
        dataIndex: 'saleNum',
      },
      {
        title: '出单率',
        dataIndex: 'saleRate',
        align: 'center',
        render: (text, row) => {
          return (
            <Progress type='circle' percent={row.saleRate * 100} format={percent => `${formatNumber(text * 100, 2)}%`}
                      width={45}/>)
        }
      },
    ];
    const userColumns = [
      {
        title: '排名',
        dataIndex: 'ranking',
        width: 55,
        align: 'center',
        render: (text, row, index) => {
          return (saleRatePageIndex - 1) * 5 + index + 1;
        }
      },
      {
        title: '员工姓名',
        dataIndex: 'createUserName',
      },
      {
        title: '铺货数量',
        dataIndex: 'allNum',
      },
      {
        title: '出单数量',
        dataIndex: 'saleNum',
      },
      {
        title: '出单率',
        dataIndex: 'saleRate',
        align: 'center',
        render: (text, row) => {
          return (
            <Progress type='circle' percent={row.saleRate * 100} format={percent => `${formatNumber(text * 100, 2)}%`}
                      width={45}/>)
        }
      },
    ];
    const shopColumns=[
      {
        title: '排名',
        dataIndex: 'ranking',
        width: 55,
        align: 'center',
        render: (text, row, index) => {
          return (saleRatePageIndex - 1) * 5 + index + 1;
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
        title: '铺货数量',
        dataIndex: 'allNum',
      },
      {
        title: '出单数量',
        dataIndex: 'saleNum',
      },
      {
        title: '出单率',
        dataIndex: 'saleRate',
        align: 'center',
        render: (text, row) => {
          return (
            <Progress type='circle' percent={row.saleRate * 100} format={percent => `${formatNumber(text * 100, 2)}%`}
                      width={45}/>)
        }
      },
    ];
    return (
      <Card
        className={style.salesRateCard}
        bordered={false}
        style={{width: '100%'}}
        bodyStyle={{padding: 0}}
        style={{minHeight: 533, marginBottom: 24, padding: 0}}
      >
        <Tabs
          activeKey={this.state.saleRateType}
          size='large'
          tabBarExtraContent={
            <StandardRangePicker
              allowClear
              value={this.state.saleRateDate}
              style={{width: 250}}
              onChange={value => this.setState({saleRateDate: value}, e => this.getSaleRate(1))}
            />
          }
          onChange={saleRateType => this.setState({saleRateType,}, e => this.getSaleRate(1))}
        >
          <TabPane tab='部门出单率' key='department'>

            <div style={{padding: '4px 24px'}}>
              <Radio.Group style={{marginBottom:12}} value={this.state.saleRateSorterColumn} onChange={e=>this.setState({saleRateSorterColumn:e.target.value},()=>this.getSaleRate(1))}>
                <Radio.Button value="saleRate">按出单率排行</Radio.Button>
                <Radio.Button value="saleNum">按出单个数排行</Radio.Button>
              </Radio.Group>
              <Table
                size='default'
                rowKey={record => record.depID}
                bordered
                columns={departmentColumns}
                loading={loading.effects[`${modelNameSpace}/getGroundingAsinSaleRate`]}
                dataSource={list}
                pagination={{
                  total, pageSize: 5, current: saleRatePageIndex, onChange: (page) => {
                    this.getSaleRate(page)
                  }
                }}
              />
            </div>
          </TabPane>
          <TabPane tab='店铺出单率' key='shop'>

            <div style={{padding: '4px 24px'}}>
              <Radio.Group style={{marginBottom:12}} value={this.state.saleRateSorterColumn} onChange={e=>this.setState({saleRateSorterColumn:e.target.value},()=>this.getSaleRate(1))}>
                <Radio.Button value="saleRate">按出单率排行</Radio.Button>
                <Radio.Button value="saleNum">按出单个数排行</Radio.Button>
              </Radio.Group>
              <Table
                size='default'
                rowKey={record => record.shopID}
                bordered
                columns={shopColumns}
                loading={loading.effects[`${modelNameSpace}/getGroundingAsinSaleRate`]}
                dataSource={list}
                pagination={{
                  total, pageSize: 5, current: saleRatePageIndex, onChange: (page) => {
                    this.getSaleRate(page)
                  }
                }}
              />
            </div>
          </TabPane>
          <TabPane tab='员工出单率' key='user'>
            <div style={{padding: '4px 24px'}}>
              <Radio.Group style={{marginBottom:12}} value={this.state.saleRateSorterColumn} onChange={e=>this.setState({saleRateSorterColumn:e.target.value},()=>this.getSaleRate(1))}>
                <Radio.Button value="saleRate">按出单率排行</Radio.Button>
                <Radio.Button value="saleNum">按出单个数排行</Radio.Button>
              </Radio.Group>
              <Table
                size='default'
                rowKey={record => record.createUser}
                bordered
                columns={userColumns}
                loading={loading.effects[`${modelNameSpace}/getGroundingAsinSaleRate`]}
                dataSource={list}
                pagination={{
                  total, pageSize: 5, current: saleRatePageIndex, onChange: (page) => {
                    this.getSaleRate(page)
                  }
                }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    )
  }

  render() {
    return (
      <div style={{padding: 24}} className={style.data}>
        <Row gutter={24}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>{this.renderDepDataCount('saleCount')}</Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>{this.renderSaleRateRank()}</Col>
        </Row>
        <Row gutter={24}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>{this.renderCategoryDataCount()}</Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>{this.renderDepartmentCategoryDataCount()}</Col>
        </Row>
      </div>
    )
  }
}
