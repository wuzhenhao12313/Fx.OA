import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Modal,
  Badge,
  Tag,
  Button,
  Select,
  Form,
  Icon,
} from 'antd';
import moment from 'moment';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import SearchForm from '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import PositionSelect from '../../../myComponents/Select/Position';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import StandardTable from '../../../myComponents/Table/Standard';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import EditModal from '../../../myComponents/Fx/EditModal';
import ImageUploader from '../../../myComponents/Fx/ImageUploader';
import Picture from '../../../myComponents/Fx/Picture';
import FxLayout from '../../../myComponents/Layout/';
import EditPanel from './Edit';
import DetailPanel from './Detail';
import styles from './index.less';
import {fetchApiSync} from "../../../utils/rs/Fetch";

const modelNameSpace = 'employee';
const Fragment = React.Fragment;
const Option = Select.Option;

const departmentData = fetchApiSync({url: '/Department/Get',});
const positionData = fetchApiSync({url: '/Position/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const positionList = positionData.data.toObject().list;

const filterSettings = {
  empName: {
    label: '员工姓名',
  },
  jobNumber: {
    label: '员工工号',
  },
  startDate: {
    label: '开始日期',
    type: 'moment',
  },
  endDate: {
    label: '结束日期',
    type: 'moment',
  },
  workStatus: {
    label: '工作状态',
    formatter: {
      ['working']: '已转正',
      ['trial']: '试用期',
      ['retire']: '已退休',
      ['waiting-quit']:'待离职',
      ['quit']: '已离职',
    }
  },
  sex: {
    label: '性别',
    formatter: {
      ['man']: '男',
      ['female']: '女',
    }
  },
  depID: {
    label: '部门',
    formatter: {},
  },
  userPosition: {
    formatter: {},
  }
};

departmentList.forEach(department => {
  filterSettings.depID.formatter[`${department['depID']}`] = department['depName'];
});

positionList.forEach(position => {
  filterSettings.userPosition.formatter[`${position['positionID']}`] = position['positionName'];
});


const filterLabels = {
  empName: '员工姓名',
  jobNumber: '员工工号',
  entryDate: '入职日期',
  probationDate: '转正日期',
  leaveDate:'离职日期',
  workStatus: '工作状态',
  sex: '性别',
  depID: '部门',
  userPosition: '职位',
};

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  'employee-edit': state['employee-edit'],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Utils({filter: filterSettings})
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_employee_list')
@Form.create()
export default class extends PureComponent {
  state = {
    modal: {
      visible: false,
      content: null,
      index: -1,
      title: '',
    },
    positionModal: {
      visible: false,
      content: null,
      index: -1,
    },
    editModal: {
      visible: false,
      userID: 0,
      index: -1,
    },
    detailModal: {
      visible: false,
      userID: 0,
      index: -1,
    },
    selectedKeys: [],
    workPhotoUrl: '',
    searchTypeValue: 'empName',
    advExpand: false,
  };

  ref = {
    searchForm: null,
    editForm: null,
  }

  defaultTags = [
    {
      key: 'default_monthEntry',
      title: '本月入职',
      value: {
        entryDate:[moment().startOf('month'),moment().endOf('month')],
      }
    },
    {
      key: 'default_monthLeave',
      title: '本月离职',
      value: {
        workStatus: ['quit'],
        leaveDate:[moment().startOf('month'),moment().endOf('month')],
      }
    },
  ];

  getList = (page) => {
    const {model, utils, [modelNameSpace]: {pageIndex, pageSize, sorter, filter, data: {total}}} = this.props;
    const searchForm = this.ref.searchForm.props.form;
    const {getFieldsValue} = searchForm;
    const searchValues = getFieldsValue();
    const {entryDate,probationDate,leaveDate}=searchValues;
    const entryStartDate=entryDate&&entryDate.length>0?entryDate[0].format('YYYY-MM-DD'):null;
    const entryEndDate=entryDate&&entryDate.length>0?entryDate[1].format('YYYY-MM-DD'):null;
    const probationStartDate=probationDate&&probationDate.length>0?probationDate[0].format('YYYY-MM-DD'):null;
    const probationEndDate=probationDate&&probationDate.length>0?probationDate[1].format('YYYY-MM-DD'):null;
    const leaveStartDate=leaveDate&&leaveDate.length>0?leaveDate[0].format('YYYY-MM-DD'):null;
    const leaveEndDate=leaveDate&&leaveDate.length>0?leaveDate[1].format('YYYY-MM-DD'):null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...filter,
        ...searchValues,
        entryStartDate,
        entryEndDate,
        probationStartDate,
        probationEndDate,
        leaveStartDate,
        leaveEndDate,
        ...sorter,
        pageIndex,
        pageSize,
      });
    });
    utils.getFilterKeys(getFieldsValue());
  }

  remove = (levelID) => {
    const {model, [modelNameSpace]: {selectItems}} = this.props;
    Modal.confirm({
      title: '确定要删除吗',
      content: '删除数据后将无法恢复',
      onOk: () => {
        if (levelID) {
          const arr = [];
          arr.push(levelID);
          model.setState({
            selectItems: arr
          });
        }
        model.remove({deleteItems: selectItems}).then(success => {
          if (success) {
            model.setState({
              selectItems: [],
            });
            this.getList();
          }
        });
      }
    });
  }

  mutiOperation = ({key}) => {
    switch (key) {
      case 'delete':
        this.remove();
        break;
    }
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  togglePositionModal = (positionModal) => {
    this.setState({
      positionModal,
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
      case 'internShip':
        info.status = "processing";
        info.text = '实习期';
        break;
      case 'temporary':
        info.status = "default";
        info.text = '临时员工';
        break;
      case 'retire':
        info.status = "waring";
        info.text = '已退休';
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

  changeWorkPhoto = (workPhotoUrl) => {
    this.setState({
      workPhotoUrl,
    })
  }

  saveWorkPhoto = () => {
    const {workPhotoUrl, modal: {content, index}} = this.state;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    const {empID} = content;
    model.call('saveWorkPhoto', {userID: empID, workPhotoUrl}).then(success => {
      if (success) {
        this.toggleModal({visible: false});
        list[index].workPhotoUrl = workPhotoUrl;
        model.setState({
          data: {
            list,
            total,
          }
        });
      }
    });
  }

  saveUserPosition = (values) => {
    const {positionList} = values;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    const {positionModal: {content, index}} = this.state;
    const _list = [];
    positionList.forEach(x => {
      _list.push(x.value.toInt());
    });
    model.dispatch({
      type: 'saveUserPosition',
      payload: {
        userID: content.empID,
        userPositionList: _list,
      }
    }).then(res => {
      if (res) {
        this.togglePositionModal({visible: false});
        const _userPositionList = [];
        positionList.forEach(x => {
          _userPositionList.push({
            position: x.value,
            positionName: x.label,
          });
        });
        list[index].positionList = _userPositionList;
        model.setState({
          data: {
            list,
            total,
          }
        });
      }
    });
  }

  tableChange = (pagination, filters, sorter) => {
    const {model} = this.props;
    const {field = 'jobNumber', order = 'ascend'} = sorter;
    let _filters = {};
    Object.keys(filters).forEach(key => {
      if (!!filters[key] && filters[key].length > 0) {
        _filters[key] = filters[key];
      }
    });
    model.setState({
      sorter: {
        sorterColumn: field,
        sorterType: order,
      },
    });
    this.setState({
      filters: _filters,
    }, e => this.getList(1));
  }

  changeSearchType = (searchTypeValue) => {
    this.setState({
      searchTypeValue,
    })
  }

  saveUserInfo = (employee, isAdd) => {
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    if (isAdd) {
      list.unshift(employee);
      model.setState({
        data: {
          list,
          total: total + 1,
        }
      });
      this.setState({
        editModal: {
          visible: false,
        }
      });
    } else {
      const {editModal: {index}} = this.state;
      list.splice(index, 1, employee);
      model.setState({
        data: {
          list,
          total,
        }
      });
    }
  }

  componentDidMount() {
    this.getList(1);
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }


  renderSearchForm() {
    const {
      [modelNameSpace]: {
        filterKeys,
        filter: {
          jobNumber,
          empName,
          workStatus,
          sex,
          entryDate,
          probationDate,
          leaveDate,
          depID,
          userPosition,
        },
        sorter: {
          sorterColumn,
          sorterType
        }
      },
      utils,
    } = this.props;
    const {searchTypeValue} = this.state;
    const item = [
      [
        {
          isShow: true,
          render: () => {
            return (
              <Input.Group compact>
                <Select value={searchTypeValue} onChange={this.changeSearchType}>
                  <Option value='empName'>员工姓名</Option>
                  <Option value='jobNumber'>员工工号</Option>
                </Select>
                {searchTypeValue === 'jobNumber' ? <Input.Search
                  prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  style={{width: 350}}
                  placeholder={`输入员工工号精确查询，多个用 "," 隔开`}
                  enterButton={<div><Icon type='search'/></div>}
                  value={jobNumber}
                  onChange={e => utils.changeFilter({jobNumber: e.target.value})}
                  onSearch={value => utils.changeFilter({jobNumber: value}).then(_ => this.getList(1))}/> : null}
                {searchTypeValue === 'empName' ? <Input.Search
                  prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  style={{width: 350}}
                  placeholder="输入员工姓名模糊查询"
                  enterButton={<Icon type='search'/>}
                  value={empName}
                  onChange={e => utils.changeFilter({empName: e.target.value})}
                  onSearch={value => utils.changeFilter({empName: value}).then(_ => this.getList(1))}
                /> : null}
              </Input.Group>
            )
          }
        },
      ],
    ];

    const filters = {
      labels: filterLabels,
      keys: filterKeys,
      type:{
        entryDate:'rangeDate',
        probationDate:'rangeDate',
        leaveDate:'rangeDate',
      },
      onClearFilter: key => {
        utils.clearFilters(key, this.ref.searchForm.props.form, e => this.getList(1))
      }
    };
    const tagProps = {
      options: this.defaultTags,
      onSearch: obj => utils.clearFilters(null, this.ref.searchForm.props.form, e => {
        utils.changeFilter(obj.value, this.ref.searchForm.props.form, _ => this.getList(1));
      })
    };
    const advProps = {
      formItem: [
        {
          label: '姓名',
          key: 'empName',
          render:()=>{
            return(
              <Input placeholder="输入员工姓名模糊查询"/>
            )
          }
        },
        {
          label:'工号',
          key:'jobNumber',
          render:()=>{
            return(
              <Input placeholder='输入员工工号精确查询，多个用 "," 隔开'/>
            )
          }
        },
        {
          label: "部门",
          key: 'depID',
          initialValue: depID,
          render: () => {
            return (<DepartmentSelect allowClear placeholder="选择部门查询部门及其子部门所有人员"/>);
          }
        },
        {
          label: '入职日期',
          key: 'entryDate',
          initialValue: entryDate ,
          render: () => {
            return (<StandardRangePicker style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '转正日期',
          key: 'probationDate',
          initialValue:probationDate,
          render: () => {
            return (<StandardRangePicker  style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '离职日期',
          key: 'leaveDate',
          initialValue: leaveDate,
          render: () => {
            return (<StandardRangePicker  style={{width: '100%'}} allowClear/>)
          }
        },
        {
          label: '性别',
          key: 'sex',
          initialValue: sex,
          render: () => {
            return (
              <AutoSelect typeCode="sex" allowClear/>
            )
          }
        },

        {
          label: '职位',
          key: 'userPosition',
          initialValue: userPosition,
          render: () => {
            return (
              <PositionSelect
                allowClear
                treeCheckable={false}
                treeCheckStrictly={false}
              />);
          }
        },
        {
          label: '工作状态',
          key: 'workStatus',
          initialValue:workStatus && workStatus.length > 0 ? workStatus[0]:[],
          render:()=>{
            return (<AutoSelect typeCode="job-status" allowClear/>)
          }
        }

      ],
      onSearch: e => this.getList(1),
    };
    const sorterProps = {
      columns: [
        {title: '员工工号', value: 'jobNumber'},
        {title: '出生日期', value: 'birthday'},
        {title: '入职日期', value: 'entryDate'},
        {title: '转正日期', value: 'correctionDate'},
        {title: '离职日期', value: 'leaveDate'},
        {title: '基本薪资', value: 'salary'}
      ],
      current: {sorterColumn, sorterType},
      onSorter: value => utils.changeSorter(value).then(_ => this.getList(1)),
    };
    const right={

    };
    return (
      <SearchForm
        filters={filters}
        sorter={sorterProps}
        searchTags={tagProps}
        advSearch={advProps}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  renderModal() {
    const {modal: {visible, content}} = this.state;
    return (
      <Modal
        visible={visible}
        className={styles.uploadModal}
        title='上传工作照'
        footer={<Button type="primary" style={{width: '100%'}} onClick={e => this.saveWorkPhoto()}>保存更改</Button>}
        width={280}
        onCancel={e => this.toggleModal({visible: false})}
      >
        <ImageUploader
          imageUrl={this.state.workPhotoUrl}
          actionName="WorkPhoto"
          uploadText="添加工作照"
          size={[200, 250]}
          onChange={url => this.changeWorkPhoto(url)}
        />
      </Modal>
    );
  }

  renderPositionModal() {
    const {positionModal: {visible, content}} = this.state;
    const {positionList} = content;
    const list = [];
    positionList.forEach(x => {
      const {positionName, position} = x;
      list.push({
        label: positionName,
        value: position.toString(),
      });
    });
    const item = [
      {
        key: 'positionList',
        label: '职位',
        value: list,
        render: () => <PositionSelect/>,
      },
    ];
    return (
      <EditModal
        item={item}
        visible={visible}
        title="变更职位"
        reset={false}
        onCancel={() => this.togglePositionModal({visible: false})}
        onSubmit={values => this.saveUserPosition(values)}
      />
    )
  }

  renderEditModal() {
    const {editModal: {visible, userID}} = this.state;
    const {dispatch, loading,} = this.props;
    return (
      <EditPanel
        visible={visible}
        userID={userID}
        dispatch={dispatch}
        loading={loading}
        employee-edit={this.props['employee-edit']}
        onCancel={() => {
          this.setState({
            editModal: {visible: false}
          });
        }}
        onOk={this.saveUserInfo}
      />
    )
  }

  renderDetailModal() {
    const {detailModal: {visible, userID}} = this.state;
    return (
      <DetailPanel
        visible={visible}
        userID={userID}
        onCancel={() => {
          this.setState({
            detailModal: {visible: false}
          });
        }}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list,}, selectItems, sorter}, model, loading
    } = this.props;
    const columns = [
      // {
      //   title: '照片',
      //   dataIndex: 'workPhotoUrl',
      //   key: 'workPhotoUrl',
      //   hide: true,
      //   render: (value, row, index) => {
      //     return <Picture size={[45, 60]} modalSize={[400, 498]} value={value}/>;
      //   },
      // },
      {
        title: '姓名',
        dataIndex: 'empName',
        key: 'empName',
        fixed:'left'
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
        key: 'jobNumber',
        sorter: true,
        sortOrder: sorter['sorterColumn'] === 'jobNumber' ? sorter['sorterType'] : false,
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
        title: '入职日期',
        dataIndex: 'entryDate',
        key: 'entryDate',
        sorter: true,
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      // {
      //   title: '钉钉用户ID',
      //   dataIndex: 'dingID',
      //   key: 'dingID',
      // },
      // {
      //   title: '性别',
      //   dataIndex: 'sex',
      //   key: 'sex',
      //   render: (text) => {
      //     return text === 'man' ? "男" : "女";
      //   },
      // },
      // {
      //   title: '年龄',
      //   dataIndex: 'age',
      //   key: 'age',
      //   render: (text, row) => {
      //     const {birthday} = row;
      //     return moment().diff(moment(birthday), 'year');
      //   }
      // },
      // {
      //   title: '出生日期',
      //   dataIndex: 'birthday',
      //   key: 'birthday',
      //   sorter: true,
      //   sortOrder: sorter['sorterColumn'] === 'birthday' ? sorter['sorterType'] : false,
      //   render: (value) => {
      //     return Format.Date.Format(value, 'YYYY-MM-DD');
      //   }
      // },
      {
        title: '转正日期',
        dataIndex: 'correctionDate',
        key: 'correctionDate',
        sorter: true,
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      // {
      //   title: '离职日期',
      //   dataIndex: 'leaveDate',
      //   key: 'leaveDate',
      //   hide: true,
      //   sorter: true,
      //   render: (value) => {
      //     return Format.Date.Format(value, 'YYYY-MM-DD');
      //   }
      // },
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
      // {
      //   title: '所在公司',
      //   dataIndex: 'companyName',
      //   key: 'companyName',
      // },
      // {
      //   title: '职位等级',
      //   dataIndex: 'positionLevel',
      //   key: 'positionLevel',
      //   render: (value) => {
      //     const {columnList} = this.props;
      //     if (columnList.contains('positionLevel')) {
      //       return value;
      //     }
      //     return "****";
      //   }
      // },
      // {
      //   title: '基本薪资',
      //   dataIndex: 'salary',
      //   key: 'salary',
      //   sorter: true,
      //   render: (value) => {
      //     const {columnList} = this.props;
      //     if (columnList.contains('salary')) {
      //       return Format.Money.Rmb(value);
      //     }
      //     return "****";
      //   }
      // },
      {
        title: '工作状态',
        dataIndex: 'workStatus',
        key: 'workStatus',
        width: 80,
        render: (text) => {
          const info = this.getBadgeInfo(text);
          return <Badge status={info.status} text={info.text}/>;
        },
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        width: 180,
        fixed:'right',
        render: (text, record, index) => {
          const {actionList} = this.props;
          const action = [
            {
              label: '查看详情',
              isShow: actionList.contains('detail'),
              submit: () => {
                this.setState({
                  detailModal: {
                    visible: true,
                    userID: record.empID,
                    index,
                  }
                });
              }
            },
            {
              label: '编辑',
              isShow: actionList.contains('edit'),
              submit: () => {
                this.setState({
                  editModal: {
                    visible: true,
                    userID: record.empID,
                    index,
                  }
                });
              }
            },
          ];
          const more = [
            {
              label: '变更职位',
              isShow: actionList.contains('position'),
              submit: () => {
                this.togglePositionModal({visible: true, content: record, index});
              }
            },
            {
              label: '工作照',
              isShow: actionList.contains('workPhoto'),
              submit: () => {
                const {workPhotoUrl} = record;
                this.setState({
                  workPhotoUrl,
                });
                this.toggleModal({visible: true, content: record, index});
              }
            },
            {
              label: '删除',
              isShow: actionList.contains('delete'),
              submit: () => {
                this.remove(record.empID);
              }
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          )
        },
      },
    ];
    const {actionList} = this.props;
    const actions = [
      {
        isShow: actionList.contains('add'),
        button: {
          icon: 'plus',
          text: '新建员工',
          className: 'ant-btn-default',
          onClick: () => {
            this.setState({
              editModal: {
                visible: true,
                userID: null,
              }
            })
          }
        },
      },
    ];
    return (
      <StandardTable
        mode='simple'
        rowKey={record => record.empID}
        actions={actions}
        columns={columns}
        dataSource={list}
        page={false}
        loading={loading.effects[`${modelNameSpace}/get`]}
        onChange={this.tableChange}
        scroll={{x:1200}}
      />
    );
  }

  render() {
    const {modal: {visible}, positionModal, editModal, detailModal,} = this.state;
    const {
      [modelNameSpace]:
        {
          data: {total},
          pageIndex,
          filter: {
            workStatus,
          },
          count: {
            all,
            working,
            trial,
            internShip,
            temporary,
            retire,
            quit,
          },
        }, pagination, loading, utils
    } = this.props;
    const fxLayoutProps = {
      header: {
        extra: this.renderSearchForm(),
        // tabs: {
        //   items: [
        //     {title: '全部', key: '', count: all},
        //     {title: '已转正', key: 'working', count: working},
        //     {title: '试用期', key: 'trial', count: trial},
        //     {title: '实习期', key: 'internShip', count: internShip},
        //     {title: '临时员工', key: 'temporary', count: temporary},
        //     {title: '已退休', key: 'retire', count: retire},
        //     {title: '已离职', key: 'quit', count: quit},
        //   ],
        //   activeKey: workStatus && workStatus.length > 0 ? workStatus[0] : '',
        //   onTabChange: tab => utils.changeFilter({workStatus: tab === '' ? [] : [tab]}).then(_ => this.getList(1)),
        // }
      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };

    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {visible ? this.renderModal() : null}
        {positionModal.visible ? this.renderPositionModal() : null}
        {editModal.visible ? this.renderEditModal() : null}
        {detailModal.visible ? this.renderDetailModal() : null}
      </Fragment>
    );
  }
}



