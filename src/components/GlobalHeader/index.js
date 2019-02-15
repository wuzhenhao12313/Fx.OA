import React, {PureComponent} from 'react';
import {Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar, message, Divider, Select, Form} from 'antd';
import moment from 'moment';
import Debounce from 'lodash-decorators/debounce';
import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import {Link} from 'dva/router';
import NoticeIcon from '../../components/NoticeIcon';
import HeaderSearch from '../../components/HeaderSearch';
import logo from '../../assets/logo.svg';
import styles from './index.less';
import Config from '../../utils/rs/Config';
import {String} from '../../utils/rs/Util';
import StandardModal from '../../myComponents/Modal/Standard';

const {Header} = Layout;
const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
export default class GlobalHeader extends PureComponent {
  state = {
    visible: false,
    scrollStyle: localStorage.getItem('scrollStyle') === null ? 'dark-thin' : localStorage.getItem('scrollStyle').toString(),
    stageLayout: Config.webSetting.stageLayout,
    theme: Config.webSetting.theme,
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type: 'user/fetchCurrent',
    // });
  }

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  getNoticeData() {
    const {notices = []} = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = {...notice};
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{marginRight: 0}}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }
  handleMenuClick = ({key}) => {
    if (key === 'logout') {
      this.props.dispatch({
        type: 'global/signOut',
      });
    }
    if (key === 'setting') {
      this.setState({
        visible: true,
      });
    }
    if (key === 'user') {
      this.props.dispatch({
        type: 'global/toUserCenter',
      });
    }
  }

  changeStyle = (scrollStyle) => {
    localStorage.setItem('scrollStyle', scrollStyle);
    this.setState({
      scrollStyle,
    }, () => {
      window.location.reload();
    });
  }

  changeStageLayout = (stageLayout) => {
    localStorage.setItem('stageLayout', stageLayout);
    this.setState({
      stageLayout,
    }, () => {
      window.location.reload();
    });

  }

  changeTheme = (theme) => {
    localStorage.setItem('fx_theme', 'light');
    this.setState({
      theme,
    }, () => {
      window.location.reload();
    });

  }

  toggle = () => {
    const {collapsed, onCollapse} = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }

  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }


  renderSettingModal() {
    const {visible} = this.state;
    const formItemLayout = {
      labelCol: 4,
      wrapperCol: 20,
    };
    const options = ['dark', 'minimal-dark', 'dark-2', 'dark-3',
      'dark-thick', 'dark-thin', 'inset-dark', 'inset-2-dark',
      'inset-3-dark', 'rounded-dark', 'rounded-dots-dark', '3d-dark', '3d-thick-dark'];
    return (
      <StandardModal
        visible={visible}
        title="设置"
        onCancel={e => {
          this.setState({
            visible: false,
          })
        }}
        footer={null}
      >
        <Form layout="horizontal">
          {/*<FormItem*/}
          {/*label='滚动条样式'*/}
          {/*{...formItemLayout}*/}
          {/*>*/}
          {/*<Select value={this.state.scrollStyle} onChange={style => this.changeStyle(style)}>*/}
          {/*{options.map(item => {*/}
          {/*return (<Option key={item} value={item}>{item}</Option>)*/}
          {/*})}*/}
          {/*</Select>*/}
          {/*</FormItem>*/}
          <FormItem
            label='二级导航栏位置'
            {...formItemLayout}
          >
            <Select value={this.state.stageLayout} onChange={layout => this.changeStageLayout(layout)}>
              <Option value='left'>左侧</Option>
              <Option value='top'>顶端</Option>
            </Select>
          </FormItem>
          <FormItem
            label='主题'
            {...formItemLayout}
          >
            <Select value={this.state.theme} onChange={theme => this.changeTheme(theme)}>
              <Option value='dark'>深色</Option>
              <Option value='light'>浅色</Option>
            </Select>
          </FormItem>
        </Form>
      </StandardModal>
    )
  }

  render() {
    const {
      currentUser, collapsed, fetchingNotices, isMobile, onNoticeClear, onNoticeVisibleChange
    } = this.props;
    const {notifyCount} = currentUser;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.handleMenuClick}>
        <Menu.Item key="user"><Icon type="user"/>个人中心</Menu.Item>
        <Menu.Item key="setting"><Icon type="setting"/>设置</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="logout"><Icon type="logout"/>退出登录</Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    return (
      <Header style={{padding: 0}} className={classNames(styles.header, {
        [styles.headerCollapsed]: collapsed,
      })}>
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div className={styles.right}>
          <NoticeIcon
            className={styles.action}
            count={currentUser.notifyCount}
            onItemClick={(item, tabProps) => {
              console.log(item, tabProps); // eslint-disable-line
            }}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            loading={fetchingNotices}
            popupAlign={{offset: [20, -16]}}

          >
            <NoticeIcon.Tab
              list={noticeData['通知']}
              title="通知"
              emptyText="你已查看所有通知"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['消息']}
              title="消息"
              emptyText="您已读完所有消息"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['待办']}
              title="待办"
              emptyText="你已完成所有待办"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
            />
          </NoticeIcon>
          {currentUser.userName ? (
            <Dropdown overlay={menu} trigger={['click']}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={styles.avatar}
                        src={String.IsNullOrEmpty(currentUser.headImage) ? Config.defaultAvator : `${currentUser.headImage}`}/>
                <span className={styles.name}>{currentUser.userName}</span>
              </span>
            </Dropdown>
          ) : <Spin size="small" style={{marginLeft: 8}}/>}
        </div>
        {this.state.visible ? this.renderSettingModal() : null}
      </Header>
    );
  }
}
