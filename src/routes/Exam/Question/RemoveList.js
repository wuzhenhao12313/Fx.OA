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
} from 'antd';
import classNames from 'classnames';
import jQuery from 'jquery';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import Color from '../../../utils/rs/Color';
import {IsArray, String} from '../../../utils/rs/Util';
import ConsoleTitle from '../../../myComponents/Fx/ConsoleTitle';
import EditModal from '../../../myComponents/Fx/EditModal';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import TagRadio from '../../../myComponents/Fx/TagRadio';
import FxLayout from '../../../myComponents/Layout/';
import Pagination from '../../../myComponents/Fx/Pagination';
import DictTree from '../../../myComponents/Tree/DictTree';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';


const modelNameSpace = 'exam-question-list';
const TextArea = Input.TextArea;
const RadioGroup = Radio.Group;
const CheckGroup = Checkbox.Group;
const ButtonGroup = Button.Group;
const Fragment = React.Fragment;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
}))//注入state
@Component.Model(modelNameSpace)//注入model
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
    currentQuestionType: '',
    optionList: [],
    isMuti: 0,
    selectedItem: 0,
    questionCategory: '',
  }

  ref = {
    editForm: null,
    filesUploader: null,
    imagesUploader: null,
  }

  changeCategory = (questionCategory) => {
    this.setState({
      questionCategory,
    }, () => {
      this.getList(1);
    });
  }

  getList = (page) => {
    const {model, [modelNameSpace]: {pageIndex, pageSize, total, questionType}} = this.props;
    const {questionCategory} = this.state;
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
        questionType,
        questionCategory,
        isDelete: 1,
      });
    })

  }

  changeTab = (questionType, page) => {
    const {model} = this.props;
    model.setState({
      questionType,
    }).then(_ => {
      this.getList(page);
    })
  }


  clearTrash = () => {

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

  componentDidMount() {

  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }


  renderList() {
    const {[modelNameSpace]: {data: {list, loading}}} = this.props;
    return (
      <List
        className={styles.questionList}
        itemLayout="vertical"
        dataSource={list}
        loading={loading}
        renderItem={(item, index) => this.renderListItem(item, index)}
      />
    )
  }

  renderListItem = (item, idx) => {
    const questionItem = jQuery(".ant-list-item");
    const imageDivWidth = questionItem.width();
    const {selectedItem} = this.state;
    let {isMuti, options, answer, level, questionID, createDate, createUserName, status, questionImageList, questionType} = item;
    let text;
    questionImageList = questionImageList ? questionImageList.toObject() : [];
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
              {`${idx + 1}、${item.questionTitle}`}
              < span style={{color: '#09c', marginLeft: 10}}>[{text}]</span>
              <span style={{marginLeft: 10, position: 'relative', top: 3}}>
                <Rate
                  allowHalf
                  value={level}/>
              </span>
              {questionImageList.length > 0 ?
                <Row style={{marginTop: 12}}>
                  {questionImageList.map((url, index) => {
                    return (
                      <div
                        style={{maxWidth: imageDivWidth, overflow: 'auto', display: 'inline-block', marginRight: 12}}>
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
          color={Color.Error}
          style={{marginRight: 20}}
        >已删除</Tag>
        <span style={{marginRight: 20}}>创建时间：{Format.Date.Format(createDate)}</span>
        <span>创建人员：{createUserName}</span>
        <ButtonGroup
          className={styles.actionBar}
          style={{marginLeft: 20}}
        >
          <Button
            type='primary'
            onClick={e => this.showEditPanel(item, {
              visible: true,
              content: item,
              index: idx,
              title: '编辑题目',
              isAdd: false,
            })}
          >还原</Button>
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
        {questionType !== "5" ?
          <Fragment>
            <div style={{fontWeight: 'bold', color: '#373d41', marginTop: 12}}>出题依据：</div>
            <div>{questionBasis.split('\n').map((i, _idx) => {
              return <div key={_idx}>{i}</div>;
            })}</div>
          </Fragment> : null
        }
      </Fragment>
    );
  }

  selectItem = (selectedItem) => {
    this.setState({
      selectedItem,
    });
  }

  render() {
    const {[modelNameSpace]: {questionType}} = this.props;
    const {pagination, [modelNameSpace]: {pageIndex, data: {total},}} = this.props;
    const {modal} = this.state;
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
        button: {
          icon: "delete",
          type: 'danger',
          text: '清空回收站',
          onClick: () => {
            this.getList();
          }
        },
      },
    ];
    const tagOptions = [
      {
        label: '全部',
        value: '',
      },
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
    const fxLayoutProps = {
      center: {
        header: <ConsoleTitle
          title={`已删除题目列表(${this.getListTitle()})`}
          left={<TagRadio
            current={questionType}
            options={tagOptions}
            onSelect={value => this.changeTab(value, 1)}
          />}
          actions={actions}
        />,
        body: this.renderList(),
        footer: <Pagination pagination={pagination({pageIndex, total}, this.getList)}/>,
      },
      left: {
        header: <ConsoleTitle title='题目业务类别'/>,
        body: (
          <DictTree
            expand
            init
            typeCode="question-category"
            handleSelect={code => this.changeCategory(code[0])}
          />)
      }
    }

    return (
      <PageHeaderLayout>
        <FxLayout {...fxLayoutProps} />
        {modal.visible ? this.renderModal() : null}
      </PageHeaderLayout>
    )

  }
}
