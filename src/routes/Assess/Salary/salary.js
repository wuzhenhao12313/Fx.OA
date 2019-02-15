import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import moment from 'moment';
import {Input, Form, Button, Card, Row, Col, Tabs, Radio, Tag} from 'antd';
import {fetchApiSync, fetchDictSync} from '../../../utils/rs/Fetch';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import InLineForm from '../../../myComponents/Form/InLine';
import Component from "../../../utils/rs/Component";
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import YearSelect from '../../../myComponents/Select/Year';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import EditModal from "../../../myComponents/Fx/EditModal";
import Uri from '../../../utils/rs/Uri';
import {formatNumber} from "../../../utils/utils";

const modelNameSpace = "assess-salary";
const Fragment = React.Fragment;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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
}))
@Component.Model(modelNameSpace)
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    id: 0,
    type: 'sell',
    currentDep: 0,
    isDataChange:false,
    currentFocusItem: {
      id: 0,
      key: '',
      table: '',
    }
  }

  componentDidMount() {
    const id = Uri.Query('id') ? Uri.Query('id').toInt() : 0;
    this.setState({
      id,
    }, e => this.getData());
  }

  getData = () => {
    const {id, type} = this.state;
    const {model} = this.props;
    if (type === 'sell') {
      model.call('getSellExtractListByID', {
        recordID: id,
      }).then(() => {
        const {depSellExtractList} = this.props[modelNameSpace];
        this.setState({
          currentDep: depSellExtractList[0].depID,
        })
      });
    }
  }


  changeDataStatus = (value) => {
    this.setState({
      isDataChange: true,
      currentFocusItem: {
        id: 0,
        key: '',
        table: '',
      }
    })
  }

  focusItem = (id, key,table) => {
    this.setState({
      currentFocusItem: {
        id, key,table,
      }
    })
  }

  changeEditData = (record) => {
    const {key, value, id,table} = record;
    const {model} = this.props;
    if (table === 'dep') {
      const {depSellExtractList,} = this.props[modelNameSpace];
      const index = depSellExtractList.findIndex(x => x.id === id);
      depSellExtractList[index][key] = value;
      model.setState({
        depSellExtractList,
      });
    }
    else if(table==='shop'){
      const {depSellExtractList,shopSellExtractList,userSellExtractList} = this.props[modelNameSpace];
      const index = shopSellExtractList.findIndex(x => x.id === id);
      const dep=depSellExtractList.filter(x=>x.depID===this.state.currentDep)[0];
      shopSellExtractList[index][key] = value;
      let extract=0;
      const shopDataSource=shopSellExtractList.filter(x => x.depID === this.state.currentDep);
      const userDataSource=userSellExtractList.filter(x => x.depID === this.state.currentDep);
      shopDataSource.forEach(x=>{
        extract+=(x.fba_profit*0.03)+(x.fbm_profit*0.06);
      });
      let hasExtension=userDataSource.filter(y=>y.isExtension).length>0;
      userDataSource.map(x=>{
        if(hasExtension){
          if(x.isManager){
            x['baseExtract']=extract*x.workYearRate*x.assessRate;
            x['otherExtract']=extract*0.12;
            x['fundPool']=(1-x.assessRate)*x.workYearRate*extract;
            x['actualExtract']=x['baseExtract']+ x['otherExtract'];
          }
          else if(x.isExtension){
            x['actualExtract']=(x['baseExtract']+x['otherExtract']-x['fundPool'])||0;
          }
          else {
            x['baseExtract']=(extract-x.otherExtract)*x.assessRate;
            x['actualExtract']=(x['baseExtract']+x['otherExtract']-x['fundPool'])||0;
          }
        }else {
          if(x.isManager){
            x['baseExtract']=extract*x.workYearRate*x.assessRate;
            x['otherExtract']=extract*0.12;
            x['fundPool']=(1-x.assessRate)*x.workYearRate*extract;
            x['actualExtract']=x['baseExtract']+ x['otherExtract'];
          }
          else {
            x['baseExtract']=(extract-x.otherExtract)*x.assessRate;
            x['actualExtract']=(x['baseExtract']+x['otherExtract']-x['fundPool'])||0;
          }
        }
      });
      dep['extract']=extract;
      model.setState({
        shopSellExtractList,
        depSellExtractList,
      });

    }
    else {
      const {userSellExtractList,depSellExtractList} = this.props[modelNameSpace];
      const index = userSellExtractList.findIndex(x => x.id === id);
      const dep=depSellExtractList.filter(x=>x.depID===this.state.currentDep)[0];
      const userDataSource=userSellExtractList.filter(x => x.depID === this.state.currentDep);
      let hasExtension=userDataSource.filter(y=>y.isExtension).length>0;
      userDataSource.map(x=>{
        if(hasExtension){
          if(x.isExtension){

          }else {

          }
        }else {
          x['baseExtract']=(dep['extract']-x.otherExtract)*x.assessRate;
        }
        x['actualExtract']=(x['baseExtract']+x['otherExtract']-x['fundPool'])||0;
      });
      userSellExtractList[index][key] = value;
      model.setState({
        userSellExtractList,
      });
    }
  }

  getInput=(row,key,table,value1,value2)=>{
    const active = this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key == key && this.state.currentFocusItem.table == table;
    return(
      <div
        className={classNames({
          ['ant-td-edit']: true,
          ['ant-td-edit-active']: active,
        })}
        style={{width: 149}}
      >
        <Input
          className='ant-table-input'
          value={active?value1:value2}
          style={{width: '100%', textAlign: 'center',}}
          onBlur={e => {
            this.changeDataStatus();
          }}
          onFocus={e => this.focusItem(row.id, key,table)}
          onChange={e => this.changeEditData({
            key,
            value: e.target.value,
            id: row.id,
            table,
          })}
        />
      </div>
    )
  }


  renderSell() {
    const {depSellExtractList, shopSellExtractList, userSellExtractList} = this.props[modelNameSpace];
    const shopColumns = [
      {
        title: '店铺',
        dataIndex: 'shopID',
        width: 250,
        render: (text, row, index) => {
          return formatter.shop[text];
        }
      },
      {
        title: '部门指标完成率',
        dataIndex: 'targetRate',
        align: 'center',
        width: 150,
        render: (text, row, index) => {
          const depRow = depSellExtractList.filter(x => x.depID === this.state.currentDep)[0];
          const length = shopSellExtractList.filter(x => x.depID === this.state.currentDep).length;
          const obj = {
            children: this.getInput(depRow,"targetRate","dep",depRow['targetRate'],`${formatNumber(depRow['targetRate'] * 100, 1)}%`),
            props: {
              rowSpan: index !== 0 ? 0 : length,
            },
          };
          return obj;
        }
      },
      {
        title: 'FBA利润',
        dataIndex: 'fba_profit',
        align: 'center',
        width: 150,
        render:(text,row)=>{
          return this.getInput(row,"fba_profit","shop",text,text?formatNumber(text,1):null);
        }
      },
      {
        title: 'FBA提成点',
        dataIndex: 'FBA_extract_rate',
        align: 'center',
        width: 150,
        render: (text, row, index) => {
          const length = shopSellExtractList.filter(x => x.depID === this.state.currentDep).length;
          const obj = {
            children: `3.0%`,
            props: {
              rowSpan: index !== 0 ? 0 : length,
            },
          };
          return obj;
        }
      },
      {
        title: 'FBM利润',
        dataIndex: 'fbm_profit',
        align: 'center',
        width: 150,
        render:(text,row)=>{
          return this.getInput(row,"fbm_profit","shop",text,text?formatNumber(text,1):null);
        }
      },
      {
        title: 'FBM提成点',
        dataIndex: 'FBM_extract_rate',
        align: 'center',
        width: 150,
        render: (text, row, index) => {
          const length = shopSellExtractList.filter(x => x.depID === this.state.currentDep).length;
          const obj = {
            children: `6.0%`,
            props: {
              rowSpan: index !== 0 ? 0 : length,
            },
          };
          return obj;
        }
      },
      {
        title: '部门总提成',
        dataIndex: 'extract',
        align: 'center',
        width: 150,
        render:(text,row,index)=>{
          return `${formatNumber((row.fba_profit*0.03)+(row.fbm_profit*0.06),1)}`;
        }
      },
    ];
    const shopDataSource=shopSellExtractList.filter(x => x.depID === this.state.currentDep);
    const dep=depSellExtractList.filter(x=>x.depID===this.state.currentDep)[0];
    const userColumns = [
      {
        title: '人员',
        dataIndex: 'userName',
        width: 250,
        render: (text, row, index) => {
          if (row.isManager === 1) {
            return (
              <div>{text}
                <Tag color="#87d068" style={{marginLeft: 10}}>部门经理</Tag>
              </div>
            )
          }
          if(row.isExtension===1){
            return (
              <div>{text}
                <Tag color="#f50" style={{marginLeft: 10}}>推广人员</Tag>
              </div>
            )
          }
          return text;
        }
      },
      {
        title: '职龄得分系数',
        dataIndex: 'workYearRate',
        width: 150,
        align: 'center',
        render: (text) => {
          if (!text) {
            return null;
          }
          return `${formatNumber(text * 100, 1)}%`
        }
      },
      {
        title: '考核得分系数',
        dataIndex: 'assessRate',
        width: 150,
        align: 'center',
        render: (text) => {
          if (!text) {
            return null;
          }
          return `${formatNumber(text * 100, 1)}%`
        }
      },
      {
        title: '基础提成',
        dataIndex: 'baseExtract',
        width: 150,
        align: 'center',
        render: (text,row) => {
          if(row.isManager){
            return formatNumber(dep['extract']*row.workYearRate*row.assessRate,1);
          }

          if(userSellExtractList.filter(x=>x.depID === this.state.currentDep&&x.isExtension===1).length>0){

          }else {
            return formatNumber((dep['extract']-row.otherExtract)*row.assessRate,1);
          }
        }
      },
      {
        title: '提成调整',
        dataIndex: 'otherExtract',
        width: 150,
        align: 'center',
        render: (text,row) => {
          if(row.isManager){
            return formatNumber(dep['extract']*0.12,1);
          }
          return this.getInput(row,"otherExtract","user",text,text?formatNumber(text,1):null);
        }
      },
      {
        title: '基金池',
        dataIndex: 'fundPool',
        width: 150,
        align: 'center',
        render: (text,row) => {
          if(row.isManager){
            return formatNumber((1-row.assessRate)*row.workYearRate*dep['extract'],1);
          }
          return this.getInput(row,"fundPool","user",text,text?formatNumber(text,1):null);
        }
      },
      {
        title: '实发提成',
        dataIndex: 'actualExtract',
        width: 150,
        align: 'center',
        render: (text,row) => {
          if(row.isManager){
            return formatNumber(dep['extract']*(row.workYearRate*row.assessRate+0.12),1);
          }
          return formatNumber(text, 1);
        }
      },
    ];
    const depColumns=[
      {
        width: 250,
        render:()=>{
          return "合计"
        }
      },
      {
        width:150,
      },
      {
        dataIndex:'fba_profit',
        width:150,
        align: 'center',
        render:(text,row,)=>{
          let value=0;
          shopDataSource.forEach(x=>{
            value+=x.fba_profit*1||0;
          });
          return formatNumber(value,1);

        }
      },
      {
        dataIndex:'FBA_extract_rate',
        width:150,
      },
      {
        dataIndex:'fbm_profit',
        width:150,
        align: 'center',
        render:(text,row,)=>{
          let value=0;
          shopDataSource.forEach(x=>{
            value+=x.fbm_profit*1||0;
          });
          return formatNumber(value,1);

        }
      },
      {
        dataIndex:'FBA_extract_rate',
        width:150,
      },
      {
        dataIndex:'extract',
        align: 'center',
        width:150,
        render:(text,row,)=>{
          let value=0;
          shopDataSource.forEach(x=>{
            value+=(x.fba_profit*0.03)+(x.fbm_profit*0.06);
          });
          return formatNumber(value,1);
        }
      },
    ];
    return (
      <div style={{marginTop: 12}}>
        <Tabs type="card" activeKey={this.state.currentDep.toString()}
              onChange={currentDep => this.setState({currentDep: currentDep.toInt()})}>
          {depSellExtractList.map(dep => {
            return (<TabPane tab={formatter.department[dep.depID]} key={dep.depID}/>)
          })}
        </Tabs>
        <StandardTable
          style={{maxWidth: 1150}}
          columns={shopColumns}
          dataSource={shopDataSource}
          bordered
          rowKey={record => record.id}
        />
        <StandardTable
          style={{maxWidth: 1150,marginTop:-16}}
          columns={depColumns}
          showHeader={false}
          dataSource={depSellExtractList.filter(x => x.depID === this.state.currentDep)}
          bordered
          rowKey={record => record.id}
        />
        <StandardTable
          style={{maxWidth: 1150, marginTop: -16}}
          columns={userColumns}
          dataSource={userSellExtractList.filter(x => x.depID === this.state.currentDep).sort((x, y) => {
            return y.isManager - x.isManager;
          })}
          bordered
          rowKey={record => record.id}
        />
      </div>
    )
  }

  renderGrounding() {
    return (
      <div></div>
    )
  }


  render() {
    const {type} = this.state;
    return (
      <div>
        <RadioGroup value={type} buttonStyle="solid" onChange={e => this.setState({type: e.target.value})}>
          <RadioButton value='sell'>精品部门</RadioButton>
          <RadioButton value='grounding'>铺货部门</RadioButton>
        </RadioGroup>
        {type === 'sell' ? this.renderSell() : this.renderGrounding()}
      </div>
    )
  }

}
