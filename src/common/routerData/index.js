import {getDashboard} from './dashboard';
import {getInfoCenter} from './infoCenter';
import {getHr} from './hr';
import {getExam} from './exam';
import {getAssess} from "./assess";
import { getShop } from './shop';
import { getMateriel } from './materiel';
import {getSupply} from "./supply";
import {getFinance} from './finance';

export const getRouter = ({app, dynamicWrapper}) => {
  return {
    ...getDashboard({app, dynamicWrapper}),
    ...getInfoCenter({app, dynamicWrapper}),
    ...getHr({app, dynamicWrapper}),
    ...getExam({app, dynamicWrapper}),
    ...getAssess({app, dynamicWrapper}),
    ...getShop({app, dynamicWrapper}),
    ...getMateriel({app, dynamicWrapper}),
    ...getSupply({app, dynamicWrapper}),
    ...getFinance({app, dynamicWrapper}),
  }
}

export const get2LevelRouter = () => {
  const routerData = getRouter({app: null, dynamicWrapper: null});
  const result = {};
  Object.keys(routerData).forEach(key => {
    if (routerData[key]["code"] || routerData[key]["selectedCode"]) {
      result[key] = {
        code: routerData[key]["code"] || routerData[key]["selectedCode"],
        name: routerData[key]['name'],
        stage: !!routerData[key]['stage'],
      };
    }
  });
  return result;
}


