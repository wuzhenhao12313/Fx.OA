import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Tag,
  Rate,
  Icon,
  Menu,
  Button,
  Dropdown,
  Input,
  InputNumber,
  Radio,
  Tooltip,
  Checkbox,
  Modal,
  List,
  Row,
  Select,
  Badge,
} from 'antd';
import classNames from 'classnames';
import RcPrint from 'rc-print';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import Color from '../../../utils/rs/Color';
import {IsArray, String} from '../../../utils/rs/Util';
import EditModal from '../../../myComponents/Fx/EditModal';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import FxLayout from '../../../myComponents/Layout/';
import EditForm from '../../../myComponents/Form/Edit';
import StandardTable from '../../../myComponents/Table/Standard';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import SearchForm from '../../../myComponents/Form/Search';
import {fetchDictSync} from "../../../utils/rs/Fetch";
import StandardModal from '../../../myComponents/Modal/Standard';
import Uri from '../../../utils/rs/Uri';
import {getPathName} from '../../../utils/utils';
import styles from './index.less';
import Print from './Print';


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

const modelNameSpace = 'exam-paper';
const TextArea = Input.TextArea;
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
@Component.Role('oa_exam_paper_list')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    templateModal: {
      visible: false,
    },
    printModal: {
      visible: false,
    },
    currentOperation: 0,
    isDelete: 0,
  };

  ref = {
    searchForm: null,
  };


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
        isDelete: this.state.isDelete,
        ...filters,
        ...sorter,
      })
    });
    utils.getFilterKeys(getFieldsValue());
  };

  createPaper = ({key}) => {
    const {model} = this.props;
    if (key === "1") {

    }
    if (key === "2") {
      model.call('getAllTemplateList');
      this.setState({
        templateModal: {
          visible: true,
        }
      });
    }
  };

  addPaperByTemplate = (values) => {
    const {model} = this.props;
    LoadingService.Start('正在后台生成试卷中，请稍后......');
    model.call('addPaperByTemplate', {
      ...values,
    }).then(({success, record}) => {
      if (success) {
        this.setState({
          templateModal: {
            visible: false,
          }
        });
        const {data: {list, total}} = this.props[modelNameSpace];
        list.unshift(record);
        model.setState({
          list,
          total: total + 1,
        });
      }
      LoadingService.Done();
    });
  }

  edit = (values, index, type) => {
    const {model} = this.props;
    let {data: {list, total}} = this.props[modelNameSpace];
    model.edit({
      paperEntity: {
        ...list[index],
        ...values,
      },
    }).then(({success, record}) => {
      if (success) {
        if (type === "remove") {
          list.remove(index);
        } else {
          list.splice(index, 1, record);
          total -= 1;
        }
        model.setState({
          data: {
            list,
            total,
          }
        });
      }
    })
  };

  remove = (paperID = 0, index) => {
    Modal.confirm({
      title: '确定要清除数据吗?',
      content: '清除数据后将无法恢复',
      onOk: () => {
        const {model} = this.props;
        let {data: {list, total}} = this.props[modelNameSpace];
        model.remove({paperID}).then(success => {
          if (paperID) {
            list.remove(index);
            total -= 1;
            model.setState({
              data: {
                list,
                total,
              }
            });
          } else {
            model.setState({
              data: {
                list: [],
                total: 0,
              }
            });
          }
        });
      }
    });
  }

  openPrintModal = (paperID) => {
    const {model} = this.props;
    model.call('getReviewItem', {paperID}).then(res => {
      this.setState({
          printModal: {
            visible: true,
          }
        }
      );
    });
  }

  startPrint = () => {
    this.refs.rcPrint.onPrint();
    this.setState({
      printModal: {
        visible: false,
      }
    })
  }

  renderTemplateModal() {
    const {templateModal: {visible,}, currentOperation} = this.state;
    const {[modelNameSpace]: {paperTemplateList}} = this.props;
    const item = [
      {
        label: '试卷标题',
        key: 'title',
        config: {
          rules: [
            {required: true, message: '请输入试卷标题',}
          ],
        },
        render: () => {
          return (
            <Input placeholder='请输入试卷标题'/>
          )
        }
      },
      {
        label: '试卷类型',
        key: 'isOperation',
        initialValue: 0,
        rules: [
          {required: true, message: '请输入试卷标题',}
        ],
        render: () => {
          return (
            <Select placeholder='请选择试卷类型' onSelect={value => {
              this.setState({
                currentOperation: value,
              });
            }}>
              <Option value={0}>理论考</Option>
              <Option value={1}>操作考</Option>
            </Select>
          )
        },
      },
      {
        label: '使用模板',
        key: 'templateID',
        rules: [
          {required: true, message: '请选择试卷模板'},
        ],
        render: () => {
          return (
            <AutoSelect showSearch>
              {paperTemplateList.map(item => {
                const {templateID, title} = item;
                return (<Option value={templateID} key={templateID}>{title}</Option>)
              })}
            </AutoSelect>
          )
        }
      },
      {
        label: '考试时限',
        key: 'time',
        rules: [
          {required: true, message: '请输入考试时限'},
          {pattern: /^[1-9]\d*$/, message: '请输入正确的考试时限'}
        ],
        render: () => {
          return <Input addonBefore={`单位： ${currentOperation === 0 ? '分钟' : '天'}`}/>
        }
      },
    ];
    return (
      <StandardModal
        width={450}
        visible={visible}
        title="从模板生成试卷"
        onCancel={e => this.setState({
          templateModal: {visible: false}
        })}
        footer={null}
      >
        <EditForm
          labelCol={5}
          item={item}
          onSubmit={values => this.addPaperByTemplate(values)}
          submitButton={{text: '开始生成试卷', icon: 'arrow-right'}}
        />
      </StandardModal>
    )
  }

  renderPrintModal() {
    const {printModal: {visible}} = this.state;
    const {[modelNameSpace]: {item: {row, list}}} = this.props;
    return (
      <StandardModal
        visible={visible}
        title='打印预览'
        width={948}
        style={{top: 20}}
        onCancel={e => this.setState({printModal: {visible: false}})}
        onOk={this.startPrint}
      >
        <RcPrint ref="rcPrint" clearIframeCache>
          <Print row={row} list={list}/>
        </RcPrint>
      </StandardModal>
    )
  }

  componentDidMount() {
    const isDelete = Uri.Match('/exam/paper/remove', getPathName());
    if (isDelete) {
      this.setState({
        isDelete: 1,
      }, () => this.getList(1));
    } else {
      this.getList(1);
    }
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }


  renderSearchForm() {
    const {
      [modelNameSpace]: {
        filterKeys,
        sorter: {sorterColumn, sorterType},
        filter: {categoryCode},
      }
      , utils
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
                style={{width: 150}}
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
        {title: '创建时间', value: 'createDate'},
        {title: '考试次数', value: 'examCount'},
      ],
      current: {sorterColumn, sorterType},
      onSorter: value => utils.changeSorter(value).then(_ => this.getList(1)),
    };
    const filters = {
      labels: filterLabels,
      keys: filterKeys,
      onClearFilter: key => {
        utils.clearFilters(key, this.ref.searchForm.props.form, _ => this.getList(1));
      }
    };
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
    const {
      [modelNameSpace]: {data: {list}},
      utils, loading,
    } = this.props;
    const columns = [
      {
        title: '试卷编号',
        dataIndex: 'serialNo',
      },
      {
        title: '试卷标题',
        dataIndex: 'title',
      },
      {
        title: '试卷类型',
        dataIndex: 'isOperation',
        render: (text, row, index) => {
          return text === 0 ? "理论考" : "操作考";
        }
      },
      {
        title: '岗位标签',
        dataIndex: 'categoryCode',
        render: (text) => {
          return (
            <Tooltip placement="top" title="点击标签可筛选模板">
              <Tag
                // color={Color.Default}
                onClick={e => utils.changeFilter({categoryCode: text}, this.ref.searchForm.props.form, _ => this.getList(1))}
              >{tagData.filter(x => x.itemCode === text)[0].itemName}</Tag>
            </Tooltip>
          )
        }
      },
      {
        title: '岗位等级',
        dataIndex: 'positionLevel',
      },
      {
        title: '试卷分值',
        dataIndex: 'score',
      },
      {
        title: '考试时限',
        dataIndex: 'examMinite',
        render: (text, row, index) => {
          return row.isOperation === 0 ? `${text}分钟` : `${row.examDays}天`;
        }
      },
      {
        title: '考试次数',
        dataIndex: 'examCount',
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
          if (this.state.isDelete) {
            obj.status = "error";
            obj.label = "已删除";
          }
          return (<Badge status={obj.status} text={obj.label}/>);
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const {isDelete} = this.state;
          const action = [
            // {
            //   label: '编辑',
            //   isShow: !isDelete,
            //   submit: () => {
            //     this.setState({
            //       modal: {
            //         visible: true,
            //         templateID: row.templateID,
            //       }
            //     });
            //   }
            // },
            {
              label: '打印',
              isShow: !isDelete,
              submit: () => {
                this.openPrintModal(row.paperID);
              }
            },
            {
              label: '预览',
              target: '_blank',
              href: `/#/blank/exam/paper/review?paperID=${row.paperID}`,
            },
            {
              label: '还原',
              isShow: isDelete,
              submit: () => {
                this.edit({isDelete: 0}, index, "remove");
              }
            },
          ];
          const more = [
            {
              label: row.status === 1 ? '禁用' : '启用',
              isShow: !isDelete,
              submit: () => {
                this.edit({status: row.status === 0 ? 1 : 0}, index);
              }
            },
            {
              label: '删除',
              isShow: !isDelete,
              submit: () => {
                this.edit({isDelete: 1}, index, "remove");
              }
            },
            {
              label: '彻底删除',
              isShow: isDelete,
              submit: () => {
                this.remove(row.paperID, index);
              }
            },
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      }
    ];
    const actions = [
      {
        isShow: !this.state.isDelete,
        dropdown: {
          button: {
            text: '新建试卷',
            className: 'ant-btn-default',
          },
          menuClick: key => this.createPaper(key),
          menu: [
            {
              label: '手动添加',
              key: "1",
              icon: 'edit'
            },
            {
              label: '模板生成',
              key: "2",
              icon: 'file-excel',
            }
          ]
        }
      },
      {
        isShow: this.state.isDelete,
        button: {
          icon: 'delete',
          text: '清空回收站',
          onClick: () => {
            this.remove();
          }
        }
      },
    ];
    return (
      <StandardTable
        rowKey={record => record.paperID}
        actions={actions}
        showIndex={true}
        columns={columns}
        dataSource={list}
        tools={['refresh']}
        loading={loading.effects[`${modelNameSpace}/get`]}
        refresh={e => this.getList(1)}
      />
    )
  }


  render() {
    const {
      loading,
      pagination,
    } = this.props;
    const {data: {total}, pageIndex} = this.props[modelNameSpace];
    const {templateModal, isDelete, printModal} = this.state;
    const fxLayoutProps = {
      pageHeader:{
        title: !isDelete ? '试卷列表' : '回收站',
      },
      header: {

        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      },
    };

    return (
      <Fragment>
        <FxLayout
          {...fxLayoutProps}
        />
        {templateModal.visible ? this.renderTemplateModal() : null}
        {printModal.visible ? this.renderPrintModal() : null}
      </Fragment>
    )
  }
}
