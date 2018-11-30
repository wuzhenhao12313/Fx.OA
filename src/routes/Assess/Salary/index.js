import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Input, Form, Button, Card, Row, Col,Radio} from 'antd';
import {fetchApiSync, fetchDictSync} from '../../../utils/rs/Fetch';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import InLineForm from '../../../myComponents/Form/InLine';
import Component from "../../../utils/rs/Component";
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import YearSelect from '../../../myComponents/Select/Year';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import EditModal from "../../../myComponents/Fx/EditModal";
import Uri from "../../../utils/rs/Uri";
import Salary from './salary';


const modelNameSpace = "assess-salary";
const Fragment = React.Fragment;
const FormItem = Form.Item;
const RadioButton=Radio.Button;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_assess_salary')
@Component.Pagination({model:modelNameSpace})
export default class extends PureComponent{
  state={
  }

  componentDidMount(){
    this.getList(1);
  }

  getList=(page)=>{
     const {model}=this.props;
     const {pageIndex,pageSize}=this.props[modelNameSpace];
     model.setState({
       pageIndex:page||pageIndex,
     }).then(()=>{
       model.call("getAssessRecordList",{
         pageIndex,
         pageSize,
       });
     });
  }

  renderTable(){
    const {pagination,loading,model}=this.props;
    const {recordData:{list,total},pageIndex,pageSize}=this.props[modelNameSpace];
    const columns=[
      {
        title:'序号',
        dataIndex:'index',
        width:55,
        align:'center',
        render:(text,row,index)=>{
          return((pageIndex-1)*pageSize+index+1);
        }
      },
      {
        title:'标题',
        dataIndex:'title',
      },
      {
        title:'操作',
        dataIndex:'op',
        width:180,
        align:'right',
        render:(text,row,index)=>{
           return(
             <a onClick={e=>model.push(`/assess/salary?id=${row.id}`)}>核算工资</a>
           )
        }
      }
    ];
    return(
      <StandardTable
        rowKey={record=>record.id}
        columns={columns}
        dataSource={list}
        loading={loading.effects[`${modelNameSpace}/getAssessRecordList`]}
        page={pagination({pageIndex,total,},this.getList)}
      />
    )
  }

  render(){
    const fxLayoutProps = {
      pageHeader: {
        title: '工资核算'
      },
      body: {
        center:Uri.Query('id')?<Salary /> : this.renderTable(),
      },
    }
    return(
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
      </Fragment>
    )
  }
}
