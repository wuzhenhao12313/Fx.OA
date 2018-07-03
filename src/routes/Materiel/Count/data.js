import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Input, Divider, Modal, Select} from 'antd';
import moment from 'moment';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';
import SearchForm from '../../../myComponents/Form/Search';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';

const modelNameSpace = "materiel-data-count";
const Fragment = React.Fragment;
const Option = Select.Option;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_materiel_data_count')
export default class extends React.Component {
  state = {
    status: "0",
    addModal: {
      visible: false,
    },
    modal: {
      visible: false,
      record: {},
      index: -1,
      isAdd: true,
    },
    materielItemList: [],
  }

  ref = {
    searchForm: null,
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    const {model} = this.props;
    const {list} = this.props[modelNameSpace];
    model.setState({
      list: [],
    }).then(_ => {
      model.get();
    });
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
      materielInsData: JSON.stringify(materielInsDataList),
    }).then(success => {
      if (success) {
        this.getList();
        this.setState({
          addModal: {
            visible: false,
          }
        })
      }
    });
  }

  remove = (materielID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除物料类型',
      content: '确定要删除吗?',
      onOk: () => {
        model.call("remove", {
          materielID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
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
    this.setState({
      modal: {
        visible: false,
      }
    });
  }

  renderSearchForm() {
    const item = [
      [
        {
          key: 'date',
          label: '统计日期',
          initialValue: moment(),
          render: () => {
            return (
              <StandardDatePicker/>
            )
          }
        }
      ]
    ];
    return (
      <SearchForm
        item={item}
        wrappedComponentRef={node => this.ref.searchForm = node}
        onSearch={e => this.getList(1)}
      />
    )
  }

  renderList() {
    const {loading, model,} = this.props;
    const {list} = this.props[modelNameSpace];
    const columns = [
      {
        title: '物料编号',
        dataIndex: 'materielNo',
      },
      {
        title: '物料名称',
        dataIndex: 'name',
      },
      {
        title: '期初库存可用数量',
        dataIndex: 'startCount',
      },
      {
        title: '期末库存可用数量',
        dataIndex: 'endCount',
      },
      {
        title: '可用库存差值',
        dataIndex: 'd-value',
        render: (text, row) => {
          const {startCount, endCount} = row;
          if (endCount === null) {
            return null;
          }
          if (startCount === endCount) {
            return 0;
          }
          if (startCount < endCount) {
            return `-${endCount - startCount}`;
          }
          if (startCount > endCount) {
            return `+${startCount - endCount}`;
          }
        }
      },
      {
        title: '本期新增库存',
        dataIndex: 'inCount',
      },
      {
        title: '本期出库库存',
        dataIndex: 'outCount',
      },
      {
        title: '本期锁定库存',
        dataIndex: 'lockCount',
      },
      {
        title:'状态',
        dataIndex:'isEnd',
        render:(text)=>{
          if(text===0){
            return "未结算";
          }
          if(text===1){
            return "已结算";
          }
        }
      }
    ];
    return (
      <div>
        {this.renderSearchForm()}
        <StandardTable
          rowKey={record => record.materielID}
          columns={columns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>
    )
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
        title: '入库数量',
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
    const {categoryList} = this.props[modelNameSpace];
    const item = [
      {
        key: 'materielID',
        label: '物料',
        rules: [
          {required: true, message: '请填写物料编号'}
        ],
        render: () => {
          return (
            <Select>
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
            </Select>
          )
        }
      },
      {
        key: 'count',
        label: '入库数量',
        rules: [
          {required: true, message: '请填写入库数量'}
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
        title='添加物料库存'
        onCancel={e => this.setState({modal: {visible: false}})}
        onSubmit={this.saveMaterielItemList}
        item={item}
        width={500}
      />
    )
  }

  render() {
    const {loading} = this.props;
    const {recordStatus} = this.state;
    const fxLayoutProps = {
      header: {
        title: `库存情况变动表`,
        actions: [
          {
            button: {
              icon: 'retweet',
              text: '刷新',
              type: 'primary',
              onClick: e => this.getList()
            }
          }
        ]
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
