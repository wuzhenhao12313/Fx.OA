import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Button,
  Input,
  Radio,
  Checkbox,
  Badge,
  Select,
  Tag,
  Modal,
  Tooltip,
  Icon,
} from 'antd';
import Component from '../../../utils/rs/Component';
import Color from '../../../utils/rs/Color';
import Format from '../../../utils/rs/Format';
import LoadingService from '../../../utils/rs/LoadingService';
import {fetchDictSync} from '../../../utils/rs/Fetch';
import FxLayout from '../../../myComponents/Layout/';
import SearchForm from '../../../myComponents/Form/Search';
import StandardTable from '../../../myComponents/Table/Standard';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import EditPanel from './Edit';
import styles from './index.less';

const filterSettings = {
  categoryCode: {
    formatter: {},
  }
};

const tagData = fetchDictSync({typeCode: 'exam-position-tag'});
tagData.forEach(item => {
  filterSettings.categoryCode.formatter[item.itemCode] = item.itemName;
});

const filterLabels = {
  title: '模板标题',
  categoryCode: '职位标签',
};


const modelNameSpace = 'exam-template';
const RadioGroup = Radio.Group;
const CheckGroup = Checkbox.Group;
const ButtonGroup = Button.Group;
const Option = Select.Option;
const Fragment = React.Fragment;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Utils({filter: filterSettings})
@Component.Role('oa_exam_template_list')
@Component.Pagination({model: modelNameSpace})
export default class extends React.Component {
  state = {
    modal: {
      visible: false,
      templateID: 0,
      index: -1,
    },
  };

  ref = {
    searchForm: null,
    dictTree: null,
  }

  getList = (page) => {
    const {model, utils, [modelNameSpace]: {pageIndex, pageSize, total, filter, sorter}} = this.props;
    const {getFieldsValue} = this.ref.searchForm.props.form;
    const filters = {
      ...filter,
      ...getFieldsValue(),
    };
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
        ...filters,
        ...sorter,
      })
    });
    utils.getFilterKeys(getFieldsValue());
  }

  save = (values) => {
    const {model} = this.props;
    const {index} = this.state.modal;
    LoadingService.Start();
    if (index === -1) {
      model.call("add", {
        ...values,
      }).then(({success, data}) => {
        if (success) {
          const {[modelNameSpace]: {data: {list, total}}} = this.props;
          const {record} = data;
          list.unshift(record);
          model.setState({
            data: {
              list,
              total: total + 1,
            }
          });
          this.setState({
            modal: {
              visible: false,
            }
          });
          LoadingService.Done();
        }
      });
    } else {
      model.edit({...values,}).then(({success, data}) => {
        if (success) {
          const {[modelNameSpace]: {data: {list, total}}} = this.props;
          const {record} = data;
          list.splice(index, 1, record);
          model.setState({
            data: {
              list,
              total,
            }
          });
          this.setState({
            modal: {
              visible: false,
            }
          });
          LoadingService.Done();
        }
      });
    }
  }

  remove = (templateID, index) => {
    Modal.confirm({
      title: '确定要删除数据吗？',
      onOk: () => {
        const {[modelNameSpace]: {data: {list, total}}, model} = this.props;
        model.remove({templateID}).then(res => {
          if (res) {
            list.remove(index);
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

  componentDidMount() {
    this.getList(1);
  }

  renderSearchForm() {
    const {
      [modelNameSpace]:
        {
          filterKeys,
          sorter: {sorterColumn, sorterType},
          filter: {categoryCode}
        },
      utils,
    } = this.props;
    const item = [
      [
        {
          key: 'categoryCode',
          initialValue: categoryCode || undefined,
          render: () => {
            return (
              <AutoSelect
                typeCode="exam-position-tag"
                style={{width: 120}}
                placeholder="选择岗位标签"
                allowClear
                onSelect={code => {
                  utils.changeFilter({categoryCode: code[0]}).then(_ => this.getList(1));
                }}
              />
            )
          }
        },
        {
          key: 'title',
          initialValue: '',
          render: () => {
            return (
              <Input.Search
                style={{width: 350}}
                enterButton={<Icon type='search'/>}
                placeholder="输入标题关键字进行模糊查询"
                onSearch={value => utils.changeFilter({title: value})
                  .then(_ => this.getList(1))}
              />
            )
          }
        },
      ]
    ];
    const sorter = {
      columns: [
        {title: '创建时间', value: 'createDate'}
      ],
      current: {sorterColumn, sorterType},
      onSorter: value => utils.changeSorter(value).then(_ => this.getList(1)),
    }
    const filters = {
      labels: filterLabels,
      keys: filterKeys,
      onClearFilter: key => {
        utils.clearFilters(key, this.ref.searchForm.props.form, _ => this.getList(1));
      }
    }
    return (
      <SearchForm
        item={item}
        sorter={sorter}
        filters={filters}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    );
  }

  renderTable() {
    const {[modelNameSpace]: {data: {list,}}, utils,loading} = this.props;
    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
      },
      {
        title: '职位标签',
        dataIndex: 'categoryCode',
        render: (text, row) => {
          return (
            <Tooltip placement="top" title="点击标签可筛选模板">
              <Tag
                onClick={e => utils.changeFilter({ categoryCode: text },
                  this.ref.searchForm.props.form, _ => this.getList(1))}
              >{tagData.filter(x => x.itemCode === text)[0].itemName}</Tag>
            </Tooltip>
          );
        }
      },
      {
        title: '岗位等级',
        dataIndex: 'positionLevel',
      },
      {
        title: '分值',
        dataIndex: 'score',
      },
      {
        title: '描述',
        dataIndex: 'desc',
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text) => {
          return Format.Date.Format(text, 'YYYY-MM-DD')
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          const obj = {};
          switch (text) {
            case 1:
              obj.label = '已启用';
              obj.status = 'success';
              break;
            case 0:
              obj.label = '已禁用';
              obj.status = 'warning';
              break;
          }
          return <Badge status={obj.status} text={obj.label}/>
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '编辑',
              submit: () => {
                this.setState({
                  modal: {
                    visible: true,
                    templateID: row.templateID,
                  }
                });
              }
            }
          ];
          const more = [
            {
              label: '删除',
              submit: () => {
                this.remove(row.templateID, index);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      }
    ];
    const actions = [
      {
        isShow: true,
        button: {
          icon: 'plus',
          text: '新建模板',
          className: 'ant-btn-default',
          onClick: () => {
            this.setState({
              modal: {
                visible: true,
                templateID: 0,
                index: -1,
              }
            });
          }
        },
      }
    ];
    return (
      <StandardTable
        // id="oa_exam_template_list"
        rowKey={record => record.templateID}
        dataSource={list}
        showIndex={true}
        columns={columns}
        actions={actions}
        refresh={e => this.getList()}
        tools={['setting', 'refresh']}
        loading={loading.effects[`${modelNameSpace}/get`]}
        page={false}
      />
    )
  }

  renderModal() {
    const {modal: {visible, templateID}} = this.state;
    return (
      <EditPanel
        visible={visible}
        templateID={templateID}
        onCancel={_ => this.setState({
          modal: {visible: false}
        })}
        onOk={this.save}
      />
    )
  }

  render() {
    const {
      [modelNameSpace]:
        {
          data: {total}, pageIndex,
        }, pagination, loading,
    } = this.props;
    const fxLayoutProps = {
      header: {
        title:'试卷模板库',
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList)
      },
    };


    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
