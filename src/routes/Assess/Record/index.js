import React, {PureComponent} from 'react';
import {
  Form,
  Select,
  Tabs,
  Input,
  Button,
  Row,
  Col,
  Card,
  Avatar,
  Icon,
  Tag,
  Divider,
  Modal,
  Alert,
  Popover,
} from 'antd';
import {connect} from 'dva';
import moment from 'moment';
import Debounce from 'lodash-decorators/debounce';
import RcPrint from 'rc-print';
import classNames from 'classnames';
import {fetchApiSync, fetchDictSync} from '../../../utils/rs/Fetch';
import {String} from '../../../utils/rs/Util';
import {createTree, formatNumber} from '../../../utils/utils';
import FxLayout from '../../../myComponents/Layout/';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import SearchForm from '../../../myComponents/Form/Search';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import LoadingService from '../../../utils/rs/LoadingService';
import Component from '../../../utils/rs/Component';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import styles from './index.less';
import PrinterItem from './PrinterItem';
import {exportExcel} from '../../../utils/rs/Excel';

const modelNameSpace = 'assess-record';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Fragment = React.Fragment;
const FormItem = Form.Item;

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const workStatusList = fetchDictSync({typeCode: 'job-status'});
const formatter = {
  department: {},
  workStatus: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});
workStatusList.forEach(workStatus => {
  formatter.workStatus[`${workStatus['itemCode']}`] = workStatus['itemName'];
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_assess_record')
@Form.create()
export default class extends React.Component {
  state = {
    currentDep: '',
    currentYear: (moment().format('M')) === "1" ? (moment().format('YYYY')) * 1 - 1 : (moment().format('YYYY')) * 1,
    currentMonth: (moment().format('M')) === "1" ? "12" : ((moment().format('M')) * 1 - 1).toString(),
    modal: {
      visible: false,
    },
    itemModal: {
      visible: false,
    },
    pop: {
      visible: false,
    },
    reviewModal: {
      visible: false,
    },
    editEmployeeModal: {
      visible: false,
      depID: 0,
      assessUserList: [],
      currentAddList: [],
    },
    currentAssessList: [],
    currentModalDep: '',
    isDataChange: false,
    currentFocusItem: {
      id: 0,
      key: '',
    },
    editEmployee: false,
  }

  ref = {
    searchForm: null,
  }

  componentDidMount() {
    const {model} = this.props;
    this.getNowAssess();
    this.getList();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.save);
  }


  changeDataStatus = (value) => {
    this.setState({
      isDataChange: true,
      currentFocusItem: {
        id: 0,
        key: '',
      }
    })
  }

  focusItem = (id, key) => {
    this.setState({
      currentFocusItem: {
        id, key,
      }
    })
  }

  save = (event) => {
    if (event.ctrlKey === true && event.keyCode === 83) {
      const {model} = this.props;
      const {assessDetail: {managerList, employeeList}} = this.props[modelNameSpace];
      model.call("update", {
        managerList,
        employeeList,
      }).then(({success}) => {
        if (success) {
          this.setState({
            isDataChange: false,
          });
        }
      });
      event.returnValue = false;
    }
  }

  getNowAssess = () => {
    const {model} = this.props;
    model.call("getNowAssess").then(_ => {
      const {nowAssess: {record, recordConfig, recordUser,}} = this.props[modelNameSpace];
      if (record) {
        let depList = [];
        recordConfig.forEach(x => {
          depList = depList.concat(x.depIDs.toList());
        });
        if (recordUser) {
          const {depIDs} = recordUser;
          let _list = depIDs ? depIDs.toList() : [];
          depList = depList.filter(x => _list.contains(x));
        }
        this.setState({
          currentDep: depList.length > 0 ? depList[0] : '',
        });
        if (record.isEnd === 0) {
          window.addEventListener("keydown", this.save);
        }
      }
    });
  }

  getList = () => {
    const {model} = this.props;
    const searchForm = this.ref.searchForm.props.form;
    const {getFieldsValue} = searchForm;
    const {year, month} = getFieldsValue();
    model.call("getAssessDetail", {
      year,
      month: month.toInt(),
    });
  }

  changeInRate = (notInRate, userID) => {
    const {model} = this.props;
    const {currentAssessList} = this.state;
    const index = currentAssessList.findIndex(x => x.userID === userID);
    currentAssessList[index]['notInRate'] = notInRate;
    this.setState({
      currentAssessList,
    })
  }

  changeDep = (currentDep) => {
    this.setState({
      currentDep,
    });
  }

  changeModalDep = (currentModalDep) => {
    this.setState({
      currentModalDep,
    });
  }

  getTabItemMap = () => {
    let map = [];
    const {nowAssess: {record, recordConfig, recordUser}} = this.props[modelNameSpace];
    if (record) {
      recordConfig.forEach(x => {
        const {depIDs} = x;
        let depList = depIDs ? depIDs.toList() : [];
        depList.forEach(dep => {
          map.push({
            title: formatter.department[dep],
            key: dep.toString(),
          });
        });
      });
      map.sort((a, b) => {
        return departmentList.filter(x => x.depID === a.key.toInt())[0].showIndex - departmentList.filter(x => x.depID === b.key.toInt())[0].showIndex;
      });
    }
    if (recordUser) {
      const {depIDs} = recordUser;
      let _list = depIDs ? depIDs.toList() : [];
      map = map.filter(x => _list.contains(x.key));
    }
    return map;
  }

  getModalTabItemMap = () => {
    let map = [];
    const {config} = this.props[modelNameSpace];
    if (config && config.length > 0) {
      config.forEach(_config => {
        const {depIDs} = _config;
        let depList = depIDs ? depIDs.toList() : [];
        depList.forEach(dep => {
          map.push({
            title: formatter.department[dep],
            key: dep.toString(),
          });
        });
      });
    }
    map.sort((a, b) => {
      return departmentList.filter(x => x.depID === a.key.toInt())[0].showIndex - departmentList.filter(x => x.depID === b.key.toInt())[0].showIndex;
    });
    return map;
  }

  @Debounce(600)
  toggleAssessUser = (userID, isAdd) => {
    const {currentModalDep, currentAssessList} = this.state;
    const {assessUserList} = this.props[modelNameSpace];
    if (isAdd) {
      let record = currentAssessList.filter(x => x.userID === userID)[0];
      let index = currentAssessList.indexOf(record);
      currentAssessList.splice(index, 1);
      this.setState({
        currentAssessList,
      });
    } else {
      let record = assessUserList.filter(x => x.userID === userID)[0];
      currentAssessList.push(record);
      this.setState({
        currentAssessList,
      });
    }
  }

  startAssess = () => {
    const {currentAssessList} = this.state;
    const {model} = this.props;
    LoadingService.Start();
    model.call("startAssess", {
      assessUserList: currentAssessList,
    }).then(({success}) => {
      if (success) {
        this.getList();
        this.getNowAssess();
        this.setState({
          modal: {visible: false}
        })
      }
      window.removeEventListener('keydown', this.save);
      window.addEventListener("keydown", this.save);
      LoadingService.Done();
    });
  }

  cancelAssess = () => {
    Modal.confirm({
      title: '确定要撤销本次考核吗？',
      content: '撤销后将无法恢复',
      onOk: () => {
        const {model} = this.props;
        const {nowAssess: {record}} = this.props[modelNameSpace];
        const {id} = record;
        model.call("cancelAssess", {
          assessID: id,
        }).then(({success}) => {
          this.getNowAssess();
        });
      }
    });
  }

  backAssess = () => {
    Modal.confirm({
      title: '确定要取消完成本次考核吗？',
      onOk: () => {
        const {model} = this.props;
        const {nowAssess: {record}} = this.props[modelNameSpace];
        const {id} = record;
        model.call("backAssess", {
          assessID: id,
        }).then(({success}) => {
          this.getNowAssess();
          this.getList();
        });
      }
    });
  }

  completeAssess = () => {
    Modal.confirm({
      title: '确定要完成本次考核吗？',
      onOk: () => {
        const {model} = this.props;
        const {nowAssess: {record}} = this.props[modelNameSpace];
        const {id} = record;

        const {assessDetail: {employeeList,managerList}} = this.props[modelNameSpace];
        let userList=[];
        employeeList.forEach(x => {
          let dataSource = employeeList.filter(y => y.depID === x.depID);
          let extraRate = null;
          if (x.notInRate !== 1) {
            let all = 0;
            dataSource.filter(y => y.notInRate !== 1 && y.isExtension === x.isExtension).forEach(i => {
              const _score = this.getEmployeeTotalScore(i) || 0;
              all += _score * 1;
            });
            if (all === 0) {
              extraRate = null
            }
            else {
              extraRate = (this.getEmployeeTotalScore(x) / all).toFixed(2);
            }
            if(x.customExtractRate){
              extraRate=customExtractRate;
            }
            userList.push({
              userID: x.userID,
              extraRate,
            });
          }
        });
        managerList.forEach(x=>{
          userList.push({
            userID:x.userID,
            extraRate:this.getManagerTotalScore(x)/100,
          });
        });
        model.call("completeAssess", {
          assessID: id,
          isEnd: 1,
          userExtraListStr: JSON.stringify(userList),
        }).then(({success}) => {
          this.getNowAssess();
          this.getList();
        });
      }
    });
  }

  openStartModal = (isEdit) => {
    const {model} = this.props;
    model.call("getAssessUserList").then(res => {
      const {assessUserList} = this.props[modelNameSpace];
      let depList = this.getModalTabItemMap();
      const list = assessUserList.filter(x => x.workStatus !== 'quit' && depList.filter(y => y.key === x.depID.toString()).length > 0);
      this.setState({
        currentModalDep: depList[0].key,
        currentAssessList: list,
        modal: {visible: true}
      })
    });
  }

  openPop = (managerID) => {
    const {model} = this.props;
    const {currentDep} = this.state;
    const {nowAssess: {record}, assessDetail: {managerList}} = this.props[modelNameSpace];
    const {id} = record;
    model.call("getEmployeeScoreList", {
      assessID: id,
      depID: currentDep,
      managerID: managerList.filter(x => x.depID === currentDep.toInt())[0].id,
    });
    this.setState({
      pop: {
        visible: true,
      }
    });
  }

  changeEditData = (record, type) => {
    const {key, value, id} = record;
    const {model} = this.props;
    if (type === 'm') {
      const {assessDetail: {managerList}} = this.props[modelNameSpace];
      const index = managerList.findIndex(x => x.id === id)
      managerList[index][key] = value;
      model.setState({
        assessDetail: {
          ...this.props[modelNameSpace].assessDetail,
          managerList,
        }
      });
    } else {
      const {assessDetail: {employeeList}} = this.props[modelNameSpace];
      const index = employeeList.findIndex(x => x.id === id);
      employeeList[index][key] = value;
      model.setState({
        assessDetail: {
          ...this.props[modelNameSpace].assessDetail,
          employeeList,
        }
      });
    }
  }

  updateManager = (id) => {
    const {model} = this.props;
    const {assessDetail: {managerList}} = this.props[modelNameSpace];
    const managerEntity = managerList.find(x => x.id === id);
    model.call("updateManager", {
      managerEntity,
    });
  }

  updateEmployee = (id) => {
    const {model} = this.props;
    const {assessDetail: {employeeList}} = this.props[modelNameSpace];
    const employeeEntity = employeeList.find(x => x.id === id);

    model.call("updateEmployee", {
      employeeEntity,
    });
  }

  getManagerTotalScore = (row) => {
    const {nowAssess: {record, recordConfig}} = this.props[modelNameSpace];
    const {
      m_baseScoreRate,
      m_targetScoreRate,
      m_cooScoreRate,
      m_gmScoreRate,
      m_memberScoreRate,
    } = recordConfig.filter(x => x.depIDs.toList().contains(this.state.currentDep.toString()))[0] || {};
    const {baseScore = 0, targetScore = 0, cooScore = 0, gmScore = 0, employeeScore = 0} = row;
    const result = baseScore * m_baseScoreRate + targetScore * m_targetScoreRate
      + cooScore * m_cooScoreRate + gmScore * m_gmScoreRate + employeeScore * m_memberScoreRate;
    return result.toFixed(2);
  }

  getEmployeeTotalScore = (row) => {
    const {nowAssess: {record, recordConfig}} = this.props[modelNameSpace];
    const {
      e_allRoundScoreRate,
      e_targetScoreRate,
      e_cooScoreRate,
      e_gmScoreRate,
      e_workingScoreRate,
    } = recordConfig.filter(x => x.depIDs.toList().contains(this.state.currentDep.toString()))[0] || {};
    const {allRoundScore = 0, targetScore = 0, cooScore = 0, gmScore = 0, workingScore = 0} = row;
    const result = allRoundScore * e_allRoundScoreRate + targetScore * e_targetScoreRate
      + cooScore * e_cooScoreRate + gmScore * e_gmScoreRate + workingScore * e_workingScoreRate;
    return result.toFixed(2);
  }

  startPrint = () => {
    this.refs.rcPrint.onPrint();
    this.setState({
      reviewModal: {
        visible: false,
      }
    });
  }

  updateMember = (managerID, memberScore) => {
    const {model} = this.props;
    model.call("updateMember", {
      managerID,
      memberScore,
    });
  }

  getRowExtraRate = (row, dataSource) => {
    if (row.notInRate === 1) {
      return null;
    }
    let all = 0;
    dataSource.filter(x => x.notInRate !== 1).forEach(i => {
      const _score = this.getEmployeeTotalScore(i) || 0;
      all += _score * 1;
    });
    if (all === 0) {
      return null;
    }
    return `${((this.getEmployeeTotalScore(row) / all) * 100).toFixed(2)}%`;
  }

  exportData = () => {
    const {model} = this.props;
    const {assessDetail: {managerList, employeeList}} = this.props[modelNameSpace];
    const depMap = this.getTabItemMap();
    const title = [
      {"value": "部门"},
      {"value": "成员"},
      {"value": "系数", align: 'right'},
    ];
    let dataArr = [];
    depMap.map(dep => {
      const manager = managerList.filter(x => x.depID === dep.key.toInt())[0];
      const _employeeList = employeeList.filter(x => x.depID === dep.key.toInt());
      const managerObj = [
        {"value": dep.title, style: 'font-weight:bold', rowspan: _employeeList.length + 1},
        {"value": manager.userName, style: 'font-weight:bold'},
        {"value": `${this.getManagerTotalScore(manager)}%`, style: 'font-weight:bold'}
      ];
      dataArr.push(managerObj);
      _employeeList.map(x => {
        const employeeObj = [

          {"value": x.userName},
          {"value": x.customExtractRate ? `${x.customExtractRate}%` : this.getRowExtraRate(x, _employeeList)}
        ];
        dataArr.push(employeeObj);
      });
    });
    exportExcel(dataArr, '部门绩效考核统计', title);

  }

  changeEditEmployee = () => {
    this.setState({
      editEmployee: !this.state.editEmployee,
    });
  }

  removeAssessEmployee = (assessEmployeeID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除考评组员',
      content: '确定要删除吗？',
      onOk: () => {
        model.call("removeAssessEmployee", {
          assessEmployeeID,
        }).then(success => {
          if (success) {
            const {assessDetail: {employeeList, managerList}} = this.props[modelNameSpace];
            const index = employeeList.findIndex(x => x.id === assessEmployeeID);
            employeeList.splice(index, 1);
            model.setState({
              assessDetail: {
                managerList,
                employeeList,
              }
            });
          }
        });
      }
    })
  }

  openAddAssessEmployeeModal = (depID) => {
    const {model} = this.props;
    const {assessDetail: {employeeList, managerList}} = this.props[modelNameSpace];
    const isAddList = employeeList.filter(x => x.depID === depID.toInt());
    console.log(isAddList)
    model.call("getAssessUserList").then(res => {
      const {assessUserList} = this.props[modelNameSpace];
      const list = assessUserList.filter(x =>
        x.depID === depID.toInt() && isAddList.findIndex(y => y.userID === x.userID) === -1 && !x.isManager);
      this.setState({
        editEmployeeModal: {
          visible: true,
          depID,
          assessUserList: list,
          currentAddList: [],
        }
      })
    });
  }

  toggleAssessEmployeeUser = (userID, isAdd) => {
    const {currentAddList, assessUserList} = this.state.editEmployeeModal;
    if (isAdd) {
      let record = currentAddList.filter(x => x.userID === userID)[0];
      let index = currentAddList.indexOf(record);
      currentAddList.splice(index, 1);
      this.setState({
        editEmployeeModal: {
          ...this.state.editEmployeeModal,
          currentAddList,
        }
      });
    } else {
      let record = assessUserList.filter(x => x.userID === userID)[0];
      currentAddList.push(record);
      this.setState({
        editEmployeeModal: {
          ...this.state.editEmployeeModal,
          currentAddList,
        }
      });
    }
  }

  addAssessEmployee = () => {
    const {model} = this.props;
    const {nowAssess} = this.props[modelNameSpace];
    const {record: {id}} = nowAssess;
    const {currentAddList} = this.state.editEmployeeModal;
    console.log(nowAssess)
    model.call("addAssessEmployee", {
      assessID: id,
      assessUserList: currentAddList,
    }).then(({success, userList}) => {
      if (success) {
        const {assessDetail: {employeeList, managerList}} = this.props[modelNameSpace];
        let list = employeeList.concat(userList);
        model.setState({
          assessDetail: {
            managerList,
            employeeList: list,
          }
        });
        this.setState({
          editEmployeeModal: {
            visible: false,
          }
        })
      }
    })
  }


  renderModal() {
    const {modal: {visible}} = this.state;
    const {getFieldDecorator} = this.props.form;
    const depMap = this.getModalTabItemMap();
    const month = (moment().format('M')) * 1;
    const _year = (moment().format('YYYY')) * 1;
    const year = month === 1 ? _year - 1 : _year;
    return (
      <StandardModal
        visible={visible}
        style={{top: 20}}
        title='发起考评'
        width={'80%'}
        onCancel={e => this.setState({
          modal: {visible: false}
        })}
        onOk={e => this.startAssess()}
      >
        <Form layout="inline">
          <FormItem
            label='年'
          >
            {getFieldDecorator('year', {
              initialValue: year,
            })(
              <Input readonly='readonly' style={{width: 120}}/>
            )}
          </FormItem>
          <FormItem
            label='月'
          >
            {getFieldDecorator('month', {
              initialValue: month === 1 ? 12 : month - 1,
            })(
              <Input readonly='readonly' style={{width: 120}}/>
            )}
          </FormItem>
        </Form>
        <ConsoleTitle title='考评人员列表' type='h2'/>
        <Tabs type="card" onChange={tab => this.changeModalDep(tab)}>
          {depMap.map(dep => {
            return (<TabPane tab={dep.title} key={dep.key}/>)
          })}
        </Tabs>
        {this.renderUserCard()}
      </StandardModal>
    )
  }

  renderAddEmployeeModal() {
    const {visible, assessUserList, depID, currentAddList} = this.state.editEmployeeModal;
    return (
      <StandardModal
        visible={visible}
        title='添加考核人员'
        width={1000}
        onCancel={e => this.setState({editEmployeeModal: {visible: false}})}
        onOk={e => this.addAssessEmployee()}
      >
        <Row gutter={24}>
          {assessUserList.map(x => {
            return (
              <Col span={8} style={{marginBottom: 24}}>
                <Card
                  onClick={e => this.toggleAssessEmployeeUser(x.userID, currentAddList.findIndex(y => y.userID === x.userID) != -1)}
                  style={{cursor: 'pointer'}}>
                  {currentAddList.findIndex(y => y.userID === x.userID) != -1 ?
                    <Icon
                      type="check-circle"
                      style={{
                        color: 'green',
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        fontSize: 20
                      }}/> : null}
                  <Row>
                    <Col span={6}>
                      <Avatar src={x.workPhoto} size="large"/>
                    </Col>
                    <Col span={18}>
                      <div style={{height: 20}}>
                        姓名:{x.userName}
                      </div>
                      <div>工号:{x.jobNumber}</div>
                      <div>状态:{formatter.workStatus[x.workStatus]}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )
          })}
        </Row>
      </StandardModal>
    )
  }

  renderItemModal() {
    const {itemModal: {visible}} = this.state;
    const {currentModalDep, currentAssessList} = this.state;
    const {assessUserList} = this.props[modelNameSpace];
    let currentList = currentAssessList.filter(x => x.depID === currentModalDep.toInt()).map(x => x.userID);
    let currentAllList = assessUserList.filter(x => x.depID === currentModalDep.toInt());
    return (
      <StandardModal
        visible={visible}
        title='考评人员维护'
        width={800}
        footer={null}
        onCancel={e => this.setState({itemModal: {visible: false}})}
      >
        <Row gutter={24}>
          {currentAllList.map(x => {
            return (
              <Col span={8} style={{marginBottom: 24}}>
                <Card onClick={e => this.toggleAssessUser(x.userID, currentList.contains(x.userID))}
                      style={{cursor: 'pointer'}}>
                  {currentList.contains(x.userID) ?
                    <Icon
                      type="check-circle"
                      style={{
                        color: 'green',
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        fontSize: 20
                      }}/> : null}
                  <Row>
                    <Col span={6}><Avatar src={x.workPhoto} size="large"/></Col>
                    <Col span={18}>
                      <div style={{height: 20}}>
                        姓名:{x.userName}
                        {x.isManager ? <Tag style={{marginLeft: 5, position: 'absolute'}}>部门经理</Tag> : null}
                      </div>
                      <div>工号:{x.jobNumber}</div>
                      <div>状态:{formatter.workStatus[x.workStatus]}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )
          })}
        </Row>
      </StandardModal>
    )
  }

  renderUserCard() {
    const {currentModalDep, currentAssessList} = this.state;
    let list = currentAssessList.filter(x => x.depID === currentModalDep.toInt());
    return (
      <Row gutter={24}>
        {list.map(x => {
          const {notInRate, userID,} = x;
          return (
            <Col span={6} style={{marginBottom: 24}}>
              <Card
                actions={
                  [
                    <Button
                      icon=''
                      type={notInRate ? 'danger' : 'primary'}
                      size='small' ghost={!!notInRate}
                      onClick={e => this.changeInRate(notInRate ? 0 : 1, userID)}
                    >
                      {notInRate ? "取消不参与提成系数分配" : "不参与提成系数分配"}
                    </Button>
                  ]
                }
              >
                <Row>
                  <Col span={6}><Avatar src={x.workPhoto} size="large"/></Col>
                  <Col span={18}>
                    <div style={{height: 20}}>姓名:{x.userName}{x.isManager ?
                      <Tag style={{marginLeft: 5, position: 'absolute'}}>部门经理</Tag> : null}</div>
                    <div>工号:{x.jobNumber}</div>
                    <div>状态:{formatter.workStatus[x.workStatus]}</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          )
        })}
        <Col span={6} style={{marginBottom: 24}}>
          <Card style={{height: 110, textAlign: 'center', cursor: 'pointer'}}
                onClick={e => this.setState({itemModal: {visible: true}})}>
            <Icon type='plus' style={{fontSize: 40, marginTop: 11}}/>
          </Card>
        </Col>
      </Row>
    )
  }

  renderSearchForm() {
    const currentYear = moment().format('YYYY');
    const item = [
      [
        {
          key: 'year',
          label: '年',
          initialValue: this.state.currentYear,
          render: () => {
            return (
              <Select style={{width: 120}}>
                <Option value={currentYear * 1}>{currentYear * 1}</Option>
                <Option value={currentYear * 1 - 1}>{currentYear * 1 - 1}</Option>
                <Option value={currentYear * 1 - 2}>{currentYear * 1 - 2}</Option>
                <Option value={currentYear * 1 - 3}>{currentYear * 1 - 3}</Option>
                <Option value={currentYear * 1 - 4}>{currentYear * 1 - 4}</Option>
              </Select>
            )
          }
        },
        {
          key: 'month',
          label: '月',
          initialValue: this.state.currentMonth,
          render: () => {
            return (
              <AutoSelect
                typeCode='month'
                style={{width: 120}}


              />
            )
          }
        }
      ]
    ];
    return (
      <SearchForm
        item={item}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  renderBody() {
    const {nowAssess: {record, recordConfig}} = this.props[modelNameSpace];
    const {actionList} = this.props;
    const {
      isEnd,
    } = record || {};
    const depMap = this.getTabItemMap();
    if (depMap && depMap.length > 0) {
      const {
        m_baseScoreRate,
        m_targetScoreRate,
        m_cooScoreRate,
        m_gmScoreRate,
        m_memberScoreRate,
        e_allRoundScoreRate,
        e_targetScoreRate,
        e_cooScoreRate,
        e_gmScoreRate,
        e_workingScoreRate,
      } = recordConfig.filter(x => x.depIDs.toList().contains(this.state.currentDep.toString()))[0] || {};
      return (
        <div>
          {actionList.contains('btn') ?
            <Form layout='inline' style={{marginBottom: 12}}>
              {isEnd === 0 ?
                <FormItem>
                  <Button icon='save' type='primary' onClick={e => this.completeAssess()}>完成考核</Button>
                </FormItem> :
                <FormItem>
                  <Button icon='arrow-left' type='danger' onClick={e => this.backAssess()} ghost>撤回考核</Button>
                </FormItem>
              }
              {isEnd === 0 ?
                <FormItem>
                  <Button icon={this.state.editEmployee ? "unlock" : 'lock'}
                          onClick={e => this.changeEditEmployee()}>{this.state.editEmployee ? "关闭人员编辑" : "开启人员编辑"}</Button>
                </FormItem> : null
              }
              {
                isEnd === 0 ?
                  <FormItem>
                    <Button icon='delete' type="danger" ghost onClick={e => this.cancelAssess()}>撤销考核</Button>
                  </FormItem>
                  : null
              }
              {
                isEnd === 1 ?
                  <Fragment>
                    <FormItem>
                      <Button type="dashed" icon='printer'
                              onClick={e => this.setState({reviewModal: {visible: true}})}>打印</Button>
                    </FormItem>
                    <FormItem>
                      <Button type="dashed" icon='export' onClick={this.exportData}>导出</Button>
                    </FormItem>
                  </Fragment> : null
              }

              {
                this.state.isDataChange ?
                  <FormItem style={{float: 'right', marginRight: 0}}><Tag color='red'>更改未保存</Tag></FormItem> : null
              }
            </Form> : null}
          <Tabs activeKey={this.state.currentDep} type="card" onChange={tab => this.changeDep(tab)}>
            {depMap.map(dep => {
              return (
                <TabPane tab={dep.title} key={dep.key}/>
              )
            })}
          </Tabs>
          <div style={{maxWidth: 1199}}>
            {this.renderManagerTable()}
            {this.renderEmployeeTable()}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.noAssessBody}>
        <ConsoleTitle title='考评须知' style={{paddingTop: 0}} titleSize={35}/>
        <Alert
          message={
            <div>
              <p>1、当月只能够发起上一个月的部门考核，如5月份只能发起4月份的部门考核</p>
              <p>2、每月有且只能存在一个考核，如需调整，请先撤销本次考核</p>
              <p>3、考核完成后将无法进行修改，请确定考核完成后在关闭考核</p>
              <p>4、发起考核时，默认添加所有非离职人员为考核人员,如需要变更，请自行调整</p>
              <p>5、为防止漏评，请管理人员提醒部门经理和所有部门成员完成各自评分后，在进行评分</p>
            </div>
          }
          type='info'
        />
        <Button type='primary' icon="arrow-right" onClick={e => this.openStartModal()}
                style={{marginTop: 16}}>发起考核</Button>
      </div>
    )
  }

  renderManagerTable = () => {
    const {assessDetail: {managerList}} = this.props[modelNameSpace];
    const {nowAssess: {record, recordUser, recordConfig}} = this.props[modelNameSpace];
    const {isEnd} = record || {};
    const {
      m_baseScoreRate,
      m_targetScoreRate,
      m_cooScoreRate,
      m_gmScoreRate,
      m_memberScoreRate,
      type
    } = recordConfig.filter(x => x.depIDs.toList().contains(this.state.currentDep.toString()))[0] || {};
    const columns = [
      {
        dataIndex: 'notInRate',
        width: 55,
        align: 'center',
        render: (text, row) => {
          if (recordUser) {
            return null
          }
          if (text === 1) {
            return (
              <Icon
                type='star-o'
                style={{cursor: 'pointer'}}
                onClick={e => this.changeEditData({key: 'notInRate', value: 0, id: row.id}, "m")}
              />)
          }
          return (
            <Icon
              type='star'
              style={{color: 'green', cursor: 'pointer'}}
              onClick={e => this.changeEditData({key: 'notInRate', value: 1, id: row.id}, "m")}
            />)
        }
      },
      {
        title: '部门经理',
        dataIndex: 'userName',
        className: 'ant-th-disabled',
        width: 150,
      },
      {
        title: '项目',
        children: [
          {
            title: '说明',
            children: [
              {
                title: '占比',
                className: 'ant-th-disabled',
                width: 60,
                align: 'center',
                render: () => {
                  return "打分";
                }
              }
            ]
          },
        ]
      },
      {
        title: '基础评分',
        align: 'center',
        children: [
          {
            title: '该项为固定分',
            align: 'center',
            children: [
              {
                title: `${m_baseScoreRate * 100}%`,
                align: 'center',
                dataIndex: 'baseScore',
                className: 'ant-th-disabled',
                width: 140,
              }
            ]
          }
        ]
      },
      {
        title: '指标完成',
        children: [
          {
            title: '部门指标完成率',
            align: 'center',
            children: [
              {
                title: `${m_targetScoreRate * 100}%`,
                align: 'center',
                dataIndex: 'targetScore',
                className: recordUser && recordUser.m_targetScore.toList()[1] === '0' ? 'ant-th-disabled' : null,
                width: 140,
                render: (text, row) => {
                  if (recordUser && recordUser.m_targetScore.toList()[1] === '0') {
                    return text;
                  }
                  if (isEnd === 0) {
                    return (
                      <div
                        className={classNames({
                          ['ant-td-edit']: true,
                          ['ant-td-edit-active']: this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key === 'targetScore',
                        })}
                        style={{width: 139}}
                      >
                        <Input
                          className='ant-table-input'
                          value={text}
                          style={{width: '100%', textAlign: 'center',}}
                          onBlur={e => {
                            this.changeDataStatus();
                          }}
                          onFocus={e => this.focusItem(row.id, "targetScore")}
                          onChange={e => this.changeEditData({
                            key: 'targetScore',
                            value: e.target.value,
                            id: row.id
                          }, "m")}
                        />
                      </div>)

                  }
                  return text;
                }
              }
            ],
          }
        ],
      },
      {
        title: '总监考评',
        children: [
          {
            title: '工作态度',
            children: [
              {
                title: `${m_cooScoreRate * 100}%`,
                dataIndex: 'cooScore',
                align: 'center',
                width: 140,
                className: recordUser && recordUser.m_cooScore.toList()[1] === '0' ? 'ant-th-disabled' : null,
                render: (text, row) => {
                  if (recordUser && recordUser.m_cooScore.toList()[1] === '0') {
                    return text;
                  }
                  if (isEnd === 0) {
                    return (
                      <div
                        className={classNames({
                          ['ant-td-edit']: true,
                          ['ant-td-edit-active']: this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key === 'cooScore',
                        })}
                        style={{width: 139}}
                      >
                        <Input
                          className='ant-table-input'
                          value={text}
                          style={{width: '100%', textAlign: 'center',}}
                          onBlur={e => this.changeDataStatus()}
                          onFocus={e => this.focusItem(row.id, "cooScore")}
                          onChange={e => this.changeEditData({key: 'cooScore', value: e.target.value, id: row.id}, "m")}
                        />
                      </div>)
                  }
                  return text;
                }
              }
            ]
          },
          {
            title: '日常考核',
            children: [
              {
                title: `${m_gmScoreRate * 100}%`,
                dataIndex: 'gmScore',
                align: 'center',
                width: 140,
                className: recordUser && recordUser.m_gmScore.toList()[1] === '0' ? 'ant-th-disabled' : null,
                render: (text, row) => {
                  if (recordUser && recordUser.m_gmScore.toList()[1] === '0') {
                    return text;
                  }
                  if (isEnd === 0) {
                    return (
                      <div
                        className={classNames({
                          ['ant-td-edit']: true,
                          ['ant-td-edit-active']: this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key === 'gmScore',
                        })}
                        style={{width: 139}}
                      >
                        <Input
                          className='ant-table-input'
                          value={text}
                          style={{width: '100%', textAlign: 'center',}}
                          onBlur={e => this.changeDataStatus()}
                          onFocus={e => this.focusItem(row.id, "gmScore")}
                          onChange={e => this.changeEditData({key: 'gmScore', value: e.target.value, id: row.id}, "m")}
                        />
                      </div>)
                  }
                  return text;
                }
              }
            ]
          }
        ]
      },
      {
        title: <div>
          组员打分
          <Popover
            title='组员打分详情列表'
            placement="bottom"
            trigger="click"
            visible={this.state.pop.visible}
            onVisibleChange={visible => this.setState({pop: {visible}})}
            content={this.renderEmployeeScoreTable()}
          >
            <Icon type="question-circle-o" onClick={e => this.openPop()}/>
          </Popover></div>,
        children: [
          {
            title: '按平均分计算',
            children: [
              {
                title: `${m_memberScoreRate * 100}%`,
                dataIndex: 'employeeScore',
                align: 'center',
                width: 140,
                className: recordUser && recordUser.m_memberScore.toList()[1] === '0' ? 'ant-th-disabled' : null,
                render: (text, row) => {
                  if (recordUser && recordUser.m_memberScore.toList()[1] === '0') {
                    return text;
                  }
                  if (isEnd === 0) {
                    return (
                      <div
                        className={classNames({
                          ['ant-td-edit']: true,
                          ['ant-td-edit-active']: this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key === 'employeeScore',
                        })}
                        style={{width: 139}}
                      >
                        <Input
                          className='ant-table-input'
                          value={text}
                          style={{width: '100%', textAlign: 'center',}}
                          onBlur={e => {
                            this.changeDataStatus();
                            this.updateMember(row.id, text);
                          }}
                          onFocus={e => this.focusItem(row.id, "employeeScore")}
                          onChange={e => this.changeEditData({
                            key: 'employeeScore',
                            value: e.target.value,
                            id: row.id
                          }, "m")}
                        />
                      </div>)
                  }
                  return text;
                }
              }
            ],
          }
        ],

      },
    ];
    if (type !== 2) {
      columns.push({
        title: '职级工龄占比得分',
        dataIndex: 'extraRate',
        align: 'center',
        className: 'ant-th-disabled',
        width: 80,
        render: (text) => {
          return `${formatNumber(text * 100, 2)}%`;
        }
      })
    }
    columns.push({
      title: '综合评分',
      dataIndex: 'totalScore',
      align: 'center',
      className: 'ant-th-disabled',
      width: type !== 2 ? 153 : 233,
      render: (text, row) => {
        if (text) {
          return text;
        }
        return this.getManagerTotalScore(row);
      }
    },)
    const dataSource = managerList.filter(x => x.depID === this.state.currentDep.toInt());
    return (
      <StandardTable
        style={{maxWidth: 1199}}
        bordered={true}
        rowKey={record => record.id}
        mode='simple'
        columns={columns}
        dataSource={dataSource}
        loading={false}
      />
    )
  }

  renderEmployeeScoreTable() {
    const {currentEmployeeList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '组员姓名',
        dataIndex: 'userName',

      }, {
        title: '组员打分',
        dataIndex: 'score',
        align: 'right'
      }, {
        title: '操作',
        dataIndex: 'op',
        align: 'center',
        render: (text, row) => {
          if (!row.score) {
            return (<Button type='primary' ghost size='small'>钉钉通知</Button>)
          }
        }
      }
    ];
    return (
      <StandardTable
        bordered={true}
        rowKey={record => record.userID}
        mode='simple'
        style={{width: 300}}
        columns={columns}
        dataSource={currentEmployeeList}
        loading={false}
        emptyProps={{size: 'small'}}
      />
    )
  }

  renderEmployeeTable = () => {
    const {nowAssess: {record, recordUser, recordConfig}} = this.props[modelNameSpace];
    const {isEnd} = record || {};
    const {assessDetail: {employeeList}} = this.props[modelNameSpace];
    const dataSource = employeeList.filter(x => x.depID === this.state.currentDep.toInt());
    const {
      e_allRoundScoreRate,
      e_targetScoreRate,
      e_cooScoreRate,
      e_gmScoreRate,
      e_workingScoreRate,
      type,
    } = recordConfig.filter(x => x.depIDs.toList().contains(this.state.currentDep.toString()))[0] || {};
    let columns = [
      {
        dataIndex: 'notInRate',
        width: 55,
        align: 'center',
        render: (text, row) => {
          if (recordUser) {
            return null;
          }
          if (this.state.editEmployee) {
            return (<Button icon='delete' size='small' type='danger' onClick={e => this.removeAssessEmployee(row.id)}/>)
          }
          if (text === 1) {
            return (
              <Icon
                type='star-o'
                style={{cursor: 'pointer'}}
                onClick={e => this.changeEditData({key: 'notInRate', value: 0, id: row.id}, "e")}
              />)
          }
          return (
            <Icon
              type='star'
              style={{color: 'green', cursor: 'pointer'}}
              onClick={e => this.changeEditData({key: 'notInRate', value: 1, id: row.id}, "e")}
            />)
        }
      },
      {
        title: '部门组员',
        dataIndex: 'userName',
        width: 150,
        className: 'ant-th-disabled',
        render: (text, row) => {
          if (row.isExtension === 1) {
            return <div>{text}<Tag style={{marginLeft: 5}} color="#2db7f5">推广</Tag></div>
          }
          return text;
        }
      },
      {
        title: '项目',
        children: [
          {
            title: '说明',
            children: [
              {
                title: '占比',
                className: 'ant-th-disabled',
                width: 60,
                align: 'center',
                render: () => {
                  return "打分";
                }
              }
            ]
          },
        ]
      },
      {
        title: type === 1 ? "指标完成率" : '工龄系数',
        children: [
          {
            title: type === 1 ? '店铺指标完成率' : '转正后每月20分',
            children: [
              {
                title: `${e_allRoundScoreRate * 100}%`,
                dataIndex: 'allRoundScore',
                align: 'center',
                className: 'ant-th-disabled',
                width: 120,
              }
            ]
          }
        ],
      },
    ];
    if (type === 2) {
      columns.push({
        title: '综合素质',
        children: [
          {
            title: '工作经验&能力',
            children: [
              {
                title: `${e_targetScoreRate * 100}%`,
                dataIndex: 'targetScore',
                align: 'center',
                className: 'ant-th-disabled',
                width: 120,
              }
            ]
          }
        ]
      })
    }

    const gmArr = [
      {
        title: type === 2 ? '绩效目标得分' : '执行力',
        children: [
          {
            title: `${e_cooScoreRate * 100}%`,
            dataIndex: 'cooScore',
            align: 'center',
            className: 'ant-th-disabled',
            width: 120,
          }
        ]
      },
      {
        title: type === 2 ? '工作质量&效率' : '工作效率',
        children: [
          {
            title: `${e_gmScoreRate * 100}%`,
            dataIndex: 'gmScore',
            align: 'center',
            className: 'ant-th-disabled',
            width: 120,
          }
        ]
      },
      {
        title: type === 2 ? '工作态度' : '工作质量',
        children: [
          {
            title: `${e_workingScoreRate * 100}%`,
            dataIndex: 'workingScore',
            align: 'center',
            className: 'ant-th-disabled',
            width: 120,
          }
        ]
      }
    ];
    if (type !== 2) {
      gmArr.unshift({
        title: '工作态度',
        children: [
          {
            title: `${e_targetScoreRate * 100}%`,
            dataIndex: 'targetScore',
            align: 'center',
            className: 'ant-th-disabled',
            width: 120,
          }
        ]
      })
    }
    ;

    columns = columns.concat(
      [
        {
          title: '经理考评',
          children: gmArr,
        },
        {
          title: '综合评分',
          dataIndex: 'totalScore',
          align: 'center',
          className: 'ant-th-disabled',
          width: 120,
          render: (text, row) => {
            return this.getEmployeeTotalScore(row);
          }
        },
        {
          title: '提成系数',
          dataIndex: 'extractRate',
          align: 'center',
          className: 'ant-th-disabled',
          width: 107,
          render: (text, row) => {
            if (row.notInRate === 1) {
              return null;
            }
            text = text || 0;
            let all = 0;
            dataSource.filter(x => x.notInRate !== 1 && x.isExtension === row.isExtension).forEach(i => {
              const _score = this.getEmployeeTotalScore(i) || 0;
              all += _score * 1;
            });
            if (all === 0) {
              return null;
            }
            return `${((this.getEmployeeTotalScore(row) / all) * 100).toFixed(2)}%`;
          }
        },
        {
          title: '系数修正(%)',
          dataIndex: 'customExtractRate',
          align: 'center',
          className: recordUser ? 'ant-th-disabled' : null,
          width: 107,
          render: (text, row) => {
            if (recordUser) {
              return text ? `${text}%` : null;
            }
            if (isEnd === 1) {
              return text ? `${text}%` : null;
            }
            return (
              <div
                className={classNames({
                  ['ant-td-edit']: true,
                  ['ant-td-edit-active']: this.state.currentFocusItem.id === row.id && this.state.currentFocusItem.key === 'customExtractRate',
                })}
                style={{width: 106}}
              >
                <Input
                  className='ant-table-input'
                  value={text}
                  style={{width: '100%', textAlign: 'center',}}
                  onBlur={e => this.changeDataStatus(text)}
                  onFocus={e => this.focusItem(row.id, "customExtractRate")}
                  onChange={e => this.changeEditData({
                    key: 'customExtractRate',
                    value: e.target.value,
                    id: row.id
                  }, "e")}
                />
              </div>
            )
          }
        },
      ]
    )
    return (
      <div>
        <StandardTable
          bordered={true}
          rowKey={record => record.id}
          mode='simple'
          columns={columns}
          style={{maxWidth: 1199, marginTop: -16}}
          dataSource={dataSource}
          loading={false}
        />
        {
          this.state.editEmployee ?
            <Button
              style={{width: '100%', marginTop: 10}}
              type='dashed'
              icon='plus'
              onClick={e => this.openAddAssessEmployeeModal(this.state.currentDep)}
            >
              添加员工</Button> : null
        }

      </div>

    )
  }

  renderReviewModal() {
    const {reviewModal: {visible},} = this.state;
    const {assessDetail: {employeeList, managerList}, nowAssess: {record, recordConfig}} = this.props[modelNameSpace];

    const currentYear = (moment().format('M')) === "1" ? (moment().format('YYYY')).toInt() - 1 : (moment().format('YYYY')).toInt();
    const currentMonth = (moment().format('M')) === "1" ? 12 : ((moment().format('M')).toInt() - 1);
    const depMap = this.getTabItemMap();
    return (
      <StandardModal
        visible={visible}
        width={1162}
        title='部门绩效考核统计-打印预览'
        onCancel={e => this.setState({reviewModal: {visible: false}})}
        style={{top: 20}}
        onOk={e => this.startPrint()}
      >
        <RcPrint ref="rcPrint" clearIframeCache>
          <div className={styles.printerReview}>
            {depMap.map(dep => {
              return (
                <PrinterItem
                  year={currentYear}
                  month={currentMonth}
                  depName={dep.title}
                  manager={managerList.filter(x => x.depID === dep.key.toInt())}
                  member={employeeList.filter(x => x.depID === dep.key.toInt())}
                  record={record}
                  recordConfig={recordConfig.filter(x => x.depIDs.toList().contains(dep.key))[0]}
                />
              )
            })}
          </div>
        </RcPrint>
      </StandardModal>
    )
  }

  render() {
    const {loading} = this.props;
    const actions = [
      {
        button: {
          icon: "retweet",
          type: 'primary',
          text: '刷新',
          onClick: () => {
            this.getNowAssess();
            this.getList();
          }
        },
      },
    ];
    const fxLayoutProps = {
      header: {
        title: '部门绩效考核统计',
        actions,
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderBody(),
        loading: loading.effects[`${modelNameSpace}/getAssessDetail`],
      },
    }
    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.pop.visible ? <div id='pop-container'></div> : null}
        {this.state.modal.visible ? this.renderModal() : null}
        {this.state.itemModal.visible ? this.renderItemModal() : null}
        {this.state.reviewModal.visible ? this.renderReviewModal() : null}
        {this.state.editEmployeeModal.visible ? this.renderAddEmployeeModal() : null}
      </Fragment>
    )
  }
}
