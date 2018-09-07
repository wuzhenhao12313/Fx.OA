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
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import Asin from './asin';
import style from './index.less';

const modelNameSpace = "grounding-track";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

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
@Component.Role('erp_shop_grounding_track')
export default class  extends PureComponent {
  state = {
    detailDrawerProps: {
      visible: false,
      currentPlanID: 0,
      currentDep: 0,
    },
    asinDrawerProps: {
      visible: false,
      currentPlanItemID: 0,
      currentPlanItem: {},
      currentAsinCode: null,
      currentCodeList: [],
    },
    cycle: {
      startDate: moment().startOf('week').format('YYYY-MM-DD'),
      endDate: moment().endOf('week').format('YYYY-MM-DD'),
    },
    cycleList: [],
    depList: [],
    activePlan: 0,
    asinModel: 'table',
    tag: null,
  }

  ref = {
    editPlanCountForm: null,
  }

  componentDidMount() {
    const tag = Uri.Query('tag');
    this.setState({
      tag,
    })
    let arr = [];
    for (let i = 0; i < 10; i += 1) {
      let _day = moment().subtract(i, 'weeks');
      let start = _day.startOf('week').format('YYYY-MM-DD');
      let end = _day.endOf('week').format('YYYY-MM-DD');
      arr.push(`${start},${end}`);
    }
    this.setState({
      cycleList: arr,
    });
    this.getList();
  }

  getList = () => {
    const {startDate, endDate} = this.state.cycle;
    const {model} = this.props;
    model.setState({
      list: [],
    }).then(() => {
      model.get({
        startDate,
        endDate,
      }).then(() => {
        const {list} = this.props[modelNameSpace];
        list.sort((a, b) => {
          const _a = departmentList.filter(x => x.depID === a.depID)[0];
          const _b = departmentList.filter(x => x.depID === b.depID)[0];
          return _a.showIndex - _b.showIndex;
        });
        let depList = [];

        list.forEach(x => {
          depList.push({
            depID: x.depID.toString(),
            planID: x.id.toString(),
          });
        });
        this.setState({
          depList,
        });
        model.setState({
          list,
        })
      });
    });
  }

  getDetailList = (planID) => {
    const {model} = this.props;
    model.call('getPlanDetail', {
      planID,
    });
  }

  getAsinList = (planItemID) => {
    const {model} = this.props;
    model.call('getPlanItemAsin', {
      planItemID,
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

  openDetailDrawer = (planID, currentDep) => {
    this.setState({
      detailDrawerProps: {
        visible: true,
        currentPlanID: planID,
        currentDep,
      }
    });
    this.setState({
      activePlan: planID.toString(),
    });
    this.getDetailList(planID);
  }

  openAsinDrawer = (planItemID, currentPlanItem) => {
    const codeList = this.getCodeList(currentPlanItem.shopType);
    this.setState({
      asinDrawerProps: {
        visible: true,
        currentPlanItemID: planItemID,
        currentPlanItem,
        currentCodeList: codeList,
        currentAsinCode: codeList[0].code,
      }
    });
    this.getAsinList(planItemID);
  }

  runDownloading = () => {
    const {model} = this.props;
    model.call('runDownloading', {
      isAutoDownloading: false,
    }).then(success => {
      if (success) {

      }
    });
  }

  switchPlan=(planID)=>{
    const {model}=this.props;
    model.call("switchPlan",{
      planID,
    }).then(success=>{
      if(success){
        this.getList();
      }
    });
  }

  renderDetail() {
    const {visible, currentPlanID} = this.state.detailDrawerProps;
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
          return (<TableActionBar action={action}/>);
        }
      },
    ];
    return (
      <Drawer
        title='计划详情列表'
        width={1000}
        placement="right"
        closable={false}
        onClose={e => this.setState({detailDrawerProps: {visible: false}})}
        visible={visible}
      >
        <div>
          <Tabs
            tabBarExtraContent={
              <Button
                type='dashed'
                icon='retweet'
                onClick={e => this.getDetailList(currentPlanID)}
              >
                刷新
              </Button>
            }
            activeKey={this.state.activePlan}
            type="card"
            onChange={tab => {
              this.setState({activePlan: tab}, e => this.getDetailList(tab.toInt()));
            }}>
            {this.state.depList.map(x => {
              return (<TabPane tab={formatter.department[x.depID.toInt()]} key={x.planID}/>);
            })}
          </Tabs>
          {this.renderDetailHeader()}
          <StandardTable
            rowKey={record => record.id}
            columns={columns}
            dataSource={detailList}
            loading={loading.effects[`${modelNameSpace}/getPlanDetail`]}
            bordered
          />
        </div>

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
      <Card style={{marginBottom: 24, marginTop: 16}}>
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
    const {visible, currentPlanItemID, currentCodeList, currentAsinCode} = this.state.asinDrawerProps;
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
          {
            this.state.asinModel === 'table' ?
              <Collapse accordion>
                {currentCodeList.map(code => {
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
              :
              <div>
                <Tabs activeKey={currentAsinCode} onChange={currentAsinCode => {
                  currentAsinCode = currentAsinCode === 'null' ? null : currentAsinCode;
                  this.setState({asinDrawerProps: {...this.state.asinDrawerProps, currentAsinCode}})
                }}>
                  {currentCodeList.map(code => {
                    return (<TabPane tab={code.name} key={code.code}/>)
                  })}
                </Tabs>
                <List
                  itemLayout="horizontal"
                  dataSource={asinList.filter(x => x.code === currentAsinCode)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon='amazon'/>}
                        title={
                          <a
                            className={style.asin}
                            href={`https://${currentCodeList.filter(x => x.code === currentAsinCode)[0].url}${item.ASIN}`}
                            target='_blank'>
                            {item.P_ASIN ? item.P_ASIN : item.ASIN}
                          </a>
                        }
                        description={
                          <div><span>创建时间：</span> <span>{Format.Date.Format(item.createDate, 'YYYY-MM-DD HH:mm')}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
          }
        </div>
      </Drawer>
    )
  }

  renderHeader() {
    const {list} = this.props[modelNameSpace];
    let planCount = 0;
    let endCount = 0;
    list.forEach(x => {
      planCount += x.planCount || 0;
      endCount += x.endCount || 0;
    });
    return (
      <Card style={{marginBottom: 24, marginTop: 16}}>
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

  renderList() {
    const {loading, model} = this.props;
    const {list} = this.props[modelNameSpace];
    const columns = [
      {
        title: '部门',
        dataIndex: 'depID',
        render: (text) => {
          return formatter.department[text];
        }
      },
      {
        title: '负责人',
        dataIndex: 'createUserName',
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
          return (<Progress percent={percent} showInfo={false}/>)
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
          if (row.isEnd===1) {
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
                this.openDetailDrawer(row.id, row.depID);
              }
            }
          ];
          const more=[
            {
              label:row.isEnd===1?'开启':'关闭',
              submit:()=>{
                this.switchPlan(row.id);
              }
            }
          ]
          return (<TableActionBar action={action} more={more}/>)
        }
      },
    ];
    return (
      <div>
        {this.renderHeader()}
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/get`]}
          bordered
        />
      </div>
    )
  }

  render() {
    const {model} = this.props;
    const actions = [
      {
        button: {
          icon: "retweet",
          type: 'primary',
          text: '刷新',
          onClick: () => {
            this.getList();
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
            model.push('/shop/grounding/track?tag=asin&key=download');
          }
        },
      },
    ];
    const {cycle} = this.state;
    const fxLayoutProps = {
      header: {
        title: (
          <div>
            <span style={{fontSize: 20}}>铺货计划跟踪</span>
            <Select
              value={`${cycle.startDate},${cycle.endDate}`}
              style={{width: 180, marginLeft: 20}}
              onChange={value => this.setState(
                {
                  cycle: {startDate: value.toList()[0], endDate: value.toList()[1]}
                }
                , this.getList)}
            >
              {this.state.cycleList.map((x, index) => {
                return <Option key={index} value={x}>{`${x.toList()[0]} - ${x.toList()[1]}`}</Option>
              })}
            </Select>
          </div>
        ),
        titleStyle: {paddingTop: 8},
        type: 'custom',
        actions,
      },
      body: {
        center: this.renderList(),
      },
    };
    return (
      <div>
        {this.state.tag === 'asin' ?
          <Asin role='admin'/> :
          <div style={{paddingTop: 16}}>
            <div>
              <FxLayout {...fxLayoutProps} />
              {this.state.detailDrawerProps.visible ? this.renderDetail() : null}
              {this.state.asinDrawerProps.visible ? this.renderAsin() : null}
            </div>
          </div>
        }
      </div>
    )
  }
}
