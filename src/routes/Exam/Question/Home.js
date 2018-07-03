import React, {PureComponent} from 'react';
import {connect} from 'dva';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Component from '../../../utils/rs/Component';

const modelNameSpace = 'exam-question-home';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Role('oa_exam_question_home')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {

  render() {
    return (
      <PageHeaderLayout>
      </PageHeaderLayout>
    )

  }
}
