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
  Pagination
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import classNames from 'classnames';
import StandardTable from '../../../myComponents/Table/Standard';
import DescriptionList from '../../../components/DescriptionList';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate, formatNumber} from '../../../utils/utils';
import InLineForm from '../../../myComponents/Form/InLine';
import DepartmentSelect from '../../../myComponents/Select/Department';
import ShopSelect from '../../../myComponents/Select/Shop';
import YearSelect from '../../../myComponents/Select/Year';
import Config from "../../../utils/rs/Config";
import style from './index.less';
import {exportCsv,exportExcel} from '../../../utils/rs/Excel';
import Uri from "../../../utils/rs/Uri";
import LoadingService from '../../../utils/rs/LoadingService';
import EditModal from "../../../myComponents/Fx/EditModal";


const modelNameSpace = "upc-company";
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
@Component.Role('erp_shop_upc_company')
export default class extends PureComponent {
  state = {
    upcIsLock: '0',
    activeKey: 'upc-apply-list',
    moveUpcModalProps:{
      visible:false,
      row:{},
    }
  }

  ref = {
    searchForm: null,
    moveUpcForm:null,
  }

  componentDidMount() {
   this.onTabsChange('upc-apply-list');
    this.getUpcCompany(1);
  }

  onTabsChange = (activeKey) => {
    this.setState({
      activeKey,
    },()=>{
      switch (activeKey) {
        case "upc-apply-list":
          this.getUpcApply();
          break;
        case "upc-apply-count":
          this.getDepartmentApplyCount();
          break;
        case "upc-sku":
          this.getUpcDepartmentSku();
          break;
        case "upc-use-report":
          this.getUpcUseReport();
          break;
      }
    });
  }

  getUpcApply = (page) => {
    const {model} = this.props;
    const {applyPageIndex,pageSize}=this.props[modelNameSpace];
    model.setState({
      applyPageIndex:page||applyPageIndex,
    }).then(()=>{
      model.call("getUpcApply", {
        pageIndex: this.props[modelNameSpace].applyPageIndex,
        pageSize,
        upcApplyType: 0,
      });
    });
  }

  getDepartmentApplyCount = () => {
    const {model} = this.props;
    model.call("getDepartmentApplyCount", {});
  }

  getUpcDepartmentSku = () => {
    const {model} = this.props;
    model.call('getUpcDepartmentSku');
  }

  getUpcUseReport = () => {
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {useYear, useMonth} = getFieldsValue();
    const {model} = this.props;
   return model.call('getUpcMonthData', {
      useYear,
      useMonth,
    });
  }

  exportUseReport=()=>{
    this.getUpcUseReport().then(()=>{
      const {upcUseDataList}=this.props[modelNameSpace];
      const {getFieldsValue} = this.ref.searchForm.props.form;
      const {useYear, useMonth} = getFieldsValue();

      const columns=[
        {value:'店铺'},
        {value:'部门'},
        {value:'使用数量'},
      ];
      const rows=[

      ];

      let list=[];
      upcUseDataList.map(x=>{
        rows.push([
          {value:formatter.shop[x.shopID]},
          {value:formatter.department[x.depID]},
          {value:x.useCount}
        ]);
        // list.push({
        //   shopName:formatter.shop[x.shopID],
        //   depName:formatter.department[x.depID],
        //   useCount:x.useCount,
        // })
      });
      exportExcel(rows,`${useYear}年${useMonth}月店铺UPC使用报表`,columns);
      // exportCsv(list,"店铺,部门,使用数量",`${useYear}年${useMonth}月店铺UPC使用报表`);
    });
  }

  getUpcCompany = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize} = this.props[modelNameSpace];
    const upcIsLock = this.state.upcIsLock;
    model.setState({
      pageIndex: page || pageIndex,
      upcData: {
        list: [],
        total: 0,
      },
    }).then(() => {
      model.call('getUpcCompany', {
        pageIndex,
        pageSize,
        status: 0,
        upcIsLock,
      });
    });
  }

  changeUPC = (list, success, msg) => {
    if (success) {
      this.getUpcCompany(1);
    }
  }

  moveUpc=()=>{
    const {row}=this.state.moveUpcModalProps;
    const {model}=this.props;
    const {getFieldsValue}=this.ref.moveUpcForm.props.form;
    model.call('moveUpc',{
      startDepID:row.depID,
      ...getFieldsValue(),
    }).then(success=>{
      if(success){
        this.setState({moveUpcModalProps:{visible:false}});
        this.getUpcDepartmentSku();
      }
    });
  }

  operationApply(applyID, applyResult) {
    const {model} = this.props;
    Modal.confirm({
      title: `确定要${applyResult === 1 ? '同意' : '拒绝'}此次申请吗?`,
      onOk: () => {
        model.call('operateApply', {
          applyID,
          applyResult,
        }).then(success => {
          if (success) {
            this.getUpcApply(1);
          }
        });
      }
    })
  }

  changeDepartmentApplyCount = (changeApplyCountID, changeApplyCountType, index) => {
    const {model} = this.props;
    model.call('changeDepartmentApplyCount', {
      changeApplyCountID,
      changeApplyCountType,
    }).then(success => {
      if (success) {
        const {departmentApplyCountList} = this.props[modelNameSpace];
        departmentApplyCountList[index]['count'] = changeApplyCountType === 0 ? departmentApplyCountList[index]['count'] + 1 : departmentApplyCountList[index]['count'] - 1;
        model.setState({
          departmentApplyCountList,
        });
      }
    });
  }

  renderMoveUpc(){
    const {visible,row}=this.state.moveUpcModalProps;
    const {departmentUpcSkuList = []} = this.props[modelNameSpace];
    var depList=departmentUpcSkuList.filter(x=>x.depID!==row.depID);
    const item=[
      {
        label:'部门',
        key:'endDepID',
        rules:[
          {required:true,message:'请选择需要转移的部门'}
        ],
        render:()=>{
          return(
            <Select>
              {depList.map(x=>{
                return <Option value={x.depID} key={x.depID}>{formatter.department[x.depID]}</Option>
              })}
            </Select>
          )
        }
      },
      {
        label:'数量',
        key:'upcNum',
        rules:[
          {required:true,message:'请填写需要转移UPC数量'}
        ],
        render:()=>{
          return (<Input/>)
        }
      }
    ];
    return (
      <EditModal
        visible={visible}
        item={item}
        title='转移UPC'
        onCancel={e=>this.setState({moveUpcModalProps:{visible:false}})}
        footer={true}
        refForm={node=>this.ref.moveUpcForm=node}
        onOk={this.moveUpc}
      />
    )
  }

  renderBody() {
    const {upcData: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const {loading, pagination} = this.props;
    const columns = [
      {
        title: 'UPC',
        dataIndex: 'upc',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      }
    ];
    return (
      <Row gutter={24}>
        <Col span={18}>
          <Card bordered={false} title='UPC管理' className={style.upcManager}>
            <Tabs activeKey={this.state.activeKey} tabPosition='left' onChange={tab=>this.onTabsChange(tab)}>
              <TabPane tab='UPC申领列表' key='upc-apply-list'>{this.renderApplyList()}</TabPane>
              <TabPane tab='部门申领次数' key='upc-apply-count'>{this.renderApplyCountList()}</TabPane>
              <TabPane tab='部门UPC库存' key='upc-sku'>{this.renderUpcDepartmentSku()}</TabPane>
              <TabPane tab='店铺使用报表' key='upc-use-report'>{this.renderUpcUseReport()}</TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title='UPC列表'
            bordered={false}
            extra={
              <FilesUploader
                type='excel'
                showUploadList={false}
                handle={<a>导入UPC</a>}
                action={`${Config.GetConfig('fxService')}/Erp/Shop/Upc/UploadUpc`}
                onChange={this.changeUPC}
              />}
          >
            <Tabs activekey={this.state.upcIsLock} type='card'
                  onChange={upcIsLock => this.setState({upcIsLock}, e => this.getUpcCompany(1))}>
              <TabPane tab='可申请' key='0'/>
              <TabPane tab='已锁定' key='1'/>
            </Tabs>
            <StandardTable
              rowKey={record => record.id}
              columns={columns}
              dataSource={list}
              loading={loading.effects[`${modelNameSpace}/getUpcCompany`]}
            />
            <Pagination size='small' showTotal={() => `共${total} 条数据`} current={pageIndex} total={total}
                        onChange={(page) => this.getUpcCompany(page)}/>
          </Card>
        </Col>
      </Row>
    )
  }

  renderApplyList() {
    const {applyData: {list, total}, applyPageIndex, applyPageSize} = this.props[modelNameSpace];
    const {loading, pagination} = this.props;
    const columns = [
      {
        title: '申请部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        },
      },
      {
        title: '申请人',
        dataIndex: 'applyUserName',

      },
      {
        title: '申请数量',
        dataIndex: 'applyNum',
      },
      {
        title: '申请时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          let obj = {};
          switch (text) {
            case 0:
              obj = {text: '待审批', status: 'processing'};
              break;
            case 1:
              obj = {text: '审批通过', status: 'success'};
              break;
            case 2:
              obj = {text: '已驳回', status: 'error'};
              break;
          }
          return <Badge text={obj.text} status={obj.status}/>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, row, index) => {
          return (
            <div>
              {row.status===0?<Fragment>
                <Button size='small' type='primary' style={{marginRight: 10}}
                        onClick={e => this.operationApply(row.id, 1)}>同意</Button>
                <Button size='small' type='danger' ghost onClick={e => this.operationApply(row.id, 2)}>拒绝</Button>
              </Fragment>:null}

            </div>
          )
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        columns={columns}
        dataSource={list}
        loading={loading.effects[`${modelNameSpace}/getUpcApply`]}
        page={pagination({pageIndex:applyPageIndex,total,},this.getUpcApply)}
      />
    )
  }

  renderApplyCountList() {
    let {departmentApplyCountList} = this.props[modelNameSpace];
    departmentApplyCountList = departmentApplyCountList.sort((a, b) => {
      return departmentList.filter(_ => _.depID === a.depID)[0]["showIndex"] - departmentList.filter(_ => _.depID === b.depID)[0]["showIndex"]
    });
    const {loading} = this.props;
    const columns = [
      {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        },
      },
      {
        title: '周期',
        dataIndex: 'circle',
        render: (text, row) => {
          return (
            `${formatDate(row.startDate, 'YYYY-MM-DD')} - ${formatDate(row.endDate, 'YYYY-MM-DD')}`
          )
        }
      },
      {
        title: '总可申请次数',
        dataIndex: 'count',
      },
      {
        title: '已申请次数',
        dataIndex: 'isUseCount',
      },
      {
        title: '剩余申请次数',
        dataIndex: 'extraCount',
        render: (text, row, index) => {
          return row.count - row.isUseCount;
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, row, index) => {
          return (
            <div>
              <Button
                size='small'
                type='primary'
                style={{marginRight: 10}}
                icon='plus'
                onClick={e => this.changeDepartmentApplyCount(row.id, 0, index)}
              />
              <Button
                size='small'
                type='danger'
                ghost
                icon='minus'
                disabled={row.count - row.isUseCount === 0}
                onClick={e => this.changeDepartmentApplyCount(row.id, 1, index)}
              />
            </div>
          )
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        columns={columns}
        dataSource={departmentApplyCountList}
        loading={loading.effects[`${modelNameSpace}/getUpcApply`]}
      />
    )
  }

  renderUpcDepartmentSku() {
    const {departmentUpcSkuList = []} = this.props[modelNameSpace];
    return (
      <div className={style.upcSku}>
        <Row gutter={24}>
          {departmentUpcSkuList && departmentUpcSkuList.map(x => {
            return (
              <Col span={8}>
                <Card
                  style={{marginBottom: 24}}
                  className={style.depSku}
                  actions={[<Button type='primary' size='small' ghost onClick={e=>this.setState({moveUpcModalProps:{visible:true,row:x}})}>库存转移</Button>]}
                >
                  <Meta
                    avatar={<Avatar icon='team' style={{backgroundColor: '#87d068'}}/>}
                    title={formatter.department[x.depID]}
                    description={
                      <div className={style.numInfo}>
                        <div>
                          <p>库存</p>
                          <p>{x.num}</p>
                        </div>
                        <div>
                          <p>申请中</p>
                          <p>{x.applyNum}</p>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            )
          })}
        </Row>
      </div>
    )
  }

  renderUpcUseReport() {
    const {upcUseDataList} = this.props[modelNameSpace];
    const {loading} = this.props;
    const item = [
      {
        key: 'useYear',
        label: '使用年份',
        initialValue: moment().format('YYYY') * 1,
        render: () => {
          return (<YearSelect style={{width: 100}}/>)
        }
      },
      {
        key: 'useMonth',
        label: '使用月份',
        initialValue: moment().format('MM') ,
        render: () => {
          return (<AutoSelect typeCode='month' style={{width: 100}}/>)
        }
      },
      {
        key: 'search',
        label: '',
        render: () => {
          return <Button type='primary' icon='search' onClick={this.getUpcUseReport}>搜索</Button>
        }
      },
      {
        key: 'export',
        label: '',
        render: () => {
          return <Button type='dashed' icon='export' onClick={this.exportUseReport}>导出</Button>
        }
      }
    ];
    const columns = [
      {
        title: '店铺',
        dataIndex: 'shopID',
        render: (text) => {
          return formatter.shop[text];
        }
      }, {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '使用数量',
        dataIndex: 'useCount',
      },
    ];
    return (
      <div>
        <InLineForm item={item} style={{marginBottom: 16}} wrappedComponentRef={node => this.ref.searchForm = node}/>
        <StandardTable
          columns={columns}
          dataSource={upcUseDataList}
          rowKey={record => record.shopID}
          loading={loading.effects[`${modelNameSpace}/getUpcMonthData`]}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: 'UPC-公司管理',
      },
      bg: true,
      body: {
        center: this.renderBody(),
      }
    };

    return (
      <div className={style.upcCompany}>
        <FxLayout {...fxLayoutProps}/>
        {this.state.moveUpcModalProps.visible?this.renderMoveUpc():null}
      </div>
    )
  }
}
