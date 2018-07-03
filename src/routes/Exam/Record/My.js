import React, {PureComponent} from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';

const modelNameSpace = "exam-my-record";
const Fragment = React.Fragment;

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
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_exam_my-record')
export default class extends React.Component {
  state = {
    recordStatus: "0",
  }

  componentDidMount() {
    this.getList(1);
  }

  getList = (page) => {
    const {model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const {recordStatus} = this.state;
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
        recordStatus: null,
      });
    });
  }

  getStatusText = (status) => {
    let text = "";
    switch (status) {
      case 0:
        text = "待审核";
        break;
      case 1:
        text = "待考试";
        break;
      case 2:
        text = "已驳回";
        break;
      case 3:
        text = "已撤销";
        break;
      case 4:
        text = "考试中";
        break;
      case 5:
        text = "待阅卷";
        break;
      case 6:
        text = "已完成";
        break;
    }
    return text;
  }

  getTableColumns = (status) => {

  }

  renderList() {
    const {loading, model} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
      {
        title: '考试编号',
        dataIndex: 'serialNo',
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
        title: '申请时间',
        dataIndex: 'createDate',
        render: (text) => {
          return formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: '准考证号',
        dataIndex: 'quasiNo',
      },
      {
        title: '考试状态',
        dataIndex: 'status',
        render: (text) => {
          return this.getStatusText(text);
        }
      },
      {
        title: '考试成绩',
        dataIndex: 'examScore',
      },
      {
        title: '操作',
        dataIndex: 'op'
      },
    ];
    const actions = [
      {
        button: {
          icon: 'arrow-right',
          text: '申请考试',
          type: 'primary',
          onClick: () => {
            message.warning('此功能暂未开放');
            // model.push('/exam/reg-center');
          }
        }
      }
    ];
    return (
      <StandardTable
        rowKey={record => record.recordID}
        actions={actions}
        columns={columns}
        dataSource={list}
        tools={['refresh']}
        loading={loading.effects[`${modelNameSpace}/get`]}
        refresh={e => this.getList(1)}
      />
    )
  }

  render() {
    const {pagination, loading} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {recordStatus} = this.state;
    const fxLayoutProps = {
      header: {
        title: `我的考试记录`,
        // tabs: {
        //   items: [
        //     {title: '待审核', key: "0"},
        //     {title: '待考试', key: "1"},
        //     {title: '待阅卷', key: "5"},
        //     {title: '已完成', key: "6"},
        //     {title: '已驳回', key: "2"},
        //     {title: '已撤销', key: "3"},
        //   ],
        //   activeKey: recordStatus || "0",
        //   onTabChange: tab => this.setState({recordStatus: tab}, () => this.getList(1)),
        // },
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
