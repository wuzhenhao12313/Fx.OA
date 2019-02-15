import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
  message,
  Button,
  Input,
  Badge,
  Modal,
  Drawer,
  Icon,
  Select,
  Tabs,
  Row,
  Col,
  Steps,
  Form,
  Card,
} from 'antd';
import Component from '../../../utils/rs/Component';
import FxLayout from '../../../myComponents/Layout/';
import cloneDeep from 'lodash/cloneDeep';
import Format from '../../../utils/rs/Format';
import StandardTable from '../../../myComponents/Table/Standard';
import StandardModal from '../../../myComponents/Modal/Standard';
import SearchForm from '../../../myComponents/Form/Search';
import InLineForm from '../../../myComponents/Form/InLine';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import {fetchApiSync, fetchServiceSync} from "../../../utils/rs/Fetch";
import EditModal from '../../../myComponents/Fx/EditModal';
import {formatDate, formatNumber} from '../../../utils/utils';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import FilesUploader from '../../../myComponents/Fx/FilesUploader';
import LoadingService from '../../../utils/rs/LoadingService';
import ProductInfo from '../../../myComponents/Fx/ProductInfo';
import PicturesUploader from '../../../myComponents/Fx/PicturesUploader';
import Config from "../../../utils/rs/Config";
import Uri from '../../../utils/rs/Uri';
import style from './index.less';
import StandardDatePicker from "../../../myComponents/Date/StandardDatePicker";
import StandardRangePicker from "../../../myComponents/Date/StandardRangePicker";
import ImageModal from '../../../myComponents/Modal/Image';

const modelNameSpace = "supply-purchase_order";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Step = Steps.Step;


@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Form.create()
export default class extends PureComponent{
  render(){
    return(
      <div></div>
    )
  }
}
