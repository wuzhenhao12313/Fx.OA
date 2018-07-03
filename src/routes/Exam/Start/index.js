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
  Spin
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

const modelNameSpace = "exam-paper-start";
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
    const quasiNo = Uri.Query('quasiNo');
    const jobNumber = Uri.Query('jobNumber');
    const mac = Uri.Query('mac');
    model.call("getStartPaper", {
      quasiNo,
      jobNumber,
      mac,
    }).then(() => {
      const { paperIns, hasAuth } = this.props[modelNameSpace];
      if (hasAuth) {
        const targetTime = moment(paperIns.expireDate).utc();
        this.setState({
          targetTime,
        });
        this.updateQuestionInsListIntervel = setInterval(this.updateQuestionInsList, 10 * 1000);
      }

    });
  }

  componentWillUnmont() {
    clearInterval(this.updateQuestionInsListIntervel);
  }

  updateQuestionInsList = () => {
    const { model } = this.props;
    const quasiNo = Uri.Query('quasiNo');
    const jobNumber = Uri.Query('jobNumber');
    const mac = Uri.Query('mac');
    const { paperIns,questionInsList } = this.props[modelNameSpace];
    model.call("updateQuestionInsList", {
      quasiNo,
      jobNumber,
      mac,
      paperInsID:paperIns.insID,
      questionInsList,
    });
  }

  submit = () => {
    Modal.confirm({
      title: '提交考试结果',
      content: '确认要提交考试结果吗，提交后将无法继续作答',
      onOk: () => {
        const { model } = this.props;
        const quasiNo = Uri.Query('quasiNo');
        const jobNumber = Uri.Query('jobNumber');
        const mac = Uri.Query('mac');
        const { paperIns, questionInsList } = this.props[modelNameSpace];  
        LoadingService.Start();
        clearInterval(this.updateQuestionInsListIntervel);
        model.call("updateQuestionInsList", {
          quasiNo,
          jobNumber,
          mac,
          paperInsID: paperIns.insID,
          questionInsList,
        }).then(success => {
          model.call("submit", {
            quasiNo,
            jobNumber,
            mac,
            paperInsID: paperIns.insID,
          }).then(success => {
            if (success) {
              window.location.reload();
            } else {
              this.updateQuestionInsListIntervel = setInterval(this.updateQuestionInsList, 10 * 1000);
            }
            LoadingService.Done();
          });
        });
      }
    });
  }

  changeQuestionAnswer = (data) => {
    const { model } = this.props;
    const { questionInsList } = this.props[modelNameSpace];
    const {value, insQuestionID } = data;
    const index = questionInsList.findIndex(x => x.insQuestionID === insQuestionID);
    const key = 'userAnswer';
    let _value = IsArray(value) ? value : [value];
    questionInsList[index][key] = JSON.stringify(_value);
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
        <div>(分值：{item.score}分)</div>
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
    let { isMuti, options, userAnswer, questionType } = item;
    userAnswer = userAnswer ? userAnswer.toObject() : [];
    let Comp;
    switch (questionType) {
      case "1":
        options = options ? options.toObject() : [];
        Comp = (
          <Fragment>
            {
              isMuti === 0 ?
                <RadioGroup
                  className={styles.horizontalRadio}
                  value={userAnswer[0]}
                  onChange={e => this.changeQuestionAnswer({value:e.target.value,insQuestionID:item.insQuestionID})}
                >
                  {options.map((option, index) => {
                    return <Radio key={index} value={option}>{`${changeNum2Letter(index)}、 ${option}`}</Radio>
                  })}
                </RadioGroup> :
                <CheckGroup
                  value={userAnswer}
                  className={styles.horizontalCheck}
                  onChange={value => this.changeQuestionAnswer({value,insQuestionID:item.insQuestionID})}
                >
                  <Row>
                    {options.map((option, index) => {
                      return (
                        <Checkbox key={index} value={option}>{`${changeNum2Letter(index)}、 ${option}`}</Checkbox>)
                    })}
                  </Row>
                </CheckGroup>
            }
          </Fragment>
        );
        break;
      case "2":
        Comp = (
          <Fragment>
            <RadioGroup
              className={styles.horizontalRadio}
              value={userAnswer[0]}
              onChange={e => this.changeQuestionAnswer({value:e.target.value,insQuestionID:item.insQuestionID})}
            >
              <Radio value={1}>对</Radio>
              <Radio value={0}>错</Radio>
            </RadioGroup>
          </Fragment>
        );
        break;
      case "3":
        Comp = (
          <Fragment>
            <div>
              <Input
                style={{ width: '100%' }}
                value={userAnswer[0]}
                onChange={e => this.changeQuestionAnswer({value:e.target.value,insQuestionID:item.insQuestionID})}
              />
            </div>
          </Fragment>
        );
        break;
      case "4":
        Comp = (
          <Fragment>
            <TextArea
              autosize={{ minRows: 6 }}
              value={userAnswer[0]}
              onChange={e => this.changeQuestionAnswer({value:e.target.value,insQuestionID:item.insQuestionID})}
            />
          </Fragment>
        );
        break;
    }
    return (
      <div>{Comp}</div>
    )
  }

  render() {
    const { loading } = this.props;
    const { hasAuth,authMsg, paperIns } = this.props[modelNameSpace];
    const top = jQuery("#paperStartHeader").height();
    return (
      <div id='paperStart' className={styles.paperStart}>
        <div className={styles.paperStartWrapper}>
          {hasAuth ?
            <div>
              <div className={styles.header} id="paperStartHeader">
                <div className={styles.title}>
                  <span>{paperIns.title}</span>
                    <Spin spinning={loading.effects[`${modelNameSpace}/updateQuestionInsList`]}></Spin>
                </div>
                <div className={styles.time}>
                  <span>考试时长： {paperIns.isOperation === 0 ? `${paperIns.examMinite}分钟` : `${paperIns.examDays}天`}</span>
                  <span style={{ marginLeft: 40 }}>总分：{paperIns.score}</span>
                  <div>{this.state.targetTime ?
                    <div>
                      剩余时间：
                      <CountDown style={{ fontSize: 20 }} target={this.state.targetTime} />
                      <Button type='primary' icon='save' style={{ marginLeft: 20 }} size='small' onClick={e => this.submit()}>提交</Button>
                    </div>
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
            : authMsg
          }
        </div>
      </div>
    )
  }
}
