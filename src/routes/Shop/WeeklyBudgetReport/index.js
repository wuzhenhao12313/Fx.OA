import React, {PureComponent} from 'react';
import {connect} from 'dva';
import { Button } from 'antd';
import moment from 'moment';
import html2canvas from 'html2canvas';
import {formatDate, downloadFile} from '../../../utils/utils';
import FxLayout from '../../../myComponents/Layout/';
import Component from '../../../utils/rs/Component';
import StandardTable from '../../../myComponents/Table/Standard';


const Fragment = React.Fragment;
const modelNameSpace = "shop-weekly-budget-report";

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('erp_shop_weekly-budget-report')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    const {model} = this.props;
    model.call("getReport");
  }

  savePicture = () => {
    html2canvas(document.querySelector("#my-report-table")).then(canvas => {
      downloadFile('破浪业务部周预算统计报表.png', canvas.toDataURL("image/png"));
    });
  }


  renderBody() {
    const {data: {list, total}} = this.props[modelNameSpace];
    let totalMoney = 0;
    let totalPurchase = 0;
    let totalAdvertise = 0;
    let totalExtension = 0;
    let totalOther = 0;
    if (list.findIndex(x => x.depID === 0) === -1) {
      list.forEach(x => {
        const {purchaseBudget = 0, advertisementBudget = 0, extensionBudget = 0, otherBudget = 0} = x;
        totalMoney += purchaseBudget * 1 + advertisementBudget * 1 + extensionBudget * 1 + otherBudget * 1;
        totalPurchase += purchaseBudget * 1;
        totalAdvertise += advertisementBudget * 1;
        totalExtension += extensionBudget * 1;
        totalOther += otherBudget * 1;
      });
      list.push({
        depID: 0,
        depName: '合计',
        purchaseBudget:totalPurchase,
        advertisementBudget:totalAdvertise,
        extensionBudget:totalExtension,
        otherBudget:totalOther,
        total: totalMoney,
      });
    }
    const columns = [
      {
        title: '部门',
        dataIndex: 'depName',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '货物采购预算',
        dataIndex: 'purchaseBudget',
        align: 'right',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '广告费用预算',
        dataIndex: 'advertisementBudget',
        align: 'right',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '推广费用预算',
        dataIndex: 'extensionBudget',
        align: 'right',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '其他费用预算',
        dataIndex: 'otherBudget',
        align: 'right',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '其他费用预算说明',
        dataIndex: 'otherBudgetRemark',
        render: (text, row) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          return text;
        }
      },
      {
        title: '小计',
        dataIndex: 'total',
        align: 'right',
        render: (text, row, index) => {
          if (row.depID === 0) {
            return <span style={{fontWeight: 'bold', fontSize: 15}}>{text}</span>
          }
          const {purchaseBudget = 0, advertisementBudget = 0, extensionBudget = 0, otherBudget = 0} = row;
          return purchaseBudget * 1 + advertisementBudget * 1 + extensionBudget * 1 + otherBudget * 1;
        }
      },
    ];
    const actions = [
      {
        button: {
          type: 'primary',
          text: '申请周预算',
          icon: 'arrow-right',
          onClick: () => {
            this.setState({
              modal: {
                visible: true,
              }
            })
          }
        }
      }
    ];
    const startDay = moment().startOf("week");
    const endDay = moment().endOf("week");
    return (
      <div>
        <StandardTable
          bordered
          title={`破浪业务部周预算统计报表（${startDay.format('YYYY-MM-DD')} -  ${endDay.format('YYYY-MM-DD')}） `}
          rowKey={record => record.depID}
          columns={columns}
          dataSource={list}
          tools={null}
          tableID='my-report-table'
          customTools={
            <div>
              <Button type='primary' ghost onClick={e => this.savePicture()}>保存为图片</Button>
            </div>
          }
          mode='simple'
        />
      </div>
    )
  }


  render() {
    const {loading} = this.props;
    const fxLayoutProps = {
      pageHeader: {
        title: '周预算申请报表',
        actions: [
          {
            button: {
              type: 'primary',
              text: '刷新',
              icon: 'retweet',
              onClick: e => this.getList(),
            }
          }
        ]
      },
      body: {
        center: this.renderBody(),
        loading: loading.effects[`${modelNameSpace}/getReport`],
      }

    }
    return (
      <Fragment>
        <FxLayout {...fxLayoutProps}/>
      </Fragment>
    )
  }
}
