import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Modal,
  Badge,
  Select,
} from 'antd';
import moment from 'moment';
import ceil from 'lodash/ceil';
import round from 'lodash/round';
import cloneDeep from 'lodash/cloneDeep';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import Uri from '../../../utils/rs/Uri';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchForm from  '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import TableActionBar from  '../../../myComponents/Table/TableActionBar';
import StandardTable from  '../../../myComponents/Table/Standard';
import StandardDatePicker from  '../../../myComponents/Date/StandardDatePicker';
import StandardRangePicker from  '../../../myComponents/Date/StandardRangePicker';
import EditModal from '../../../myComponents/Fx/EditModal';
import FxLayout from '../../../myComponents/Layout/';
import PositionSelect from '../../../myComponents/Select/Position';

const modelNameSpace = 'employee-contract';
const TextArea = Input.TextArea;
const Fragment = React.Fragment;
const Option = Select.Option;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_employee_contract_list')
export default class extends PureComponent {
  state = {
    sorter: {
      sorterColumn: 'createDate',
      sorterType: 'desc',
    },
    modal: {
      visible: false,
      content: null,
      index: -1,
    },
    remarkModal: {
      visible: false,
      content: null,
      index: -1,
    },
    stopModal: {
      visible: false,
      content: null,
      index: -1,
    },
    selectedKeys: [],
    currentAddUserID: 0,
    currentStatus: '',
    searchTypeValue: 'empName',
  };

  ref = {
    entityForm: null,
    searchForm: null,
  }

  cacheOriginData = {}

  getList = (page) => {
    const {model, [modelNameSpace]: {pageIndex, pageSize}} = this.props;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {sorter, currentStatus} = this.state;
    let {entryDate,probationDate,contractStartDate,contractEndDate} = getFieldsValue();
    const entryStartDate = entryDate ? entryDate[0].format('YYYY-MM-DD') : null;
    const entryEndDate = entryDate ? entryDate[1].format('YYYY-MM-DD') : null;
    const probationStartDate = probationDate ? probationDate[0].format('YYYY-MM-DD') : null;
    const probationEndDate = probationDate ? probationDate[1].format('YYYY-MM-DD') : null;
    const contractStartStartDate = contractStartDate ? contractStartDate[0].format('YYYY-MM-DD') : null;
    const contractStartEndDate = contractStartDate ? contractStartDate[1].format('YYYY-MM-DD') : null;
    const contractEndStartDate = contractEndDate ? contractEndDate[0].format('YYYY-MM-DD') : null;
    const contractEndEndDate = contractEndDate ? contractEndDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        entryStartDate,
        entryEndDate,
        probationStartDate,
        probationEndDate,
        contractStartStartDate,
        contractStartEndDate,
        contractEndStartDate,
        contractEndEndDate,
        ...getFieldsValue(),
        status: currentStatus,
        ...sorter,
        pageIndex,
        pageSize,
      });
    });
  }

  tableChange = (pagination, filters, sorter) => {
    let {field, order} = sorter;
    let type;
    field = field || 'createDate';
    order = order || 'descend';
    type = order === 'ascend' ? 'asc' : 'desc';
    this.setState({
      sorter: {
        sorterColumn: field,
        sorterType: type,
      }
    }, e => this.getList(1));
  }

  changeEditData = (data) => {
    const {value, key, index} = data;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    list[index][key] = value;
    model.setState({
      data: {
        list,
        total,
      }
    })
  }

  changeStatus = (status) => {
    const {form: {resetFields}} = this.ref.searchForm.props;
    resetFields();
    this.setState({
      currentStatus: status,
    }, e => this.getList(1));
  }

  remove = (recordID, index) => {
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    Modal.confirm({
      title: '确定要删除吗',
      content: '删除数据后将无法恢复',
      onOk: () => {
        model.remove({recordID,}).then(success => {
          if (success)
            list.remove(index);
          model.setState({
            data: {
              list, total,
            }
          });
          model.call('getCount');
        });
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  toggleRemarkModal = (remarkModal) => {
    this.setState({
      remarkModal,
    });
  }

  toggleStopModal = (stopModal) => {
    this.setState({
      stopModal,
    });
  }

  getBadgeInfo = (record) => {
    const {startDate, endDate, isStop} = record;
    if (isStop === 1) {
      return <Badge status='error' text='已终止'/>
    }
    if (moment(endDate) < moment()) {
      return <Badge status="default" text='已过期'/>
    }
    if (moment(endDate) - moment() < 35 * 24 * 60 * 60 * 1000) {
      const value = (moment(endDate).diff(moment(), 'days', true));
      return (
        <Fragment>
          <div style={{marginBottom: 5}}><Badge status="success" text='已生效'/></div>
          <div><Badge status="warning" text={`${ceil(value)}天后过期`}/></div>
        </Fragment>
      )
    }
    if (moment(startDate) >= moment()) {
      const value = (moment(startDate).diff(moment(), 'days', true));
      return <Badge status="processing" text={`${ceil(value)}天后生效`}/>
    }
    return <Badge status="success" text='已生效'/>;
  }

  saveRemark = (values) => {
    const {remark} = values;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    const {remarkModal: {content, index}} = this.state;
    model.dispatch({
      type: 'saveRemark',
      payload: {
        recordID: content.recordID,
        remark,
      }
    }).then(res => {
      if (res) {
        this.toggleRemarkModal({visible: false});
        list[index].remark = remark;
        model.setState({
          data: {
            list,
            total,
          }
        });
      }
    });
  }

  changeJobNumber = (jobNumber) => {
    const {setFieldsValue} = this.ref.entityForm.props.form;
    const {model} = this.props;
    model.dispatch({
      type: 'getInfoByNo',
      payload: {
        jobNumber,
      }
    }).then(() => {
      const {[modelNameSpace]: {currentUserInfo}} = this.props;
      const {empName, depName, empID} = currentUserInfo;
      this.setState({
        currentAddUserID: empID,
      });
      setFieldsValue({
        empName,
        depName,
      })
    });
  }

  changeDateLength = (value) => {
    const {setFieldsValue} = this.ref.entityForm.props.form;
    if (value) {
      setFieldsValue({
        dateLength: round(moment(value[1]).diff(moment(value[0]), 'month', true)),
      })
    }
  }

  add = (values) => {
    const {model} = this.props;
    const {currentAddUserID} = this.state;
    let {date, contractBase, remark} = values;
    date = date && date.length !== 0 ? date : null
    const startDate = date ? moment(date[0]).format('YYYY-MM-DD') : null;
    const endDate = date ? moment(date[1]).format('YYYY-MM-DD') : null;
    model.add({
      entity: {
        startDate,
        endDate,
        userID: currentAddUserID,
        contractBase,
        remark,
      }
    }).then(success => {
      if (success) {
        this.toggleModal({visible: false});
        this.getList();
      }
    })
  }

  edit = (index) => {
    const {model, [modelNameSpace]: {data: {list}}} = this.props;
    let {startDate, endDate, contractBase, recordID} = list[index];
    startDate = startDate ? moment(startDate).format('YYYY-MM-DD') : null;
    endDate = endDate ? moment(endDate).format('YYYY-MM-DD') : null;
    model.edit({
      entity: {
        startDate,
        endDate,
        contractBase,
        recordID,
      }
    }).then(success => {
      if (success) {
        this.changeEditData({key: 'edit', value: false, index});
      }
    });
  }

  stopContract = (values) => {
    const {stopModal: {content, type}} = this.state;
    const {recordID, index} = content;
    let {stopDate} = values;
    stopDate = stopDate ? moment(stopDate).format('YYYY-MM-DD') : null;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    model.dispatch({
      type: type === 'stop' ? 'stop' : 'updateStopDate',
      payload: {
        recordID,
        stopDate,
      }
    }).then(success => {
      if (success) {
        this.getList()
        this.toggleStopModal({visible: false});
      }
    });
  }

  cancelStop = (recordID) => {
    Modal.confirm({
      title: '撤销终止',
      content: '确定要撤销终止吗,撤销后合同将继续生效',
      onOk: () => {
        const {model} = this.props;
        model.call("cancelStop", {recordID}).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    })
  }

  changeSearchType = (searchTypeValue) => {
    this.setState({
      searchTypeValue,
    })
  }

  componentDidMount() {
    const current = Uri.Query('status') || 'all';
    this.setState({
      currentStatus: current,
    }, e => this.getList(1));
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }



  renderSearchForm() {
    const {resetFields}=this.ref.searchForm?this.ref.searchForm.props.form:{};
    const advProps = {
      formItem: [
        {
          label: '姓名',
          key: 'empName',
          render: () => {
            return (
              <Input placeholder="输入员工姓名模糊查询"/>
            )
          }
        },
        {
          label: '工号',
          key: 'jobNumber',
          render: () => {
            return (
              <Input placeholder='输入员工工号精确查询，多个用 "," 隔开'/>
            )
          }
        },
        {
          label: "部门",
          key: 'depID',
          render: () => {
            return (<DepartmentSelect allowClear placeholder="选择部门查询部门及其子部门所有人员"/>);
          }
        },
        {
          label: '入职日期',
          key: 'entryDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '转正日期',
          key: 'probationDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '合同开始日期',
          key: 'contractStartDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '合同截止日期',
          key: 'contractEndDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
      ],
      onSearch: e => this.getList(1),
      reset:() => {
        resetFields();
        this.getList(1);
      }
    };
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  renderModal() {
    const {modal: {visible}} = this.state;
    const item = [
      [
        {
          key: 'jobNumber',
          label: '工号',
          span: 12,
          config: {
            rules: [{
              required: true, message: '请输入工号',
            }],
          },
          render: () => <Input placeholder="请输入工号" onBlur={e => this.changeJobNumber(e.target.value)}/>,
        },
      ],
      [
        {
          key: 'empName',
          label: '员工姓名',
          render: () => <Input readOnly="readonly"/>,
        },
        {
          key: 'depName',
          label: '所在部门',
          render: () => <Input readOnly="readonly"/>,
        },
      ],
      [
        {
          key: 'contractBase',
          label: '合同基数',
          span: 12,
          config: {
            rules: [{
              required: true, message: '请填写合同基数',
            }],
          },
          render: () => {
            return <Input placeholder="请填写合同基数"/>
          }
        }
      ],
      [
        {
          key: 'date',
          label: '合同生效期',
          span: 18,
          config: {
            rules: [{
              required: true, message: '请选择合同生效期',
            }],
          },
          render: () => {
            return <StandardRangePicker onChange={e => this.changeDateLength(e)}/>
          }
        },
        {
          key: 'dateLength',
          label: '时长(月)',
          span: 6,
          render: () => {
            return <Input readOnly="readonly"/>
          }
        },
      ],
      [
        {
          key: 'remark',
          label: '备注',
          span: 24,
          render: () => <TextArea rows={4}/>,
        },
      ],
    ];
    return (
      <EditModal
        mode="muti-line"
        item={item}
        visible={visible}
        title="新增合同"
        reset={true}
        refForm={node => this.ref.entityForm = node}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.add(values)}
      />
    )
  }

  renderRemarkModal() {
    const {remarkModal: {visible, content}} = this.state;
    const {remark} = content;
    const item = [
      {
        key: 'remark',
        label: '备注',
        value: remark,
        render: () => <TextArea rows={4}/>,
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title="备注"
        reset={false}
        onCancel={() => this.toggleRemarkModal({visible: false})}
        onSubmit={values => this.saveRemark(values)}
      />
    )
  }

  rangeStopDate = (startDate, endDate, date) => {
    return date < moment(startDate) || date > moment(endDate);
  }

  renderStopModal() {
    const {stopModal: {visible, content, title, type,}} = this.state;
    const {startDate, endDate, stopDate} = content;
    const item = [
      {
        key: 'date',
        label: '合同生效期',
        value: [moment(startDate), moment(endDate)],
        span: 24,
        render: () => {
          return (
            <StandardRangePicker disabled/>
          )
        }
      },
      {
        key: 'stopDate',
        label: '终止时间',
        value: stopDate ? moment(stopDate) : null,
        config: {
          rules: [{
            required: true, message: '请选择终止时间',
          }],
        },
        render: () => <StandardDatePicker disabledDate={date => this.rangeStopDate(startDate, endDate, date)}/>
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title={title}
        reset={false}
        onCancel={() => this.toggleStopModal({visible: false})}
        onSubmit={values => this.stopContract(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list,}}, actionList,
    } = this.props;
    const columns = [
      {
        title: '合同编号',
        dataIndex: 'contractNo',
        key: 'contractNo',
        width: 150
      },
      {
        title: '员工姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
        key: 'jobNumber',
        sorter: true,
      },
      {
        title: '部门',
        dataIndex: 'dep_name',
        key: 'dep_name',
      },
      {
        title: '合同基数',
        dataIndex: 'contractBase',
        key: 'contractBase',
        render: (value, record, index) => {
          if (record["edit"]) {
            return (<Input value={value}
                           onChange={e => this.changeEditData({key: 'contractBase', value: e.target.value, index})}/>)
          }
          return Format.Money.Rmb(value);
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startDate',
        key: 'startDate',
        sorter: true,
        render: (value, record, index) => {
          if (record["edit"]) {
            return (
              <StandardDatePicker
                value={value ? moment(value) : null}
                onChange={e => this.changeEditData({key: 'startDate', value: e, index})}
              />
            )
          }
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '到期时间',
        dataIndex: 'endDate',
        key: 'endDate',
        sorter: true,
        render: (value, record, index) => {
          if (record["edit"]) {
            return (
              <StandardDatePicker
                value={value ? moment(value) : null}
                onChange={e => this.changeEditData({key: 'endDate', value: e, index})}
              />
            )
          }
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '合同时长（月）',
        dataIndex: 'contractLength',
        key: 'contractLength',
        render: (value, row) => {
          const {startDate, endDate} = row;
          return round(moment(endDate).diff(moment(startDate), 'month', true));
        }
      },
      {
        title: '是否终止',
        dataIndex: 'isStop',
        key: 'isStop',
        hide: true,
        render: (value) => {
          if (value === 0) {
            return "否"
          }
          return "是";
        }
      },
      {
        title: '终止时间',
        dataIndex: 'stopDate',
        key: 'stopDate',
        hide: true,
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '合同状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          return this.getBadgeInfo(record);
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        hide: true,
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        render: (text, record, index) => {
          const action = record["edit"] ? [
            {
              label: '保存',
              isShow: true,
              submit: () => {
                this.edit(index);
              }
            },
            {
              label: '取消',
              isShow: true,
              submit: () => {
                const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
                list[index] = this.cacheOriginData[index];
                model.setState({
                  data: {
                    list,
                    total,
                  }
                }).then(_ => {
                  delete this.cacheOriginData[index];
                  this.changeEditData({key: 'edit', value: false, index});
                });
              }
            },
          ] : [
            {
              label: '编辑',
              isShow: actionList.contains('edit'),
              submit: () => {
                if (!record["edit"]) {
                  this.cacheOriginData[index] = cloneDeep(record);
                }
                this.changeEditData({key: 'edit', value: true, index});
              }
            },
            {
              label: '备注',
              isShow: actionList.contains('remark'),
              submit: () => {
                this.toggleRemarkModal({visible: true, content: record, index,});
              }
            },
          ];
          const more = record["edit"] ? null : [
            {
              label: '终止',
              isShow: actionList.contains('stop') && record.isStop === 0 && (moment(record.endDate) > moment()),
              submit: () => {
                this.toggleStopModal({visible: true, title: '终止合同', content: record, index, type: 'stop'});
              }
            },
            {
              label: '更改终止时间',
              isShow: actionList.contains('update-stop') && record.isStop === 1,
              submit: () => {
                this.toggleStopModal({visible: true, content: record, title: '更改终止时间', index, type: 'update'});
              }
            },
            {
              label: '撤销终止',
              isShow: actionList.contains('cancel-stop') && record.isStop === 1,
              submit: () => this.cancelStop(record.recordID),
            },
            {
              label: '删除',
              isShow: actionList.contains('delete') && (moment(record.startDate) > moment()),
              submit: () => {
                this.remove(record.recordID, index);
              }
            }
          ];
          return (
            <TableActionBar action={action} more={ more}/>
          )
        },
      },
    ];
    const actions = [
      {
        isShow: actionList.contains('add'),
        button: {
          text: '新增',
          icon:'plus',
          className:'ant-btn-default',
          onClick: () => this.toggleModal({visible: true}),
        },
      },
    ]
    return (
      <StandardTable
        id="oa-hr-employee-contract-list"
        rowKey={record => record.recordID}
        columns={columns}
        dataSource={list}
        page={false}
        onChange={this.tableChange}
      />
    );
  }

  render() {
    const {modal, remarkModal, stopModal} = this.state;
    const {currentStatus} = this.state;
    const {[modelNameSpace]: {pageIndex, data: {list, total},}, pagination, loading,actionList} = this.props;
    const actions = [
      {
        isShow: actionList.contains('add'),
        button: {
          text: '新增',
          icon: 'plus',
          type: 'primary',
          onClick: () => this.toggleModal({visible: true}),
        },
      },
      {
        isShow: true,
        button: {
          icon: "retweet",
          type: 'primary',
          ghost:true,
          text: '刷新',
          onClick: () => {
            this.getList();
          }
        },
      },

    ];
    const options = [
      {
        label: '全部',
        value: 'all',
      },
      {
        label: '已生效',
        value: 'effect',
      },
      {
        label: '即将生效',
        value: 'willEffect',
      },
      {
        label: '即将到期',
        value: 'willExpire',
      },
      {
        label: '已到期',
        value: 'expire',
      },
      {
        label: '已终止',
        value: 'stop',
      },
    ];
    const fxLayoutProps = {
      pageHeader:false,
      header: {
        title: '合同列表',
        left: {
          current: currentStatus,
          options,
          onSelect: value => this.changeStatus(value),
        },
        actions,
        extra: this.renderSearchForm(),
      },
      body: {
        loading: loading.effects[`${modelNameSpace}/get`],
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };
    return (
      <Fragment>
        <FxLayout {...fxLayoutProps} />
        {modal.visible ? this.renderModal() : null}
        {remarkModal.visible ? this.renderRemarkModal() : null}
        {stopModal.visible ? this.renderStopModal() : null}
      </Fragment>

    );
  }
}



