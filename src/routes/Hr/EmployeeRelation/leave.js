import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Tabs, Input, Button, Tag, Icon, Breadcrumb, Modal, Select, Drawer, Switch} from 'antd';
import classNames from 'classnames';
import Component from "../../../utils/rs/Component";
import Format from '../../../utils/rs/Format';
import SearchForm from '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import PositionSelect from '../../../myComponents/Select/Position';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import EditForm from '../../../myComponents/Form/Edit';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import Styles from './index.less'
import TableActionBar from "../../../myComponents/Table/TableActionBar";
import UserSelect from '../../../myComponents/Select/User';

const jobNatureData = fetchDictSync({typeCode: 'job-nature'});
const jobNatureList = {};
jobNatureData.forEach(x => {
  jobNatureList[x.itemCode] = x.itemName;
});
const Fragment = React.Fragment;
const modelNameSpace = 'employee-leave';
const TextArea = Input.TextArea;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    leaveModalProps: {
      visible: false,
      row: {},
      index: -1,
      isAdd: false,
      title: null,
    },
    editDateModalProps: {
      visible: false,
      currentUserID: 0,
      index: -1,
    },
    confirmLeaveDrawerProps: {
      visible: false,
      currentApply: {},
      isStopContract: true,
      isStopInsurance: true,
    }
  }

  ref = {
    searchForm: null,
    editForm: null,
    leaveApplyForm: null,
  }

  renderLeaveModal() {
    const {visible, row, title, isAdd} = this.state.leaveModalProps;
    const {leaveUserApply} = this.props[modelNameSpace];
    const item = [
      {
        label: '待离职员工',
        key: 'userID',
        initialValue:isAdd?undefined:leaveUserApply.userID,
        render: () => {
          if(isAdd){
            return <UserSelect workStatusList={['working','trial']} style={{width:'100%'}}/>
          }
          return <span>{row.empName}</span>
        }
      },
      {
        label: '计划离职日期',
        key: 'expectLeaveDate',
        initialValue: isAdd ? undefined : moment(leaveUserApply.expectLeaveDate),
        rules: [
          {required: true, message: '请选择计划离职日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '申请日期',
        key: 'leaveApplyDate',
        initialValue: isAdd ? undefined : moment(leaveUserApply.leaveApplyDate),
        rules: [
          {required: true, message: '请选择申请日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '薪资结算日期',
        key: 'payDay',
        initialValue: isAdd ? undefined : moment(leaveUserApply.payDay),
        rules: [
          {required: true, message: '请选择薪资结算日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '离职原因',
        key: 'leaveResult',
        initialValue: isAdd ? undefined : leaveUserApply.leaveResult,
        rules: [
          {required: true, message: '请填写离职原因'}
        ],
        render: () => {
          return (
            <TextArea autosize={{minRows: 4}}/>
          )
        }
      },
    ];
    return (
      <EditModal
        title={title}
        labelCol={5}
        visible={visible}
        item={item}
        onCancel={e => this.setState({leaveModalProps: {visible: false}})}
        footer={true}
        refForm={node => this.ref.leaveApplyForm = node}
        onOk={e => this.leaveUserApply()}
      />
    )
  }

  getList = (page) => {
    const {model} = this.props;
    const {pageIndex, pageSize, data: {total}} = this.props[modelNameSpace];
    const searchForm = this.ref.searchForm.props.form;
    const {getFieldsValue} = searchForm;
    const searchValues = getFieldsValue();
    const {entryDate, expectLeaveDate} = searchValues;
    const entryStartDate = entryDate && entryDate.length > 0 ? entryDate[0].format('YYYY-MM-DD') : null;
    const entryEndDate = entryDate && entryDate.length > 0 ? entryDate[1].format('YYYY-MM-DD') : null;
    const expectLeaveStartDate = expectLeaveDate && expectLeaveDate.length > 0 ? expectLeaveDate[0].format('YYYY-MM-DD') : null;
    const expectLeaveEndDate = expectLeaveDate && expectLeaveDate.length > 0 ? expectLeaveDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...searchValues,
        workStatus: ['waiting-quit'],
        pageIndex,
        pageSize,
        entryStartDate,
        entryEndDate,
        expectLeaveStartDate,
        expectLeaveEndDate,
        sorterColumn: 'expectLeaveDate',
        sorterType: 'asc',
      });
    });
  }

  leaveUserApply = () => {
    const {getFieldsValue} = this.ref.leaveApplyForm.props.form;
    const {model} = this.props;
    const {isAdd} = this.state.leaveModalProps;
    let {userID, expectLeaveDate, leaveApplyDate, leaveResult, payDay} = getFieldsValue();
    expectLeaveDate = expectLeaveDate.format('YYYY-MM-DD');
    leaveApplyDate = leaveApplyDate.format('YYYY-MM-DD');
    payDay = payDay.format('YYYY-MM-DD');
    model.call(isAdd ? 'userLeaveApply' : 'editUserLeaveApply', {
      userID,
      expectLeaveDate,
      leaveApplyDate,
      payDay,
      leaveResult,
    }).then(success => {
      if (success) {
        this.setState({
          leaveModalProps: {
            visible: false,
          }
        });
        this.getList();
      }
    });
  }

  cancelApply = (userID) => {
    Modal.confirm({
      title: '确定要放弃离职吗？',
      onOk: () => {
        const {model} = this.props;
        model.call("cancelLeaveApply", {
          userID
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
  }

  toIsLeave = () => {
    const {model} = this.props;
    model.push(`/hr/employee/relation?activeKey=quit&isTabBar=false`);
  }

  openConfirmDrawer = (currentApply) => {
    this.setState({
      confirmLeaveDrawerProps: {
        visible: true,
        currentApply,
        isStopContract: true,
        isStopInsurance: true,
      }
    })
  }

  confirmLeave = () => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.editForm.props.form;
    let {leaveDate, payDay, contractStopDate, insuranceStopDate, isStopContract, isStopInsurance, leaveResult} = getFieldsValue();
    const {leaveUserApply} = this.props[modelNameSpace];
    leaveDate = leaveDate ? leaveDate.format('YYYY-MM-DD') : null;
    payDay = payDay ? payDay.format('YYYY-MM-DD') : null;
    contractStopDate = contractStopDate ? contractStopDate.format('YYYY-MM-DD') : null;
    insuranceStopDate = insuranceStopDate ? insuranceStopDate.format('YYYY-MM-DD') : null;
    model.call('confirmLeaveUser', {
      leaveDate,
      payDay,
      contractStopDate,
      insuranceStopDate,
      isStopContract,
      isStopInsurance,
      leaveResult,
      leaveApplyID: leaveUserApply.id,
      userID: leaveUserApply.userID,
    }).then(success => {
      if (success) {
        this.setState({
          confirmLeaveDrawerProps: {
            visible: false,
          }
        });
        this.getList();
      }
    })
  }


  componentDidMount() {
    this.getList(1);
  }

  renderConfirmDrawer() {
    const {visible, currentApply, isStopContract, isStopInsurance} = this.state.confirmLeaveDrawerProps;
    const {empName} = currentApply;
    const {leaveUserApply} = this.props[modelNameSpace];
    const item = [
      {
        label: '待离职员工',
        key: 'userID',
        render: () => {
          return <span>{empName}</span>;
        }
      },
      {
        label: '计划离职日期',
        key: 'expectLeaveDate',
        render: () => {
          return <span>{Format.Date.Format(leaveUserApply.expectLeaveDate, 'YYYY-MM-DD')}</span>
        }
      },
      {
        label: '离职日期',
        key: 'leaveDate',
        initialValue: moment(leaveUserApply.expectLeaveDate),
        rules: [
          {required: true, message: '请选择离职日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '薪资结算日期',
        key: 'payDay',
        initialValue: moment(leaveUserApply.payDay),
        rules: [
          {required: true, message: '请选择薪资结算日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '终止合同',
        key: 'isStopContract',
        initialValue: isStopContract,
        valuePropName: 'checked',
        render: () => {
          return (
            <Switch
              checkedChildren={<Icon type="check"/>}
              unCheckedChildren={<Icon type="cross"/>}
              onChange={value => this.setState({
                confirmLeaveDrawerProps: {
                  ...this.state.confirmLeaveDrawerProps,
                  isStopContract: value
                }
              })}
            />
          )
        }
      },
      {
        label: '合同终止日期',
        key: 'contractStopDate',
        isShow: isStopContract,
        initialValue: moment(leaveUserApply.expectLeaveDate),
        rules: [
          {required: true, message: '请选择合同终止日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '终止社保',
        key: 'isStopInsurance',
        initialValue: isStopInsurance,
        valuePropName: 'checked',
        render: () => {
          return (
            <Switch
              checkedChildren={<Icon type="check"/>}
              unCheckedChildren={<Icon type="cross"/>}
              onChange={value => this.setState({
                confirmLeaveDrawerProps: {
                  ...this.state.confirmLeaveDrawerProps,
                  isStopInsurance: value
                }
              })}
            />
          )
        }
      },
      {
        label: '社保终止日期',
        key: 'insuranceStopDate',
        isShow: isStopInsurance,
        initialValue: moment(leaveUserApply.expectLeaveDate),
        rules: [
          {required: true, message: '请选择合同终止日期'}
        ],
        render: () => {
          return (<StandardDatePicker style={{width: '100%'}}/>)
        }
      },
      {
        label: '离职原因',
        key: 'leaveResult',
        initialValue: leaveUserApply.leaveResult,
        rules: [
          {required: true, message: '请填写离职原因'}
        ],
        render: () => {
          return (
            <TextArea autosize={{minRows: 4}}/>
          )
        }
      },
    ];
    return (
      <Drawer
        title='确认离职'
        visible={visible}
        width={500}
        maskClosable={false}
        onClose={e => this.setState({confirmLeaveDrawerProps: {visible: false}})}
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: 53,
        }}
      >
        <EditForm
          labelCol={6}
          item={item}
          wrappedComponentRef={node => this.ref.editForm = node}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={e => this.setState({confirmLeaveDrawerProps: {visible: false}})}
          >
            取消
          </Button>
          <Button onClick={this.confirmLeave} type="primary">确定</Button>
        </div>
      </Drawer>
    )
  }

  renderTable() {
    const {loading} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '姓名',
        dataIndex: 'empName',
        key: 'empName',
        fixed: 'left',
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
        key: 'jobNumber',
      },
      {
        title: '部门',
        dataIndex: 'depName',
        key: 'depName',
      },
      {
        title: '岗位',
        dataIndex: 'positionList',
        key: 'positionList',
        render: (value) => {
          value = value || [];
          return (
            <Fragment>{value.map((position, idx) => {
              return <Tag key={idx}>{position.positionName}</Tag>
            })}</Fragment>
          )
        }
      },
      {
        title: '工作性质',
        dataIndex: 'jobNature',
        render: (text) => {
          return text ? jobNatureList[text] : null;
        }
      },
      {
        title: '入职日期',
        dataIndex: 'entryDate',
        key: 'entryDate',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '工龄(月)',
        key: 'workMonth',
        dataIndex: 'workMonth',
        render: (value, row,) => {
          const {entryDate, workStatus, leaveDate} = row;
          if (workStatus === 'retire' || workStatus === 'quit') {
            return moment(leaveDate).diff(moment(entryDate), 'month');
          }
          return moment().diff(moment(entryDate), 'month');
        }
      },
      {
        title: '待离职日期',
        dataIndex: 'expectLeaveDate',
        key: 'expectLeaveDate',
        render: (value, row, index) => {
          return Format.Date.Format(value, 'YYYY-MM-DD')
        }
      },
      {
        title: '离职原因',
        dataIndex: 'leaveResult',
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        width: 150,
        fixed: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '确认离职',
              submit: () => {
                const {model} = this.props;
                model.call('getLeaveUserApplyByID', {
                  userID: row.empID,
                }).then(() => {
                  this.openConfirmDrawer(row);
                });
              }
            }
          ];
          const more = [
            {
              label: '放弃离职',
              submit: () => {
                this.cancelApply(row.empID);
              }
            },
            {
              label: '更改离职信息',
              submit: () => {
                const {model} = this.props;
                model.call('getLeaveUserApplyByID', {
                  userID: row.empID,
                }).then(() => {
                  this.setState({
                    leaveModalProps: {
                      visible: true,
                      currentUserID: row.empID,
                      isAdd: false,
                      row,
                      title: '更改离职信息',
                      index,
                    }
                  });
                });
              }
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          )
        }
      },
    ];
    return (
      <div className={Styles.list}>
        <StandardTable
          rowKey={record => record.empID}
          columns={columns}
          dataSource={list}
          page={false}
          loading={loading.effects[`${modelNameSpace}/get`]}
          scroll={{x: 1200}}
          emptyProps={{type: 'img', text: '无待离职人员'}}
        />
      </div>
    )
  }

  renderSearchForm() {
    const {resetFields} = this.ref.searchForm ? this.ref.searchForm.props.form : {};
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
          label: '待离职日期',
          key: 'expectLeaveDate',
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '职位',
          key: 'userPosition',
          render: () => {
            return (
              <PositionSelect
                allowClear
                treeCheckable={false}
                treeCheckStrictly={false}
              />);
          }
        },
      ],
      onSearch: e => this.getList(1),
      reset: () => {
        resetFields();
        this.getList(1);
      }
    };
    const right = (
      <Button
        type='primary'
        onClick={() => this.setState({
          leaveModalProps: {
            visible: true,
            isAdd: true,
            row: null,
            title: '办理离职',
            index: -1
          }
        })}
      >
        办理离职
      </Button>)
    return (
      <SearchForm
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
        right={right}
      />
    )
  }

  render() {
    const {pagination} = this.props;
    const {pageIndex, data: {total}, employeeCountModel} = this.props[modelNameSpace];
    const {waitingLeaveCount, leaveCount} = employeeCountModel;
    const fxLayoutProps = {
      header: {
        title: (
          <div style={{fontSize: 18, fontWeight: 'bold'}}>
            <span>待离职 <span style={{color: '#f90'}}>{waitingLeaveCount}</span> 人 </span>
            <a className={Styles.isLeaveHref} onClick={e => this.toIsLeave()}>
              <span>已离职 <span style={{color: '#f90'}}>{leaveCount}</span> 人 </span>
            </a>
          </div>
        ),
        titleStyle: {paddingTop: 8},
        type: 'custom',
        extra: this.renderSearchForm(),

      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };

    return (
      <div className={Styles.leave}>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.leaveModalProps.visible ? this.renderLeaveModal() : null}
        {this.state.confirmLeaveDrawerProps.visible ? this.renderConfirmDrawer() : null}
      </div>
    )
  }
}
