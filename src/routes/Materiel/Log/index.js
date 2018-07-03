import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {message, Button, Divider, Modal} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchApiSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';
import SearchForm from '../../../myComponents/Form/Search';
import StandardRangePicker from '../../../myComponents/Date/StandardRangePicker';

const modelNameSpace = "materiel-log";
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
@Component.Role('erp_materiel_log')
export default class extends React.Component {
  state = {
    status: "0",
  }

  componentDidMount() {
    this.getList(1);
  }

  ref={
    searchForm:null,
  }

  getList = (page) => {
    const {model} = this.props;
    const {data: {list, total}, pageIndex, pageSize} = this.props[modelNameSpace];
    const {getFieldsValue}=this.ref.searchForm.props.form;
    const values=getFieldsValue();
    const startDate=values.date?values.date[0].format('YYYY-MM-DD'):null;
    const endDate=values.date?values.date[1].format('YYYY-MM-DD'):null;
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
        startDate,
        endDate,
      });
    });
  }


  renderList() {
    const {loading, model} = this.props;
    const {data: {list}} = this.props[modelNameSpace];
    const columns = [
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
        title: '操作类型',
        dataIndex: 'type',
        width: 100,
        render: (text) => {
          let value = '';
          switch (text) {
            case 1:
              value = '出库';
              break;
            case 0:
              value = '入库';
              break;
            case 2:
              value = '销毁';
              break;
          }
          return value;
        }
      },
      {
        title: '操作人',
        dataIndex: 'createUserName',
        width: 100,
      },
      {
        title: '操作时间',
        dataIndex: 'createDate',
        width: 150,
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:mm')
        }
      },
    ];
    return (
      <div>
        {this.renderSearchForm()}
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </div>
    )
  }

  renderSearchForm() {
    const start=moment().startOf('month');
    const item = [
      [
        {
          key: 'date',
          label: '操作时间',
          initialValue:[start,moment()],
          render: () => {
            return (
              <StandardRangePicker/>
            )
          }
        }
      ]
    ];
    return (
      <SearchForm
        item={item}
        wrappedComponentRef={node => this.ref.searchForm = node}
        onSearch={e=>this.getList(1)}
      />
    )
  }

  render() {
    const {pagination, loading} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {recordStatus} = this.state;
    const fxLayoutProps = {
      header: {
        title: `物料出入库记录`,
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
