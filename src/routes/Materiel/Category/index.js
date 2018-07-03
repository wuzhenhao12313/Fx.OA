import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Input,Divider,Modal} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';

const modelNameSpace = "materiel-category";
const Fragment = React.Fragment;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_materiel_category')
export default class extends React.Component {
  state = {
    status: "0",
    modal: {
      visible: false,
      record: {},
      index: -1,
      isAdd: true,
    }
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

  save = (values) => {
    const {record, index, isAdd} = this.state.modal;
    const {model} = this.props;
    const {list} = this.props[modelNameSpace];
    if (isAdd) {
      model.add({
        categoryEntity: {
          ...values,
        }
      }).then((success) => {
        if (success) {
          this.setState({
            modal: {visible: false},
          },e=>this.getList());
        }
      });
    }else {
      model.edit({
        categoryEntity: {
          ...record,
          ...values,
        }
      }).then(success=>{
        if(success){
          this.setState({
            modal: {visible: false},
          },e=>this.getList());
        }
      });
    }
  }

  remove=(materielID)=>{
    const { model }=this.props;
    Modal.confirm({
      title:'删除物料类型',
      content:'确定要删除吗?',
      onOk:()=>{
        model.call("remove",{
          materielID,
        }).then(success=>{
          if(success){
            this.getList();
          }
        });
      }
    })

  }

  renderList() {
    const {loading, model} = this.props;
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
        title: '创建人',
        dataIndex: 'createUserName',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        width: 100,
        align: 'right',
        render: (text, row,index) => {
          return (
            <Fragment>
              <a onClick={e=>this.setState({modal:{visible:true,record:row,index,isAdd:false}})}>编辑</a>
              <Divider type="vertical" />
              <a onClick={e=>this.remove(row.id)}>删除</a>
            </Fragment>

          )
        }
      },
    ];
    const actions = [
      {
        button: {
          icon: 'plus',
          text: '添加',
          type: 'primary',
          onClick: () => {
            this.setState({
              modal: {
                visible: true,
                record: {},
                index: -1,
                isAdd: true,
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

  renderModal() {
    const {visible, record, isAdd} = this.state.modal;
    const item = [
      {
        key: 'materielNo',
        label: '物料编号',
        initialValue: isAdd ? null : record.materielNo,
        rules: [
          {required: true, message: '请填写物料编号'}
        ],
        render: () => {
          return (
            <Input/>
          )
        }
      },
      {
        key: 'name',
        label: '物料名称',
        initialValue: isAdd ? null : record.name,
        rules: [
          {required: true, message: '请填写物料名称'}
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
        title='编辑物料类型'
        onCancel={e => this.setState({modal: {visible: false}})}
        onSubmit={this.save}
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
        title: `物料类型`,
      },
      body: {
        center: this.renderList(),
      },
    };
    return (
      <Fragment>
        <FxLayout {...fxLayoutProps} />
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
