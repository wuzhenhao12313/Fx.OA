import React, {PureComponent} from 'react';
import {connect} from 'dva';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Component from '../../../utils/rs/Component';
import {getPageKey} from '../../../utils/utils';
import PageList from './List';

const modelNameSpace = 'position_level';


@connect(state => ({
  actionList: state[modelNameSpace].menuAuth.actionList,
  columnList: state[modelNameSpace].menuAuth.columnList,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  render() {
    const {actionList, columnList} = this.props;
    const pageKey = getPageKey('/hr/position-level/:type');
    return (
      <PageHeaderLayout>
        {pageKey === 'list' ? <PageList actionList={actionList} columnList={columnList}/> : null}
      </PageHeaderLayout>
    )
  }
}
