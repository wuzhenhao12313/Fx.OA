import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Modal, Select, Input} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';

const modelNameSpace = "materiel-apply-my";
const Fragment = React.Fragment;
const Option = Select.Option;

const formatter = {
  materielCategory: {},
};

const materielCategoryData = fetchApiSync({
  url: '/Materiel/Category',
  params: {}
}).data.toObject().list;
materielCategoryData.forEach(item => {
  formatter.materielCategory[item.id] = item.name;
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_materiel_my-apply')
export default class extends React.Component {
  state = {
    status: "0",
    addModal: {
      visible: false,
    },
    modal: {
      visible: false,
    },
    materielItemList: [],
  }

  componentDidMount() {
    this.getList(1);
  }

  save = () => {
    const {model} = this.props;
    const {materielItemList} = this.state;
    const materielInsDataList = [];
    materielItemList.forEach(i => {
      materielInsDataList.push({
        materielID: i.materielID,
        count: i.count,
      });
    });
    model.call("add", {
      materielData: JSON.stringify(materielInsDataList),
    }).then(({success, record}) => {
      const {list, total} = this.props[modelNameSpace].data;
      list.unshift(record);
      if (success) {
        model.setState({
          data: {
            list,
            total: total + 1,
          }
        });
        this.setState({
          addModal: {
            visible: false,
          }
        })
      }
    });
  }

  cancel = (applyID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '撤销申请',
      content: '确定要撤销申请吗，撤销后将无法恢复',
      onOk: () => {
        model.call('cancel', {
          applyID,
        }).then(success => {
          if (success) {
            const {list, total} = this.props[modelNameSpace].data;
            const index = list.findIndex(x => x.id === applyID);
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
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const {status} = this.state;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(_ => {
      model.get({
        pageIndex,
        pageSize,
        applyStatus: status,
      });
    });
  }

  getCountByID = (materielID) => {
    const {model} = this.props;
    model.call("getCountByID", {materielID,})
  }

  editMaterielItemList = (count, index) => {
    const {materielItemList} = this.state;
    materielItemList[index]['count'] = count;
    this.setState({
      materielItemList,
    });
  }

  removeMaterielItemList = (index) => {
    const {materielItemList} = this.state;
    materielItemList.splice(index, 1);
    this.setState({
      materielItemList,
    });
  }

  saveMaterielItemList = (values) => {
    const {categoryList} = this.props[modelNameSpace];
    const {materielItemList} = this.state;
    const index = materielItemList.findIndex(x => x.materielID === values.materielID);
    if (index !== -1) {
      materielItemList[index]['count'] += values.count * 1;
    } else {
      materielItemList.push({
        materielID: values.materielID,
        name: categoryList.filter(x => x.id === values.materielID)[0].name,
        count: values.count * 1,
      });
    }
    this.setState({
      materielItemList,
    });
    this.closeModal();
  }

  closeModal=()=>{
    this.setState({
      modal:{
        visible:false,
      }
    });
    const {model}=this.props;
    model.setState({
      currentMaterielCount:null,
    });
  }

  renderAddModal() {
    const {visible} = this.state.addModal;
    const {materielItemList} = this.state;
    const columns = [
      {
        title: '物料',
        dataIndex: 'name',
      },
      {
        title: '申请数量',
        dataIndex: 'count',
        width: 200,
        render: (text, row, index) => {
          return (
            <Input
              value={text}
              style={{width: '100%'}}
              onChange={e => this.editMaterielItemList(e.target.value, index)}
            />
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          return (
            <a onClick={e => this.removeMaterielItemList(index)}>删除</a>
          )
        }
      }
    ];
    const actions = [
      {
        button: {
          icon: 'plus',
          text: '添加条目',
          type: 'primary',
          onClick: () => {
            const {model} = this.props;
            model.call("getCategoryList");
            this.setState({
              modal: {
                visible: true,
              }
            });
            // model.push('/exam/reg-center');
          }
        }
      }
    ];
    return (
      <StandardModal
        visible={visible}
        title='添加物料'
        width={600}
        onCancel={e => this.setState({addModal: {visible: false}})}
        onOk={this.save}
      >
        <StandardTable
          rowKey={record => record.materielID}
          actions={actions}
          columns={columns}
          dataSource={materielItemList}
        />
      </StandardModal>
    )
  }

  renderModal() {
    const {visible, record, isAdd} = this.state.modal;
    const {categoryList, currentMaterielCount} = this.props[modelNameSpace];
    const item = [
      {
        key: 'materielID',
        label: '物料',
        rules: [
          {required: true, message: '请选择物料'}
        ],
        render: () => {
          return (
            <AutoSelect
              onChange={value => this.getCountByID(value)}
            >
              {categoryList.map(category => {
                return (
                  <Option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </Option>
                )
              })}
            </AutoSelect>
          )
        }
      },
      {
        key: 'canUseCount',
        label: '可申请数量',
        children: <span style={{ color:'red'}}>{currentMaterielCount}</span>,
      },
      {
        key: 'count',
        label: '申请数量',
        rules: [
          {required: true, message: '请填写申请数量'}
        ],
        render: () => {
          return (
            <Input/>
          )
        }
      }
      ,
    ];
    return (
      <EditModal
        destroyOnClose
        visible={visible}
        labelCol={5}
        title='添加物料库存'
        onCancel={e => this.closeModal()}
        onSubmit={this.saveMaterielItemList}
        item={item}
        width={500}
      />
    )
  }

  renderList() {
    const {loading, model} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '申请编号',
        dataIndex: 'materielNo',
        width: 250,
      },
      {
        title: '申请时间',
        dataIndex: 'applyDate',
        width: 200,
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '物料列表',
        dataIndex: 'materielData',
        render: (text) => {
          const array = text ? text.toObject() : [];
          return (
            <div>
              {array.map(i => {
                return (
                  <p>
                    <span>物料名称: </span>{formatter.materielCategory[i.materielID]}
                    <span style={{marginLeft: 30}}>数量: </span>{i.count}
                  </p>
                )
              })
              }
            </div>
          )
        }
      },
      {
        title: '完成时间',
        dataIndex: 'applyDate',
        width: 200,
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        width: 100,
        align: 'right',
        render: (text, row) => {
          if (row.status === 0) {
            return (<a onClick={e => this.cancel(row.id)}>撤销</a>)
          }
          return null;
        }
      },
    ];
    const actions = [
      {
        button: {
          icon: 'plus',
          text: '申请物料',
          type: 'primary',
          onClick: () => {
            this.setState({
              materielItemList: [],
              addModal: {
                visible: true,
              }
            });
            // model.push('/exam/reg-center');
          }
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.id}
        actions={actions}
        columns={columns}
        dataSource={list}
        tools={['refresh']}
        loading={loading.effects[`${modelNameSpace}/get`]}
        refresh={e => this.getList()}
      />
    )
  }

  render() {
    const {pagination, loading} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {status} = this.state;
    const fxLayoutProps = {
      header: {
        title: `我的物料申请`,
        tabs: {
          items: [
            {title: '申请中', key: "0"},
            {title: '已同意', key: "1"},
            {title: '已拒绝', key: "2"},
          ],
          activeKey: status || "0",
          onTabChange: tab => this.setState({status: tab}, () => this.getList(1)),
        },
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      },
      body: {
        center: this.renderList(),
      },
    };
    return (
      <Fragment>
        <FxLayout {...fxLayoutProps} />
        {this.state.addModal.visible ? this.renderAddModal() : null}
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
