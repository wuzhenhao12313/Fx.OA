const prefix = '/hr';

const menuCode = {
  employee: 'oa_employee',
  employeeContract: 'oa_employee_contract',
  employeeInsurance: 'oa_employee_insurance',
  positionLevel: 'oa_position_level',
}

export const getHr = ({app, dynamicWrapper}) => {
  return {
    [`${prefix}/employee`]: {
      name: '员工管理',
      code: menuCode.employee,
      redirect: `${prefix}/employee/home`,
    },
    [`${prefix}/employee/home`]: {
      name: '员工管理',
      selectedCode: menuCode.employee,
      component: dynamicWrapper ? dynamicWrapper(app, ['employee'], () => import('../../routes/Hr/Employee/Home')) : null,
    },
    [`${prefix}/employee/list`]: {
      name: '员工管理',
      selectedCode: menuCode.employee,
      component: dynamicWrapper ? dynamicWrapper(app, ['employee','employee-edit','employee-detail'], () => import('../../routes/Hr/Employee/List')) : null,
    },

    [`${prefix}/employee-contract`]: {
      name: '合同管理',
      code: menuCode.employeeContract,
      redirect: `${prefix}/employee-contract/home`,
    },
    [`${prefix}/employee-contract/home`]: {
      name: '合同管理-首页',
      selectedCode: menuCode.employeeContract,
      component: dynamicWrapper ? dynamicWrapper(app, ['employee-contract'], () => import('../../routes/Hr/EmployeeContract/Home')) : null,
    },
    [`${prefix}/employee-contract/list`]: {
      name: '合同管理-列表',
      selectedCode: menuCode.employeeContract,
      component: dynamicWrapper ? dynamicWrapper(app, ['employee-contract'], () => import('../../routes/Hr/EmployeeContract/List')) : null,
    },

    [`${prefix}/employee-insurance`]: {
      name: '社保管理',
      code: menuCode.employeeInsurance,
      redirect: `${prefix}/employee-insurance/list`,
    },
    [`${prefix}/employee-insurance/list`]: {
      name: '社保管理-列表',
      selectedCode: menuCode.employeeInsurance,
      component: dynamicWrapper ? dynamicWrapper(app, ['employee-insurance'], () => import('../../routes/Hr/EmployeeInsurance/List')) : null,
    },


    [`${prefix}/position-level`]: {
      name: '职位等级',
      component: dynamicWrapper ? dynamicWrapper(app, ['position_level'], () => import('../../routes/Hr/PositionLevel/List')) : null,
    },


    [`${prefix}/recruit`]: {
      name: '招聘登记',
      component: dynamicWrapper ? dynamicWrapper(app, ['recruit'], () => import('../../routes/Hr/Recruit/')) : null,
    },

  }
}
