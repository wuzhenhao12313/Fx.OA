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
  Radio,
  Tooltip,
  Checkbox,
  Modal,
  List,
  Row,
  Select,
  Col,
  AutoComplete,
} from 'antd';
import classNames from 'classnames';
import jQuery from 'jquery';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import Color from '../../../utils/rs/Color';
import {IsArray, String} from '../../../utils/rs/Util';
import EditModal from '../../../myComponents/Fx/EditModal';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import FxLayout from '../../../myComponents/Layout/';
import DictTree from '../../../myComponents/Tree/DictTree';
import SearchForm from '../../../myComponents/Form/Search';
import StandardModal from '../../../myComponents/Modal/Standard';
import Editor from '../../../myComponents/Editor/';
import styles from './index.less';
import {fetchApi} from "../../../utils/rs/Fetch";
import UserNameSelect from '../../../myComponents/Select/UserName';

const filterSettings = {
  questionType: {
    formatter: {
      ['1']: '选择题',
      ['2']: '判断题',
      ['3']: '填空题',
      ['4']: '问答题',
      ['5']: '操作题',
    }
  }
}

const filterLabels = {
    userName: '创建者',
    questionType: '题目类型',
    title: '題目標題',
  };

const tagOptions = [
  {
    label: '选择题',
    value: '1',
  },
  {
    label: '判断题',
    value: '2',
  },
  {
    label: '填空题',
    value: '3',
  },
  {
    label: '问答题',
    value: '4',
  },
  {
    label: '操作题',
    value: '5',
  },
];

const modelNameSpace = 'exam-question-list';
const TextArea = Input.TextArea;
const RadioGroup = Radio.Group;
const CheckGroup = Checkbox.Group;
const ButtonGroup = Button.Group;
const Option = Select.Option;
const Fragment = React.Fragment;


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Utils({filter: filterSettings})
@Component.Pagination({model: modelNameSpace})
@Component.Role('oa_exam_question_list')
export default class extends PureComponent {
  state = {
    tab: '',
    modal: {
      visible: false,
      content: null,
      title: '',
      index: null,
      isAdd: false,
    },
    basisModal: {
      visible: false,
      content: '',
      questionID: 0,
      index: -1,
    },
    tagModal:{
      visible: false,
      content: null,
      currentTags:null,
      index:-1,
    },
    currentQuestionType: '',
    optionList: [],
    isMuti: 0,
    selectedItem: 0,
    questionCategory: '',
    userNameDataSource: [],
    inputVisible: false,
    newTagValue:null,
  }

  ref = {
    editForm: null,
    filesUploader: null,
    imagesUploader: null,
    searchForm: null,
    editor: null,
  }

  filterValueFormatter = {
    questionType: {
      ['1']: '选择题',
      ['2']: '判断题',
      ['3']: '填空题',
      ['4']: '问答题',
      ['5']: '操作题',
    }
  }

  changeCategory = (questionCategory) => {
    this.setState({
      questionCategory,
    }, () => {
      this.getList(1);
    });
  }

  getList = (page) => {
    const {
      model, utils,
      [modelNameSpace]:
        {
          pageIndex,
          pageSize,
          sorter,
          filter,
          data: {
            total,
          }
        }
    } = this.props;
    const {questionCategory} = this.state;
    const {getFieldsValue} = this.ref.searchForm.props.form;
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
        ...filter,
        ...getFieldsValue(),
        ...sorter,
        questionCategory,
        isDelete: 0,
      });
    });

    utils.getFilterKeys(getFieldsValue());
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  showEditPanel = (content, model) => {
    const {questionType} = content;
    let state = {};
    if (questionType === "1") {
      state.isMuti = content.isMuti === 1 || content.isMuti === 2;
      state.optionList = content.options.toObject().options;
    }
    state.currentQuestionType = questionType;
    this.setState({
      ...state,
    }, e => this.toggleModal(model));
  }

  clickAddItem = ({key}) => {
    this.setState({
      currentQuestionType: key,
      optionList: [],
      isMuti: 0,
    }, e => this.toggleModal({visible: true, content: null, title: '新增题目', isAdd: true}))
  }

  add = (values) => {
    const {model} = this.props;
    const {modal: {isAdd, content, index}, questionCategory} = this.state;
    let {answer, options, questionImageList} = values;
    const {resetFields} = this.ref.editForm.props.form;
    if (this.state.currentQuestionType === "1") {
      answer = values.isMuti === 0 && !IsArray(answer) ? [answer] : answer;
      const _options = options.toList("\n");
      _options.map((item, idx) => {
        item.trim();
        if (String.IsNullOrEmpty(item)) {
          _options.remove(idx);
        }
      });
      values.options = JSON.stringify({options: _options});
    }
    else if (this.state.currentQuestionType === "5") {
      values.options = JSON.stringify({options: values.options});
    }
    else {
      answer = [answer];
    }
    answer = JSON.stringify({answer,});
    values.questionImageList = questionImageList ? JSON.stringify(values.questionImageList) : null;
    if (isAdd) {
      model.add({
        questionEntity: {
          ...values,
          answer,
          questionCategory,
        }
      }).then(res => {
        const {success, data} = res;
        if (success) {
          this.setState({
            modal: {
              ...this.state.modal,
              content: null,
            }
          }, () => {
            if (this.state.currentQuestionType === "5") {
              const {clearFileList} = this.ref.filesUploader;
              clearFileList();
            }
            else {
              const {clearImageList} = this.ref.imagesUploader;
              clearImageList();
            }
            resetFields();
          });
          const {[modelNameSpace]: {data: {list, total}}} = this.props;
          const record = data.toObject().record;
          list.splice(index, index, record);
          model.setState({
            data: {
              list,
              total,
            }
          });
        }
      });
    } else {
      model.edit({
        questionEntity: {
          ...content,
          ...values,
          answer,
        }
      }).then(res => {
        const {success, data} = res;
        if (success) {
          const {[modelNameSpace]: {data: {list, total}}, model} = this.props;
          const record = data.toObject().record;
          list.splice(index, 1, record);
          model.setState({
            data: {
              list,
              total,
            }
          });
          this.toggleModal({visible: false});
          // this.changeTab(this.state.currentQuestionType);
        }
      });
    }
  }

  edit = () => {
    const { model } = this.props;
    const { index,currentTags, } = this.state.tagModal;
    const { [modelNameSpace]: { data: { list,total, } }} = this.props;
    const content = list[index];
    model.edit({
      questionEntity: {
        ...content,
        questionTags:currentTags,
      }
    }).then(res => {
      const {success, data} = res;
      if (success) {
        const record = data.toObject().record;
        list.splice(index, 1, record);
        model.setState({
          data: {
            list,
            total,
          }
        });
        this.setState({
          tagModal: {
            visible: false,
          }
        });
        // this.changeTab(this.state.currentQuestionType);
      }
    });
  }

  changeOptions = (item) => {
    const {setFieldsValue} = this.ref.editForm.props.form;
    let value = item.target.value;
    value = value.toList('\n');
    value.map((item, idx) => {
      item.trim();
      if (String.IsNullOrEmpty(item)) {
        value.remove(idx);
      }
    });
    this.setState({
      optionList: value,
    }, () => {
      setFieldsValue({
        answer: null,
      })
    });
  }

  changeMuti = (isMuti) => {
    const {setFieldsValue} = this.ref.editForm.props.form;
    this.setState({
      isMuti,
    }, () => {
      setFieldsValue({
        answer: null,
      })
    })
  }

  remove = (questionID, index) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除题目',
      content: '确定要删除吗？',
      onOk: () => {
        model.remove({questionID,}).then(success => {
          if (success) {
            const {[modelNameSpace]: {data: {list, total}}} = this.props;
            list.splice(index, 1);
            model.setState({
              data: {
                list,
                total,
              }
            });
          }
        });
      }
    });
  };

  use = (questionID, index) => {
    const {model} = this.props;
    model.call('use', {questionID,}).then(res => {
      if (res) {
        const {[modelNameSpace]: {data: {list, total}}} = this.props;
        list[index].status = list[index].status === 0 ? 1 : 0;
        this.setState({
          data: {
            list,
            total,
          }
        })
      }
    });
  }

  changeImageList = (questionImageList) => {
    const {setFieldsValue} = this.ref.editForm.props.form;
    setFieldsValue({
      questionImageList,
    });
  }

  changeFileList = (questionFileList) => {
    const {setFieldsValue} = this.ref.editForm.props.form;
    setFieldsValue({
      options: questionFileList,
    });
  }

  getListTitle = () => {
    const {questionCategory} = this.state;
    let listTitle = '';
    switch (questionCategory) {
      case 'amazon':
        listTitle = '业务-亚马逊';
        break;
      case 'cdiscount':
        listTitle = '业务-CD';
        break;
      case 'advertisement':
        listTitle = '广告';
        break;
      case 'comprehensive':
        listTitle = '综合素质';
        break;
      case 'design':
        listTitle = '设计';
        break;
      case 'extension':
        listTitle = '推广';
        break;
      case 'finance':
        listTitle = '财务';
        break;
      case 'hr':
        listTitle = '人事';
        break;
      case 'bulk-buy':
        listTitle = '后勤-大货采购';
        break;
      case 'bulk-delivery':
        listTitle = '后勤-大货发货';
        break;
      case 'bulk-spec':
        listTitle = '后勤-大货专员';
        break;
      case 'purchase-delivery':
        listTitle = '后勤-散单发货';
        break;
      case 'purchase-buy':
        listTitle = '后勤-散单采购';
        break;
      case 'marry':
        listTitle = '后勤-婚纱礼服质检';
        break;
      case 'supply-chain':
        listTitle = '后勤-供应链';
        break;
      case 'warehouse':
        listTitle = '后勤-库管';
        break;
    }
    return listTitle;
  }

  clickCreateUser = (userName) => {
    const {setFieldsValue} = this.ref.searchForm.props.form;
    setFieldsValue({
      userName,
    });
    this.getList(1);
  }

  saveBasis = () => {
    const {basisModal: {questionID, content, index}} = this.state;
    const {model} = this.props;
    model.call('editQuestionBasis', {
      questionID,
      questionBasis: content,
    }).then(res => {
      if (res) {
        const {[modelNameSpace]: {data: {list, total}}} = this.props;
        list[index].questionBasis = content;
        model.setState({
          data: {
            list,
            total,
          }
        });
        this.setState({
          basisModal: {
            visible: false,
          }
        });
      }
    });
  }

  changeEditorHtml = (content) => {
    const {basisModal} = this.state;
    this.setState({
      basisModal: {
        ...basisModal,
        content,
      }
    })
  }

  getTagList = () => {
    const { model } = this.props;
    model.call('getTagList');
  }

  openTagModal = (tagModal) => {
    this.setState({
      tagModal,
    }, () => this.getTagList());
  }

  componentDidMount() {
    fetchApi({
      url: '/user/GetUserNameList',
    }).then(res => {
      const {data} = res;
      const {list} = data.toObject();
      this.setState({
        userNameDataSource: list,
      });
    });
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderModal() {
    const {modal: {visible, title, content}, currentQuestionType} = this.state;
    const isAdd = content === null;
    let item = [
      {
        key: 'questionType',
        label: '题目类型',
        value: currentQuestionType,
        render: () => <AutoSelect typeCode="question-type" disabled/>,
      },
      {
        key: 'questionTitle',
        label: '题目标题',
        value: isAdd ? null : content.questionTitle,
        config: {
          rules: [{
            required: true, message: '请输入题目标题',
          }],
        },
        render: () => {
          return <TextArea autosize={{minRows: 4}}/>
        },
      },
      {
        key: 'questionImageList',
        label: '图片',
        value: isAdd ? null : content.questionImageList ? content.questionImageList.toObject() : null,
        isShow: currentQuestionType !== "5",
        render: () => {
          return (
            <PicturesUploader
              ref={node => this.ref.imagesUploader = node}
              defaultFileList={isAdd ? null : content.questionImageList ? content.questionImageList.toObject() : null}
              type="question"
              onChange={this.changeImageList}
            />)
        },
      },
    ];
    let extra = [];
    switch (currentQuestionType) {
      case "1":
        extra = [
          {
            key: 'options',
            label: (
              <span>
              选项&nbsp;
                <Tooltip title="每行填写一个选项">
                <Icon className="text-success" type="info-circle"/>
              </Tooltip>
            </span>
            ),
            value: isAdd ? null : content.options.toObject().options.join('\n'),
            config: {
              rules: [{
                required: true, message: '请输入题目选项',
              }],
            },
            render: () => {
              return <TextArea autosize={{minRows: 4}} onBlur={this.changeOptions}/>
            },
          },
          {
            key: 'isMuti',
            label: '答案类型',
            value: isAdd ? 0 : content.isMuti,
            render: () => {
              return (
                <RadioGroup onChange={e => this.changeMuti(e.target.value !== 0)}>
                  <Radio value={0}>单选</Radio>
                  <Radio value={1}>多选</Radio>
                  <Radio value={2}>不定项</Radio>
                </RadioGroup>
              )
            },
          },
          {
            key: 'answer',
            label: '答案',
            isShow: this.state.isMuti,
            value: isAdd ? null : content.answer.toObject().answer,
            config: {
              rules: [{
                required: true, message: '请选择题目答案',
              }],
            },
            render: () => {
              return (
                <CheckGroup className={styles.horizontalCheck}>{this.state.optionList.map(option => {
                  return <Checkbox key={option} value={option}>{option}</Checkbox>
                })}
                </CheckGroup>
              )
            },
          },
          {
            key: 'answer',
            label: '答案',
            isShow: !this.state.isMuti,
            value: isAdd ? null : content.answer.toObject().answer[0],
            config: {
              rules: [{
                required: true, message: '请选择题目答案',
              }],
            },
            render: () => {
              return (
                <RadioGroup className={styles.horizontalRadio}>
                  {this.state.optionList.map(option => {
                    return <Radio key={option} value={option}>{option}</Radio>
                  })}
                </RadioGroup>
              )
            },
          },
        ];
        break;
      case "2":
        extra = [
          {
            key: 'answer',
            label: '答案',
            value: isAdd ? null : content.answer.toObject().answer[0],
            config: {
              rules: [{
                required: true, message: '请选择题目答案',
              }],
            },
            render: () => {
              return (
                <RadioGroup>
                  <Radio value={1}>对</Radio>
                  <Radio value={0}>错</Radio>
                </RadioGroup>
              )
            },
          },
        ];
        break;
      case "3":
        extra = [
          {
            key: 'answer',
            label: '参考答案',
            value: isAdd ? null : content.answer.toObject().answer[0],
            config: {
              rules: [{
                required: true, message: '请输入题目参考答案',
              }],
            },
            render: () => {
              return <Input placeholder="请输入题目参考答案"/>
            },
          },
        ];
        break;
      case "4":
        extra = [
          {
            key: 'answer',
            label: '参考答案',
            value: isAdd ? null : content.answer.toObject().answer[0],
            render: () => {
              return <TextArea autosize={{minRows: 4}} placeholder="请输入题目参考答案"/>
            },
          },
        ];
        break;
      case "5":
        extra = [
          {
            key: 'options',
            label: '附件',
            value: isAdd ? null : content.options ? content.options.toObject().options : null,
            render: () => {
              return (
                <FilesUploader
                  type="compress"
                  ref={node => this.ref.filesUploader = node}
                  desc={`( 仅支持上传 [.rar , .zip, .7z] 格式的文件 )`}
                  defaultFileList={isAdd ? null : content.options ? content.options.toObject().options : null}
                  onChange={this.changeFileList}
                />
              )
            },
          },
        ];
    }
    item = item.concat(extra);
    item = item.concat([
      {
        key: 'level',
        label: '难度',
        value: isAdd ? null : content.level,
        config: {
          rules: [{
            required: true, message: '请选择题目难度',
          }],
        },
        render: () => {
          return <Rate allowHalf={true} allowClear={true}/>
        },
      },
    ])
    return (
      <EditModal
        item={item}
        visible={visible}
        style={{top: 20}}
        title={title}
        width={600}
        refForm={node => this.ref.editForm = node}
        onCancel={() => this.toggleModal({visible: false})}
        onSubmit={this.add}
      />
    )
  }

  renderBasisModal() {
    const {basisModal: {visible, content}} = this.state;
    return (
      <StandardModal
        visible={visible}
        title="出题依据"
        width={800}
        onCancel={e => {
          this.setState({
            basisModal: {
              visible: false,
            }
          })
        }}
        onOk={this.saveBasis}
      >
        <Editor
          id="editor"
          defaultValue={content}
          // ref={node=>this.ref.editor=node}
          onChange={this.changeEditorHtml}
        />
      </StandardModal>
    )
  }

  renderList() {
    const {[modelNameSpace]: {data: {list,}}} = this.props;
    return (
      <List
        className={styles.questionList}
        itemLayout="vertical"
        dataSource={list}
        renderItem={(item, index) => this.renderListItem(item, index)}
      />
    )
  }

  renderListItem = (item, idx) => {
    const questionItem = jQuery(".ant-list-item");
    const imageDivWidth = questionItem.width();
    const {selectedItem} = this.state;
    let {isMuti, options, answer, level, questionID, createDate, createUserName, status, questionImageList, questionType,questionTags} = item;
    let text;
    questionImageList = questionImageList ? questionImageList.toObject() : [];
    const questionTagList = questionTags ? questionTags.toList() : [];
    switch (questionType) {
      case "1":
        switch (isMuti) {
          case 1:
            text = "多选题";
            break;
          case 2:
            text = "不定项选择题";
            break;
          default:
            text = "单选题";
            break;
        }
        break;
      case "2":
        text = "判断题";
        break;
      case "3":
        text = "填空题";
        break;
      case "4":
        text = "问答题";
        break;
      case "5":
        text = "操作题";
        break;
    }
    switch (isMuti) {
      case 1:
        text = "多选题";
        break;
      case 2:
        text = "不定项选择题";
        break;
    }
    return (
      <List.Item
        className={classNames({
          [styles.questionItem]: true,
          [styles.questionItemSelected]: questionID === selectedItem,
        })}
        onClick={e => this.selectItem(questionID)}
      >
        <List.Item.Meta
          title={
            <div className={styles.questionTitle}>
              <span style={{width: 30, display: 'inline-block', position: 'absolute'}}>{`${idx + 1}、`}</span>
              <div>
                {item.questionTitle.split('\n').map((_text, _idxText) => {
                  return (<div style={{textIndent: 25}} key={_idxText}>{_text}</div>)
                })}
              </div>
              <div>
                <span className={styles.questionTitleText}>[{text}]</span>
                <span className={styles.questionTitleLevel}>
                <Rate
                  allowHalf
                  disabled
                  value={level}/>
                </span>
              </div>
              {questionImageList.length > 0 ?
                <Row style={{marginTop: 12}}>
                  {questionImageList.map((url, index) => {
                    return (
                      <div
                        style={{maxWidth: imageDivWidth, overflow: 'auto', display: 'inline-block', marginRight: 12}}
                      >
                        <img key={index} src={url} alt=""/>
                      </div>
                    )
                  })}
                </Row> : null
              }
            </div>
          }
          description={this.renderListDescription(item, idx)}

        />
        <Tag
          color={status === 1 ? Color.Success : Color.Warning}
          style={{marginRight: 20}}
          onClick={e => this.use(questionID, idx)}
        >{status === 1 ? "已发布" : "未发布"}</Tag>
        <span className={styles.questionCreateDate}
              style={{marginRight: 20}}>创建时间：{Format.Date.Format(createDate)}</span>
        <span
          className={styles.questionCreateUser}
          onClick={e => this.clickCreateUser(createUserName)}
        >创建人员：
          <span className={styles.userName}>
            {createUserName}
            </span>
        </span>
        <span style={{marginLeft:20}}>
        {
          questionTagList.map(_tag => {
            return (
              <Tag color='green' key={_tag}>{_tag}</Tag>
            )
          })
        }
        </span>

        <ButtonGroup
          className={styles.actionBar}
          style={{marginLeft: 20}}
        >
          <Button
            icon="edit"
            type='primary'
            onClick={e => this.showEditPanel(item, {
              visible: true,
              content: item,
              index: idx,
              title: '编辑题目',
              isAdd: false,
            })}
          />

          <Button
            icon="search"
            type='primary'
            onClick={e => {
              this.setState({
                basisModal: {
                  visible: true,
                  content: item.questionBasis,
                  questionID: item.questionID,
                  index: idx,
                }
              })
            }}
          />
          <Button
            icon='tag'
            type='primary'
            onClick={e => this.openTagModal({visible:true,currentTags:item.questionTags,index:idx})}
          />
          <Button
            icon="delete"
            type='primary'

            onClick={e => this.remove(questionID, idx)}
          />
        </ButtonGroup>

      </List.Item>
    )
  }

  renderListDescription = (item, idx) => {
    let {questionType, isMuti, options, answer, level, questionID, createDate, createUserName, status, questionBasis} = item;
    questionBasis = questionBasis || "";

    let Comp;
    switch (questionType) {
      case "1":
        options = options ? options.toObject().options : [];
        answer = answer ? answer.toObject().answer : [];
        Comp = (
          <Fragment>
            {
              isMuti === 0 ?
                <RadioGroup
                  className={styles.horizontalRadio}
                  disabled
                  value={answer[0]}
                >
                  {options.map((option, index) => {
                    return <Radio key={index} value={option}>{option}</Radio>
                  })}
                </RadioGroup> :
                <CheckGroup
                  disabled
                  className={styles.horizontalCheck}
                  value={answer}
                >
                  <Row>
                    {options.map((option, index) => {
                      return (
                        <Checkbox key={index} value={option}>{option}</Checkbox>)
                    })}
                  </Row>
                </CheckGroup>
            }
          </Fragment>
        );
        break;
      case "2":
        answer = answer ? answer.toObject().answer : [""];
        Comp = (
          <Fragment>
            <RadioGroup className={styles.horizontalRadio} value={answer[0]}>
              <Radio value={1}>对</Radio>
              <Radio value={0}>错</Radio>
            </RadioGroup>
          </Fragment>
        );
        break;
      case "3":
        answer = answer ? answer.toObject().answer : [""];
        Comp = (
          <Fragment>
            <div>
              <div style={{fontWeight: 'bold', color: '#373d41'}}>参考答案：</div>
              {answer[0] ? answer[0].split('\n').map((i, _idx) => {
                return <div key={_idx}>{i}</div>;
              }) : null
              }
            </div>
          </Fragment>
        );
        break;
      case "4":
        answer = answer ? answer.toObject().answer : [""];
        Comp = (
          <Fragment>
            <div style={{fontWeight: 'bold', color: '#373d41'}}>参考答案：</div>
            {answer[0] ? answer[0].split('\n').map((i, _idx) => {
              return <div key={_idx}>{i}</div>;
            }) : null
            }
          </Fragment>
        );
        break;
      case "5":
        options = options ? options.toObject().options : [];
        Comp = (
          <Fragment>
            {options && options.length > 0 ?
              <Fragment>
                <div style={{fontWeight: 'bold', color: '#373d41'}}>附件下载：</div>
                {options.map(opt => {
                  const {name, url} = opt;
                  return (<div key={name}><a download={name} href={url}>{name}</a></div>)
                })}
              </Fragment> : null}
          </Fragment>
        );
    }
    return (
      <Fragment>
        {Comp}
        <Fragment>
          <div style={{fontWeight: 'bold', color: '#373d41', marginTop: 12}}>出题依据：</div>
          <div dangerouslySetInnerHTML={{__html: questionBasis}}/>
        </Fragment>
      </Fragment>
    );
  }

  selectItem = (selectedItem) => {
    this.setState({
      selectedItem,
    });
  }

  renderSearchForm() {
    const {
      utils,
      [modelNameSpace]:
        {
          filter: {userName, title},
          filterKeys,
          sorter: {sorterType, sorterColumn}
        }
    } = this.props;
    const item = [
      [
        {
          key: 'userName',
          initialValue: userName,
          render: () => {
            return (
              <UserNameSelect
                style={{width: 150}}
                data={{options: this.state.userNameDataSource}}
                placeholder='输入员工姓名'
                onChange={value => utils.changeFilter({userName: value}).then(_ => this.getList(1))}
              />
            )
          }
        },
        {
          key: 'title',
          initialValue: title,
          render: () => {
            return (<Input.Search
              style={{width: 350}}
              placeholder="输入题目标题进行模糊查询"
              enterButton={<Icon type='search'/>}
              onSearch={value => utils.changeFilter({title: value}).then(_ => this.getList(1))}
            />)
          }
        },
      ]
    ];
    const sorter = {
      columns: [
        {title: '创建时间', value: 'createDate'},
        {title: '难度等级', value: 'level'}
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
    }
    return (
      <SearchForm
        item={item}
        filters={filters}
        sorter={sorter}
        wrappedComponentRef={node => this.ref.searchForm = node}
      />
    )
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ newTagValue: e.target.value });
  }

  handleInputConfirm = () => {
    const { newTagValue } = this.state;
    const { model } = this.props;
    if (String.IsNullOrEmpty(newTagValue)) {
      this.setState({
        inputVisible: false,
        newTagValue: '',
      });
      return;
    }
    Modal.confirm({
      title: '新建标签',
      content: '确定要保存吗?',
      onOk: () => {
        model.call('createTag', {
          tagName: newTagValue,
        }).then(success => {
          if (success) {
            this.getTagList();
          }
          this.setState({
            inputVisible: false,
            newTagValue: '',
          });
        });
      },
      onCancel: () => {
        this.setState({
          inputVisible: false,
          newTagValue: '',
        });
      }
    })

  }

  setCurrentTag = (isAdd, tagName) => {
    console.log(isAdd)
    const { currentTags } = this.state.tagModal;
    let currentTagList = [];
    if (isAdd) {
      currentTagList = currentTags.toList();
      const index = currentTagList.findIndex(x => x === tagName);
      currentTagList.splice(index, 1);
    } else {
      currentTagList = currentTags ? currentTags.toList() : [];
      currentTagList.push(tagName);
    }
    this.setState({
      tagModal: {
        ...this.state.tagModal,
        currentTags: currentTagList.join(','),
      }
    });
  }

  removeTag = (tagID) => {
    const { model } = this.props;
    Modal.confirm({
      title: '删除标签',
      content: '',
      onOk: () => {
        model.call('removeTag', {
          tagID,
        }).then(res => {
          if (res) {
            this.getTagList();
          }
        });
      }
    });
  }

  saveInputRef = input => this.input = input;

  renderTagModal() {
    let { tagList, } = this.props[modelNameSpace];
    tagList = tagList || [];
    const { visible, currentTags } = this.state.tagModal;
    const currentTagsList = currentTags ? currentTags.toList() : [];
    return (
      <StandardModal
        visible={visible}
        title='标签'
        width={500}
        onCancel={e => this.setState({ tagModal: { visible: false } })}
        onOk={this.edit}
      >
        {tagList.map(tag => {
          const isAdd = currentTagsList.contains(tag.name);
          const colorprops = isAdd ? { color: Color.Success } : {};
          return (
            <Tag
              {...colorprops}
              key={tag.name}
              onClick={e => this.setCurrentTag(isAdd, tag.name)}
              closable
              onClose={e => this.removeTag(tag.id)}
            >{tag.name}</Tag>
          )
        })}
        {this.state.inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            value={this.state.newTagValue}
            style={{ width: 78 }}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!this.state.inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <Icon type="plus" /> 新建标签
          </Tag>
        )}
      </StandardModal>
    )
  }

  render() {
    const {
      pagination,
      utils,
      loading,
      [modelNameSpace]:
        {
          pageIndex,
          data: {total},
          sorter: {
            sorterType,
            sorterColumn,
          },
          filter: {
            questionType,
          }
        }
    } = this.props;
    const {modal, basisModal,tagModal} = this.state;
    const actions = [
      {
        isShow: true,
        button: {
          icon: "retweet",
          className: 'ant-btn-default',
          onClick: () => {
            this.getList();
          }
        },
      },
      {
        isShow: true,
        render: () => {
          const menu = (
            <Menu onClick={this.clickAddItem}>
              <Menu.Item key="1">选择题</Menu.Item>
              <Menu.Item key="2">判断题</Menu.Item>
              <Menu.Item key="3">填空题</Menu.Item>
              <Menu.Item key="4">问答题</Menu.Item>
              <Menu.Item key="5">操作题</Menu.Item>
            </Menu>
          );
          return (
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button type='primary'>
                新增<Icon type="down"/>
              </Button>
            </Dropdown>
          );
        }
      },
    ];

    const fxLayoutProps = {
      header: {
        title: `题目列表`,
        actions,
        extra: this.renderSearchForm(),
        tabs: {
          items: [
            {title: '全部', key: ''},
            {title: '选择题', key: '1'},
            {title: '判断题', key: '2'},
            {title: '填空题', key: '3'},
            {title: '问答题', key: '4'},
            {title: '操作题', key: '5'},
          ],
          activeKey: questionType || '',
          onTabChange: tab => utils.changeFilter({questionType: tab}).then(_ => this.getList(1)),
        },
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      },
      body: {
        center: this.renderList(),
        loading: loading.effects[`${modelNameSpace}/get`],
      },
      left: (
        <DictTree
          expand
          init
          typeCode="question-category"
          handleSelect={code => this.changeCategory(code[0])}
        />
      ),
    };

    return (
      <Fragment>
        <FxLayout {...fxLayoutProps} />
        {modal.visible ? this.renderModal() : null}
        {basisModal.visible ? this.renderBasisModal() : null}
        {tagModal.visible?this.renderTagModal():null}
      </Fragment>
    )

  }
}
