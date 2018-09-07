import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Row, Col, Card, Avatar, Tag, List, Modal, Button, Badge, Divider, Icon, Popover} from 'antd';
import EditableLinkGroup from '../../components/EditableLinkGroup';
import FxLayout from '../../myComponents/Layout/';
import Format from '../../utils/rs/Format';
import Component from '../../utils/rs/Component';
import LoadingService from '../../utils/rs/LoadingService';
import StandardModal from '../../myComponents/Modal/Standard';
import FlowLogTimeLine from './FlowLogTimeLine';

import styles from './Workplace.less';
import Config from "../../utils/rs/Config";

const modelNameSpace = 'dashboard';
const Fragment = React.Fragment;

const getFlowAvatarProps = (flowType) => {
  let props = {};
  switch (flowType) {
    case "level-exam":
      props = {
        icon: 'form',
        background: '#87d068',
      };
      break;
    case "weekly-budget":
      props = {
        icon: 'pay-circle-o',
        background: '#d07380',
      };
      break;
    case "weekly-budget-cd":
      props = {
        icon: 'pay-circle-o',
        background: '#d07380',
      };
      break;
  }
  return props;
}

const links = [
  {
    title: '操作一',
    onClick: () => {
      console.log(1);
    }
  },
];

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
  currentUser: state.global.currentUser,
}))//注入state
@Component.Model(modelNameSpace)
@Component.Role('oa_dashboard')
export default class extends PureComponent {
  state = {
    noticeModal: {
      visible: false,
      url: '',
    }
  }

  componentDidMount() {
    this.getWorkFlow();
  }

  getWorkFlow = (page) => {
    const {model,} = this.props;
    const {flowPageIndex, flowPageSize} = this.props[modelNameSpace];
    model.setState({
      flowPageIndex: page || flowPageIndex,
    }).then(_ => {
      model.call("getWorkFlow", {
        pageIndex: flowPageIndex,
        pageSize: flowPageSize,
        flowIsCancel: 0,
      });
    });
  }

  audit = (item, result) => {
    const {model} = this.props;
    const {flowType, flowInsID, flowInsNodeID} = item;
    LoadingService.Start();
    model.call("audit", {
      flowType,
      insID: flowInsID,
      insNodeID: flowInsNodeID,
      result,
      reason: '',
    }).then(_ => {
      this.getWorkFlow(1);
      LoadingService.Done();
    });
  }


  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderNoticeList() {
    const {[modelNameSpace]: {noticeList = []}} = this.props;
    return (
      <List
        size="small"
        bordered={false}
        dataSource={noticeList}
        renderItem={(item, index) => {
          // console.log(item.url)
          // const url=`dingtalk://dingtalkclient/page/link?url=${encodeURI(item.url)}&pc_slide=true`;
          return (
            <List.Item>
              <a href={url}>{`${index + 1}、 ${item.title}`}</a>
            </List.Item>
          )
        }}
      />
    )
  }

  renderFlowList() {
    const {[modelNameSpace]: {flow: {list, total}, flowPageIndex, flowPageSize}, loading, model} = this.props;
    const pageProps = {
      size: 'small',
      total,
      current: flowPageIndex,
      pageSize: flowPageSize,
      hideOnSinglePage: true,
      onChange: (current) => {
        model.setState({
          flowPageIndex: current,
        }).then(_ => this.getWorkFlow());
      }
    };
    return (
      <List
        size="small"
        bordered={false}
        dataSource={list}
        className={styles.flowList}
        loading={loading.effects[`${modelNameSpace}/getWorkFlow`]}
        pagination={pageProps}
        locale={{
          emptyText: (
            <div style={{height:200}}>
              <div style={{position:'relative',top:36}}><img src={`${Config.cdn}/image/empty.png`} alt=""/>
              </div>
              <div style={{position:'relative',top:50,color:'#80848f',fontSize:14}}>
                没有查询到符合条件的记录
              </div>
            </div>
          )
        }}
        renderItem={(item, index) => {
          const {title, flowType, content, createDate, flowInsID} = item;
          const contentList = content ? content.toObject() : [];
          const avatarProps = getFlowAvatarProps(flowType);
          return (
            <List.Item
              className={styles.flowItem}
            >
              <List.Item.Meta
                avatar={<Avatar icon={avatarProps.icon} style={{backgroundColor: avatarProps.background}}/>}
                title={title}
                description={
                  <div>{
                    contentList.map(row => {
                      return (<p>{row}</p>)
                    })}
                    <div className={styles.flowActionBar}>
                      <Button size='small' onClick={e => this.audit(item, 0)} type="danger" ghost>拒绝</Button>
                      <Button size='small' type='primary' onClick={e => this.audit(item, 1)}
                              style={{marginLeft: 5}}>同意</Button>
                    </div>
                  </div>
                }
              />
              <div className={styles.flowContent}>
                <p className={styles.flowTime}>{Format.Date.Format(createDate, 'YYYY-MM-DD HH:mm')}</p>
                <Popover placement="right" content={<FlowLogTimeLine insID={flowInsID}/>} trigger="click">
                  <p className={styles.flowStatus}>待审批</p>
                </Popover>
              </div>
            </List.Item>
          )
        }}
      />
    )
  }

  render() {
    const {currentUser, [modelNameSpace]: {flow: {total}}} = this.props;
    const {userName, depName, nickName, headImage, PositionList, jobNumber} = currentUser;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src={headImage}/>
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>您好，{userName}，祝你开心每一天！</div>
          <div>{jobNumber} | 破浪电子商务－{depName} | {PositionList ? PositionList.map((position, idx) => {
            return <Tag key={idx}>{position}</Tag>
          }) : null}</div>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>项目数</p>
          <p>56</p>
        </div>
        <div className={styles.statItem}>
          <p>团队内排名</p>
          <p>8<span> / 24</span></p>
        </div>
        <div className={styles.statItem}>
          <p>项目访问</p>
          <p>2,223</p>
        </div>
      </div>
    );


    const body = (
      <Row gutter={24}>
        <Col lg={10} xxl={8}>
          <Card
            title={
              <div>我的审批
                <Badge
                  style={{
                    marginLeft: 5,
                    position: 'relative',
                    top: -2
                  }}
                  count={total}
                  showZero={false}
                  overflowCount={99}
                />
              </div>
            }
            bordered={false}
            style={{marginBottom: 24}}
            extra={<a onClick={e => this.getWorkFlow()}>刷新</a>}>
            {this.renderFlowList()}
          </Card>
        </Col>
      </Row>
    )

    return (
      <div className='ant-layout-top-50'>
        <Card bordered={false}>
          {pageHeaderContent}
        </Card>
        <div style={{padding:24}}>
          {body}
        </div>
      </div>
    );
  }
}
