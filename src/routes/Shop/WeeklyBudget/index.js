import React, {PureComponent} from 'react';
import {Card, Steps, List, Button, message, Row, Col, Modal, Tag, Input, Form, Divider, Badge, Alert} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import classNames from 'classnames';
import {fetchApiSync} from '../../../utils/rs/Fetch';
import {formatDate} from '../../../utils/utils';
import FxLayout from '../../../myComponents/Layout/';
import Component from '../../../utils/rs/Component';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditForm from '../../../myComponents/Form/Edit';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import LoadingService from '../../../utils/rs/LoadingService';

const Fragment = React.Fragment;
const modelNameSpace = "shop-weekly-budget";
const TextArea = Input.TextArea;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('erp_shop_weekly-budget')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  state = {
    modal: {
      visible: false,
    }
  }

  ref = {
    editForm: null,
  };


  apply = (values) => {
    const {model} = this.props;
    LoadingService.Start();
    model.call("apply", {
      entity: {
        ...values,
      }
    }).then(({success, record}) => {
      if (success) {
        const {data: {list, total}} = this.props[modelNameSpace];
        list.unshift(record);
        model.setState({
          data: {
            list,
            total: total + 1,
          }
        });
        this.setState({
          modal: {
            visible: false,
          }
        });
      }
      LoadingService.Done();
    });
  }

  cancel = (budgetID, index) => {
    Modal.confirm({
      title: '撤销预算申请',
      content: '确定要撤销预算申请吗？',
      onOk: () => {
        const { model } = this.props;
        model.call("cancel", {
          budgetID,
        }).then(success => {
          if (success) {
            const { data: { list,total} } = this.props[modelNameSpace];
            list.splice(index, 1);
            model.setState({
              data: {
                list,
                total: total - 1,
              }
            });
      }
    });
      }
    })


  }

  getList = (page) => {
    const {model} = this.props;
    const {data: {total}, pageIndex, pageSize} = this.props[modelNameSpace];
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.call("getMyRecord", {
        pageIndex,
        pageSize,
      });
    });
  }

  componentDidMount() {
    this.getList(1);
  }

  renderModal() {
    const {modal: {visible}} = this.state;
    const startDay = moment().startOf("week");
    const endDay = moment().endOf("week");
    const formItem = [
      {
        label: '预算周期',
        key: 'cycle',
        initialValue: [startDay, endDay],
        render: () => {
          return (
            <StandardRangePicker
              disabled
              style={{width: '100%'}}
            />
          )
        }
      },
      {
        label: '货物采购预算',
        key: 'purchaseBudget',
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        label: '广告费用预算',
        key: 'advertisementBudget',
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        label: '推广费用预算',
        key: 'extensionBudget',
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        label: '其他费用预算',
        key: 'otherBudget',
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        label: '其他费用说明',
        key: 'otherBudgetRemark',
        render: () => {
          return (
            <TextArea autoSize={{minRows: 4,}}/>
          )
        }
      }
    ];
    return (
      <StandardModal
        title='申请周预算'
        visible={visible}
        onCancel={e => this.setState({modal: visible})}
        footer={null}
      >
        <EditForm
          item={formItem}
          labelCol={6}
          wrappedRef={node => this.ref.editForm = node}
          onSubmit={this.apply}
        />
      </StandardModal>
    )
  }

  renderBody() {
    const {data: {list, total}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '预算周期',
        dataIndex: 'cycle',
        render: (text, row, index) => {
          return (
            <div>
              <span>{formatDate(row.startDate, 'YYYY-MM-DD')}</span>
              <span style={{width: 40, display: 'inline-block', textAlign: 'center'}}>-</span>
              <span>{formatDate(row.endDate, 'YYYY-MM-DD')}</span>
            </div>
          );
        }
      },
      {
        title: '货物采购预算',
        dataIndex: 'purchaseBudget',
        align: 'right',
      },
      {
        title: '广告费用预算',
        dataIndex: 'advertisementBudget',
        align: 'right',
      },
      {
        title: '推广费用预算',
        dataIndex: 'extensionBudget',
        align: 'right',
      },
      {
        title: '其他费用预算',
        dataIndex: 'otherBudget',
        align: 'right',
      },
      {
        title: '其他费用预算说明',
        dataIndex: 'otherBudgetRemark',
      },
      {
        title: '小计',
        dataIndex: 'total',
        align: 'right',
        render: (text, row, index) => {
          const {purchaseBudget = 0, advertisementBudget = 0, extensionBudget = 0, otherBudget = 0} = row;
          return purchaseBudget * 1 + advertisementBudget * 1 + extensionBudget * 1 + otherBudget * 1;
        }
      },
      {
        title:'申请时间',
        dataIndex:'createDate',
        render:(text) => {
          return formatDate(text,'YYYY-MM-DD hh:mm')
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        render: (text) => {
          let props = {};
          switch (text) {
            case 0:
              props = {
                text: '待审批',
                status: 'warning'
              };
              break;
            case 1:
              props = {
                text: '已通过',
                status: 'success'
              };
              break;
            case 2:
              props = {
                text: '已驳回',
                status: 'error'
              };
              break;
          }
          return (
            <Badge status={props.status} text={props.text}/>
          )
        }
      },
      {
        title:'操作',
        dataIndex: 'op',
        align:'center',
        render:(text,row,index) => {
          if (row.status === 0) {
            return (
              <a onClick={e => this.cancel(row.id,index)}>撤销</a>
            )
           }
        }
      }
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
    return (
      <div>
        <Alert
          type='info'
          style={{marginBottom: 16}}
          message={
            <div>
              <p>1. 统计货币单位为 RMB, 数值取整数，例如：35。</p>
              <p style={{color: 'red'}}>2. 预算每周一10点前填写完毕，各部门须提前对本部门做周预算，有效时间为每周一0点到10点。</p>
              <p>3. 填写数据尽量精准。</p>
              <p>4. 涉及到广告费用及推广费用的业务部和推广及广告部核对。</p>
              <p>5. 其他费用包含部门任何日常费用开销。</p>
              <p>6. 货物采购预算特指“大货采购”。</p>
            </div>
          }
        />
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          mode='simple'
          actions={actions}
        />
      </div>
    )
  }

  render() {
    const {loading, pagination} = this.props;
    const {data: {total}, pageIndex,} = this.props[modelNameSpace];
    const fxLayoutProps = {
      pageHeader: {
        title: '我的周预算申请',
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
        loading: loading.effects[`${modelNameSpace}/getMyRecord`],
      },
      footer: {
        pagination: pagination({total, pageIndex}, this.getList),
      }
    }
    return (
      <Fragment>
        <FxLayout {...fxLayoutProps}/>
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
