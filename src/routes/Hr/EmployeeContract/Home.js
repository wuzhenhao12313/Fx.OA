import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Row,
  Card,
} from 'antd';
import Component from '../../../utils/rs/Component';
import InfoHeader from '../../../myComponents/Fx/InfoHearder';

const modelNameSpace = 'employee-contract';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Role('oa_employee_contract_home')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  ref = {
    entityForm: null,
    searchForm: null,
  }

  changeStatus = (status) => {
    const {model} = this.props;
    model.push(`/hr/employee-contract/list?status=${status}`);
  }

  componentDidMount() {
    const {model} = this.props;
    model.call('getCount');
  }

  componentWillUnmount() {

  }

  render() {
    const {[modelNameSpace]: {count},} = this.props;
    const {all, willEffect, effect, willExpire, expire, stop} = count;
    const items = [
      {
        title: '所有数据',
        value: all,
        key: 'all',
        type: 'primary',
        select: true,
      },
      {
        title: '即将生效',
        value: willEffect,
        key: 'willEffect',
        type: 'processing',
        select: true,
      },
      {
        title: '已生效',
        value: effect,
        key: 'effect',
        type: 'success',
        select: true,
      },
      {
        title: '即将过期',
        value: willExpire,
        key: 'willExpire',
        type: 'warning',
        select: true,
      },
      {
        title: '已终止',
        value: stop,
        key: 'stop',
        type: 'error',
        select: true,
      },

      {
        title: '已过期',
        value: expire,
        key: 'expire',
        select: true,
      },
    ]
    return (
      <div style={{padding: '12px 16px'}}>
        <Row>
          <Card title="数据总览" bordered={false}>
            <InfoHeader items={items} onSelect={this.changeStatus}/>
          </Card>
        </Row>
      </div>

    );
  }
}



