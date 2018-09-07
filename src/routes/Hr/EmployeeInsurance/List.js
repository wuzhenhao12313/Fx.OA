import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Modal,
  Badge,
  Select,
  Cascader,
  Alert,
} from 'antd';
import moment from 'moment';
import ceil from 'lodash/ceil';
import cloneDeep from 'lodash/cloneDeep';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import {String} from '../../../utils/rs/Util';
import SearchForm from  '../../../myComponents/Form/Search';
import DepartmentSelect from '../../../myComponents/Select/Department';
import TableActionBar from  '../../../myComponents/Table/TableActionBar';
import StandardTable from  '../../../myComponents/Table/Standard';
import StandardDatePicker from  '../../../myComponents/Date/StandardDatePicker';
import StandardRangePicker from  '../../../myComponents/Date/StandardRangePicker';
import EditModal from '../../../myComponents/Fx/EditModal';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import FxLayout from '../../../myComponents/Layout/';


const modelNameSpace = 'employee-insurance';
const Fragment = React.Fragment;
const Option = Select.Option;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Role('oa_employee_insurance_list')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    modal: {
      edit: {
        visible: false,
        content: null,
        index: -1,
        title: '',
      },
    },
    selectedKeys: [],
    currentAddUserID: 0,
    filters: {
      status: null,
      city: null,
      area: null,
    },
    sorter: {
      sorterColumn: 'insuredDate',
      sorterType: 'desc',
    },
    searchTypeValue: 'empName',
  };

  ref = {
    entityForm: null,
    searchForm: null,
  }

  cacheOriginData = {}

  getList = (page) => {
    const {model, [modelNameSpace]: {pageIndex}} = this.props;
    const {filters} = this.state;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {sorter} = this.state;
    let {date} = getFieldsValue();
    const startDate = date ? date[0].format('YYYY-MM-DD') : null;
    const endDate = date ? date[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      const {[modelNameSpace]: {pageIndex, pageSize}} = this.props;
      model.get({
        startDate,
        endDate,
        ...getFieldsValue(),
        ...filters,
        ...sorter,
        pageIndex,
        pageSize,
      });
    });
  }

  tableChange = (pagination, filters, sorter) => {
    let {field = 'insuredDate', order = 'descend'} = sorter;
    const type = order === 'ascend' ? 'asc' : 'desc';
    let _filters = {};
    Object.keys(filters).forEach(key => {
      if (!!filters[key] && filters[key].length > 0) {
        _filters[key] = filters[key];
      }
    });
    this.setState({
      sorter: {
        sorterColumn: field,
        sorterType: type,
      },
      filters: _filters,
    }, e => this.getList());
  }

  changeEditData = (data) => {
    const {value, key, index} = data;
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    if (key === "city" || key === "area") {
      const _value = list[index]["insuredArea"].toObject();
      list[index]["insuredArea"] = JSON.stringify({
        ..._value,
        [key]: value,
      });
    } else {
      list[index][key] = value;
    }
    model.setState({
      data: {
        list,
        total,
      }
    })
  }

  clearFilter = (key) => {
    const {filters} = this.state;
    if (key) {
      this.setState({
        filters: {
          ...filters,
          [key]: null,
        }
      }, e => this.getList(1));
    } else {
      this.setState({
        filters: {
          status: null,
          city: null,
          area: null,
        },
      }, e => this.getList(1));
    }
  }

  remove = (recordID, index) => {
    const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
    Modal.confirm({
      title: '确定要删除吗',
      content: '删除数据后将无法恢复',
      onOk: () => {
        model.remove({recordID,}).then(success => {
          if (success) {
            list.remove(index);
          }
          model.setState({
            data: {
              list, total,
            }
          });
        });
      }
    });
  }

  toggleModal = (data) => {
    this.setState({
      modal: {
        ...this.state.modal,
        ...data,
      },
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
          <p style={{marginBottom: 5}}><Badge status="success" text='已生效'/></p>
          <p><Badge status="warning" text={`${ceil(value)}天后过期`}/></p>
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
    if (!String.IsNullOrEmpty(jobNumber)) {
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
  }

  add = (values) => {
    const {model} = this.props;
    const {currentAddUserID} = this.state;
    let {insuredDate, insuredArea, number} = values;
    insuredDate = moment(insuredDate).format('YYYY-MM-DD');
    insuredArea = JSON.stringify({
      city: insuredArea[0],
      area: insuredArea[1],
    });
    model.add({
      entity: {
        userID: currentAddUserID,
        insuredDate,
        insuredArea,
        number,
      }
    }).then(success => {
      if (success) {
        this.toggleModal({edit: {visible: false}});
        this.getList(1);
      }
    })
  }

  edit = (index) => {
    const {model, [modelNameSpace]: {data: {list}}} = this.props;
    let {insuredDate, insuredArea, number, stopDate, status, recordID} = list[index];
    insuredDate = moment(insuredDate).format('YYYY-MM-DD');
    stopDate = stopDate ? moment(stopDate).format('YYYY-MM-DD') : null;
    model.edit({
      editEntity: {
        recordID,
        insuredArea,
        insuredDate,
        number,
        stopDate,
        status,
      }
    }).then(success => {
      if (success) {
        this.changeEditData({key: 'edit', value: false, index});
      }
    });
  }

  changeSearchType = (searchTypeValue) => {
    this.setState({
      searchTypeValue,
    })
  }

  componentDidMount() {
    this.getList(1);
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderSearchForm() {
    const {[modelNameSpace]: {searchValues}} = this.props;
    const {searchTypeValue} = this.state;
    const item = [
      [
        {
          isShow: true,
          render: () => {
            return (
              <Select value={searchTypeValue} onChange={this.changeSearchType} style={{width: 100}}>
                <Option value='empName'>员工姓名</Option>
                <Option value='jobNumber'>员工工号</Option>
                <Option value='dept'>部门</Option>
                <Option value='time'>时间</Option>
              </Select>
            )
          }
        },
        {
          key: 'jobNumber',
          isShow: searchTypeValue === 'jobNumber',
          render: () => {
            return (<Input style={{width: 250}} placeholder={`输入员工工号精确查询，多个用 "," 隔开`}/>);
          }
        },
        {
          key: 'empName',
          isShow: searchTypeValue === 'empName',
          render: () => {
            return (<Input style={{width: 250}} placeholder="输入员工姓名模糊查询"/>);
          }
        },
        {
          key: 'depID',
          isShow: searchTypeValue === 'dept',
          render: () => {
            return (<DepartmentSelect allowClear style={{width: 250}} placeholder="选择部门查询部门及其子部门所有人员"/>);
          }
        },
        {
          key: 'dateType',
          value: 'insured',
          isShow: searchTypeValue === 'time',
          render: () => {
            return (
              <Select style={{width: 100}}>
                <Option value={'insured'}>参保日期</Option>
                <Option value={'stop'}>中断日期</Option>
              </Select>
            )
          }
        },
        {
          key: 'date',
          isShow: searchTypeValue === 'time',
          render: () => {
            return (
              <StandardRangePicker/>
            )
          }
        },
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.getList(1)}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  renderModal() {
    const {modal: {edit: {visible, content}}} = this.state;
    const item = [
      [
        {
          key: 'desc',
          label: '',
          render: () => {
            return <Alert message="输入工号后自动带出员工信息" type="info" showIcon/>
          }
        }
      ],
      [
        {
          key: 'jobNumber',
          label: '工号',
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
          key: 'number',
          label: '社保号',
          span: 12,
          render: () => {
            return <Input placeholder="请填写社保号"/>
          }
        },
        {
          key: 'insuredArea',
          label: '参保区域',
          config: {
            rules: [{
              required: true, message: '请选择参保区域',
            }],
          },
          span: 12,
          render: () => {
            const options = [
              {
                value: '苏州',
                label: '苏州',
                children: [
                  {
                    value: '园区',
                    label: '园区',
                  }, {
                    value: '市区',
                    label: '市区',
                  }
                ],
              }, {
                value: '成都',
                label: '成都',
                children: [
                  {
                    value: '金牛区',
                    label: '金牛区',
                  }
                ]
              }
            ];
            return <Cascader options={options} placeholder="请选择参保区域"/>
          },
        },
      ],
      [
        {
          key: 'insuredDate',
          label: '参保日期',
          config: {
            rules: [{
              required: true, message: '请选择参保日期',
            }],
          },
          render: () => {
            return <StandardDatePicker/>
          }
        },
      ],
    ];
    return (
      <EditModal
        mode="muti-line"
        item={item}
        visible={visible}
        title="新增社保记录"
        reset={true}
        refForm={node => this.ref.entityForm = node}
        onCancel={() => this.toggleModal({edit: {visible: false}})}
        onSubmit={values => this.add(values)}
      />
    )
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list,}}, actionList,
    } = this.props;
    const {filters} = this.state;
    const columns = [
      {
        title: '编号',
        key: 'serialNo',
        dataIndex: 'serialNo',
      },
      {
        title: '员工姓名',
        dataIndex: 'empName',
        key: 'empName',
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
        key: 'jobNumber',
        sorter: true,
      },
      {
        title:'身份证',
        dataIndex:'ID',
      },
      {
        title: '部门',
        dataIndex: 'depName',
        key: 'depName',
      },
      {
        title: '社保号',
        key: 'number',
        dataIndex: 'number',
        render: (text, row, index) => {
          const {[modelNameSpace]: {data: {list}}} = this.props;
          if (row["edit"]) {
            return (
              <Input
                value={text}
                onChange={e => this.changeEditData({index, key: 'number', value: e.target.value})}/>
            )
          }
          return text;
        }
      },
      {
        title: '社保区域',
        key: 'insuredArea',
        dataIndex: 'insuredArea',
        children: [
          {
            title: '市',
            key: 'city',
            dataIndex: 'city',
            filters: [{
              text: '苏州',
              value: '苏州',
            }, {
              text: '成都',
              value: '成都',
            }],
            filterMultiple: false,
            filteredValue: filters.city,
            render: (value, row, index) => {
              const {insuredArea} = row;
              const _area = String.IsNullOrEmpty(insuredArea) ? {city: '', area: ''} : insuredArea.toObject();
              const {city} = _area;
              if (row["edit"]) {
                return (
                  <Select
                    value={city}
                    onChange={e => this.changeEditData({key: 'city', value: e, index})}>
                    <Option value={'苏州'}>苏州</Option>
                    <Option value={'成都'}>成都</Option>
                  </Select>
                );
              }
              return city;
            }
          },
          {
            title: '区',
            key: 'area',
            dataIndex: 'area',
            filters: [{
              text: '市区',
              value: '市区',
            }, {
              text: '园区',
              value: '园区',
            }, {
              text: '金牛区',
              value: '金牛区',
            }],
            filterMultiple: false,
            filteredValue: filters.area,
            render: (value, row, index) => {
              const {insuredArea} = row;
              const _area = String.IsNullOrEmpty(insuredArea) ? {city: '', area: ''} : insuredArea.toObject();
              const {area} = _area;
              if (row["edit"]) {
                return (
                  <Select
                    value={area}
                    onChange={e => this.changeEditData({key: 'area', value: e, index})}>
                    <Option value={'市区'}>市区</Option>
                    <Option value={'园区'}>园区</Option>
                    <Option value={'金牛区'}>金牛区</Option>
                  </Select>
                );
              }
              return area;
            }
          },
        ],
      },
      {
        title: '参保时间',
        key: 'insuredDate',
        dataIndex: 'insuredDate',
        sorter: true,
        render: (value, record, index) => {
          if (record["edit"]) {
            return (
              <StandardDatePicker
                value={moment(value)}
                onChange={e => this.changeEditData({key: 'insuredDate', value: e, index})}
              />
            )
          }
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '中断时间',
        key: 'stopDate',
        dataIndex: 'stopDate',
        sorter: true,
        render: (value, record, index) => {
          if (record["edit"]) {
            return (
              <StandardDatePicker
                value={value ? moment(value) : null}
                onChange={e => this.changeEditData({key: 'stopDate', value: e, index})}
              />
            )
          }
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        filters: [
          {
            text: '参保中',
            value: 1,
          },
          {
            text: '已中断',
            value: 0,
          },
        ],
        filterMultiple: false,
        filteredValue: filters.status || null,
        render: (value, record, index) => {
          if (record["edit"]) {
            return (
              <Select value={value} onChange={e => this.changeEditData({key: 'status', value: e, index})}>
                <Option value={1}>参保中</Option>
                <Option value={0}>已中断</Option>
              </Select>
            )
          }
          let text = value === 1 ? '参保中' : '已中断';
          let type = value === 1 ? 'processing' : 'error';
          return <Badge text={text} status={type}/>;
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        render: (text, record, index) => {
          const {actionList} = this.props;
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
              label: '删除',
              isShow: actionList.contains('delete'),
              submit: () => {
                this.remove(record.recordID, index);
              }
            }
          ];
          return (
            <TableActionBar action={action}/>
          )
        },
      },
    ];
    const actions = [
      {
        isShow: actionList.contains('add'),
        button: {
          text: '新增',
          className: 'ant-btn-default',
          icon: 'plus',
          onClick: () => this.toggleModal({edit: {visible: true, content: null, title: '新增社保'}}),
        },
      }
    ];
    return (
      <StandardTable
        id="oa-hr-employee-insurance-list"
        editable
        currentFilters={filters}
        onClearFilter={key => this.clearFilter(key)}
        rowKey={record => record.recordID}
        columns={columns}
        dataSource={list}
        tools={["export","setting","refresh"]}
        refresh={e => this.getList()}
        page={false}
        onChange={this.tableChange}
        actions={actions}
      />
    );
  }

  render() {
    const {modal: {edit}} = this.state;
    const {[modelNameSpace]: {data: {list, total}, pageIndex}, pagination, loading} = this.props;
    const fxLayoutProps = {
      header: {
        extra: this.renderSearchForm(),
      },
      body: {
        loading: loading.effects[`${modelNameSpace}/get`],
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      },
    };
    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {edit.visible ? this.renderModal() : null}
      </Fragment>
    );
  }
}



