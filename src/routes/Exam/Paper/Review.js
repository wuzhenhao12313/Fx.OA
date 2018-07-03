import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import {
  Tabs,
  Icon,
  List,
  Rate,
  Row,
  Col,
  Checkbox,
  Radio,
  Input,
  BackTop,
  Button,
  Tag,
  Popover,
  InputNumber,
  Modal,
} from 'antd';

import {shuffle, changeNum2Letter, IsArray} from '../../../utils/rs/Util';
import Uri from '../../../utils/rs/Uri';
import styles from './index.less';
import Component from "../../../utils/rs/Component";
import StandardModal from '../../../myComponents/Modal/Standard';
import EditModal from '../../../myComponents/Fx/EditModal';
import AddQuestion from './AddQuestion';

const modelNameSpace = 'exam-paper-review';
const TabPane = Tabs.TabPane;
const Fragment = React.Fragment;
const CheckGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;
const TextArea = Input.TextArea;


const formatter = {
  questionType: {
    ['1']: '选择题',
    ['2']: '判断题',
    ['3']: '填空题',
    ['4']: '问答题',
    ['5']: '操作题',
  }
}


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
export default class extends React.Component {
  state = {
    tab: '1',
    isEdit: false,
    modal: {
      visible: false,
      index: -1,
      record: {},
    },
    addModal: {
      visible: false,
      questionType: '',
    }
  }

  ref = {
    elePaperReview: null,
  }

  componentDidMount() {
    this.getPaper();
    window.addEventListener("keydown", this.save);
  }

  componentWillUnmount() {

    window.removeEventListener('keydown', this.save);
  }

  getPaper = () => {
    const paperID = Uri.Query('paperID');
    const {model} = this.props;
    if (paperID) {
      model.call('getReviewItem', {paperID});
    }
  };

  startEdit = () => {
    this.setState({
      isEdit: true,
    });
  }

  changeRowData = (data) => {
    const { model } = this.props;
    const { item: { row } } = this.props[modelNameSpace];
    model.setState({
      item: {
        ...this.props[modelNameSpace].item,
        row: {
          ...row,
          ...data,
        },
      }
    });
  }

  changeData = (data) => {
    const {key, value, paperQuestionID} = data;
    const {model} = this.props;
    const {item: {list}} = this.props[modelNameSpace];
    const index = list.findIndex(x => x.paperQuestionID === paperQuestionID);
    list[index][key] = value;
    model.setState({
      item: {
        ...this.props[modelNameSpace].item,
        list,
      }
    });
  }

  save = (event) => {
    if (event.ctrlKey === true && event.keyCode === 83) {
      const {model} = this.props;
      const {item: {row, list}} = this.props[modelNameSpace];
      model.call("edit", {
        paperID: Uri.Query('paperID'),
        paperEntity:row,
        paperQuestionList: list,
      }).then(({success, totalScore}) => {
        if (success) {
          row.score = totalScore;
          model.setState({
            item: {
              ...this.props[modelNameSpace].item,
              row,
            }
          });
        }
      });
      event.returnValue = false;
    }
  }

  removeItem = (paperQuestionID) => {
    Modal.confirm({
      title: '删除题目',
      content: '确定要删除吗，删除后将无法恢复',
      onOk: () => {
        const {model} = this.props;
        const {item: {list, row}} = this.props[modelNameSpace];
        model.call("removePaperQuestion", {
          paperQuestionID,
        }).then(({success}) => {
          if (success) {
            let totalScore = 0;
            const index = list.findIndex(x => x.paperQuestionID === paperQuestionID)
            list.splice(index, 1);
            list.forEach(x => {
              totalScore += x.score;
            });
            row.score = totalScore;
            model.setState({
              item: {
                row,
                list,
              }
            });
          }
        })
      }
    })
  }

  renderTabs() {
    const {[modelNameSpace]: {item: {row, list}}} = this.props;
    return (
      <Tabs type="card" animated={true}>
        <TabPane tab={<span><Icon type='filter'/>选择题</span>} key="1">{this.renderTabPane("1")}</TabPane>
        <TabPane tab={<span><Icon type='check-circle'/>判断题</span>} key="2">{this.renderTabPane("2")}</TabPane>
        <TabPane tab={<span><Icon type='edit'/>填空题</span>} key="3">{this.renderTabPane("3")}</TabPane>
        <TabPane tab={<span><Icon type='question-circle'/>问答题</span>} key="4">{this.renderTabPane("4")}</TabPane>
        {row.isOperation === 1 ? <TabPane tab="操作题" key="5">{this.renderTabPane("5")}</TabPane> : null}
      </Tabs>
    )
  }

  renderTabPane = (questionType) => {
    const {[modelNameSpace]: {item: {list}}} = this.props;
    const questionList = list.filter(x => x.questionType === questionType);
    return (
      <div>
        {this.state.isEdit ?
          <Button
            type='dashed'
            style={{width: '100%'}}
            icon='plus'
            size='large'
            onClick={e => this.setState({addModal: {visible: true, questionType,}})}
          >
            {`添加${formatter.questionType[questionType]}`}
          </Button> : null
        }

        <List
          className={styles.questionList}
          itemLayout="vertical"
          dataSource={questionList}
          renderItem={(item, index) => this.renderListItem(item, index)}
        />
      </div>
    )
  };

  renderListItem = (item, itemIndex) => {
    return (
      <List.Item
        className={classNames({
          [styles.questionItem]: true,
        })}>
        <List.Item.Meta
          title={this.renderItemTitle(item, itemIndex)}
          description={this.renderItemDescription(item, itemIndex)}
        />
        {this.state.isEdit ?
          <ButtonGroup
            className={styles.actionBar}
          >
            <Button
              icon="delete"
              type='primary'
              onClick={e => this.removeItem(item.paperQuestionID)}
            />
          </ButtonGroup> : null}
      </List.Item>
    )
  }

  renderItemTitle = (item, itemIndex) => {
    let {isMuti, questionTitle, questionImageList, questionType, paperQuestionID} = item;
    questionImageList = questionImageList ? questionImageList.toObject() : [];
    let text;
    switch (isMuti) {
      case 0:
        text = "单选题";
        break;
      case 1:
        text = "多选题";
        break;
      case 2:
        text = "不定项选择题";
        break;
    }
    return (
      <div className={styles.questionTitle}>
        {questionType === "1" ?
          <Fragment>
            <span>{`${itemIndex + 1}、`}</span>
            <span>{this.state.isEdit ?
              <TextArea value={questionTitle}
                        onChange={e => this.changeData({
                          key: 'questionTitle',
                          value: e.target.value,
                          paperQuestionID
                        })}/>
              : questionTitle}</span>
            <span className={styles.questionTitleTag}>[{text}]</span>
          </Fragment> :
          <Fragment>
            <span style={{width: 30, display: 'inline-block', position: 'absolute'}}>{`${itemIndex + 1}、`}</span>
            {this.state.isEdit ?
              <div>
                <TextArea value={questionTitle}
                          onChange={e => this.changeData({
                            key: 'questionTitle',
                            value: e.target.value,
                            paperQuestionID
                          })}/>
              </div> :
              <div>
                {item.questionTitle.split('\n').map((_text, _idxText) => {
                  return (<div style={{textIndent: 25}} key={_idxText}>{_text}</div>)
                })}
              </div>
            }
          </Fragment>
        }
        {this.state.isEdit ?
          <div>
            (分值：
            <InputNumber
              value={item.score}
              onChange={value => this.changeData({key: 'score', value, paperQuestionID})}/>分)
          </div> :
          <div>
            (分值：{item.score}分)
          </div>
        }
        {questionImageList.length > 0 ?
          <Row style={{marginTop: 12}}>
            {questionImageList.map((url, index) => {
              return (
                <div
                  style={{maxWidth: '836px', overflow: 'auto', display: 'inline-block', marginRight: 12}}
                >
                  <img key={index} src={url} alt=""/>
                </div>
              )
            })}
          </Row> : null
        }
      </div>
    )
  }

  renderItemDescription = (item, itemIndex) => {
    let {isMuti, options, answer, questionType} = item;
    let Comp;
    switch (questionType) {
      case "1":
        options = options ? options.toObject().options : [];
        // options = shuffle(options);
        answer = answer ? answer.toObject().answer : [];
        let answerList = [];
        options.map((x, xIndex) => {
          if (IsArray(answer) && answer.contains(x)) {
            answerList.push(changeNum2Letter(xIndex));
          }
        });
        Comp = (
          <Fragment>
            {
              isMuti === 0 ?
                <RadioGroup
                  className={styles.horizontalRadio}
                  value={answer[0]}
                >
                  {options.map((option, index) => {
                    return <Radio key={index} value={option}>{`${changeNum2Letter(index)}、 ${option}`}</Radio>
                  })}
                </RadioGroup> :
                <CheckGroup
                  value={answer}
                  className={styles.horizontalCheck}
                >
                  <Row>
                    {options.map((option, index) => {
                      return (
                        <Checkbox key={index} value={option}>{`${changeNum2Letter(index)}、 ${option}`}</Checkbox>)
                    })}
                  </Row>
                </CheckGroup>
            }
            <div className={styles.answerTitle}>答案：{answerList.join(" 、")}</div>
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
            <div className={styles.answerTitle}>答案：{answer[0] === 0 ? "错" : "对"}</div>
          </Fragment>
        );
        break;
      case "3":
        answer = answer ? answer.toObject().answer : [""];
        Comp = (
          <Fragment>
            <div>
              <Input style={{width: '100%'}}/>
              <div className={styles.answerTitle}>参考答案：</div>
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
            <TextArea autosize={{minRows: 6}}/>
            <div className={styles.answerTitle}>参考答案：</div>
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
      <div>{Comp}</div>
    )
  }

  addQuestionOk = (record) => {
    const {item: {row, list}} = this.props[modelNameSpace];
    const {model} = this.props;
    list.push(record);
    let totalScore = 0;
    list.forEach(x => {
      totalScore += x.score;
    });
    row.score = totalScore;
    model.setState({
      item: {
        row,
        list,
      }
    });
  }

  renderModal() {
    const {modal: {visible, record = {}}} = this.state;
    const {score} = record;
    const item = [
      {
        label: '分值',
        key: 'score',
        initialValue: score,
        render: () => {
          return (<Input/>)
        }
      }
    ];
    return (
      <EditModal
        title="编辑题目"
        visible={visible}
        onCancel={e => this.setState({modal: {visible: false}})}
        item={item}
      />
    )
  }

  renderAddModal() {
    const {addModal: {visible, questionType}} = this.state;
    const {[modelNameSpace]: {item: {list}}, model} = this.props;
    const questionList = list.filter(x => x.questionType === questionType);
    let arr = [];
    questionList.forEach(x => arr.push(x.questionID));
    return (
      <StandardModal
        title={`添加${formatter.questionType[questionType]}`}
        visible={visible}
        onCancel={e => this.setState({addModal: {visible: false}})}
        scroll={true}
        width={1200}
        footer={null}
      >
        <AddQuestion
          questionType={questionType}
          addIds={arr}
          addQuestion={this.addQuestionOk}
          paperID={Uri.Query('paperID')}
          model={model}
        />
      </StandardModal>
    )
  }

  render() {
    const {[modelNameSpace]: {item: {row, list}}} = this.props;
    const {tab, isEdit} = this.state;
    return (
      <div id="paperReview" className={styles.paperReview}>
        <div className={styles.paperReviewWrapper}>
          <div className={styles.header}>
            <div className={styles.title}>
              <span>{this.state.isEdit ?
                <Input
                  value={row.title}
                  style={{ width: 300 }}
                  onChange={e => this.changeRowData({title:e.target.value})}
                /> : row.title}</span>
              <span><Icon type='edit' onClick={this.startEdit} style={{cursor: 'pointer'}}/></span>
            </div>
            <div className={styles.time}>
              <span>考试时长： {this.state.isEdit ?
                <InputNumber
                 value={row.examMinite}
                 style={{ width: 120 }}
                 onChange={value => this.changeRowData({examMinite:value})}
              />
                : row.isOperation === 0 ? `${row.examMinite}分钟` : `${row.examDays}天`}</span>
              <span style={{marginLeft: 40}}>总分：{row.score}</span>
            </div>
            {isEdit ?
              <div style={{marginTop: 15}}>
                <Tag
                  color='red'
                  closable
                  onClose={e => this.setState({isEdit: false})}>编辑模式
                </Tag></div> : null}
          </div>
          <div className={styles.body}>
            {this.renderTabs()}
          </div>
          <BackTop target={() => document.getElementById("paperReview")}/>
        </div>
        {this.state.modal.visible ? this.renderModal() : null}
        {this.state.addModal.visible ? this.renderAddModal() : null}
      </div>
    )
  }
}
