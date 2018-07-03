import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import {
  Badge,
  Input,
  Divider,
  Tabs,
  Modal,
  message,
} from 'antd';
import moment from 'moment';
import {formatDate} from '../../../utils/utils';
import Component from "../../../utils/rs/Component";
import StandardTable from '../../../myComponents/Table/Standard';
import FxLayout from '../../../myComponents/Layout/';
import EditModal from '../../../myComponents/Fx/EditModal';

const Fragment = React.Fragment;
const modelNameSpace = 'exam-pc';
const TabPane = Tabs.TabPane;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_exam_pc_reg')
export default class extends PureComponent {
  state = {
    modal: {
      visible: false,
      isAdd: true,
      index: -1,
      record: {},
    },
    activeKey: "0",
    selectKeys: [],
  }

  componentDidMount() {
    this.getList();
  }


  remove = (applyID) => {
    Modal.confirm({
      title: '删除记录',
      content: '确定要删除记录吗？',
      onOk: () => {
        const {model} = this.props;
        model.call("remove", {
          applyID,
        }).then(success => {
          const {list} = this.props[modelNameSpace];
          const index = list.findIndex(x => x.id === applyID);
          if (success) {
            list.splice(index, 1);
            model.setState({
              list,
            });
          }
        });
      }
    });
  }

  use = (applyID) => {
    const {model} = this.props;
    model.call("use", {
      applyID,
    }).then(success => {
      const {list} = this.props[modelNameSpace];
      const index = list.filter(x => x.isTmp !== 1).findIndex(x => x.id === applyID);
      if (success) {
        list[index]['status'] = list[index]['status'] === 1 ? 0 : 1;
        model.setState({
          list,
        });
      }
    });
  }

  getList = () => {
    const {model} = this.props;
    model.get();
  }

  save = (values) => {
    const {isAdd, record, index} = this.state.modal;
    const {model} = this.props;
    model.call(isAdd ? 'add' : 'edit', {
      entity: {
        ...record,
        ...values,
      }
    }).then(({success, record}) => {
      const {list} = this.props[modelNameSpace];
      if (success) {
        if (isAdd) {
          list.unshift(record);
        } else {
          list.splice(index, 1, record);
        }
        model.setState({
          list,
        });
        this.setState({
          modal: {
            visible: false,
          }
        })
      }
    });
  }

  audit = (applyResult) => {
    if (this.state.selectKeys.length === 0) {
      message.warning("请先选择一条记录");
      return;
    }
    Modal.confirm({
      title: `${applyResult===1 ? "同意" : '拒绝'}申请`,
      onOk: () => {
        const { model } = this.props;
        model.call('audit', {
          idList: this.state.selectKeys,
          applyResult,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
  }


  renderModal() {
    const {modal: {visible, record}} = this.state;
    const {model, location, mac} = record;
    const item = [
      {
        key: 'model',
        label: '电脑型号',
        initialValue: model,
        render: () => {
          return (<Input/>)
        }
      },
      {
        key: 'location',
        label: '所在房间',
        initialValue: location,
        render: () => {
          return (<Input/>)
        }
      },
      {
        key: 'mac',
        label: 'MAC地址',
        initialValue: mac,
        render: () => {
          return (<Input/>)
        }
      },
    ];
    return (
      <EditModal
        title='编辑'
        visible={visible}
        item={item}
        onCancel={e => this.setState({modal: {visible: false}})}
        onSubmit={this.save}
      />
    )
  }

  renderTabs() {
    return (
      <Tabs>
        <TabPane tab="固定考试机" key="0">{this.renderSolid()}</TabPane>
        <TabPane tab="临时考试机申请" key="1">{this.renderApply()}</TabPane>
      </Tabs>
    )
  }

  renderSolid() {
    const {list} = this.props[modelNameSpace];
    const dataSource = list.filter(x => x.isTmp !== 1);
    const actions = [
      {
        button: {
          type: 'primary',
          icon: 'plus',
          text: '注册',
          onClick: () => {
            this.setState({
              modal: {
                visible: true,
                record: {},
                isAdd: true,
              }
            })
          }
        }
      }
    ]
    const columns = [
      {
        title: '电脑型号',
        dataIndex: 'model',
      },
      {
        title: '所在房间',
        dataIndex: 'location',
      },
      {
        title: 'MAC地址',
        dataIndex: 'mac',
      },
      {
        title: '注册日期',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm');
        }
      },
      {
        title: '注册人员',
        dataIndex: 'createUserName'
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          const obj = {};
          switch (text) {
            case 1:
              obj.text = "已启用";
              obj.status = "success";
              break;
            case 0:
              obj.text = "已禁用";
              obj.status = "warning";
              break;
          }
          return (<Badge status={obj.status} text={obj.text}/>)
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'center',
        render: (text, record, index) => {
          return (
            <div>
              <a onClick={e => this.setState({modal: {visible: true, index, record}})}>编辑</a>
              <Divider type="vertical"/>
              <a onClick={e => this.use(record.id)}>{record.status === 0 ? "启用" : "禁用"}</a>
            </div>
          )
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        dataSource={dataSource}
        columns={columns}
        mode='simple'
        actions={actions}
      />
    )
  }

  renderApply() {
    const {list} = this.props[modelNameSpace];
    const dataSource = list.filter(x => x.isTmp === 1);

    const actions = [
      {
        button: {
          type: 'primary',
          icon: 'check',
          text: '同意',
          onClick: () => this.audit(1),
        }
      }, {
        button: {
          type: 'danger',
          icon: 'close',
          text: '拒绝',
          ghost: true,
          onClick: () => this.audit(2),
        }
      }
    ];
    const columns = [
      {
        title: '工号',
        dataIndex: 'jobNumber',
      },
      {
        title: 'MAC地址',
        dataIndex: 'mac',
      },
      {
        title: '申请时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm');
        }
      },
      {
        title: '申请人员',
        dataIndex: 'createUserName'
      },
      {
        title: '状态',
        dataIndex: 'applyStatus',
        render: (text, row) => {
          const obj = {};

          switch (text) {
            case 0:
              obj.text = "申请中";
              obj.status = "processing";
              if (moment(row.applyExpireDate).isBefore(moment())) {
                obj.text = "已过期";
                obj.status = "default";
              }
              break;
            case 1:
              obj.text = "已通过";
              obj.status = "success";
              if (moment(row.expireDate).isBefore(moment())) {
                obj.text = "已过期";
                obj.status = "default";
              }
              break;
            case 2:
              obj.text = "已拒绝";
              obj.status = "error";
              break;
          }
          return (<Badge status={obj.status} text={obj.text}/>)
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'center',
        render: (text, record, index) => {
          return (
            <div>
              <a onClick={e => this.remove(record.id)}>删除</a>
            </div>
          )
        }
      }
    ];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectKeys: selectedRowKeys,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.applyStatus!==0|| moment(record.applyExpireDate).isBefore(moment()),
        name: record.id,
      }),
    }
    return (
      <StandardTable
        rowKey={record => record.id}
        dataSource={dataSource}
        rowSelection={rowSelection}
        columns={columns}
        mode='simple'
        actions={actions}
      />
    )
  }

  render() {
    const {loading} = this.props;
    const fxProps = {
      header: {
        title: '考试机列表',
        actions: [
          {
            button: {
              type: 'primary',
              icon: 'retweet',
              text: '刷新',
              onClick: this.getList,
            }
          }
        ]
      },
      body: {
        center: this.renderTabs(),
        loading: loading.effects[`${modelNameSpace}/get`]
      }
    };
    return (
      <Fragment>
        <FxLayout {...fxProps}/>
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
