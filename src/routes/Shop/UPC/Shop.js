import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
  Button,
  Badge,
  Select,
  Tabs,
  Card,
  Radio,
  message,
  Alert,
  Modal,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import DescriptionList from '../../../components/DescriptionList';
import {fetchApiSync, fetchDictSync, fetchApi} from "../../../utils/rs/Fetch";
import {formatDate, formatNumber} from '../../../utils/utils';


const modelNameSpace = "upc-shop";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
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
@Component.Role('erp_shop_upc_shop')
export default class extends PureComponent {
  state = {
    status: 0,
    currentShop: null,
    myShopList: [],
    selectedRowKeys: [],
    selectRows: [],
    currentCopyText: null,
  }


  componentDidMount() {
    const {model} = this.props;
    model.call("getUpcRole").then(() => {
      const {role} = this.props[modelNameSpace];
      fetchApi({
        url: '/Shop/GetMyOpenShop',
        params: {
          shopType: 'amazon',
        }
      }).then(res => {
        const {data} = res;
        let list = data.toObject().list;
        list = role === 'ad' ? list.filter(x => x.shopId === 135) : list;
        this.setState({
          myShopList: list,
          currentShop: list.length > 0 ? list[0].shopId.toString() : null,
        });

        this.getUpcShop(1);
      })
    });

  }

  getUpcShop = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize} = this.props[modelNameSpace];
    model.setState({
      pageIndex: page || pageIndex,
      upcData: {
        list: [],
        total: 0,
      },
    }).then(() => {
      model.call('getUpcShop', {
        pageIndex,
        pageSize,
        status: this.state.status,
        shopID: this.state.currentShop ? this.state.currentShop.toInt() : null,
      });
    });
  }

  useUpc = (upcID) => {
    const {selectRows, selectedRowKeys} = this.state;
    if (selectRows.length === 0) {
      message.warning("请先选择一条数据");
      return;
    }
    const upcIdList = upcID ? [upcID] : selectedRowKeys;
    Modal.confirm({
      title: '确定要标记为已使用吗?',
      onOk: () => {
        const {model} = this.props;
        model.call('useUpc', {
          upcIdList,
        }).then(success => {
          if (success) {
            this.getUpcShop(1);
          }
        });
      }
    });
  }

  onSelectChange = (selectedRowKeys, selectRows) => {
    this.setState({selectedRowKeys, selectRows});
    const list = [];
    selectRows.forEach(x => {
      list.push(x.upc);
    });
    const text = list.join('\n');
    this.setState({
      currentCopyText: text,
    });
  }

  onBatchCopy = () => {
    const {selectRows} = this.state;
    if (selectRows.length === 0) {
      message.warning("请先选择一条数据");
      return;
    }
    message.success("已复制到剪切板");
  }

  returnUpc = () => {
    const {model} = this.props;
    const {currentShop}=this.state;
    Modal.confirm({
      title: '退回UPC',
      onOk: () => {
        model.call('returnUpc', {
          shopID:currentShop.toInt(),
        }).then(success => {
          if (success) {
            this.getUpcShop(1);
          }
        });
      }
    });
  }

  renderBody() {
    const {data: {list, total}, pageIndex,} = this.props[modelNameSpace];
    const {loading, pagination} = this.props;
    const {selectedRowKeys, currentCopyText} = this.state;
    const columns = [
      {
        title: 'UPC',
        dataIndex: 'upc',

      },
      {
        title: '店铺',
        dataIndex: 'shopID',
        render: (text) => {
          return formatter.shop[text];
        }
      },
      {
        title: '分配时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '分配人',
        dataIndex: 'allotUserName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          let obj = {};
          switch (text) {
            case 0:
              obj = {text: '可以使用', status: 'success'};
              break;
            case 1:
              obj = {text: '已使用', status: 'error'};
              break;
          }
          return <Badge text={obj.text} status={obj.status}/>
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          return (
            <div>
              {row.status === 0 ?
                <Fragment>
                  <CopyToClipboard text={row.upc} onCopy={e => message.success('已复制到剪切板')}>
                    <Button type='dashed' style={{marginRight: 10}} size='small'>复制</Button>
                  </CopyToClipboard>
                  <Button type='primary' size='small' ghost onClick={e => this.useUpc(row.id)}>标记为已使用</Button>
                </Fragment> : null
              }
            </div>
          )
        }
      }
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div>
        <Alert message={
          <div>
            <p>1、点击复制按钮可将UPC复制到剪切板</p>
            <p style={{color: 'red'}}>2、使用UPC后请务必将UPC标记为已使用</p>
          </div>
        } style={{marginBottom: 24}}/>
        <Tabs activeKey={this.state.currentShop}
              onChange={value => this.setState({currentShop: value}, e => this.getUpcShop(1))} type='card'
              tabBarExtraContent={
                <RadioGroup value={this.state.status}
                            onChange={e => this.setState({status: e.target.value}, e => this.getUpcShop(1))}
                            style={{marginBottom: 24}} buttonStyle="solid">
                  <RadioButton value={0}>可以使用</RadioButton>
                  <RadioButton value={1}>已使用</RadioButton>
                </RadioGroup>
              }>
          {this.state.myShopList.map(x => {
            return (
              <TabPane key={x.shopId.toString()} tab={x.shop_name}/>
            )
          })}

        </Tabs>
        <div style={{marginBottom: 12}}>
          <CopyToClipboard text={currentCopyText} onCopy={this.onBatchCopy}>
            <Button type='dashed' style={{marginRight: 16}} icon='copy'>批量复制</Button>
          </CopyToClipboard>
          <Button type='primary' ghost icon='tag' onClick={e => this.useUpc()}>批量标记为已使用</Button>
          <div className='float-right'>
            <Button type='danger' ghost onClick={this.returnUpc}>退回部门仓库</Button>
          </div>
        </div>
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          rowSelection={rowSelection}
          page={pagination({pageIndex, total}, this.getUpcShop)}
          loading={loading.effects[`${modelNameSpace}/getUpcShop`]}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: 'UPC-店铺管理',
      },
      body: {
        center: this.renderBody(),
      }
    };
    return (
      <div>
        <FxLayout {...fxLayoutProps}/>
      </div>)
  }
}
