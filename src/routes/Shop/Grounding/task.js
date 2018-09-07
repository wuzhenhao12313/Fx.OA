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
  Row,
  Col,
  Card,
  Collapse,
  Menu,
  Dropdown
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import EditModal from '../../../myComponents/Fx/EditModal';
import Config from "../../../utils/rs/Config";
import {String} from '../../../utils/rs/Util';
import ShopSelect from '../../../myComponents/Select/Shop';
import Asin from './asin';
import style from './index.less';
import Uri from "../../../utils/rs/Uri";

const modelNameSpace = "grounding-task";
const Fragment = React.Fragment;
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
@Component.Role('erp_shop_grounding_task')
export default class  extends PureComponent {
  state = {
    asinDrawerProps: {
      visible: false,
      currentPlanItemID: 0,
      currentPlanID: 0,
      currentPlan: {},
    },
    editModal: {
      isAdd: false,
      visible: false,
      currentAsin: {},
      index: -1,
      currentAddAsinCode: null,
    },
    addAsinVisible: false,
    currentAddAsinValue: null,
    currentAddAsinCode: null,
    asinModel: 'table',
    tag: null,
  };

  ref = {
    editPlanCountForm: null,
    editForm: null,
  }

  componentDidMount() {
    const tag = Uri.Query('tag');
    this.setState({
      tag,
    })
    this.getList(1);
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

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    model.setState({
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.call('getMyPlanDetail', {
        pageIndex,
        pageSize,
      });
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

  openAsinDrawer = (planItemID, planID, currentPlan) => {
    this.setState({
      asinDrawerProps: {
        visible: true,
        currentPlanItemID: planItemID,
        currentPlanID: planID,
        currentPlan,
      }
    });
    this.getAsinList(planItemID);
  }

  addAsin = () => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.editForm.props.form;
    const {currentPlanItemID, currentPlanID} = this.state.asinDrawerProps;
    const {pAsin, asin, shopID} = getFieldsValue();
    const {currentAddAsinCode, isAdd, currentAsin} = this.state.editModal;
    if (String.IsNullOrEmpty(asin)) {
      message.warning("ASIN不能为空");
      return;
    }
    model.call(isAdd ? "addAsin" : "editAsin", isAdd ? {
      planID: currentPlanID,
      planItemID: currentPlanItemID,
      asin: asin.trim(),
      shopID,
      pAsin: pAsin.trim(),
      imgUrl: "",
      code: currentAddAsinCode,
    } : {
      asinID: currentAsin.id,
      asin: asin.trim(),
      shopID,
      pAsin: pAsin.trim(),
      imgUrl: '',
      code: currentAddAsinCode,
    }).then(success => {
      if (success) {
        this.setState({
          editModal: {
            visible: false,
          }
        });
        this.getAsinList(currentPlanItemID);
      }
    });
  }

  editAsin = (asinID, value) => {
    const {model} = this.props;
    const {asinList} = this.props[modelNameSpace];
    const index = asinList.findIndex(x => x.id === asinID);
    asinList[index]['ASIN'] = value;
    model.setState({
      asinList,
    });
  }

  saveEditAsin = (asinID) => {
    const {currentPlanItemID} = this.state.asinDrawerProps;
    Modal.confirm({
      title: '更改ASIN',
      content: '确定要更改ASIN吗？',
      onOk: () => {
        const {model} = this.props;
        const {asinList} = this.props[modelNameSpace];
        const index = asinList.findIndex(x => x.id === asinID);
        const asin = asinList[index]['ASIN'];
        const code = asinList[index]['code'];
        model.call("editAsin", {
          asinID,
          asin: asin.trim(),
          imgUrl: '',
          code,
        }).then(success => {
          if (success) {
            this.getAsinList(currentPlanItemID);
          }
        });
      }
    });
  }

  removeAsin = (asinID) => {
    const {currentPlanItemID} = this.state.asinDrawerProps;
    Modal.confirm({
      title: '删除ASIN',
      content: '确定要删除ASIN吗？删除后将无法恢复',
      onOk: () => {
        const {model} = this.props;
        model.call("removeAsin", {
          asinID,
        }).then(success => {
          if (success) {
            this.getAsinList(currentPlanItemID);
          }
        });
      }
    });
  }

  openAsinEdit = (asinID) => {
    const {model} = this.props;
    const {asinList} = this.props[modelNameSpace];
    const index = asinList.findIndex(x => x.id === asinID);
    asinList[index]['edit'] = true;
    asinList[index]['old-asin'] = asinList[index]['ASIN'];
    model.setState({
      asinList,
    });
  }

  cancelAsinEdit = (asinID) => {
    const {model} = this.props;
    const {asinList} = this.props[modelNameSpace];
    const index = asinList.findIndex(x => x.id === asinID);
    asinList[index]['edit'] = false;
    asinList[index]['ASIN'] = asinList[index]['old-asin'];
    model.setState({
      asinList,
    });
  }

  moveAsin = (asinID, code) => {
    const {currentPlanItemID} = this.state.asinDrawerProps;
    const {model} = this.props;
    const asinIDList = [];
    asinIDList.push(asinID);
    model.call("moveAsin", {
      asinIDList,
      code,
    }).then(success => {
      if (success) {
        this.getAsinList(currentPlanItemID);
      }
    });
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
        onOk={this.addAsin}
      />
    )
  }

  renderAsinHeader() {
    const {currentPlan} = this.state.asinDrawerProps;
    let planCount = currentPlan.count;
    let endCount = currentPlan.endCount;
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
    const {visible, currentPlanItemID, currentPlan} = this.state.asinDrawerProps;
    const {asinList} = this.props[modelNameSpace];
    const codeList = this.getCodeList(currentPlan.shopType);
    const gridStyle = {
      width: '33.33%',
      textAlign: 'center',
      height: 80,
      lineHeight: '36px',
    };
    return (
      <Drawer
        title='ASIN列表'
        width={1100}
        placement="right"
        closable={false}
        onClose={e => this.setState({asinDrawerProps: {visible: false}})}
        visible={visible}
      >
        <div style={{marginBottom: 16}}>
          <Button
            type='primary'
            icon='retweet'
            onClick={e => this.getAsinList(currentPlanItemID)}>刷新</Button>
        </div>
        {this.renderAsinHeader()}
        <Collapse accordion>
          {codeList.map(code => {
            return (
              <Collapse.Panel
                header={<div>{code.name} <Badge count={asinList.filter(_ => _.code === code.code).length}/></div>}
                key={code.code}>
                <div>
                  {
                    currentPlan.isEnd === 0 ?
                      <Card.Grid style={gridStyle} className={style.asinItem}>
                        {this.state.addAsinVisible && this.state.currentAddAsinCode === code.code ?
                          <div>
                            <Input value={this.state.currentAddAsinValue} style={{width: 160}}
                                   onChange={e => this.setState({currentAddAsinValue: e.target.value})}/>
                            <Button icon='save' type='primary' style={{marginLeft: 5}}
                                    onClick={e => this.addAsin(code.code)}/>
                            <Button icon='reload' type='danger' ghost style={{marginLeft: 5}}
                                    onClick={e => this.setState({addAsinVisible: false, currentAddAsinValue: null})}/>
                          </div> :
                          <div className={style.addAsin} onClick={e => this.setState({
                            editModal: {
                              isAdd: true,
                              visible: true,
                              currentAsin: {},
                              currentAddAsinCode: code.code
                            }
                          })}
                               style={{cursor: 'pointer'}}>
                            <Icon type='plus'/>点击添加新的ASIN
                          </div>}
                      </Card.Grid>
                      : null
                  }
                  {asinList.filter(_ => _.code === code.code).map((x, index) => {
                    if (currentPlan.isEnd === 1) {
                      return (
                        <Card.Grid style={gridStyle} className={style.asinItem}>
                          <div className={style.asinDiv}>
                            {x.P_ASIN ? <Icon type='check-circle'/> : null}
                            <a className={style.asinHref} href={`https://${code.url}${x.ASIN}`}
                               target='_blank'>{x.P_ASIN ? x.P_ASIN : x.ASIN}</a>
                          </div>
                        </Card.Grid>
                      )
                    }
                    return (
                      <Card.Grid style={gridStyle} className={style.asinItem}>
                        <div className={style.asinDiv}>
                          {x.edit ?
                            <div>
                              <Input value={x.ASIN} style={{width: 160}}
                                     onChange={e => this.editAsin(x.id, e.target.value)}/>
                              <Button
                                icon='save'
                                type='primary'
                                style={{marginLeft: 5}}
                                onClick={e => this.saveEditAsin(x.id)}/>
                              <Button
                                icon='reload'
                                type='danger'
                                ghost
                                style={{marginLeft: 5}}
                                onClick={e => this.cancelAsinEdit(x.id)}/>
                            </div> :
                            <div>
                              {x.P_ASIN ? <Icon type='check-circle'/> : null}
                              <a className={style.asinHref} href={`https://${code.url}${x.ASIN}`}
                                 target='_blank'>{x.P_ASIN ? x.P_ASIN : x.ASIN}</a>
                              <Button className={style.btn} icon='edit' type='primary' style={{marginLeft: 5}}
                                      onClick={e => this.setState({
                                        editModal: {
                                          isAdd: false,
                                          visible: true,
                                          currentAsin: x,
                                          currentAddAsinCode: code.code
                                        }
                                      })}/>
                              <Button className={style.btn} icon='delete' type='danger' ghost style={{marginLeft: 5}}
                                      onClick={e => this.removeAsin(x.id)}/>
                              <Dropdown overlay={
                                <Menu onClick={e => this.moveAsin(x.id, e.key)}>
                                  {codeList.map(i => {
                                    if (x.code === i.code) {
                                      return null;
                                    }
                                    return (
                                      <Menu.Item key={i.code}>{i.name}</Menu.Item>
                                    )
                                  })}
                                </Menu>
                              } trigger={['click']}>
                                <a href="#" style={{marginLeft: 5}}>
                                  移动至<Icon type="down"/>
                                </a>
                              </Dropdown>
                            </div>}
                        </div>
                      </Card.Grid>
                    )
                  })}

                  <div style={{clear: 'both'}}></div>
                </div>
              </Collapse.Panel>
            )
          })}
        </Collapse>
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
        title: '任务周期',
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
        title: '任务数量',
        dataIndex: 'count',
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
              label: 'ASIN列表',
              submit: () => {
                this.openAsinDrawer(row.id, row.planID, row);
              }
            }
          ];
          return (<TableActionBar action={action}/>)
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
    const {pagination, loading,model} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const actions = [
      {
        button: {
          icon: "right",
          type: 'primary',
          text: '铺货ASIN管理',
          onClick: () => {
            model.push('/shop/grounding/task?tag=asin&key=download');
          }
        },
      },
      {
        button: {
          icon: "retweet",
          type: 'primary',
          text: '刷新',
          ghost: true,
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
        title: `我的铺货任务----当前周期（${startDay.format('YYYY-MM-DD')} -  ${endDay.format('YYYY-MM-DD')}）`,
        actions,
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
        {this.state.tag==='asin'?
         <Asin role='employee' />:<div>
            <FxLayout {...fxLayoutProps} />
            {this.state.asinDrawerProps.visible ? this.renderAsin() : null}
            {this.state.editModal.visible ? this.renderEditModal() : null}
          </div>
        }
      </div>
    )
  }
}
