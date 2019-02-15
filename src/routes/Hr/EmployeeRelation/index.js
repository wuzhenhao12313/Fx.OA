import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Tabs} from 'antd';
import {Route, Redirect, Switch, Link} from 'dva/router';
import classNames from 'classnames';
import Styles from './index.less'
import Component from "../../../utils/rs/Component";
import Uri from '../../../utils/rs/Uri';
import Contract from '../EmployeeContract/List';
import Insurance from '../EmployeeInsurance/List';
import PositionLevel from '../PositionLevel/List';
import Probation from './probation';
import UnusualAction from './unusual-action';
import Leave from './leave';
import IsLeave from './isLeave';

const TabPane = Tabs.TabPane;
const modelNameSpace = 'employee-relation';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    activeKey: 'enrollment',
    isTabBar: true,
  }

  componentDidMount() {
    const activeKey = Uri.Query('activeKey') || 'enrollment';
    const isTabBar = Uri.Query('isTabBar') ? false : true;
    this.setState({
      activeKey,
      isTabBar,
    });
  }

  changeTab = (tab) => {
    const {model} = this.props;
    model.push(`/hr/employee/relation?activeKey=${tab}`);
    // this.setState({
    //   activeKey:tab,
    // });
  }

  render() {
    return (
      <div className={
        classNames({
          ['whiteBody']: false,
          [Styles.employeeRelation]: true,
        })
      }>
        {
          this.state.isTabBar ?
            <Tabs className='ant-tab-title-bar' activeKey={this.state.activeKey} onChange={this.changeTab}>
              <TabPane key='enrollment' tab='入职管理'/>
              <TabPane key='probation' tab='转正管理'/>
              <TabPane key='waiting-quit' tab='离职管理'/>
              <TabPane key='contract' tab='合同管理'/>
              <TabPane key='insurance' tab='社保管理'/>
              <TabPane key='position-level' tab='职级管理'/>
              <TabPane key='unusual-action' tab='人事异动'/>
            </Tabs> : null
        }
        <div>
          {this.state.activeKey === 'probation' ? <Probation/> : null}
          {this.state.activeKey === 'contract' ? <Contract/> : null}
          {this.state.activeKey === 'insurance' ? <Insurance/> : null}
          {this.state.activeKey === 'position-level' ? <PositionLevel/> : null}
          {this.state.activeKey === 'unusual-action' ? <UnusualAction/> : null}
          {this.state.activeKey === 'waiting-quit' ? <Leave/> : null}
          {this.state.activeKey==='quit'?<IsLeave/>:null}
        </div>
      </div>
    )
  }
}
