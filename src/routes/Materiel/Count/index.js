import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Input,Divider,Modal,Select} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';

const modelNameSpace = "materiel-count";
const Fragment = React.Fragment;
const Option=Select.Option;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_materiel_count')
export default class extends React.Component {
  state = {
    status: "0",
    addModal:{
      visible:false,
    },
    modal: {
      visible: false,
      record: {},
      index: -1,
      isAdd: true,
    },
    materielItemList:[],
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
    const { materielItemList }=this.state;
    const materielInsDataList=[];
    materielItemList.forEach(i=>{
      materielInsDataList.push({
        materielID:i.materielID,
        count:i.count,
      });
    });
    model.call("add",{
      materielInsData:JSON.stringify( materielInsDataList),
    }).then(success=>{
      if(success){
        this.getList();
        this.setState({
          addModal:{
            visible:false,
          }
        })
      }
    });
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
    });
  }

  editMaterielItemList=(count,index)=>{
     const { materielItemList }=this.state;
     materielItemList[index]['count']=count;
     this.setState({
       materielItemList,
     });
  }

  removeMaterielItemList=(index)=>{
    const { materielItemList }=this.state;
    materielItemList.splice(index,1);
    this.setState({
      materielItemList,
    });
  }

  saveMaterielItemList=(values)=>{
    const { categoryList }=this.props[modelNameSpace];
    const { materielItemList }=this.state;
    const index=materielItemList.findIndex(x=>x.materielID===values.materielID);
    if(index!==-1){
      materielItemList[index]['count']+=values.count*1;
    }else {
      materielItemList.push({
        materielID:values.materielID,
        name:categoryList.filter(x=>x.id===values.materielID)[0].name,
        count:values.count*1,
      });
    }
    this.setState({
      materielItemList,
    });
    this.setState({
      modal:{
        visible:false,
      }
    });

  }

  renderList() {
    const {loading, model,columnList,actionList} = this.props;
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
        title: '库存可用数量',
        dataIndex: 'canUseCount',
      },
    ];
    if(columnList.contains('isLockNum')){
      columns.push({
        title: '已锁定数量',
        dataIndex: 'lockCount',
      });
    }
    const actions = [
      {
        isShow:actionList.contains('add'),
        button: {
          icon: 'plus',
          text: '添加库存',
          type: 'primary',
          onClick: () => {
            this.setState({
              materielItemList:[],
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
        style={{width:800}}
        rowKey={record => record.materielID}
        actions={actions}
        columns={columns}
        dataSource={list}
        loading={loading.effects[`${modelNameSpace}/get`]}
      />
    )
  }

  renderAddModal(){
     const {visible}=this.state.addModal;
     const {materielItemList}=this.state;
     const columns=[
       {
         title:'物料',
         dataIndex:'name',
       },
       {
         title:'入库数量',
         dataIndex:'count',
         width:200,
         render:(text,row,index)=>{
           return(
             <Input
               value={text}
               style={{width:'100%'}}
               onChange={e=>this.editMaterielItemList(e.target.value,index)}
             />
           )
         }
       },
       {
         title:'操作',
         dataIndex:'op',
         render:(text,row,index)=>{
           return(
             <a onClick={e=>this.removeMaterielItemList(index)}>删除</a>
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
            const { model }=this.props;
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
     return(
       <StandardModal
         visible={visible}
         title='添加物料'
         width={600}
         onCancel={e=>this.setState({addModal:{visible:false}})}
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
    const { categoryList }=this.props[modelNameSpace];
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
                {categoryList.map(category=>{
                  return(
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
        title: `物料库存管理`,
        actions:[
          {
            button:{
              icon:'retweet',
              text:'刷新',
              type:'primary',
              onClick:e=>this.getList()
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
        {this.state.addModal.visible?this.renderAddModal():null}
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
