import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Switch, Input, Modal, Badge, InputNumber, Tabs, Button} from 'antd';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import Convert from '../../../utils/rs/Convert';
import SearchForm from '../../../myComponents/Form/Search';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import StandardTable from '../../../myComponents/Table/Standard';
import BaseTable from '../../../myComponents/Table/Base';
import EditModal from '../../../myComponents/Fx/EditModal';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import FxLayout from '../../../myComponents/Layout/';
import Pagination from '../../../myComponents/Fx/Pagination';

const modelNameSpace = 'position_level';
const Fragment = React.Fragment;
const TabPane = Tabs.TabPane;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Role("oa_position_level")
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    columns: [
      {
        title: '岗位',
        dataIndex: 'levelGroupName',
        key: 'levelGroupName',
      },
      {
        title: '等级',
        dataIndex: 'levelCode',
        key: 'levelCode',
      },
      {
        title: '基本工资',
        dataIndex: 'levelSalary',
        key: 'levelSalary',
        className: 'align-center',
        children: [
          {
            title: '苏州公司',
            dataIndex: 'sz',
            key: 'sz',
            className: 'align-center',
            render: (text, row) => {
              const {columnList} = this.props;
              let value = 0;
              const {salaryList} = row;
              salaryList.forEach(salary => {
                if (salary.companyCode === 'sz-pole') {
                  value = salary.salary;
                }
              })
              if (columnList.contains('salary')) {
                return Format.Money.Rmb(value)
              }
              return "****";
            }
          },
          {
            title: '成都分公司',
            dataIndex: 'cd',
            key: 'cd',
            className: 'align-center',
            render: (text, row) => {
              const {columnList} = this.props;
              let value = 0;
              const {salaryList} = row;
              salaryList.forEach(salary => {
                if (salary.companyCode === 'cd-pole') {
                  value = salary.salary;
                }
              })
              if (columnList.contains('salary')) {
                return Format.Money.Rmb(value)
              }
              return "****";
            }
          },
        ]
      },
      {
        title: '职级描述',
        dataIndex: 'levelName',
        key: 'levelName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          const info = this.getBadgeInfo(text);
          return <Badge status={info.status} text={info.text}/>;
        },
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        align: 'right',
        render: (text, record) => {
          const {actionList} = this.props;
          const action = [
            {
              label: '薪资管理',
              isShow: actionList.contains('salary'),
              submit: () => {
                const {model} = this.props;
                model.call('getLevelSalary', {
                  levelID: record.levelID,
                });
                this.toggleSalaryModal({visible: true, levelID: record.levelID});
              }
            },
            {
              label: '编辑',
              isShow: actionList.contains('edit'),
              submit: () => {
                this.toggleModal({
                  visible: true,
                  content: record,
                  isAdd: false,
                  title: '编辑职位等级'
                })
              }
            },
          ];
          const more = [
            {
              label: '删除',
              isShow: actionList.contains('delete'),
              submit: () => {
                this.deletePositionLevel(record.levelID);
              }
            }
          ];
          return (
            <TableActionBar action={action} more={more}/>
          )
        },
      },
    ],
    salaryColumns: [
      {
        title: '公司名称',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
      },
      {
        title: '薪资',
        dataIndex: 'salary',
        key: 'salary',
        render: (text, row, index) => {
          return (<InputNumber value={text} onChange={value => this.changeLevelSalary(value, index)}/>)
        }
      },
    ],
    modal: {
      visible: false,
      content: null,
      isAdd: true,
      title: '',
    },
    salaryModal: {
      visible: false,
      levelID: 0,
    },
    activeKey: 'business',
  };

  getList = (page) => {
    const {model, [modelNameSpace]: {current, pageIndex, pageSize}} = this.props;
    const {activeKey} = this.state;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        positionLevelGroup: activeKey,
        pageIndex,
        pageSize,
      });
    });
  }

  changeLevelSalary = (text, index) => {
    const {[modelNameSpace]: {salaryList}, model} = this.props;
    salaryList[index].salary = Convert.ToInt(text);
    model.setState({
      salaryList,
    });
  }

  saveLevelSalary = () => {
    const {[modelNameSpace]: {salaryList}, model} = this.props;
    const {salaryModal: {levelID}} = this.state;
    model.call('saveLevelSalary', {
      levelID,
      salaryList,
    }).then(success => {
      if (success) {
        this.toggleSalaryModal({visible: false});
        this.getList();
      }
    });

  }

  savePositionLevel = (values) => {
    const {model} = this.props;
    values.status = values.status ? 1 : 0;
    const {isAdd, content} = this.state.modal;
    const levelID = isAdd ? 0 : content.levelID;
    const dispatchName = isAdd ? 'add' : 'edit';
    model.dispatch({
      type: dispatchName,
      payload: {
        LevelEntity: {
          levelID,
          ...values,
        },
      }
    }).then(res => {
      if (res) {
        this.toggleModal({visible: false});
        this.getList();
      }
    });
  }

  deletePositionLevel = (levelID) => {
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
          if (success)
            model.setState({
              selectItems: [],
            });
          this.getList();
        });
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  toggleSalaryModal = (salaryModal) => {
    this.setState({
      salaryModal,
    });
  }

  renderSearchForm() {
    const item = [
      [
        {
          key: 'positionLevelGroup',
          render: () => {
            return (<AutoSelect style={{width: 200}} typeCode="position-level-group" placeholder="请选择岗位"/>);
          }
        }
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.onSearch(values)}
        reload={() => this.reload()}
      />
    )
  }

  onSearch = (searchValues) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues,
    }).then(() => {
      this.getList();
    });
  }

  reload = () => {
    const {model: {setState}} = this.props;
    setState({
      searchValues: {},
    }).then(() => {
      this.getList();
    });
  }

  getBadgeInfo = (type) => {
    const info = {};
    switch (type) {
      case 0:
        info.status = "warning";
        info.text = '已禁用';
        break;
      case 1:
        info.status = "success";
        info.text = '已启用';
        break;
      default:
        info.status = "warning";
        info.text = '已禁用';
        break;
    }
    return info;
  }

  componentDidMount() {
    this.getList();
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderEditPanel() {
    const {modal: {visible, title, content, isAdd}} = this.state;
    const item = [
      {
        key: 'levelCode',
        label: '等级',
        value: isAdd ? "" : content.levelCode,
        config: {
          rules: [{
            required: true, message: '请输入等级',
          }],
        },
        render: () => <Input placeholder="请输入等级"/>,
      },
      {
        key: 'levelName',
        label: '职级描述',
        value: isAdd ? "" : content.levelName,
        config: {
          rules: [{
            required: true, message: '请输入职级描述',
          }],
        },
        render: () => <Input placeholder="请输入职级描述"/>,
      },
      {
        key: 'levelGroupCode',
        label: '岗位',
        value: isAdd ? "" : content.levelGroupCode,
        config: {
          rules: [{
            required: true, message: '请选择岗位',
          }],
        },
        render: () => <AutoSelect typeCode="position-level-group" placeholder="请选择岗位"/>,
      },
      {
        key: 'status',
        label: '状态',
        value: isAdd ? true : content.status === 1,
        config: {
          valuePropName: 'checked',
        },
        render: () => <Switch/>,
      },
      {
        key: 'levelDesc',
        label: '附加信息',
        value: isAdd ? "" : content.levelDesc,
        render: () => <Input.TextArea autosize={{minRows: 4}}/>,
      },
    ];
    return (
      <EditModal
        labelCol={4}
        item={item}
        visible={visible}
        title={title}
        reset={isAdd}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={values => this.savePositionLevel(values)}
      />
    )
  }

  renderSalaryModal() {
    const {salaryModal: {visible, levelID}} = this.state;
    return (
      <Modal
        visible={visible}
        title='薪资管理'
        width={600}
        onCancel={e => this.toggleSalaryModal({visible: false})}
        onOk={this.saveLevelSalary}
      >
        {this.renderSalaryTable()}
      </Modal>
    );
  }

  renderSalaryTable() {
    const {
      [modelNameSpace]: {salaryList}, loading, model,
    } = this.props;
    const {salaryColumns} = this.state;
    return (
      <BaseTable
        size="default"
        pagination={false}
        rowKey={record => record.companyID}
        columns={salaryColumns}
        loading={loading.effects[`${modelNameSpace}/getLevelSalary`]}
        dataSource={salaryList}
      />
    );
  }

  renderTable() {
    const {
      [modelNameSpace]: {data: {list,}}, actionList,
    } = this.props;
    const {columns} = this.state;
    return (
      <div>
        <Tabs activeKey={this.state.activeKey} onChange={activeKey => this.setState({activeKey}, e => this.getList())} type='card'>
          <TabPane key='business' tab='业务岗'/>
          <TabPane key='manage' tab='高管'/>
          <TabPane key='software-engineer' tab='软件工程师'/>
          <TabPane key='functional-post' tab='职能岗'/>
        </Tabs>
        <StandardTable
          id="oa-hr-position-level-list"
          rowKey={record => record.levelID}
          columns={columns}
          dataSource={list}
          page={false}
        />
      </div>

    );
  }

  render() {
    const {modal: {visible}, salaryModal} = this.state;
    const {loading, [modelNameSpace]: {current}, model} = this.props;

    const fxLayoutProps = {
      header: {
        title: '职级列表',
        actions: [
          {
            button: {
              text: '添加职位等级',
              type: 'primary',
              icon: 'plus',
              onClick:() => this.toggleModal({visible: true, isAdd: true, content: null, title: '添加职位等级'})
            }
          },
          {
            button: {
              text: '刷新',
              icon: 'retweet',
              type: 'primary',
              ghost: true,
              onClick:() => this.getList()
            }
          }
        ],
      },
      body: {
        loading: loading.effects[`${modelNameSpace}/get`],
        center: this.renderTable(),
      }
    };

    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {visible ? this.renderEditPanel() : null}
        {salaryModal.visible ? this.renderSalaryModal() : null}
      </Fragment>
    );
  }
}



