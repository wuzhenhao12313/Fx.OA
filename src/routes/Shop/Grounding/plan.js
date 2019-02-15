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
  Divider,
  Card,
  Row,
  Col,
  Tag,
  List,
  Avatar,
  Select,
  Collapse,
  Tabs
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import {formatNumber} from '../../../utils/utils';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import Config from "../../../utils/rs/Config";
import style from './index.less';
import Uri from "../../../utils/rs/Uri";
import Asin from './asin';

const modelNameSpace = "grounding-plan";
const Fragment = React.Fragment;
const ButtonGroup = Button.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const formatter = {
  department: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_shop_grounding_plan')
export default class  extends PureComponent {
  state = {
    addPlanModalProps: {
      visible: false,
      isOpenLeaveUser: false,
      isOPenManager: false,
      isAdd: true,
    },
    detailDrawerProps: {
      visible: false,
      currentPlanID: 0,
      currentPlan: {},
    },
    asinDrawerProps: {
      visible: false,
      currentPlanItemID: 0,
      currentPlanItem: {},
      currentAsinCode: null,
      currentCodeList: [],
    },
    editPlanCountModalProps: {
      visible: false,
      currentID: 0,
      index: -1,
      currentCount: null,
      currentShopType: null,
    },
    asinModel: 'table',
    tag:'download',

  }

  ref = {
    editPlanCountForm: null,
  }

  componentDidMount() {
    const tag = Uri.Query('tag');
    this.setState({
      tag,
    })
    this.getList(1);
  }

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    model.setState({
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        pageIndex,
        pageSize,
      });
    });
  }

  getDetailList = (planID) => {
    const {model} = this.props;
    model.call('getPlanDetail', {
      planID,
    });
  }

  getBadgeInfo = (type) => {
    const info = {};
    switch (type) {
      case 'working':
        info.status = "success";
        info.text = '已转正';
        break;
      case 'trial':
        info.status = "processing";
        info.text = '试用期';
        break;
      case 'waiting-quit':
        info.status = "waring";
        info.text = '待离职';
        break;
      case 'quit':
        info.status = "error";
        info.text = '已离职';
        break;
      default:
        info.status = "error";
        info.text = '已离职';
        break;
    }
    return info;
  }

  openAddPlanModal = () => {
    const {model} = this.props;
    model.call("getUserList", {
      isLoginDep: 1,
    });
    this.setState({
      addPlanModalProps: {
        visible: true,
        isOpenLeaveUser: false,
        isOPenManager: false,
        isAdd: true,
      }
    });
  }

  openDetailDrawer = (planID, currentPlan) => {
    this.setState({
      detailDrawerProps: {
        visible: true,
        currentPlanID: planID,
        currentPlan,
      }
    });
    this.getDetailList(planID);
  }

  editPlanCount = (userID, value, column) => {
    const {model} = this.props;
    const {userList} = this.props[modelNameSpace];
    const index = userList.findIndex(x => x.userID === userID);
    userList[index][column] = value;
    model.setState({
      userList,
    });
  }

  addPlan = () => {
    const {model} = this.props;
    const {userList} = this.props[modelNameSpace];
    const planCountModel = [];
    if(userList.filter(x=>!x.shopType&&x.planCount > 0).length>0){
      message.error("店铺类型没有选择");
      return;
    }
    userList.forEach(x => {
      if (x.planCount > 0) {
        planCountModel.push({
          userID: x.userID,
          userName: x.name,
          count: x.planCount,
          shopType: x.shopType,
        });
      }
    });
    model.call("addPlan", {
      planCountModel,
    }).then(success => {
      if (success) {
        this.setState({
          addPlanModalProps: {
            visible: false,
          }
        });
        this.getList(1);
      }
    });
  }

  cancelPlan = (planID) => {
    Modal.confirm({
      title: '撤销计划',
      content: '确定要撤销计划吗？撤销后将无法恢复',
      onOk: () => {
        const {model} = this.props;
        model.call("cancelPlan", {
          planID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
  }

  editPlanItemCount = () => {
    const {getFieldsValue} = this.ref.editPlanCountForm.props.form;
    const {model} = this.props;
    const {currentID, index} = this.state.editPlanCountModalProps;
    const {detailList} = this.props[modelNameSpace];
    const {count, shopType} = getFieldsValue();
    model.call('editPlanItem', {
      planItemID: currentID,
      ...getFieldsValue(),
    }).then(success => {
      if (success) {
        detailList[index]['count'] = count;
        detailList[index]['shopType'] = shopType;
        model.setState({
          detailList,
        });
        this.setState({
          editPlanCountModalProps: {
            visible: false,
          }
        })
      }
    });
  };

  getAsinList = (planItemID) => {
    const {model} = this.props;
    model.call('getPlanItemAsin', {
      planItemID,
    });
  };

  openAsinDrawer = (planItemID, currentPlanItem) => {
    const codeList = this.getCodeList(currentPlanItem.shopType);
    this.setState({
      asinDrawerProps: {
        visible: true,
        currentPlanItemID: planItemID,
        currentPlanItem,
        currentShopType:currentPlanItem.shopType,
      }
    });
    this.getAsinList(planItemID);
  };

  removePlanItem = (planItemID, planID,) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除此员工任务',
      content: '确定要删除吗？',
      onOk: () => {
        model.call("removePlanItem", {
          planItemID,
        }).then(success => {
          if (success) {
            this.getDetailList(planID);
          }
        });
      }
    })
  };

  openAddPlanItem = () => {
    const {model} = this.props;
    model.call("getUserList", {
      isLoginDep: 1,
    });
    this.setState({
      addPlanModalProps: {
        visible: true,
        isOpenLeaveUser: false,
        isOPenManager: false,
        isAdd: false,
      }
    });
  };

  addPlanItem = () => {
    const {model} = this.props;
    const {currentPlanID} = this.state.detailDrawerProps;
    let {userList, detailList} = this.props[modelNameSpace];
    userList = userList.filter(x => detailList.filter(y => y.userID === x.userID).length === 0);
    const planCountModel = [];
    if(userList.filter(x=>!x.shopType&&x.planCount>0).length>0){
      message.error("店铺类型没有选择");
      return;
    }
    userList.forEach(x => {
      if (x.planCount > 0) {
        planCountModel.push({
          userID: x.userID,
          userName: x.name,
          count: x.planCount,
          shopType:x.shopType,
        });
      }
    });
    model.call("addPlanItem", {
      planID: currentPlanID,
      planCountModel,
    }).then(success => {
      if (success) {
        this.getDetailList(currentPlanID);
        this.setState({
          addPlanModalProps: {
            visible: false,
          }
        })
      }
    });
  };

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
  };

  getShopTypeAsinCount=(shopType)=>{
    const {asinList} = this.props[modelNameSpace];
    return asinList.filter(x=>x.shopType===shopType).length;
  };

  renderEditPlanCountModal() {
    const {visible, currentCount, currentShopType} = this.state.editPlanCountModalProps;
    const item = [
      {
        label: '调整计划数量',
        key: 'count',
        initialValue: currentCount,
        rules: [
          {required: true, message: '请填写需要调整计划数量'}
        ],
        render: () => {
          return (<Input style={{width: '100%'}}/>)
        }
      },
      {
        label: '调整店铺类型',
        key: 'shopType',
        initialValue: currentShopType,
        rules: [
          {required: true, message: '请选择需要调整的铺类型'}
        ],
        render: () => {
          return (
            <Select style={{width: '100%'}}>
              <Option value='amazon'>amazon</Option>
              <Option value='ebay'>ebay</Option>
              <Option value='cdiscount'>cdiscount</Option>
              <Option value='wish'>wish</Option>
              <Option value='shopee'>shopee</Option>
            </Select>
          )
        }
      }
    ]
    return (
      <EditModal
        width={400}
        labelCol={6}
        item={item}
        title='调整计划数量'
        visible={visible}
        zIndex={1001}
        onCancel={e => this.setState({editPlanCountModalProps: {visible: false}})}
        refForm={node => this.ref.editPlanCountForm = node}
        onOk={this.editPlanItemCount}
        footer={true}
      />
    )
  }

  renderDetail() {
    const {visible, currentPlanID, currentPlan} = this.state.detailDrawerProps;
    const {detailList} = this.props[modelNameSpace];
    const {loading} = this.props;
    const columns = [
      {
        title: '员工姓名',
        dataIndex: 'userName',
      },
      {
        title: '店铺类型',
        dataIndex: 'shopType',

      },
      {
        title: '计划数量',
        dataIndex: 'count',
      },
      {
        title: '完成数量',
        dataIndex: 'endCount',
      },
      {
        title: '完成进度',
        dataIndex: 'progress',
        width: 400,
        render: (text, row) => {
          const percent = (row.endCount / row.count) * 100;
          return (<Progress percent={percent} showInfo={false}/>)
        }
      },
      {
        title: '完成比率',
        dataIndex: 'percent',
        width: 150,
        render: (text, row) => {
          const percent = formatNumber((row.endCount / row.count) * 100, 2);
          return `${percent}%`;
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          const action = [
            {
              label: 'ASIN列表',
              submit: () => {
                this.openAsinDrawer(row.id, row);
              }
            }
          ];
          const more = [
            {
              isShow: row.isEnd === 0,
              label: '编辑',
              submit: () => {
                this.setState({
                  editPlanCountModalProps: {
                    visible: true,
                    currentID: row.id,
                    index,
                    currentCount: row.count,
                    currentShopType: row.shopType,
                  }
                })
              }
            },
            {
              isShow: row.isEnd === 0,
              label: '删除',
              submit: () => {
                this.removePlanItem(row.id, row.planID);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      },
    ];
    return (
      <Drawer
        title='计划详情列表'
        width={1000}
        style={{width:1000}}
        placement="right"
        closable={false}
        onClose={e => this.setState({detailDrawerProps: {visible: false}})}
        visible={visible}
      >
        <div>
          <Button type='primary' style={{marginBottom: 16}} icon='retweet'
                  onClick={e => this.getDetailList(currentPlanID)}>刷新</Button>
          {currentPlan.isEnd === 0 ?
            <Button type='primary' style={{marginBottom: 16, marginLeft: 10}} icon='plus'
                    onClick={e => this.openAddPlanItem(currentPlanID)} ghost>添加员工</Button>
            : null
          }
          {this.renderDetailHeader()}
          <StandardTable
            rowKey={record => record.id}
            columns={columns}
            dataSource={detailList}
            loading={loading.effects[`${modelNameSpace}/getPlanDetail`]}
            bordered
          />
        </div>
        {this.state.asinDrawerProps.visible ? this.renderAsin() : null}
      </Drawer>
    )
  }

  renderDetailHeader() {
    const {detailList} = this.props[modelNameSpace];
    let planCount = 0;
    let endCount = 0;
    detailList.forEach(x => {
      planCount += x.count || 0;
      endCount += x.endCount || 0;
    });
    return (
      <Card style={{marginBottom: 24, marginTop: 4}}>
        <Row>
          <Col span={6}>
            <div className='headerInfo'>
              <span>总计划数量</span>
              <p>{planCount}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>总实际上传数量</span>
              <p>{endCount}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>总完成进度</span>
              <p style={{padding: '0 20px'}}><Progress percent={(endCount / planCount) * 100} showInfo={false}/></p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>总完成率</span>
              <p>{`${formatNumber((endCount / planCount) * 100, 2)}%`}</p>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }

  renderAddPlanModal() {
    const {visible, isOpenLeaveUser, isOPenManager, isAdd} = this.state.addPlanModalProps;
    const {loading} = this.props;
    let {userList, detailList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '员工姓名',
        dataIndex: 'name',
        render: (text, row) => {
          if (row.isDepartmentManager === 1) {
            return (<div>{text}<Tag style={{marginLeft: 10}}>部门经理</Tag></div>)
          }
          return text;
        }
      },
      {
        title: '工作状态',
        dataIndex: 'workStatus',
        render: (text) => {
          const obj = this.getBadgeInfo(text);
          return (<Badge status={obj.status} text={obj.text}/>)
        }
      },
      {
        title: '店铺类型',
        dataIndex: 'shopType',
        width: 120,
        render: (text, row,) => {
          return (
            <Select value={text} style={{width: '100%'}}
                    onChange={value => this.editPlanCount(row.userID, value, "shopType")}>
              <Option value='amazon'>amazon</Option>
              <Option value='ebay'>ebay</Option>
              <Option value='cdiscount'>cdiscount</Option>
              <Option value='wish'>wish</Option>
              <Option value='shopee'>shopee</Option>
            </Select>
          )
        }
      },
      {
        title: '计划数量',
        dataIndex: 'planCount',
        render: (text, row, index) => {
          return (
            <Input value={text} style={{width: '100%'}}
                   onChange={e => this.editPlanCount(row.userID, e.target.value, "planCount")}/>
          )
        }
      }
    ];
    if (!isOpenLeaveUser) {
      userList = userList.filter(x => x.isLeave === 0);
    }
    if (!isOPenManager) {
      userList = userList.filter(x => x.isDepartmentManager !== 1);
    }
    if (!isAdd) {
      userList = userList.filter(x => detailList.filter(y => y.userID === x.userID).length === 0);
    }
    return (
      <StandardModal
        width={700}
        title={isAdd ? '创建计划' : '添加计划员工'}
        visible={visible}
        onCancel={e => this.setState({addPlanModalProps: {visible: false}})}
        onOk={isAdd ? this.addPlan : this.addPlanItem}
        zIndex={1001}
      >
        <StandardTable
          columns={columns}
          rowKey={record => record.userID}
          dataSource={userList}
          loading={loading.effects[`${modelNameSpace}/getUserList`]}
          bordered={true}
          emptyProps={{type: 'text'}}
        />
        <Button
          type='dashed'
          icon={isOPenManager ? 'up' : 'down'}
          style={{width: '100%', marginTop: 10}}
          onClick={e => this.setState({
            addPlanModalProps: {
              ...this.state.addPlanModalProps,
              isOPenManager: !isOPenManager,
            }
          })}>
          {`${isOPenManager ? "隐藏" : "显示"}部门经理`}
        </Button>
        <Button
          type='dashed'
          icon={isOpenLeaveUser ? 'up' : 'down'}
          style={{width: '100%', marginTop: 10}}
          onClick={e => this.setState({
            addPlanModalProps: {
              ...this.state.addPlanModalProps,
              isOpenLeaveUser: !isOpenLeaveUser
            }
          })}>
          {`${isOpenLeaveUser ? "隐藏" : "显示"}已离职人员`}
        </Button>
      </StandardModal>
    )
  }

  renderAsinHeader() {
    const {currentPlanItem} = this.state.asinDrawerProps;
    let planCount = currentPlanItem.count;
    let endCount = currentPlanItem.endCount;
    return (
      <Card style={{marginBottom: 24, marginTop: 4}}>
        <Row>
          <Col span={6}>
            <div className='headerInfo'>
              <span>计划数量</span>
              <p>{planCount}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>实际上传数量</span>
              <p>{endCount}</p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>完成进度</span>
              <p style={{padding: '0 20px'}}><Progress percent={(endCount / planCount) * 100} showInfo={false}/></p>
              <em/>
            </div>
          </Col>
          <Col span={6}>
            <div className='headerInfo'>
              <span>完成率</span>
              <p>{`${formatNumber((endCount / planCount) * 100, 2)}%`}</p>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }

  renderAsin() {
    const {visible, currentPlanItemID, currentShopType} = this.state.asinDrawerProps;
    const codeList = this.getCodeList(currentShopType);
    const {asinList} = this.props[modelNameSpace];
    const gridStyle = {
      width: '33.33%',
      textAlign: 'center',
      height: 80,
    };
    return (
      <Drawer
        title='ASIN列表'
        width={800}
        style={{width:800}}
        placement="right"
        closable={false}
        onClose={e => this.setState({asinDrawerProps: {visible: false}})}
        visible={visible}
      >
        <div style={{marginBottom: 16}}>
          <Button
            type='primary'
            icon='retweet'
            onClick={e => this.getAsinList(currentPlanItemID)}>刷新
          </Button>
          <ButtonGroup style={{float: 'right'}}>
            <Button type={this.state.asinModel === 'table' ? "primary" : ''} icon='table'
                    onClick={e => this.setState({asinModel: 'table'})}/>
            <Button type={this.state.asinModel === 'list' ? "primary" : ''} icon='bars'
                    onClick={e => this.setState({asinModel: 'list'})}/>
          </ButtonGroup>
        </div>
        {this.renderAsinHeader()}
        <div>
          <Tabs type='card'
                activeKey={currentShopType}
                onChange={currentShopType => this.setState({
                  asinDrawerProps: {
                    ...this.state.asinDrawerProps,
                    currentShopType
                  }
                })}
          >
            <TabPane key='amazon' tab={<div>amazon <Badge count={this.getShopTypeAsinCount('amazon')}/></div>}/>
            <TabPane key='ebay' tab={<div>ebay <Badge count={this.getShopTypeAsinCount('ebay')}/></div>}/>
            <TabPane key='cdiscount' tab={<div>cdiscount <Badge count={this.getShopTypeAsinCount('cdiscount')}/></div>}/>
            <TabPane key='wish' tab={<div>wish <Badge count={this.getShopTypeAsinCount('wish')}/></div>}/>
            <TabPane key='shopee' tab={<div>shopee <Badge count={this.getShopTypeAsinCount('shopee')}/></div>}/>
          </Tabs>
          <Collapse accordion>
            {codeList.map(code => {
              return (
                <Collapse.Panel
                  header={<div>{code.name} <Badge count={asinList.filter(_ => _.code === code.code).length}/></div>}
                  key={code.code}>
                  {
                    asinList.filter(_ => _.code === code.code).map(x => {
                      return (
                        <Card.Grid style={gridStyle} className={style.asinItem}>
                          <div><span>ASIN：</span> <a className={style.asin} href={`https://${code.url}${x.ASIN}`}
                                                     target='_blank'>{x.P_ASIN ? x.P_ASIN : x.ASIN}</a></div>
                          <div><span>创建时间：</span>
                            <span>{Format.Date.Format(x.createDate, 'YYYY-MM-DD HH:mm')}</span></div>
                        </Card.Grid>)
                    })
                  }
                  <div style={{clear: 'both'}}></div>
                </Collapse.Panel>
              )
            })
            }
          </Collapse>
          {/*{*/}
            {/*this.state.asinModel === 'table' ?*/}
             {/**/}
              {/*:*/}
              {/*<div>*/}
                {/*<Tabs activeKey={currentAsinCode} onChange={currentAsinCode => {*/}
                  {/*currentAsinCode = currentAsinCode === 'null' ? null : currentAsinCode;*/}
                  {/*this.setState({asinDrawerProps: {...this.state.asinDrawerProps, currentAsinCode}})*/}
                {/*}}>*/}
                  {/*{currentCodeList.map(code => {*/}
                    {/*return (<TabPane tab={code.name} key={code.code}/>)*/}
                  {/*})}*/}
                {/*</Tabs>*/}
                {/*<List*/}
                  {/*itemLayout="horizontal"*/}
                  {/*dataSource={asinList.filter(x => x.code === currentAsinCode)}*/}
                  {/*renderItem={item => (*/}
                    {/*<List.Item>*/}
                      {/*<List.Item.Meta*/}
                        {/*avatar={<Avatar icon='amazon'/>}*/}
                        {/*title={*/}
                          {/*<a*/}
                            {/*className={style.asin}*/}
                            {/*href={`https://${currentCodeList.filter(x => x.code === currentAsinCode)[0].url}${item.ASIN}`}*/}
                            {/*target='_blank'>*/}
                            {/*{item.P_ASIN ? item.P_ASIN : item.ASIN}*/}
                          {/*</a>*/}
                        {/*}*/}
                        {/*description={*/}
                          {/*<div><span>创建时间：</span> <span>{Format.Date.Format(item.createDate, 'YYYY-MM-DD HH:mm')}</span>*/}
                          {/*</div>*/}
                        {/*}*/}
                      {/*/>*/}
                    {/*</List.Item>*/}
                  {/*)}*/}
                {/*/>*/}
              {/*</div>*/}
          {/*}*/}
        </div>
      </Drawer>
    )
  }

  renderList() {
    const {loading, model} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '计划周期',
        dataIndex: 'cycle',
        render: (text, row) => {
          return (
            <div>
              <span>{Format.Date.Format(row.startDate, 'YYYY-MM-DD')}</span>
              <span style={{width: 40, display: 'inline-block', textAlign: 'center'}}>-</span>
              <span>{Format.Date.Format(row.endDate, 'YYYY-MM-DD')}</span>
            </div>
          )
        }
      },
      {
        title: '计划数量',
        dataIndex: 'planCount',
        render: (text) => {
          return text || 0;
        }
      },
      {
        title: '完成数量',
        dataIndex: 'endCount',
      },
      {
        title: '完成进度',
        dataIndex: 'progress',
        width: 300,
        render: (text, row) => {
          const planCount = row.planCount ? row.planCount : 0;
          const percent = (row.endCount / planCount) * 100;
          return (<Progress percent={percent} showInfo={false}/>);
        }
      },
      {
        title: '完成比率',
        dataIndex: 'percent',
        width: 150,
        render: (text, row) => {
          const planCount = row.planCount ? row.planCount : 0;
          const percent = formatNumber((row.endCount / planCount) * 100, 2);
          return `${percent}%`;
        }
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        render: (text, row) => {
          const obj = {};
          if (moment(row.endDate).isBefore(moment().startOf('week'))) {
            obj.text = '已结束';
            obj.status = 'default';
          }
          else {
            obj.text = "进行中";
            obj.status = "processing";
          }
          return (<Badge text={obj.text} status={obj.status}/>);
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          const action = [
            {
              label: '查看详情',
              submit: () => {
                this.openDetailDrawer(row.id, row);
              }
            }
          ];
          const more = [
            {
              isShow: row.isEnd === 0,
              label: '撤销计划',
              submit: () => {
                this.cancelPlan(row.id);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      },
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        columns={columns}
        dataSource={list}
        loading={loading.effects[`${modelNameSpace}/get`]}
        bordered
      />
    )
  }

  render() {
    const {pagination, loading, model} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const actions = [
      {
        button: {
          icon: "plus",
          type: 'primary',
          text: '创建计划',
          onClick: () => {
            this.openAddPlanModal();
          }
        },
      },
      {
        button: {
          icon: "right",
          type: 'primary',
          text: '铺货ASIN管理',
          ghost: true,
          onClick: () => {
            model.push('/shop/grounding/plan?tag=asin&key=download');
          }
        },
      },
      {
        button: {
          icon: "retweet",
          type: 'primary',
          ghost: true,
          text: '刷新',
          onClick: () => {
            this.getList();
          }
        },
      },

    ];
    const startDay = moment().startOf('week');
    const endDay = moment().endOf('week');
    const fxLayoutProps = {
      header: {
        title: `铺货计划----当前周期（${startDay.format('YYYY-MM-DD')} -  ${endDay.format('YYYY-MM-DD')}）`,
        actions,
        titleStyle: {padding:'24px 0px'},
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      },
      body: {
        center: this.renderList(),
      },
    };
    return (
      <div >
        {this.state.tag === 'asin' ?
          <Asin role='manager'/> : <div>
            <FxLayout {...fxLayoutProps} />
            {this.state.addPlanModalProps.visible ? this.renderAddPlanModal() : null}
            {this.state.detailDrawerProps.visible ? this.renderDetail() : null}
            {this.state.editPlanCountModalProps.visible ? this.renderEditPlanCountModal() : null}

          </div>
        }
      </div>
    )
  }
}
