import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Select, Badge,Modal} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import {formatDate} from '../../../utils/utils';
import UserSelect from '../../../myComponents/Select/User';
import SearchForm from '../../../myComponents/Form/Search';
import EditModal from '../../../myComponents/Fx/EditModal';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import LoadingService from '../../../utils/rs/LoadingService';

const modelNameSpace = "exam-record";
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
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_exam_record')
export default class extends PureComponent {
  state = {
    recordStatus: "0",
    modal: {
      visible: false,
    }
  }

  componentDidMount() {
    this.getList(1);
  }

  ref = {
    searchForm: null,
    editForm: null,
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



  getPaperList = (data) => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.editForm.props.form;
    const {categoryCode, positionLevel} = getFieldsValue();
    const params = {
      categoryCode,
      positionLevel,
      ...data,
    };
    model.call("getPaperList", params);
  }

  createExam = (values) => {
    const { model } = this.props;
    LoadingService.Start();
    model.call("createExam", {
      ...values,
    }).then(success => {
      if (success) {
        this.getList(1);
        LoadingService.Done();
        this.setState({
          modal: {
            visible: false,
          }
        });
      }
    });
  }

  remove = (recordID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除考试记录',
      content: '确定要删除吗，删除记录后将无法恢复',
      onOk: () => {
        model.remove({
          recordID,
        }).then(success => {
          if (success) {
            this.getList(1);
          }
        });
      }
    });
  }

  getStatusText = (status) => {
    let text = "";
    let _status = "";
    switch (status) {
      case 0:
        text = "待审核";
        _status = "warning";
        break;
      case 1:
        text = "待考试";
        _status = "processing";
        break;
      case 4:
        text = "考试中";
        _status = "processing";
        break;
      case 5:
        text = "待阅卷";
        _status = "error";
        break;
      case 6:
        text = "已完成";
        _status = "success";
        break;
    }
    return {
      text,
      status: _status,
    };
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
        title: '考试人员',
        dataIndex: 'examUserName',
      },
      {
        title: '工号',
        dataIndex: 'examJobNumber',
      },
      {
        title: '准考证号',
        dataIndex: 'quasiNo',
      },
      {
        title: '考试状态',
        dataIndex: 'status',
        render: (text) => {
          const obj = this.getStatusText(text);
          return <Badge text={obj.text} status={obj.status}/>;
        }
      },
      {
        title: '考试成绩',
        dataIndex: 'examScore',
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row) => {
          const action = [
            {
              isShow: row.status === 5,
              label: '批卷',
              target: '_blank',
              href: `/#/blank/exam/paper/batch?paperID=${row.paperInsID}`,
            },
            {
              isShow: row.status === 6,
              label: '查看试卷',
              target: '_blank',
              href: `/#/blank/exam/paper/batch?paperID=${row.paperInsID}`,
            }
          ];

          const more = [
            {
              isShow: row.status === 0 || row.status === 1||row.status===4,
              label: '删除',
              submit: () => {
                this.remove(row.recordID);
              }
            },

          ]

          return (
            <TableActionBar action={action} more={more}/>
          )
        }
      },
    ];
    const actions = [
      {
        button: {
          icon: 'arrow-right',
          text: '发起考试',
          type: 'primary',
          onClick: () => {
            this.setState({modal: {visible: true}})
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

  renderSearchForm() {
    const item = [
      [
        {
          key: 'recordStatus',
          label: '状态',
          render: () => {
            return (
              <Select
                style={{width: 120}}
                allowClear
              >
                <Option value={0}>待审核</Option>
                <Option value={1}>待考试</Option>
                <Option value={5}>待阅卷</Option>
                <Option value={6}>已完成</Option>
              </Select>
            )
          }
        },
        {
          key: 'userID',
          label: '人员',
          render: () => {
            return (
              <UserSelect
                style={{ width: 150 }}
                workStatusList={
                  ['working','trial','internShip','temporary']
                }
                allowClear
              />
            )
          }
        },
      ]
    ];
    return (
      <SearchForm
        item={item}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    );
  }

  renderModal() {
    const {modal: {visible}} = this.state;
    const {paperList} = this.props[modelNameSpace];
    const item = [
      {
        label: '职位类型',
        key: 'categoryCode',
        rules: [
          {required: true, message: '请选择职位类型'},
        ],
        render: () => {
          return (
            <AutoSelect
              typeCode='exam-position-tag'
              placeholder='请选择职位类型'
              onSelect={value => this.getPaperList({categoryCode: value,})}
            />
          )
        }
      }, {
        label: '职位等级',
        key: 'positionLevel',
        rules: [
          {required: true, message: '请选择岗位等级'},
        ],
        render: () => {
          return (
            <Select
              allowClear
              placeholder="请选择岗位等级"
              onSelect={value => this.getPaperList({positionLevel: value,})}
            >
              <OptionGroup label="业务岗">
                <Option value="B1">B1</Option>
                <Option value="B2">B2</Option>
                <Option value="B3">B3</Option>
                <Option value="B4">B4</Option>
                <Option value="B5">B5</Option>
                <Option value="B6">B6</Option>
                <Option value="B7">B7</Option>
                <Option value="B8">B8</Option>
                <Option value="B9">B9</Option>
                <Option value="B10">B10</Option>
              </OptionGroup>
              <OptionGroup label="职能岗">
                <Option value="S1">S1</Option>
                <Option value="S2">S2</Option>
                <Option value="S3">S3</Option>
                <Option value="S4">S4</Option>
                <Option value="S5">S5</Option>
                <Option value="S6">S6</Option>
                <Option value="S7">S7</Option>
                <Option value="S8">S8</Option>
                <Option value="S9">S9</Option>
                <Option value="S10">S10</Option>
              </OptionGroup>
            </Select>
          )
        },
      },
      {
        label: '考试人员',
        key: 'userIdList',
        render: () => {
          return (
            <UserSelect
              mode="multiple"
              workStatusList={
                ['working','trial','internShip','temporary']
              }
              allowClear
            />
          )
        }
      },
      {
        label: '默认试卷',
        key: 'defaultPaperID',
        rules: [
          {required: true, message: '请选择默认试卷'},
        ],
        render: () => {
          return (
            <Select
              allowClear
            >
              {paperList.map(x => {
                return (
                  <Option key={x.paperID} value={x.paperID}>{x.title}</Option>
                )
              })}
            </Select>
          )
        }
      }
    ];
    return (
      <EditModal
        item={item}
        title='发起考试'
        visible={visible}
        onCancel={e => this.setState({modal: {visible: false}})}
        refForm={node => this.ref.editForm = node}
        onSubmit={values => this.createExam(values)}
      />
    )
  }

  render() {
    const {pagination, loading} = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {recordStatus} = this.state;


    const fxLayoutProps = {
      header: {
        title: `考试记录汇总`,
        extra: this.renderSearchForm(),
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
        {this.state.modal.visible ? this.renderModal() : null}
      </Fragment>
    )
  }
}
