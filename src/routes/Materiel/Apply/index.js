import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Button, Divider,Modal} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';

const modelNameSpace = "materiel-apply";
const Fragment = React.Fragment;

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
@Component.Role('erp_materiel_apply')
export default class extends React.Component {
  state = {
    status: "0",
  }

  componentDidMount() {
    this.getList(1);
  }

  getList = (page) => {
    const {model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
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
      });
    });
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
        title: '申请人',
        dataIndex: 'applyUserName',
        width: 100,
      },
      {
        title: '申请时间',
        dataIndex: 'applyDate',
        width: 150,
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
                    <span style={{marginLeft:30}}>数量: </span>{i.count}
                  </p>
                )
              })
              }
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        width: 180,
        align: 'center',
        render: (text, row) => {
          if (row.status === 0) {
            return (
              <Fragment>
                <Button type='danger' ghost size='small' onClick={e=>this.audit(row.id,0)}>拒绝</Button>
                <Divider type="vertical" />
                <Button type='primary' size='small' onClick={e=>this.audit(row.id,1)}>同意</Button>
              </Fragment>
            )
          }
          return null;
        }
      },
    ];
    return (
      <StandardTable
        rowKey={record => record.recordID}
        columns={columns}
        dataSource={list}
        tools={['refresh']}
        loading={loading.effects[`${modelNameSpace}/get`]}
        refresh={e => this.getList(1)}
      />
    )
  }

  audit=(applyID,result)=>{
    const applyTitle=result?"拒绝申请":"同意申请";
    const {model}=this.props;
    Modal.confirm({
      title:applyTitle,
      content:'确定要审批吗？',
      onOk:()=>{
        model.call('audit',{
          applyID,
          result,
        }).then(success=>{
          if(success){
            const {list,total}=this.props[modelNameSpace].data;
            const index=list.findIndex(x=>x.id===applyID);
            list.splice(index,1);
            model.setState({
              data:{
                list,
                total:total-1,
              }
            });
          }
        })
      }
    });

  }

  render() {
    const {pagination, loading} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {recordStatus} = this.state;
    const fxLayoutProps = {
      header: {
        title: `物料申请单`
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
      </Fragment>
    )
  }
}
