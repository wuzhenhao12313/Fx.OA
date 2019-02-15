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
  Pagination,
  Alert,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import classNames from 'classnames';
import StandardTable from '../../../myComponents/Table/Standard';
import DescriptionList from '../../../components/DescriptionList';
import StandardModal from '../../../myComponents/Modal/Standard';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync,fetchApi} from "../../../utils/rs/Fetch";
import {formatDate, formatNumber} from '../../../utils/utils';
import ShopSelect from '../../../myComponents/Select/Shop';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import Config from "../../../utils/rs/Config";
import style from './index.less';


const modelNameSpace = "upc-department";
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
@Component.Role('erp_shop_upc_department')
export default class extends PureComponent {
  state = {
    applyModal: {
      visible: false,
    },

    allotModal:{
      visible:false,

    },
  }

  componentDidMount() {
    this.getUpcApply();
    this.getUpcDepartment(1);
  }

  getUpcApply = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, applyData: {list, total,}} = this.props[modelNameSpace];
    model.setState({
      list: [],
      total: 0,
    }).then(() => {
      model.call("getUpcApply", {
        pageIndex,
        pageSize,
        upcApplyType: 1,
      });
    });
  }

  getUpcDepartment = (page) => {
    const {model} = this.props;
    const {upcPageIndex, upcPageSize} = this.props[modelNameSpace];
    model.setState({
      upcPageIndex: page || upcPageIndex,
      upcData: {
        list: [],
        total: 0,
      },
    }).then(() => {
      model.call('getUpcDepartment', {
        pageIndex:upcPageIndex,
        pageSize:upcPageSize,
        status: 0,
      });
    });
  }

  applyUpc = () => {
    const {model} = this.props;
    Modal.confirm({
      title:'确定要申请UPC吗？',
      onOk:()=>{
        model.call('applyUpc',{
          upcNum:100,
        }).then(success=>{
          if(success){
            this.getUpcApply(1);
          }
        });
      }
    });
  }

  cancelApply=(applyID)=>{
    const {model}=this.props;
    model.call('cancelApply',{
      applyID,
    }).then(success=>{
      if(success){
        this.getUpcApply(1);
      }
    });
  }

  changeAllotNum=(shopID,upcNum)=> {
    const {model}=this.props;
    const {allotList}=this.props[modelNameSpace];
    const index=allotList.findIndex(x=>x.shopID===shopID);
    allotList[index]['upcNum']=upcNum;
    model.setState({
      allotList,
    })
  }

  allotUpc=()=>{
    const {model}=this.props;
    const {allotList}=this.props[modelNameSpace];
    model.call('allotUpc',{
      allotStr: JSON.stringify(allotList.filter(x=>x.upcNum>0)),
    }).then(success=>{
      if(success){
        this.getUpcDepartment(1);
        this.setState({
          allotModal:{
            visible:false,
          }
        })
      }
    });
  }

  openAllotModal=()=>{
    this.setState({
      allotModal:{
        visible:true,
      }
    });
    const {model}=this.props;
    model.call("getUpcRole").then(()=>{
      const {role}=this.props[modelNameSpace];
      fetchApi({
        url:'/Shop/GetMyOpenShop',
        params:{
          shopType:'amazon',
        }
      }).then(res=>{
        const allotList=[];
        const {data}=res;

        let list=data.toObject().list;
        list=role==='ad'?list.filter(x=>x.shopId===135):list;
        list.forEach(x=>{
          allotList.push({
            shopID:x.shopId,
            upcNum:0,
          });
        });
        model.setState({
          allotList,
        });
      });
    });

  }

  renderApplyModal() {
    return (
      <StandardModal
        title='申请UPC'
        width={600}
        visible={this.state.applyModal.visible}
        onCancel={e => this.setState({applyModal: {visible: false}})}
      >
        <div>
          1
        </div>
      </StandardModal>
    )
  }

  renderAllotModal() {
    const {allotList}=this.props[modelNameSpace];
    const columns=[
      {
        title:'店铺',
        dataIndex:'shopID',
        render:(text)=>{
          return formatter.shop[text];
        }
      },
      {
        title:'数量',
        dataIndex:'upcNum',
        render:(text,row)=>{
          return (<InputNumber value={text} onChange={value=>this.changeAllotNum(row.shopID,value)}/>)
        }
      }
    ];
    return (
      <StandardModal
        title='分配UPC'
        width={600}
        visible={this.state.allotModal.visible}
        onCancel={e => this.setState({allotModal: {visible: false}})}
        onOk={this.allotUpc}
      >
        <StandardTable
          rowKey={record=>record.shopID}
          columns={columns}
          dataSource={allotList}
          page={false}
        />
      </StandardModal>
    )
  }

  renderBody() {
    const {upcData: {list, total}, upcPageIndex} = this.props[modelNameSpace];
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
          <Card bordered={false} title='UPC申请列表' className={style.upcManager}
                extra={<a onClick={this.applyUpc}>申请UPC</a>}>
            <Alert style={{marginBottom:24}} message={
              <div>
                <p>1、每周基础申请次数为3次，每次申请固定为100个UPC</p>
                <p>2、申请次数用完后将无法继续申请，请联系管理员补充申请次数</p>
                <p>3、公司UPC库存不足时将无法申请，请联系管理员补充UPC</p>
              </div>
            } type="info" />
            {this.renderApplyList()}
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title='UPC列表'
            bordered={false}
            extra={<a onClick={this.openAllotModal}>分配UPC</a>}
          >
            <StandardTable
              rowKey={record => record.id}
              columns={columns}
              dataSource={list}
              loading={loading.effects[`${modelNameSpace}/getUpcDepartment`]}
            />
            <Pagination size='small' showTotal={() => `共${total} 条数据`} current={upcPageIndex} total={total}
                        onChange={(page) => this.getUpcDepartment(page)}/>
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
              {row.status === 0 ? <Button size='small' type='primary' style={{marginRight: 10}} onClick={e=>this.cancelApply(row.id)}>撤销</Button> : null}
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
      />
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: 'UPC-部门管理',
      },
      bg: true,
      body: {
        center: this.renderBody(),
      }
    };

    return (
      <div className={style.upcCompany}>
        <FxLayout {...fxLayoutProps}/>
        {this.state.applyModal.visible ? this.renderApplyModal() : null}
        {this.state.allotModal.visible?this.renderAllotModal():null}
      </div>
    )
  }
}
