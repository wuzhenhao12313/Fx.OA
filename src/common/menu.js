const menuData = [
  {
    name: '应用管理',
    icon: 'appstore',
    path: 'app',
    children: [
      {
        name: 'APP列表',
        path: 'list',
      },
      {
        name: 'APP模块',
        path: 'list/menu',
        hideInMenu: true,
      },
      {
        name: 'APP模块操作',
        path: 'list/menu/action',
        hideInMenu: true,
      },
    ],
  },
  {
    name: '通用设置',
    icon: 'setting',
    path: 'setting',
    children: [
      {
        name: '部门管理',
        path: 'department',
      },
      {
        name: '职位管理',
        path: 'position',
      },
      {
        name: '职级管理',
        path: 'position-level',
      },
      {
        name: '用户管理',
        path: 'user',
      },
      {
        name: '角色管理',
        path: 'role',
      },
      {
        name: '角色授权',
        path: 'role/auth',
        hideInMenu: true,
      },
      {
        name: '字典管理',
        path: 'dict',
      },
      {
        name: '条目管理',
        path: 'dict/item',
        hideInMenu: true,
      },
    ],
  },
];

function formatter(data, parentPath = '') {
  const list = [];
  data.forEach((item) => {
    if (item.children) {
      list.push({
        ...item,
        path: `${parentPath}${item.path}`,
        children: formatter(item.children, `${parentPath}${item.path}/`),
      });
    } else {
      list.push({
        ...item,
        path: `${parentPath}${item.path}`,
      });
    }
  });
  return list;
}

export const getMenuData = () => formatter(menuData);
