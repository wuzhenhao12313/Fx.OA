import React, {PureComponent} from 'react';
import {connect} from 'dva';
import Component from '../../../utils/rs/Component';

const modelNameSpace = 'employee-insurance';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  render() {
    return (
      <div>
      </div>
    )
  }
}
