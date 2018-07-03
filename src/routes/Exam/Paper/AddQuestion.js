import React from 'react';
import {Tabs, Row, Col, Pagination, List, Input, Rate, Radio, Checkbox, Tag, Icon, Button} from 'antd';
import classNames from 'classnames';
import jQuery from 'jquery';
import {fetchDict, fetchService} from '../../../utils/rs/Fetch';
import DictTree from '../../../myComponents/Tree/DictTree';
import Color from "../../../utils/rs/Color";
import Format from "../../../utils/rs/Format";
import styles from './index.less';


const TabPane = Tabs.TabPane;
const Fragment = React.Fragment;
const CheckGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

export default class extends React.Component {
  state = {
    tabs: [],
    pageIndex: 1,
    pageSize: 10,
    level: 0,
    title: null,
    questionCategory: null,
    data: {
      list: [],
      total: 0,
    },
    loading: false,
  }

  componentDidMount() {
    fetchDict({typeCode: 'question-category'}).then(data => {
      this.setState({tabs: data});
    });
  }

  changeTab = (activeKey) => {
    this.setState({
      activeKey,
    })
  }

  getList = () => {
    const {pageIndex, pageSize, level, title, questionCategory} = this.state;
    const {questionType} = this.props;
    this.setState({
      loading: true,
      data: {
        list: [],
        total: 0,
      }
    }, () => {
      fetchService({
        url: '/oa/exam/question/get',
        params: {
          pageIndex,
          pageSize,
          level,
          title,
          questionCategory,
          questionType,
          sorterColumn: 'createDate',
          sorterType: 'desc',
        }
      }).then(data => {
        this.setState({
          data,
          loading: false,
        });
      });
    });


  }

  changeCategory = (questionCategory) => {
    this.setState({
      pageIndex: 1,
      level: 0,
      title: null,
      questionCategory,
    }, e => this.getList());
  }

  onAddQuestion = (questionEntity) => {
    const {model, paperID, addQuestion} = this.props;
    model.add({
      paperID,
      questionEntity,
    }).then(({success, record}) => {
      if (success) {
        addQuestion(record);
      }
    });
  }

  renderList() {
    const {data: {list, total}} = this.state;

    return (
      <div style={{height: '100%'}}>
        <Input.Search
          style={{width: 250}}
          value={this.state.title}
          enterButton={<Icon type='search'/>}
          onChange={e => this.setState({
            title: e.target.value,
          })}
          onSearch={value => {
            this.setState({
              pageIndex: 1,
            }, () => this.getList())
          }} placeholder='输入题目标题进行模糊查询'/>
        <span style={{marginLeft: 12}}>题目等级：</span><Rate value={this.state.level} onChange={value => {
        this.setState({
          level: value,
          pageIndex: 1,
        }, () => this.getList())
      }} allowHalf allowClear/>
        <List
          className={styles.addQuestionList}
          itemLayout="vertical"
          dataSource={list}
          loading={this.state.loading}
          renderItem={(item, index) => this.renderListItem(item, index)}
        />
        <Pagination
          showQuickJumper
          current={this.state.pageIndex}
          total={this.state.data.total}
          onChange={pageIndex => {
            this.setState({
              pageIndex,
            }, () => this.getList())
          }}/>
      </div>

    )
  }

  renderListItem = (item, idx) => {
    const {addIds = []} = this.props;
    const questionItem = jQuery(".ant-list-item");
    const imageDivWidth = questionItem.width();
    const {selectedItem} = this.state;
    let {isMuti, options, answer, level, questionID, createDate, createUserName, status, questionImageList, questionType} = item;
    console.log(questionID)
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
        })}
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
        <span style={{marginLeft: 20}}>
          {addIds.contains(questionID) ?
            <Tag color='green'>已添加</Tag> :
            <Button icon='plus' type='primary' onClick={e=>this.onAddQuestion(item)}>添加</Button>}
            </span>
      </List.Item>
    )
  }

  renderListDescription = (item, idx) => {
    let {questionType, isMuti, options, answer, level, paperQuestionID, createDate, createUserName, status, questionBasis} = item;
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
      </Fragment>
    );
  }


  render() {
    const {addedIDs, questionType} = this.props;

    return (
      <div style={{height: '100%'}}>
        <Row style={{height: '100%'}}>
          <Col span={5} style={{height: '100%', borderRight: '1px solid #e8e8e8'}}>
            <DictTree
              expand
              init
              typeCode="question-category"
              handleSelect={code => this.changeCategory(code[0])}
            />
          </Col>
          <Col span={19} style={{height: '100%', padding: '0px 0px 0px 24px'}}>
            {this.renderList()}
          </Col>
        </Row>

      </div>
    )
  }
}
