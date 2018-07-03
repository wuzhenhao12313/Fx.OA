import React, {PureComponent} from 'react';
import {Timeline} from 'antd';
import {connect} from 'dva';
import {fetchService} from '../../utils/rs/Fetch';
import Format from '../../utils/rs/Format';

@connect(state => ({
  loading: state.loading,
  currentUser: state.global.currentUser,
}))//注入state
export default class extends React.Component {
  state = {
    logList: [],
  };

  componentDidMount() {
    const {insID} = this.props;
    fetchService({
      url: '/Flow/Log/Get',
      params: {insID},
    }).then(data => {
      const {log} = data;
      this.setState({
        logList: log,
      })
    })
  }

  renderLogItem(log, idx) {
    const {
      userId, status, createDate, content, logID, userName,
    } = log;
    const {currentUser} = this.props;
    let color = '', text = '';
    switch (status) {
      case 0:
        color = 'red';
        text = "已拒绝";
        break;
      case 1:
        color = 'green';
        text = "已同意";
        break;
      case 2:
        color = 'gray';
        text = "撤销申请";
        break;
      default:
        color = 'green';
        text = "已同意";
    }
    return (
      <Timeline.Item color={color} key={logID}>
        <p>
          <span>{currentUser.userID === userId ? "我" : userName} </span>
          <span style={{marginLeft:20}}>{idx === 0 ? "发起申请" : text}</span>
          <span style={{marginLeft:20}}>{Format.Date.Format(createDate, 'MM-DD HH:mm')}</span>
        </p>
      </Timeline.Item>
    )
  }

  render() {
    const {logList} = this.state;
    return (
      <Timeline>
        {logList.map((log, idx) => this.renderLogItem(log, idx))}
      </Timeline>
    )
  }
}
