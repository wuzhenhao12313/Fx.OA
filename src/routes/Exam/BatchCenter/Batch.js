import React, {PureComponent} from 'react';
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
  Affix,
  Spin,
  message,
} from 'antd';
import CountDown from 'ant-design-pro/lib/CountDown';
import moment from 'moment';
import jQuery from 'jquery';
import {connect} from 'dva';
import classNames from 'classnames';
import styles from './index.less';
import Uri from '../../../utils/rs/Uri';
import Component from "../../../utils/rs/Component";
import { shuffle, changeNum2Letter, IsArray } from '../../../utils/rs/Util';
import LoadingService from '../../../utils/rs/LoadingService';
import Result from '../../../components/Result';

const modelNameSpace = "exam-paper-batch";
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
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends React.Component {
  state = {
    targetTime: 0,
    tab:"1",
  }

  updateQuestionInsListIntervel = null;

  componentDidMount() {
    const {model} = this.props;
    model.call("getBatchItem", {
      paperID:Uri.Query('paperID'),
    }).then(() => {
      const { paperIns } = this.props[modelNameSpace];
      if (paperIns.isBatch !== 1) {
        this.updateQuestionInsListIntervel = setInterval(this.updateQuestionInsList, 30*1000);
      }
    })
  }

  componentWillUnmont() {
    clearInterval(this.updateQuestionInsListIntervel);
  }

  updateQuestionInsList = () => {
    const { model } = this.props;
    const paperInsID = Uri.Query('paperID');
    const { paperIns,questionInsList } = this.props[modelNameSpace];
    model.call("updateBatchQuestionList", {
      paperInsID,
      questionInsList,
    });
  }

  submit = () => {
    Modal.confirm({
      title: '提交批卷结果',
      content: '确认要提交考试结果吗，提交后将无法继续作答',
      onOk: () => {
        const { model } = this.props;
        const paperInsID = Uri.Query('paperID');
        const { paperIns, questionInsList } = this.props[modelNameSpace];
        if (questionInsList.findIndex(x => x.userScore === null) > 0) {
          message.warning("还有考题未评分");
          return;
        }

        LoadingService.Start();
        clearInterval(this.updateQuestionInsListIntervel);
        model.call("updateBatchQuestionList", {
          paperInsID,
          questionInsList,
        }).then(success => {
          model.call("submitBatch", {
            paperInsID,
          }).then(success => {
            if (success) {
              window.location.reload();
            } else {
              this.updateQuestionInsListIntervel = setInterval(this.updateQuestionInsList, 30 * 1000);
            }
            LoadingService.Done();
          });
        });
      }
    });
  }

  changeQuestionUserScore = (data) => {
    const { model } = this.props;
    const { questionInsList } = this.props[modelNameSpace];
    const {value, insQuestionID } = data;
    const index = questionInsList.findIndex(x => x.insQuestionID === insQuestionID);
    const key = 'userScore';
    questionInsList[index][key] = value;
    model.setState({
       questionInsList,
    });
  }

  renderTabs() {
    return (
      <Tabs type="card" animated={true} onChange={tab => this.setState({tab})} >

        <TabPane tab={<span><Icon type='filter'/>选择题</span>} key="1" />
        <TabPane tab={<span><Icon type='check-circle'/>判断题</span>} key="2" />
        <TabPane tab={<span><Icon type='edit'/>填空题</span>} key="3" />
        <TabPane tab={<span><Icon type='question-circle'/>问答题</span>} key="4" />
      </Tabs>
    )
  }

  renderTabPane = (questionType) => {
    const {paperIns, questionInsList} = this.props[modelNameSpace];
    const questionList = questionInsList.filter(x => x.questionType === questionType);
    return (
      <div>
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
      </List.Item>
    )
  }

  renderItemTitle = (item, itemIndex) => {
    const { paperIns } = this.props[modelNameSpace];
    let {isMuti, questionTitle, questionImageList, questionType, questionInsID} = item;
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

    const readonly = questionType === "1" || questionType === "2"|| paperIns.isBatch ? { readonly: 'readonly' } : {}
    return (
      <div className={styles.questionTitle}>
        {questionType === "1" ?
          <Fragment>
            <span>{`${itemIndex + 1}、`}</span>
            <span>{questionTitle}</span>
            <span className={styles.questionTitleTag}>[{text}]</span>
          </Fragment> :
          <Fragment>
            <span style={{width: 30, display: 'inline-block', position: 'absolute'}}>{`${itemIndex + 1}、`}</span>
            <div>
              {item.questionTitle.split('\n').map((_text, _idxText) => {
                return (<div style={{textIndent: 25}} key={_idxText}>{_text}</div>)
              })}
            </div>
          </Fragment>
        }
        <div>
          <span>(分值：{item.score}分)</span>
          <span style={{ marginLeft: 40 }}>
            得分：<Input
              style={{ width: 50 }}
              value={item.userScore} {...readonly}
              onChange={e => this.changeQuestionUserScore({ value: e.target.value,insQuestionID:item.insQuestionID })}
            />
          </span>
        </div>
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
    let { isMuti, options, userAnswer,answer, questionType } = item;
    userAnswer = userAnswer ? userAnswer.toObject() : [];
    let Comp;
    switch (questionType) {
      case "1":
        options = options ? options.toObject() : [];
        // options = shuffle(options);
        answer = answer ? answer.toObject() : [];
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
                  value={userAnswer[0]}
                >
                  {options.map((option, index) => {
                    return <Radio key={index} value={option}>{`${changeNum2Letter(index)}、 ${option}`}</Radio>
                  })}
                </RadioGroup> :
                <CheckGroup
                  value={userAnswer}
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
            <div className={styles.answerTitle}>正确答案：{answerList.join(" 、")}</div>
          </Fragment>
        );
        break;
      case "2":
       answer = answer ? answer.toObject() : [""];
        Comp = (
          <Fragment>
            <RadioGroup
              className={styles.horizontalRadio}
              value={userAnswer[0]}
            >
              <Radio value={1}>对</Radio>
              <Radio value={0}>错</Radio>
            </RadioGroup>
            <div className={styles.answerTitle}>正确答案：{answer[0] === 0 ? "错" : "对"}</div>
          </Fragment>
        );
        break;
      case "3":
        answer = answer ? answer.toObject() : [""];
        Comp = (
          <Fragment>
            <div>
              <Input
                style={{ width: '100%' }}
                value={userAnswer[0]}
              />
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
        answer = answer ? answer.toObject() : [""];
        Comp = (
          <Fragment>
            <TextArea
              autosize={{ minRows: 6 }}
              value={userAnswer[0]}
            />
            <div className={styles.answerTitle}>参考答案：</div>
            {answer[0] ? answer[0].split('\n').map((i, _idx) => {
              return <div key={_idx}>{i}</div>;
            }) : null
            }
          </Fragment>
        );
        break;
    }
    return (
      <div>{Comp}</div>
    )
  }

  getAllScore = () => {
    const { paperIns, questionInsList } = this.props[modelNameSpace];
  }

  render() {
    const { loading } = this.props;
    const {paperIns } = this.props[modelNameSpace];
    const top = jQuery("#paperStartHeader").height();
    return (
      <div id='paperStart' className={styles.paperStart}>
        <div className={styles.paperStartWrapper}>
        <div>
        <div className={styles.header} id="paperStartHeader">
          <div className={styles.title}>
            <span>{paperIns.title}</span>
            {paperIns.isBatch !== 1 ? <Spin spinning={loading.effects[`${modelNameSpace}/updateBatchQuestionList`]}></Spin> : null}
          </div>
          <div className={styles.time}>
            <span>考试人员： {paperIns.userName}</span>
            <span style={{ marginLeft: 40 }}>工号：{paperIns.jobNumber}</span>
            <div>
                <span>总得分：<span style={{ color: 'red', fontSize: 20 }}>{paperIns.userScore}</span></span>
                  {paperIns.isBatch !== 1 ?
                    <Button type='primary' icon='save' style={{ marginLeft: 20 }} size='small' onClick={e => this.submit()}>完成批卷</Button>
                  : null}
            </div>
          </div>
          <div style={{marginTop:20}}>
            {this.renderTabs()}
          </div>
          </div>
        <div className={styles.body} style={{paddingTop:top+63}}>
          {this.renderTabPane(this.state.tab)}

        </div>
        <BackTop target={() => document.getElementById("paperStart")}/>
      </div>
        </div>
      </div>
    )
  }
}
