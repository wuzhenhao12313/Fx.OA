const prefix = '/exam';

const menuCode = {
  question: 'oa_exam_question',
  template: 'oa_exam_template',
  paper: 'oa_exam_paper',
}

export const getExam = ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/reg-center`]: {
      name: '报考中心',
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-reg-center'], () => import('../../routes/Exam/RegCenter/')) : null,
    },

    [`${prefix}/my-record`]:{
      name: '我的考试',
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-my-record'], () => import('../../routes/Exam/Record/My')) : null,
    },
    [`${prefix}/record`]:{
      name: '考试管理',
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-record'], () => import('../../routes/Exam/Record/')) : null,
    },

    [`${prefix}/question`]: {
      name: '题库管理',
      code: menuCode.question,
      redirect: `${prefix}/question/list`,
    },
    [`${prefix}/question/home`]: {
      name: '题库管理',
      selectedCode: menuCode.question,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-question-home'], () => import('../../routes/Exam/Question/Home')) : null,
    },
    [`${prefix}/question/list`]: {
      name: '题库管理',
      selectedCode: menuCode.question,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-question-list'], () => import('../../routes/Exam/Question/List')) : null,
    },
    [`${prefix}/question/remove`]: {
      name: '题库管理',
      selectedCode: menuCode.question,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-question-list'], () => import('../../routes/Exam/Question/RemoveList')) : null,
    },
    [`${prefix}/template`]: {
      name: '模板管理',
      code: menuCode.template,
      redirect: `${prefix}/template/list`,
    },
    [`${prefix}/template/list`]: {
      name: '模板管理',
      selectedCode: menuCode.template,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-template'], () => import('../../routes/Exam/Template/List')) : null,
    },
    [`${prefix}/paper`]: {
      name: '试卷管理',
      code: menuCode.paper,
      redirect: `${prefix}/paper/list`,
    },

    [`${prefix}/paper/list`]: {
      name: '试卷管理-列表',
      selectedCode: menuCode.paper,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-paper'], () => import('../../routes/Exam/Paper/List')) : null,
    },
    [`${prefix}/paper/remove`]: {
      name: '试卷管理-回收站',
      selectedCode: menuCode.paper,
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-paper'], () => import('../../routes/Exam/Paper/List')) : null,
    },
    [`${prefix}/pc-reg`]: {
      name: '考试机注册',
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-pc'], () => import('../../routes/Exam/PC/')) : null,
    },
    [`${prefix}/score-report`]: {
      name: '成绩报表',
      component: dynamicWrapper ? dynamicWrapper(app, ['exam-score-report'], () => import('../../routes/Exam/ScoreReport/')) : null,
    },
  }
}

