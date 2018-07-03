import React, {PureComponent} from 'react';
import {connect} from 'dva';
import { Select, Badge, Modal } from 'antd';
import moment from 'moment';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';
import SearchForm from '../../../myComponents/Form/Search';
import LoadingService from '../../../utils/rs/LoadingService';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';

const modelNameSpace = "exam-score-report";
const Fragment = React.Fragment;
const Option = Select.Option;
const OptionGroup = Select.OptGroup;

const filterSettings = {
   categoryCode: {
    formatter: {},
  }
};

const tagData = fetchDictSync({typeCode: 'exam-position-tag'});
tagData.forEach(item => {
  filterSettings.categoryCode.formatter[item.itemCode] = item.itemName;
});

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Role('oa_exam_score-report')
export default class extends PureComponent {


  componentDidMount() {
    this.getList();
  }

  ref = {
    searchForm : null,
  }



  getList = () => {
    const { model } = this.props;
    const { getFieldsValue } = this.ref.searchForm.props.form;
    const _values = getFieldsValue();
    const values = {
      batchStartDate: _values.batchStartDate ? _values.batchStartDate.format('YYYY-MM-DD 00:00:00') : null,
      batchEndDate: _values.batchEndDate ? _values.batchEndDate.format('YYYY-MM-DD 23:59:59') : null,
    };
    model.call('getScoreReport', { ...values });
  }

  renderSearchForm() {
    const item = [
      [
        {
          label:'开始时间',
          key: 'batchStartDate',
          initialValue:moment().startOf('month'),
          render: () => {
            return (
              <StandardDatePicker />
            )
          }
        },
        {
          label:'结束时间',
          key: 'batchEndDate',
          initialValue:moment().endOf('month'),
          render: () => {
            return (
              <StandardDatePicker />
            )
          }
        }
      ]
    ]

    return (
      <SearchForm
        item={item}
        onSearch={this.getList}
        wrappedComponentRef={ node => this.ref.searchForm = node}
      />
    )

  }

  renderList = () => {
    const { loading } = this.props;
    const { list } = this.props[modelNameSpace];
    const columns = [
      {
        title: '员工姓名',
        dataIndex: 'userName',
      },
      {
        title: '工号',
        dataIndex: 'jobNumber',
      },
      {
        title: '职位类型',
        dataIndex: 'categoryCode',
        render: (text) => {
          return filterSettings.categoryCode.formatter[text];
        }
      },
      {
        title: '职位等级',
        dataIndex: 'positionLevel',
      },
      {
        title: '试卷名称',
        dataIndex: 'title',
      },
      {
        title: '试卷总分',
        dataIndex: 'score',
      },
      {
        title: '成绩',
        dataIndex: 'userScore',
      },
      {
        title: '完成时间',
        dataIndex: 'batchDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm');
        }
      }
    ];
    return (
      <div>
        <StandardTable
          title={`破浪等级考试统计报表`}
          rowKey={record => record.insID}
          columns={columns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/getScoreReport`]}
          tools={null}
          mode='simple'
        />
      </div>
    )

  }

  render() {
    const fxLayoutProps = {
      header: {
        title: `成绩报表`,
        extra: this.renderSearchForm(),
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
