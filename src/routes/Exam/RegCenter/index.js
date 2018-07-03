import React, {PureComponent} from 'react';
import {Card, Steps, List, Button, message, Row, Col, Modal} from 'antd';
import {connect} from 'dva';
import classNames from 'classnames';
import {fetchDict} from '../../../utils/rs/Fetch';
import {createTree} from '../../../utils/utils';
import Result from '../../../components/Result';
import FxLayout from '../../../myComponents/Layout/';
import Component from '../../../utils/rs/Component';
import styles from './index.less';

const Step = Steps.Step;

const positionLevel = {
  business: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
  functional: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
}

const modelNameSpace = 'exam-reg-center';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_exam_reg-center')
export default class extends PureComponent {
  state = {
    currentSteps: 0,
    positionTagList: [],
    currentSelectedTag: null,
    currentSelectedTagType: null,
    currentSelectedPositionLevel: null,
    submitResult: false,
    submitRecord: {},
  }

  positionTagMap = {};

  changeSteps = (currentSteps) => {
    this.setState({
      currentSteps,
    });
  }

  submit = () => {
    const { currentSelectedTag, currentSelectedPositionLevel } = this.state;
    message.warning('此功能暂未开放');
    // if (!currentSelectedPositionLevel) {
    //   message.warning("请先选择职位等级");
    //   return;
    // }
    // Modal.confirm({
    //   title: '确定要报名参加考试吗?',
    //   onOk: () => {
    //     const {model} = this.props;
    //     model.add({
    //       categoryCode: currentSelectedTag,
    //       positionLevel: currentSelectedPositionLevel,
    //     }).then(({success, record}) => {
    //       this.setState({
    //         submitResult: success,
    //         submitRecord: record,
    //         currentSteps: 2,
    //       });
    //     });
    //   }
    // });
  }

  reStart = () => {
    this.setState({
      currentSteps: 0,
      currentSelectedTag: null,
      currentSelectedTagType: null,
      currentSelectedPositionLevel: null,
      submitResult: false,
      submitRecord: {},
    });
  }

  componentDidMount() {
    fetchDict({typeCode: 'exam-position-tag'}).then(data => {
      data.forEach(x => {
        this.positionTagMap[x.itemCode] = x.itemName;
      })
      const positionTagList = createTree(data, "itemID", "showIndex");
      this.setState({
        positionTagList,
      });
    });
  }

  renderForm() {
    const {currentSteps} = this.state;
    return (
      <div className={styles.regCenter}>
        <Card bordered={false}>
          <Steps current={currentSteps} className={styles.regStep}>
            <Step title="选择职位类型"/>
            <Step title="选择职位等级"/>
            <Step title="完成"/>
          </Steps>
          <div className={styles.regForm}>
            {currentSteps === 0 ?
              this.renderPositionPanel() : null
            }
            {
              currentSteps === 1 ?
                this.renderPositionLevel() : null
            }
            {
              currentSteps === 2 ?
                this.renderResult() : null
            }
          </div>
        </Card>
      </div>
    )
  }

  renderPositionPanel() {
    const {positionTagList, currentSelectedTag} = this.state;
    return (
      <div className={styles.positionPanel}>
        {positionTagList.map(tag => {
          return (
            <div className={styles.positionTagBody}>
              <h1 className={styles.positionTagTitle}>{tag.itemName}</h1>
              <List
                grid={{gutter: 24, column: 4}}
                dataSource={tag.children}
                renderItem={item => (
                  <List.Item>
                    <div
                      className={classNames(styles.positionTagItem, {
                        [styles.selected]: currentSelectedTag === item.itemCode
                      })}
                      onClick={e => {
                        this.setState({
                          currentSelectedTag: item.itemCode,
                          currentSelectedTagType: tag.itemCode,
                        });
                      }}
                    >{item.itemName}</div>
                  </List.Item>
                )}/>
            </div>
          )
        })}
        <div className={styles.buttonBar}>
          <Row gutter={24}>
            <Col span={6}>
              <Button
                icon='arrow-right'
                type='primary'
                style={{width: '100%'}}
                onClick={e => {
                  if (!currentSelectedTag) {
                    message.warning("请先选择职位类型");
                    return;
                  }
                  this.changeSteps(1);
                }}
              >下一步</Button>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  renderPositionLevel() {
    const {loading}=this.props;
    const {currentSelectedTagType, currentSelectedPositionLevel} = this.state;
    return (
      <div className={styles.positionPanel}>
        <div className={styles.positionTagBody}>
          <h1 className={styles.positionTagTitle}>职位等级-{currentSelectedTagType === 'business' ? "业务岗" : '职能岗'}</h1>
          <List
            grid={{gutter: 24, column: 4}}
            dataSource={positionLevel[currentSelectedTagType]}
            renderItem={item => (
              <List.Item>
                <div
                  className={classNames(styles.positionTagItem, {
                    [styles.selected]: currentSelectedPositionLevel === item
                  })}
                  onClick={e => {
                    this.setState({
                      currentSelectedPositionLevel: item,
                    });
                  }}
                >{item}</div>
              </List.Item>
            )}/>
        </div>
        <div className={styles.buttonBar}>
          <Row gutter={24}>
            <Col span={6}>
              <Button
                icon='save'
                type='primary'
                style={{width: '100%'}}
                onClick={e => this.submit()}
                loading={loading.effects[`${modelNameSpace}/add`]}
              >提交</Button>
            </Col>
            <Col span={6}>
              <Button
                icon='arrow-left'
                style={{width: '100%'}}
                onClick={e => {
                  this.changeSteps(0);
                }}
              >上一步</Button>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  renderResult() {
    const {submitResult, submitRecord} = this.state;
    const {model}=this.props;
    const {examJobNumber, examUserName, categoryCode, positionLevel,serialNo} = submitRecord;
    const type = submitResult ? 'success' : 'error';
    const title = submitResult ? '报考成功' : '报考失败';
    const description = submitResult ? "您已提交考试申请，通过审核后将可以进行考试，请耐心等待"
      : '报名过程中发生错误，请返回重新报名';
    const extra = submitResult ? (
      <div>
        <div style={{fontSize: 16, color: 'rgba(0, 0, 0, 0.85)', fontWeight: '500', marginBottom: 20}}>
          考试信息
        </div>
        <Row style={{marginBottom: 16}}>
          <Col span={12} style={{marginBottom: 16}}>
            <span style={{color: 'rgba(0, 0, 0, 0.85)'}}>考试编号：</span>
            {serialNo}
          </Col>
          <Col span={12} style={{marginBottom: 16}}>
            <span style={{color: 'rgba(0, 0, 0, 0.85)'}}>工号：</span>
            {examJobNumber}
          </Col>
          <Col span={12} style={{marginBottom: 16}}>
            <span style={{color: 'rgba(0, 0, 0, 0.85)'}}>报考人：</span>
            {examUserName}
          </Col>
          <Col span={12} style={{marginBottom: 16}}>
            <span style={{color: 'rgba(0, 0, 0, 0.85)'}}>报考职位：</span>
            {this.positionTagMap[categoryCode]}
          </Col>
          <Col span={12} style={{marginBottom: 16}}>
            <span style={{color: 'rgba(0, 0, 0, 0.85)'}}>报考等级：</span>
            {positionLevel}
          </Col>
        </Row>
      </div>
    ) : null;

    const actions = submitResult ? (
      <div>
        <Button type='primary' onClick={e => model.push('/exam/my-record')}>查看记录</Button>
        <Button onClick={e => this.reStart()}>返回</Button>
      </div>
    ) : (
      <div>
        <Button type='primary' onClick={e => this.reStart()}>返回</Button>
      </div>
    )

    return (
      <div>
        <Result
          type={type}
          title={title}
          description={description}
          extra={extra}
          actions={actions}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      header: {
        title: '报考中心'
      },
      body: {
        padding: false,
        center: this.renderForm()
      },
    }
    return (
      <FxLayout
        {...fxLayoutProps}
      />
    )
  }
}
