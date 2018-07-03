import 'babel-polyfill';
import dva from 'dva';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import './g2';
import onError from './error';
import './utils/extension';
// import browserHistory from 'history/createBrowserHistory';
import './index.less';
// 1. Initialize
const app = dva({
  ...createLoading({
    effects: true,
  }),
  onError,
});

// 2. Plugins
// app.use({});

// 3. Register global model
app.model(require('./models/global'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');




