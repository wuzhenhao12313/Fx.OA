import React, {PureComponent} from 'react';
import {Tabs, Icon, List, Rate, Row, Col, Checkbox, Radio, Input, BackTop} from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import {changeNum2Letter, shuffle} from "../../../utils/rs/Util";

const Fragment = React.Fragment;
const CheckGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

export default class extends PureComponent {
  styles = {
    title: {
      marginBottom: 4,
      textAlign: 'center'
    },
    titleSpan: {
      fontSize: 24,
    }
  }


  renderList = (questionType) => {
    const {list} = this.props;
    const questionList = list.filter(x => x.questionType === questionType);
    let listTitle = '';
    switch (questionType) {
      case '1':
        listTitle = '一、 选择题';
        break;
      case '2':
        listTitle = '二、 判断题';
        break;
      case '3':
        listTitle = '三、 填空题';
        break;
      case '4':
        listTitle = '四、 问答题';
        break;
    }
    return (
      <div>
        <div style={{fontSize: 25}}>{listTitle}, 共{questionList.length}题</div>
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
        style={{paddingBottom: 0}}
        className={classNames({
          [styles.questionItem]: true,
        })}>
        <List.Item.Meta
          title={this.renderItemTitle(item, itemIndex)}
          description={this.renderItemDescription(item, itemIndex)}
        >

        </List.Item.Meta>
      </List.Item>
    )
  }

  renderItemTitle = (item, itemIndex) => {
    let {isMuti, questionTitle, questionImageList, questionType} = item;
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
            <span className={styles.questionTitleTag} style={{color: '#666'}}>[{text}]</span>
            <span style={{marginLeft: 20}}>（分值：{item.score}分）</span>
          </Fragment> :
          <Fragment>
            <span>{`${itemIndex + 1}、`}</span>
            <span>{questionTitle}</span>
            <span style={{marginLeft: 20}}>（分值：{item.score}分）</span>
          </Fragment>
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
    let {options, questionType} = item;
    let Comp;
    switch (questionType) {
      case "1":
        options = options ? options.toObject().options : [];
        options = shuffle(options);
        Comp = (
          <Fragment>
            {options.map((option, index) => {
              return <p key={index}>{`${changeNum2Letter(index)}、 ${option}`}</p>
            })}
            <div className={styles.answerTitle}>答案：</div>
          </Fragment>
        );
        break;
      case "2":
        Comp = (
          <Fragment>
            <p>{`A、对`}</p>
            <p>{`B、错`}</p>
            <div className={styles.answerTitle}>答案：</div>
          </Fragment>
        );
        break;
      case "3":
        Comp = (
          <Fragment>
            <div>
            </div>
          </Fragment>
        );
        break;
      case "4":
        Comp = (
          <Fragment>
            <TextArea autosize={{minRows: 6}}/>
          </Fragment>
        );
        break;
      case "5":
        options = options ? options.toObject().options : [];
    }
    return (
      <div>{Comp}</div>
    )
  }


  render() {
    const {row, list} = this.props;
    return (
      <div style={{padding: '0px 20px'}} className={styles.paperPrint}>
        <div style={this.styles.title}>
          <span style={this.styles.titleSpan}>{row.title}</span>
          <div>
            <span>考试时长： {row.isOperation === 0 ? `${row.examMinite}分钟` : `${row.examDays}天`}</span>
            <span style={{marginLeft: 40}}>总分：{row.score}</span>
          </div>
        </div>
        <div>
          {this.renderList("1")}
          {this.renderList("2")}
          {this.renderList("3")}
          {this.renderList("4")}
        </div>
      </div>
    )
  }
}
