import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import {
  Input,
  Modal,
  Row,
  Col,
  Button,
  Card,
} from 'antd';
import moment from 'moment';
import {Pie, yuan} from '../../../components/Charts';
import Component from '../../../utils/rs/Component';
import Uri from '../../../utils/rs/Uri';

import SearchForm from '../../../myComponents/Form/Search';
import PositionSelect from '../../../myComponents/Select/Position';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';
import ImageUploader from '../../../myComponents/Fx/ImageUploader';
import InfoHeader from '../../../myComponents/Fx/InfoHearder';
import ConsoleTitlePanel from '../../../myComponents/Fx/ConsoleTitlePanel';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const modelNameSpace = 'employee';


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_employee_home')
export default class extends PureComponent {
  state = {
    sorter: {
      sorterColumn: 'jobNumber',
      sorterType: 'asc',
    },
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
    selectedKeys: [],
    workPhotoUrl: '',
    deptPanel: {
      visible: false,
      view: 24,
      panel: 0,
    },
    filters: {
      sex: null,
    },
    currentStatus: '',
  };

  ref = {
    searchForm: null,
  }

  getList = (page) => {
    const {model, [modelNameSpace]: {pageIndex, pageSize}} = this.props;
    const depID = Uri.Query('depID') || 0;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {sorter, filters, currentStatus} = this.state;
    const values = getFieldsValue();
    const {entryDate} = values;
    const startDate = entryDate ? entryDate[0].format('YYYY-MM-DD') : null;
    const endDate = entryDate ? entryDate[1].format('YYYY-MM-DD') : null;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        depID,
        startDate,
        endDate,
        ...values,
        ...filters,
        workStatus: currentStatus,
        pageIndex,
        pageSize,
        ...sorter,
      });
    });
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
          sex: null,
        },
      }, e => this.getList(1));
    }
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

  changeStatus = (workStatus) => {
    const {model} = this.props;
    model.push(`/hr/employee/list?workStatus=${workStatus}`);
  }

  changeMonthStatus = (status) => {
    // const {model} = this.props;
    // const search={
    //   dateType:status==='monthEntry'?'entry':'leave',
    //   date:''
    // }
    // model.push(`/hr/employee/list?workStatus=all&search=${}`);
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
    const {field = 'jobNumber', order = 'ascend'} = sorter;
    let type;
    if (field === 'birthday') {
      type = order === 'ascend' ? 'desc' : 'asc';
    } else {
      type = order === 'ascend' ? 'asc' : 'desc';
    }
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
    }, e => this.getList(1));
  }

  componentDidMount() {
    const {model} = this.props;
    model.call('getCount');
  }

  componentWillUnmount() {
  }

  renderSearchForm() {
    const {[modelNameSpace]: {searchValues}} = this.props;
    const item = [
      [
        {
          label: '员工工号',
          key: 'jobNumber',
          render: () => {
            return (<Input style={{width: 100}} placeholder="输入工号"/>);
          }
        },
        {
          label: '员工姓名',
          key: 'empName',
          render: () => {
            return (<Input style={{width: 100}} placeholder="输入员工姓名"/>);
          }
        },
        {
          label: '入职时间',
          key: 'entryDate',
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
        reset={() => this.reset()}
        onSearch={values => this.getList(1)}
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


  render() {
    const {
      [modelNameSpace]: {
        selectItems, count: {
          all,
          working,
          trial,
          internShip,
          temporary,
          retire,
          quit,
          monthEntry,
          monthLeave,
        }
      }, model, actionList
    } = this.props;
    const items = [
      {
        title: '所有数据',
        value: all,
        key: 'all',
        type: 'primary',
      },
      {
        title: '已转正',
        value: working,
        key: 'working',
        type: 'success',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['working'],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
      {
        title: '试用期',
        value: trial,
        key: 'trial',
        type: 'processing',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['trial'],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
      {
        title: '实习期',
        value: internShip,
        key: 'internShip',
        type: 'warning',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['internShip'],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
      {
        title: '已退休',
        value: retire,
        key: 'retire',
        type: 'default',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['retire'],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },

      {
        title: '已离职',
        value: quit,
        key: 'quit',
        type: 'error',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['quit'],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
    ];
    const monthItem = [
      {
        key: 'monthEntry',
        title: '已入职',
        value: monthEntry,
        type: 'success',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              entryDate:[moment().startOf('month'),moment().endOf('month')]
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
      {
        title: '已离职',
        value: monthLeave,
        key: 'monthLeave',
        type: 'error',
        select: true,
        onClick: () => {
          model.setState({
            filter: {
              ...this.props[modelNameSpace].filter,
              workStatus: ['quit'],
              leaveDate: [moment().startOf('month'), moment().endOf('month')],
            }
          }).then(() => {
            model.push(`/hr/employee/list`);
          });
        }
      },
    ];
    const salesPieData = [
      {
        x: '正式员工',
        y: working,
      },
      {
        x: '试用期员工',
        y: trial,
      },
      {
        x: '临时员工',
        y: temporary,
      },
      {
        x: '退休员工',
        y: retire,
      },
      {
        x: '离职员工',
        y: quit,
      },
    ];

    return (
      <div className={classNames({
        [styles.employeeHome]: true,
        ['ant-layout-top-100']: true,
      })}
      >
        <div className={styles.employeeHomeWrapper}>
          <Row gutter={24}>
            <Col span={16}>
              <Card bordered={false} title="员工数据汇总">
                <InfoHeader items={items} onSelect={this.changeStatus}/>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} title="本月员工变动">
                <InfoHeader items={monthItem}/>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}



