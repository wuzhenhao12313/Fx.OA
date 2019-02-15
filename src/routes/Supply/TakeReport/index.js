import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  message,
  Progress,
  Button,
  Input,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import InLineForm from '../../../myComponents/Form/InLine';
import {fetchApiSync, fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';

const modelNameSpace = "supply-take-report";
const Fragment = React.Fragment;
const TextArea = Input.TextArea;

const departmentData = fetchApiSync({url: '/Department/Get',});
console.log(departmentData)
const departmentList = departmentData.data.toObject().list.toObject();
const formatter = {
  department: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_supply_take_report')
export default class extends PureComponent {

  componentDidMount() {
    this.getList();
  }

  ref = {
    searchForm: {}
  }

  getList = () => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const {contractCustomNo, asin} = getFieldsValue();
    if (!contractCustomNo && !asin) {

    } else {
      model.get({
        ...getFieldsValue(),
      });
    }
  }


  renderTable() {
    const {list} = this.props[modelNameSpace];
    const {loading} = this.props;
    const item = [
      {
        key: 'contractCustomNo',
        label: '合同编号',
        render: () => {
          return (<Input style={{width: '200'}}/>)
        }
      },
      {
        key: 'asin',
        label: 'ASIN',
        render: () => {
          return (<Input style={{width: '200'}}/>)


        }
      },
      {
        key: 'search',
        render: () => {
          return (<Button type='primary' onClick={e => this.getList()}>搜索</Button>)
        }
      }
    ];
    const columns = [
      {
        title: '图片',
        dataIndex: 'pro_id',
        width: 70,
        render: (text) => {
          return <ProductInfo proId={text}/>
        }
      },
      {
        title: '合同编号',
        dataIndex: 'contractCustomNo',
      },
      {
        title: 'ASIN',
        dataIndex: 'productCode',
      },
      {
        title: '颜色',
        dataIndex: 'color_code',
      },
      {
        title: '尺码',
        dataIndex: 'size_code',
      },
      {
        title: '总采购数量',
        dataIndex: 'allNum',
      },
      {
        title: '总收货数量',
        dataIndex: 'takeNum',
        render: (text) => {
          return text || 0;
        }
      },
      {
        title: '未收数量',
        dataIndex: 'noNum',
        render: (text, row) => {
          return row.allNum <= row.takeNum ? 0 : row.allNum - row.takeNum;
        }
      }
    ];
    return (
      <div>
        <InLineForm item={item} wrappedComponentRef={node => this.ref.searchForm = node} style={{marginBottom: 12}}/>
        <StandardTable
          rowKey={record => record.itemID}
          columns={columns}
          dataSource={list}
          page={false}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>

    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '采购收货报表'
      },

      body: {
        center: this.renderTable(),
      },
    };
    return (
      <FxLayout {...fxLayoutProps} />
    )
  }
}
