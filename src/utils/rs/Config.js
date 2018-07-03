const Config = {
  title: '破浪管理系统',
  appCode: 'OA',
  homepage: '/dashboard/workplace',
  logo: '',
  cdn: 'http://cdn.polelong.com',
  defaultImage: 'http://cdn.polelong.com/image/loading.gif',
  defaultAvator: 'http://cdn.polelong.com/image/defaultLogo.jpg',
  serialLogo: 'http://cdn.polelong.com/image/serialLogo.png',
  imgServer: 'http://erpimg1.polelong.com',
  uploadServer: 'http://fxServer.polelong.com/Uploader',
  localUploadServer: 'http://fxServer.lpole.com/Uploader',
  dev: {
    url: 'http://oa.lpole.com:8081/',
    fxService: 'http://fxServer.lpole.com',
    fxApi: 'http://fxServer.lpole.com/api',
    loginServer: 'http://login.lpole.com:8082/#/user/login',
  },
  prod: {
    url: 'http://oa.polelong.com/',
    fxService: 'http://fxServer.polelong.com',
    fxApi: 'http://fxServer.polelong.com/api',
    loginServer: 'http://login.polelong.com/#/user/login',
  },
  webSetting: {
    pageSize: localStorage.getItem('pageSize') === null ? 10
      : parseInt(localStorage.getItem('pageSize')),
    stageLayout: localStorage.getItem('stageLayout') === null ? 'top'
      : localStorage.getItem('stageLayout').toString(),
    theme: localStorage.getItem('fx_theme') === null ? 'dark'
      : localStorage.getItem('fx_theme').toString(),
  },
  siderBaseWidth: 220,
  GetConfig(key) {
    if (process.env.NODE_ENV === 'production') {
      return this.prod[key];
    } else {
      return this.dev[key];
    }
  },
}
export default Config;
