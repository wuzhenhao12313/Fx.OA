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
import ImageModal from '../../../myComponents/Modal/Image';

const modelNameSpace = "supply-contract";
const Fragment = React.Fragment;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Step = Steps.Step;

const departmentData = fetchApiSync({url: '/Department/Get',});
const departmentList = departmentData.data.toObject().list.toObject();
const supplierData = fetchApiSync({url: '/Supply/GetAllSupplier',});
const supplierList = supplierData.data.toObject().list;
const formatter = {
  department: {},
  supplier: {},
};
departmentList.forEach(department => {
  formatter.department[`${department['depID']}`] = department['depName'];
});
supplierList.forEach(supplier => {
  formatter.supplier[`${supplier['id']}`] = supplier['name'];
})

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
@Component.Pagination({model: modelNameSpace})
@Component.Role('erp_supply_contract')
@Form.create()
export default class extends PureComponent {
  state = {
    fileUploadModalProps: {
      visible: false,
      index: -1,
      row: {},
      currentFile: null,
    },
    addContractModalProps: {
      visible: false,
      itemList: [],
      step: 1,
      conditionList: [],
    },
    detailDrawerProps: {
      visible: false,
      row: {},
    },
    takeProductModalProps: {
      visible: false,
      row: {},
      loading: false,
    },
    batchDrawerProps: {
      visible: false,
      itemRow: {},
    },
    payModalProps: {
      visible: false,
      row: {},
      isAdd: true,
      payType: null,
    },
    editContractModalProps: {
      visible: false,
      row: {},
    },
    payRecordModalProps: {
      visible: false,
      row: {},
    },
    payFileModalProps:{
      visible:false,
      row:{},
    }
  }

  componentDidMount() {
    this.getList(1);
  }

  ref = {
    filesUploader: null,
    takeProductForm: null,
    editContractForm: null,
    searchItemForm: null,
    payForm: null,
    payFileForm:null,
  }

  changeAddContractModalProps = (props) => {
    this.setState({
      addContractModalProps: {
        ...this.state.addContractModalProps,
        ...props,
      }
    });
  }

  getList = (page, searchValue) => {
    const {model} = this.props;
    const {pageIndex, pageSize} = this.props[modelNameSpace];
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total: 0,
      }
    }).then(() => {
      model.get({
        pageIndex,
        pageSize,
        ...searchValue,
      });
    });
  };

  removeContract = (contractID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除合同',
      content: '确定要删除合同吗？删除后将无法恢复',
      onOk: () => {
        model.call("removeContract", {
          contractID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
  }

  submitContract = (contractID) => {
    const {model} = this.props;
    Modal.confirm({
      title: '提交合同',
      content: '确定要提交合同吗？删除后将无法恢复',
      onOk: () => {
        model.call("submitContract", {
          contractID,
        }).then(success => {
          if (success) {
            this.getList();
          }
        });
      }
    });
  }

  changeFileList = (questionFileList) => {
    const currentFile = {
      ...questionFileList[0],
    };
    this.changeFileUploadModalProps({currentFile});
  }

  changeFileUploadModalProps = (props) => {
    this.setState({
      fileUploadModalProps: {
        ...this.state.fileUploadModalProps,
        ...props,
      }
    });
  }

  saveFile = () => {
    const {model} = this.props;
    const {fileUploadModalProps: {currentFile, index, row}} = this.state;
    const entity = {
      ...row,
    }
    if (!currentFile) {
      message.warning("请先上传一个文件");
      return;
    }
    entity.fileUrl = currentFile.url;
    entity.fileName = currentFile.name;

    model.call("editContract", {contractEntity: entity, isUpload: true}).then(success => {
      if (success) {
        this.changeFileUploadModalProps({visible: false, currentFile: null});
        this.getList();
      }
    });
  }

  closeAddContractModal = () => {
    Modal.confirm({
      title: '退出合同新增',
      content: '确定要退出吗？退出后将无法还原。',
      onOk: () => {
        this.setState({
          addContractModalProps: {
            visible: false,
          }
        });
      }
    });
  }

  changeItemValueInCreate = (column, value, index) => {
    const {itemList} = this.state.addContractModalProps;
    itemList[index][column] = value;
    this.setState({
      addContractModalProps: {
        ...this.state.addContractModalProps,
        itemList,
      }
    });
  }

  changeConditionValueInCreate = (column, value, index) => {
    const {conditionList} = this.state.addContractModalProps;
    conditionList[index][column] = value;
    this.setState({
      addContractModalProps: {
        ...this.state.addContractModalProps,
        conditionList,
      }
    });
  }

  addContractItemInCreate = () => {
    const {itemList} = this.state.addContractModalProps;
    const item = {
      index: itemList.length,
      productCode: null,
      price: null,
      num: null,
      conditionList: [],
    };
    itemList.push(item);
    this.setState({
      addContractModalProps: {
        ...this.state.addContractModalProps,
        itemList,
      }
    });
  };

  addContractConditionInCreate = () => {
    const {conditionList} = this.state.addContractModalProps;
    const condition = {
      index: conditionList.length,
      productCode: null,
      startDate: undefined,
      endDate: undefined,
      needDeliverNum: null,
    };
    conditionList.push(condition);
    this.changeAddContractModalProps({conditionList,});
  }

  removeContractItemInCreate = (index) => {
    const {itemList, conditionList} = this.state.addContractModalProps;
    if (conditionList.filter(x => x.productCode === itemList[index].productCode).length > 0) {
      message.warning("请先删除此ASIN的约束");
      return;
    }
    itemList.splice(index, 1);
    this.setState({
      addContractModalProps: {
        ...this.state.addContractModalProps,
        itemList,
      }
    });
  }

  removeContractConditionInCreate = (index) => {
    const {conditionList} = this.state.addContractModalProps;
    conditionList.splice(index, 1);
    this.changeAddContractModalProps({conditionList});
  }

  editContractInfo = () => {
    const {row} = this.state.editContractModalProps;
    const {model} = this.props;
    const {getFieldsValue} = this.ref.editContractForm.props.form;
    let {contractTitle, contractCustomNo, startDate, supplierID, advancePay, freight} = getFieldsValue();
    startDate = startDate.format('YYYY-MM-DD');
    model.call('editContractInfo', {
      contractID: row.id,
      contractTitle,
      contractCustomNo,
      advancePay,
      supplierID,
      startDate,
      freight,
    }).then(success => {
      if (success) {
        this.getList(1);
        this.setState({
          editContractModalProps: {
            visible: false,
          }
        })
      }
    });
  }

  saveContract = () => {
    const {itemList, conditionList} = this.state.addContractModalProps;
    const _itemList = cloneDeep(itemList) || [];
    const _conditionList = cloneDeep(conditionList) || [];


    _conditionList.forEach(x => {
      x.startDate = x.startDate.format('YYYY-MM-DD');
      x.endDate = x.endDate.format('YYYY-MM-DD');
      if (_itemList.filter(item => item.productCode === x.productCode).length > 0) {
        _itemList.filter(item => item.productCode === x.productCode)[0].conditionList.push(x);
      }
    });
    const itemStr = JSON.stringify(_itemList);
    const {model} = this.props;
    const {getFieldsValue} = this.props.form;
    let {contractTitle, startDate, endDate, advancePay, contractCustomNo, supplierID, freight} = getFieldsValue();
    startDate = startDate.format('YYYY-MM-DD');
    endDate = endDate ? endDate.format('YYYY-MM-DD') : null;
    LoadingService.Start("正在保存合同数据，请稍后...");
    model.call('addContract', {
      contractTitle,
      isSubmit: 0,
      startDate,
      endDate,
      itemStr,
      advancePay,
      contractCustomNo,
      supplierID,
      freight,
    }).then(success => {
      if (success) {
        this.changeAddContractModalProps({visible: false});
        this.getList(1);
      }
      LoadingService.Done();
    });
  }

  openDetailDrawer = (row) => {
    this.getContractItem(row);
    this.setState({detailDrawerProps: {visible: true, row}});
  }

  getContractItem = (row) => {
    const {model} = this.props;
    let value = {};
    if (this.ref.searchItemForm) {
      const {getFieldsValue} = this.ref.searchItemForm.props.form;
      value = getFieldsValue();
    }
    model.call(row.isSubmit === 0 ? 'getContractDetailByIDInCreate'
      : 'getContractDetailByID', {contractID: row.id, ...value}).then(() => {
    });
  }

  addContractConditionInEdit = () => {
    const {conditionList} = this.props[modelNameSpace];
    const {model} = this.props;
    const condition = {
      isNew: true,
      contractID: null,
      itemID: null,
      startDate: undefined,
      endDate: undefined,
      needDeliverNum: null,
    };
    conditionList.push(condition);
    model.setState({
      conditionList,
    });
  }

  addContractItemInEdit = () => {
    const {itemList} = this.props[modelNameSpace];
    const {model} = this.props;
    const item = {
      isNew: true,
      contractID: null,
      itemID: null,
      price: null,
      productCode: null,
      num: null,
    };
    itemList.push(item);
    model.setState({
      itemList,
    });
  }

  removeContractItem = (contractItemID, isNew, index) => {
    const {model} = this.props;
    const {itemList, conditionList} = this.props[modelNameSpace];
    if (isNew) {
      itemList.splice(index, 1);
      model.setState({
        itemList,
      });
    } else {
      Modal.confirm({
        title: '删除合同子项',
        content: '确定要删除吗？删除后将无法恢复。',
        onOk: () => {
          model.call('removeContractItem', {
            contractItemID,
          }).then(success => {
            if (success) {
              index = itemList.findIndex(x => x.itemID === contractItemID);
              itemList.splice(index, 1);
              conditionList.forEach((x, idx) => {
                if (x.itemID === contractItemID) {
                  conditionList.splice(idx, 1);
                }
              });
              model.setState({
                itemList,
                conditionList,
              });
            }
          });
        }
      });

    }
  }

  removeContractCondition = (contractConditionID, isNew, index) => {
    const {model} = this.props;
    const {conditionList} = this.props[modelNameSpace];
    if (isNew) {
      conditionList.splice(index, 1);
      model.setState({
        conditionList,
      });
    } else {
      Modal.confirm({
        title: '删除约束条件',
        content: '确定要删除吗？删除后将无法恢复。',
        onOk: () => {
          model.call('removeContractCondition', {
            contractConditionID,
          }).then(success => {
            if (success) {
              index = conditionList.findIndex(x => x.conditionID === contractConditionID);
              conditionList.splice(index, 1);
              model.setState({
                conditionList,
              })
            }
          });
        }
      });

    }
  }

  saveContractCondition = (conditionEntity, index) => {
    const {model} = this.props;
    const {itemList, conditionList} = this.props[modelNameSpace];
    const {row} = this.state.detailDrawerProps;
    conditionEntity.contractID = row.id;
    conditionEntity.startDate = conditionEntity.startDate ? moment(conditionEntity.startDate, 'YYYY-MM-DD') : null;
    conditionEntity.endDate = conditionEntity.endDate ? moment(conditionEntity.endDate, 'YYYY-MM-DD') : null;
    model.call('addContractCondition', {
      conditionEntity,
    }).then(({success, data}) => {
      if (success) {
        const {record} = data.toObject();
        conditionList.splice(index, 1, record);
        model.setState({conditionList});
      }
    });
  }

  saveContractItem = (itemEntity, index) => {
    const {model} = this.props;
    const {itemList, conditionList} = this.props[modelNameSpace];
    const {row} = this.state.detailDrawerProps;
    itemEntity.contractID = row.id;
    model.call('addContractItem', {
      itemEntity,
    }).then(({success, data}) => {
      if (success) {
        const {record} = data.toObject();
        itemList.splice(index, 1, record);
        model.setState({itemList});
      }
    });
  }

  updateContractCondition = (conditionEntity) => {
    const {model} = this.props;
    conditionEntity.startDate = conditionEntity.startDate ? moment(conditionEntity.startDate, 'YYYY-MM-DD') : null;
    conditionEntity.endDate = conditionEntity.endDate ? moment(conditionEntity.endDate, 'YYYY-MM-DD') : null;
    model.call('editContractCondition', {
      conditionEntity,
    });
  }

  updateContractItem = (itemEntity) => {
    const {model} = this.props;
    model.call('editContractItem', {
      itemEntity,
    });
  }

  changeConditionValueInEdit = (column, value, index) => {
    const {model} = this.props;
    const {itemList, conditionList} = this.props[modelNameSpace];
    conditionList[index][column] = value;
    model.setState({
      conditionList,
    });
  }

  changeItemValueInEdit = (column, value, index) => {
    const {model} = this.props;
    const {itemList, conditionList} = this.props[modelNameSpace];
    itemList[index][column] = value;
    model.setState({
      itemList,
    });
  }

  getContractStep = (contract) => {
    if (contract.isSubmit === 0) {
      return {
        step: 0,
        arr: [
          {
            status: 'process',
            title: '等待提交',
          },
          {
            title: '待审核',
            status: 'wait',
          },
          {
            title: '待收货',
            status: 'wait',
          },
          {
            title: '已完成',
            status: 'wait',
          }
        ],
      }
    }
    if (contract.isSubmit === 1 && contract.status === 0) {
      return {
        step: 1,
        arr: [
          {
            status: 'finish',
            title: '已提交',
          },
          {
            title: '待审核',
            status: 'process',
          },
          {
            title: '待收货',
            status: 'wait',
          },
          {
            title: '等待完成',
            status: 'wait',
          }
        ],
      }
    }
    if (contract.isSubmit === 1 && contract.isStop === 0 && contract.status === 1) {
      return {
        step: 2,
        arr: [
          {
            status: 'finish',
            title: '等待提交',
          },
          {
            title: '已通过',
            status: 'finish',
          },
          {
            title: '待收货',
            status: 'process',
          },
          {
            title: '等待完成',
            status: 'wait',
          }
        ],
      }
    }
    if (contract.isSubmit === 1 && contract.isStop === 0 && contract.status === 2) {
      return {
        step: 2,
        arr: [
          {
            status: 'finish',
            title: '等待提交',
          },
          {
            title: '已驳回',
            status: 'error',
          },
          {
            title: '待收货',
            status: 'wait',
          },
          {
            title: '等待完成',
            status: 'wait',
          }
        ],
      }
    }
    if (contract.isStop === 1) {
      return {
        step: 2,
        arr: [
          {
            status: 'finish',
            title: '已提交',
          },
          {
            title: '已通过',
            status: 'finish',
          },
          {
            title: '收货完成',
            status: 'finish',
          },
          {
            title: '已完成',
            status: 'finish',
          }
        ],
      }
    }
  }

  takeProduct = (contractItemID) => {
    const {model} = this.props;
    const {getFieldsValue} = this.ref.takeProductForm.props.form;
    const {row} = this.state.takeProductModalProps;
    let {takeNum, takeDate} = getFieldsValue();
    takeDate = takeDate ? takeDate.format('YYYY-MM-DD HH:MM') : null,
      this.setState({
        takeProductModalProps: {
          ...this.state.takeProductModalProps,
          loading: true,
        }
      });
    model.call('takeProduct', {
      contractItemID,
      takeNum,
      takeDate,
    }).then(success => {
      if (success) {
        model.call('getContractDetailByID', {contractID: row.contractID,});
        this.setState({takeProductModalProps: {visible: false}});
      }
      this.setState({
        takeProductModalProps: {
          ...this.state.takeProductModalProps,
          loading: false,
        }
      });
    });
  }

  removeTake = (row) => {
    const {model} = this.props;
    Modal.confirm({
      title: '删除收货记录',
      onOk: () => {
        model.call('removeTake', {
          takeID: row.id,
        }).then(success => {
          if (success) {
            model.call('getTakeProductBatchByItemID', {contractItemID: row.itemID,});
          }
        });
      }
    });
  }

  GetTakeProductBatchByItemID = (contractItemID) => {
    const {model} = this.props;
    model.call('getTakeProductBatchByItemID', {contractItemID,});
  }

  payTakeMoney = () => {
    const {row, payType} = this.state.payModalProps;
    const {getFieldsValue} = this.ref.payForm.props.form;
    const {payFileUrl, payMoney} = getFieldsValue();
    const {model} = this.props;
    model.call('payMoney', {
      contractID: row.id,
      payMoney: payMoney * 1,
      payFileUrl: payFileUrl ? payFileUrl[0] : null,
      payType,
    }).then(success => {
      if (success) {
        this.setState({payModalProps: {visible: false}});
        this.getList();
      }
    });
  }

  getPayList = (contractID) => {
    const {model} = this.props;
    model.call('getPayRecordByContractID', {
      contractID,
    });
  }

  openPayRecordModal = (row) => {
    this.setState({
      payRecordModalProps: {
        visible: true,
        row,
      }
    });
    this.getPayList(row.id);
  }

  changeImageList = (questionImageList) => {
    const {setFieldsValue} = this.ref.payForm.props.form;
    setFieldsValue({
      payFileUrl: questionImageList[0],
    });
  }

  editPay = () => {
    const {getFieldsValue} = this.ref.payFileForm.props.form;
    const {payFileUrl} = getFieldsValue();
    const {model} = this.props;
    const {row}=this.state.payFileModalProps;
    model.call('editPay', {
      payID: row.id,
      payMoney: row.actualPayMoney * 1,
      payFileUrl: payFileUrl ? payFileUrl[0] : null,
    }).then(success => {
      if (success) {
        this.setState({payFileModalProps: {visible: false}});
        this.getPayList(row.contractID);
      }
    });
  }

  removePay=(payID)=>{
    const {model}=this.props;
    const {row}=this.state.payRecordModalProps;
    Modal.confirm({
      title:'删除付款记录',
      content:'确定要删除吗,删除了将无法恢复.',
      onOk:()=>{
        model.call('removePay',{
          payID,
        }).then(success=>{
          if(success){
            this.getPayList(row.id);
          }
        });
      }
    })
  }

  renderFileUploaderModal() {
    const {visible} = this.state.fileUploadModalProps;
    return (
      <StandardModal
        visible={visible}
        title='合同文件上传'
        onCancel={e => this.setState({fileUploadModalProps: {visible: false, currentFile: null, row: {},}})}
        width={400}
        onOk={e => this.saveFile()}
      >
        <FilesUploader
          type="pdf"
          ref={node => this.ref.filesUploader = node}
          desc={`( 仅支持上传 [.pdf] 格式的文件 )`}
          onChange={this.changeFileList}
        />
      </StandardModal>
    )
  }

  renderAddContractModal() {
    const {visible, itemList, step, conditionList} = this.state.addContractModalProps;
    const {getFieldDecorator} = this.props.form;
    const {supplierList} = this.props[modelNameSpace];
    const columns = [
      {
        title: 'ASIN',
        dataIndex: 'productCode',
        width: 200,
        render: (text, row, index) => {
          return (
            <Input value={text} onChange={e => this.changeItemValueInCreate("productCode", e.target.value, index)}/>)
        }
      },
      {
        title: '单价',
        dataIndex: 'price',
        render: (text, row, index) => {
          return (<Input value={text} onChange={e => this.changeItemValueInCreate("price", e.target.value, index)}/>)
        }
      },
      {
        title: '数量',
        dataIndex: 'num',
        render: (text, row, index) => {
          return (<Input value={text} onChange={e => this.changeItemValueInCreate("num", e.target.value, index)}/>)
        }
      },
      {
        title: '约束条件',
        dataIndex: 'check',
        render: (text, row, index) => {
          return (
            <div>
              {conditionList.filter(x => x.productCode === row.productCode).map(x => {
                return (
                  <p>
                    <span style={{marginRight: 5}}>{formatDate(x.startDate, 'YYYY-MM-DD')}</span>
                    -
                    <span style={{marginLeft: 5, marginRight: 10}}>{formatDate(x.endDate, 'YYYY-MM-DD')}</span>
                    <span>需收货 {x.needNum} 个</span>
                  </p>
                )
              })}
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          return <a onClick={e => this.removeContractItemInCreate(index)}>删除</a>
        }
      }
    ];
    const conditionColumns = [
      {
        title: '开始日期',
        dataIndex: 'startDate',
        render: (text, row, index) => {
          return (
            <StandardDatePicker value={text}
                                onChange={value => this.changeConditionValueInCreate("startDate", value, index)}/>
          )
        }
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        render: (text, row, index) => {
          return (
            <StandardDatePicker value={text}
                                onChange={value => this.changeConditionValueInCreate("endDate", value, index)}/>
          )
        }
      },
      {
        title: '需要收货数量',
        dataIndex: 'needNum',
        render: (text, row, index) => {
          return (
            <Input value={text} onChange={e => this.changeConditionValueInCreate("needNum", e.target.value, index)}/>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          return <a onClick={e => this.removeContractConditionInCreate(index)}>删除</a>
        }
      }
    ];
    return (
      <StandardModal
        title='新增合同'
        visible={visible}
        onCancel={this.closeAddContractModal}
        width={1200}
        footer={null}
      >
        <div style={{display: step === 1 ? "block" : 'none'}}>
          <Form layout='horizontal' className='ant-form-slim' style={{marginBottom: 12}}>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label='合同标题'>
                  {getFieldDecorator("contractTitle", {
                    rules: [{required: true, message: '请输入合同标题!'}],
                  })(
                    <Input placeholder='请输入合同标题'/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label='合同自定义编号'>
                  {getFieldDecorator("contractCustomNo", {
                    rules: [{required: true, message: '请填写自定义编号!'}],
                  })(
                    <Input placeholder='请填写自定义编号'/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label='开始日期'>
                  {getFieldDecorator("startDate", {
                    rules: [{required: true, message: '请选择开始日期!'}],
                  })(
                    <StandardDatePicker/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label='结束日期'>
                  {getFieldDecorator("endDate")(
                    <StandardDatePicker/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label='预付款金额'>
                  {getFieldDecorator("advancePay", {
                    rules: [{required: true, message: '请填写预付款金额!'}],
                  })(
                    <Input placeholder='请填写预付款金额'/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label='供应商'>
                  {getFieldDecorator("supplierID", {
                    rules: [{required: true, message: '请选择供应商!'}],
                  })(
                    <Select>
                      {supplierList.map(x => {
                        return (<Option key={x.id} value={x.id}>{x.name}</Option>)
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label='运费'>
                  {getFieldDecorator("freight")(
                    <Input placeholder='请填写运费'/>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
          {/*<StandardTable*/}
            {/*rowKey={record => record.index}*/}
            {/*columns={columns}*/}
            {/*dataSource={itemList}*/}
          {/*/>*/}
          {/*<Button type='dashed' style={{width: '100%', marginBottom: 24}} icon='plus'*/}
                  {/*onClick={this.addContractItemInCreate}>添加合同子项</Button>*/}
        </div>
        <div style={{display: step === 2 ? "block" : 'none'}}>
          <StandardTable
            rowKey={record => record.index}
            columns={conditionColumns}
            dataSource={conditionList}
          />
          <Button type='dashed' style={{width: '100%', marginBottom: 24}} icon='plus'
                  onClick={this.addContractConditionInCreate}>添加合同约束</Button>

        </div>
        <div style={{textAlign: 'center'}}>
          {step === 1 ?
            <div>
              <Button type='primary' style={{marginRight: 10}} icon='arrow-right'
                      onClick={e => this.changeAddContractModalProps({step: 2})}>约束管理</Button>
              <Button type='dashed' icon='save' onClick={e => this.saveContract()}>立即保存</Button>
            </div> : null
          }
          {
            step === 2 ?
              <div>
                <Button type='primary' style={{marginRight: 10}} icon='arrow-left'
                        onClick={e => this.changeAddContractModalProps({step: 1})}>返回</Button>
                <Button type='dashed' icon='save' onClick={e => this.saveContract()}>保存</Button>
              </div> : null
          }
        </div>
      </StandardModal>
    )
  }

  renderTakeProductModal() {
    const {visible, row, loading} = this.state.takeProductModalProps;
    const item = [
      {
        label: '收货数量',
        key: 'takeNum',
        rules: [
          {required: true, message: '请填写收货数量'},
        ],
        render: () => {
          return (<Input placeholder='请输入收货数量'/>)
        }
      },
      {
        label: '收货时间',
        key: 'takeDate',
        render: () => {
          return (<StandardDatePicker allowClear/>)
        }
      }
    ];
    return (
      <EditModal
        item={item}
        zIndex={1001}
        refForm={node => this.ref.takeProductForm = node}
        visible={visible}
        title='采购收货'
        onCancel={e => this.setState({takeProductModalProps: {visible: false}})}
        onOk={e => this.takeProduct(row.itemID)}
        footer={true}
        confirmLoading={loading}
      />
    )
  }

  renderDetailNoSubmit() {
    const {itemList, conditionList} = this.props[modelNameSpace];
    const columns = [
      {
        title: 'ASIN',
        dataIndex: 'productCode',
        width: 200,
        render: (text, row, index) => {
          if (!row.isNew) {
            return text;
          }
          return (
            <Input value={text} onChange={e => this.changeItemValueInEdit("productCode", e.target.value, index)}/>)
        }
      },
      {
        title: '单价',
        dataIndex: 'price',
        render: (text, row, index) => {
          return (<Input value={text} onChange={e => this.changeItemValueInEdit("price", e.target.value, index)}/>)
        }
      },
      {
        title: '数量',
        dataIndex: 'num',
        render: (text, row, index) => {
          return (<Input value={text} onChange={e => this.changeItemValueInEdit("num", e.target.value, index)}/>)
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '删除',
              submit: () => this.removeContractItem(row.itemID, row.isNew, index),
            },
            {
              label: '保存',
              isShow: !!row.isNew,
              submit: () => this.saveContractItem(row, index),
            },
            {
              label: '更改',
              isShow: !row.isNew,
              submit: () => this.updateContractItem(row, index),
            }
          ];
          return <TableActionBar action={action}/>
        }
      }
    ];
    const conditionColumns = [
      {
        title: '开始日期',
        dataIndex: 'startDate',
        render: (text, row, index) => {
          return (
            <StandardDatePicker
              value={text ? moment(text) : undefined}
              onChange={value => this.changeConditionValueInEdit("startDate", value, index)}
              allowClear/>
          )
        }
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        render: (text, row, index) => {
          return (
            <StandardDatePicker
              value={text ? moment(text) : undefined}
              onChange={value => this.changeConditionValueInEdit("endDate", value, index)}
              allowClear/>
          )
        }
      },
      {
        title: '需要收货数量',
        dataIndex: 'needDeliverNum',
        render: (text, row, index) => {
          return (
            <Input value={text}
                   onChange={e => this.changeConditionValueInEdit("needDeliverNum", e.target.value, index)}/>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '删除',
              submit: () => this.removeContractCondition(row.conditionID, row.isNew, index),
            },
            {
              label: '保存',
              isShow: !!row.isNew,
              submit: () => this.saveContractCondition(row, index),
            },
            {
              label: '更改',
              isShow: !row.isNew,
              submit: () => this.updateContractCondition(row, index),
            }
          ];
          return <TableActionBar action={action}/>
        }
      }
    ];
    return (
      <div style={{border: '1px solid #e8e8e8', padding: 24}}>
        {/*<h3>合同子项</h3>*/}
        {/*<StandardTable*/}
          {/*bordered={true}*/}
          {/*rowKey={record => record.itemID}*/}
          {/*columns={columns}*/}
          {/*dataSource={itemList}*/}
        {/*/>*/}
        {/*<Button type='dashed' style={{width: '100%', marginBottom: 24}} icon='plus'*/}
                {/*onClick={this.addContractItemInEdit}>添加合同子项</Button>*/}
        <h3>合同约束</h3>
        <StandardTable
          bordered={true}
          rowKey={record => record.conditionID}
          columns={conditionColumns}
          dataSource={conditionList}
        />
        <Button type='dashed' style={{width: '100%', marginBottom: 24}} icon='plus'
                onClick={this.addContractConditionInEdit}>添加合同约束</Button>
      </div>


    )
  }

  renderDetailSubmit() {
    const {itemList} = this.props[modelNameSpace];
    const {row} = this.state.detailDrawerProps;
    const item = [
      {
        key: 'asin',
        label: 'ASIN',
        render: () => {
          return (<Input style={{width: '200'}}/>)
        }
      },
      {
        key: 'search',
        render: () => {
          return (<Button type='primary' onClick={e => this.getContractItem(row)}>搜索</Button>)
        }
      }
    ];
    const columns = [
      {
        title: '图片',
        dataIndex: 'pro_id',
        render: (text) => {
          return (<ProductInfo proId={text}/>)
        }
      },
      {
        title: 'ASIN',
        dataIndex: 'productCode',
      },
      {
        title: '颜色',
        dataIndex: 'color_code',
      },
      {
        title: '尺码',
        dataIndex: 'size_code',
      },
      {
        title: '单价',
        dataIndex: 'purchase_price',
      },
      {
        title: '数量',
        dataIndex: 'purchase_num',
      },
      {
        title: '已收货数量',
        dataIndex: 'takeNum',
        render: (text) => {
          return text || 0;
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, record, index) => {
          const action = [
            // {
            //   label: '收货',
            //   isShow: row.isSubmit === 1 && row.status !== 2 && row.isStop === 0,
            //   submit: () => this.setState({takeProductModalProps: {visible: true, row: record, loading: false}}),
            // },
            {
              label: '查看批次',
              isShow: row.isSubmit === 1 && row.status !== 2 && row.isStop === 0,
              submit: () => {
                this.setState({batchDrawerProps: {visible: true, itemRow: record}});
                this.GetTakeProductBatchByItemID(record.itemID);
              }
            }
          ];
          return <TableActionBar action={action}/>
        }
      }
    ];
    return (
      <div>
        <InLineForm item={item} wrappedComponentRef={node => this.ref.searchItemForm = node}
                    style={{marginBottom: 12}}/>
        <StandardTable
          rowKey={record => record.itemID}
          columns={columns}
          dataSource={itemList}
          bordered
        />
      </div>
    )
  }

  renderEditContractModal() {
    const {visible, row} = this.state.editContractModalProps;
    const item = [
      {
        label: '合同标题',
        key: 'contractTitle',
        initialValue: row.contractTitle,
        rules: [
          {required: true, message: '请输入合同标题'}
        ],
        render: () => {
          return (<Input/>)
        }
      },
      {
        label: '自定义编号',
        key: 'contractCustomNo',
        initialValue: row.contractCustomNo,
        rules: [
          {required: true, message: '请输入自定义编号'}
        ],
        render: () => {
          return (<Input/>)
        }
      },
      {
        label: '开始日期',
        key: 'startDate',
        initialValue: row.startDate ? moment(row.startDate) : null,
        rules: [
          {required: true, message: '请选择开始日期'}
        ],
        render: () => {
          return (<StandardDatePicker/>)
        }
      },
      // {
      //   label:'结束日期',
      //   key:'endDate',
      //   initialValue:row.endDate?moment(row.endDate):null,
      //   render:()=>{
      //     return (<StandardDatePicker />)
      //   }
      // },
      {
        label: '预付款金额',
        key: 'advancePay',
        initialValue: row.advancePay,
        rules: [
          {required: true, message: '请填写预付款金额'}
        ],
        render: () => {
          return (<Input/>)
        }
      },
      {
        label: '供应商',
        key: 'supplierID',
        initialValue: row.supplierID,
        rules: [
          {required: true, message: '请选择供应商'}
        ],
        render: () => {
          return (
            <Select>
              {supplierList.map(x => {
                return (<Option key={x.id} value={x.id}>{x.name}</Option>)
              })}
            </Select>
          )
        }
      },
      {
        label: '运费',
        key: 'freight',
        initialValue: row.freight,
        render: () => {
          return (<Input/>)
        }
      }
    ];
    return (
      <EditModal
        item={item}
        onCancel={e => this.setState({editContractModalProps: {visible: false}})}
        title='编辑合同信息'
        visible={visible}
        footer={true}
        labelCol={7}
        refForm={node => this.ref.editContractForm = node}
        onOk={this.editContractInfo}
      />
    )
  }

  renderBatchDrawer() {
    const {visible} = this.state.batchDrawerProps;
    const {itemTakeProductBatchList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '',
        dataIndex: 'index',
        width: 55,
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '收货人',
        dataIndex: 'takeUsername',
      },
      {
        title: '收货时间',
        dataIndex: 'takeDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '收货数量',
        dataIndex: 'takeNum',
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row, index) => {
          return <a onClick={e => this.removeTake(row)}>删除</a>;
        }
      }
    ];
    return (
      <Drawer
        visible={visible}
        title='收货批次'
        onClose={e => this.setState({batchDrawerProps: {visible: false}})}
        style={{width: 800}}
      >
        <StandardTable
          columns={columns}
          rowKey={record => record.id}
          dataSource={itemTakeProductBatchList}
        />
      </Drawer>
    )
  }

  renderDetailDrawer() {
    const {visible, row} = this.state.detailDrawerProps;
    const obj = this.getContractStep(row);
    return (
      <Drawer
        visible={visible}
        title='合同详情'
        onClose={e => this.setState({detailDrawerProps: {visible: false}}, () => {
          if (row.isSubmit === 0) {
            this.getList();
          }
        })}
        style={{width: row.isSubmit === 0 ? 1200 : 1300}}
      >
        <Steps current={obj.step} status={obj.arr[obj.step]} style={{marginBottom: 24}}>
          {obj.arr.map(x => {
            return (<Step title={x.title} status={x.status}/>)
          })}
        </Steps>
        {row.isSubmit === 0 ? this.renderDetailNoSubmit() : this.renderDetailSubmit()}
        {this.state.batchDrawerProps.visible ? this.renderBatchDrawer() : null}
      </Drawer>
    )
  }

  renderSearchForm() {
    const {actionList} = this.props;
    const item = [
      [
        {
          key: 'contractCustomNo',
          label: '合同编号',
          render: () => {
            return (<Input style={{width: 200}}/>)
          }
        },
        {
          key: 'supplierID',
          label: '供应商',
          render: () => {
            return (
              <AutoSelect style={{width: 200}} allowClear>
                {supplierList.map(x => {
                  return (<Option key={x.id} value={x.id}>{x.name}</Option>)
                })}
              </AutoSelect>
            )
          }
        }
      ]
    ];
    const right = (
      <div style={{marginBottom: 16}}>
        {
          actionList.contains('add') ?
            <Button
              type="primary"
              icon='plus'
              onClick={e => {
                const {model} = this.props;
                model.call("getAllSupplier");
                this.setState({
                  addContractModalProps: {
                    visible: true,
                    itemList: [],
                    step: 1,
                    conditionList: [],
                  }
                })
              }
              }>
              新增合同
            </Button> : null
        }
        <Button type='dashed' icon='retweet' style={{marginLeft: 10}} onClick={e => this.getList()}>刷新</Button>
      </div>
    );
    return (
      <SearchForm
        right={right}
        item={item}
        onSearch={value => this.getList(1, value)}
      />
    )
  }

  renderPayModal() {
    const {visible, isAdd} = this.state.payModalProps;
    const {payRecord} = this.props[modelNameSpace];
    const item = [
      {
        label: '付款金额',
        key: 'payMoney',
        initialValue: isAdd ? undefined : payRecord.actualPayMoney,
        rules: [
          {required: true, message: '请输入付款金额'}
        ],
        render: () => {
          return <Input placeholder='请输入付款金额'/>
        }
      },
      {
        label: '付款凭证',
        key: 'payFileUrl',
        initialValue: isAdd ? undefined : payRecord.payFileUrl ? [payRecord.payFileUrl] : undefined,
        render: () => {
          return (
            <PicturesUploader
              ref={node => this.ref.imagesUploader = node}
              type="question"
              defaultFileList={isAdd ? undefined : payRecord.payFileUrl ? [payRecord.payFileUrl] : undefined}
              onChange={this.changeImageList}
              max={1}
            />)
        },
      },
    ];
    return (
      <EditModal
        item={item}
        title='付款'
        visible={visible}
        refForm={node => this.ref.payForm = node}
        footer={true}
        onCancel={e => this.setState({payModalProps: {visible: false}})}
        onOk={isAdd ? this.payTakeMoney : this.editPay}
      />
    )
  }

  renderPayFileModal() {
    const {visible, row} = this.state.payFileModalProps;
    const item = [
      {
        label: '付款凭证',
        key: 'payFileUrl',
        initialValue: row.payFileUrl ? [row.payFileUrl] : undefined,
        render: () => {
          return (
            <PicturesUploader
              ref={node => this.ref.imagesUploader = node}
              type="question"
              defaultFileList={row.payFileUrl ? [row.payFileUrl] : undefined}
              onChange={this.changeImageList}
              max={1}
            />)
        },
      },
    ];
    return (
      <EditModal
        item={item}
        title='付款'
        visible={visible}
        refForm={node => this.ref.payFileForm = node}
        footer={true}
        onCancel={e => this.setState({payFileModalProps: {visible: false}})}
        onOk={this.editPay}
        zIndex={1001}
      />
    )
  }

  renderPayRecordModal() {
    const {visible} = this.state.payRecordModalProps;
    const {loading, actionList} = this.props;
    const {payList} = this.props[modelNameSpace];
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (text, row, index) => {
          return index + 1;
        }
      },
      {
        title: '付款人员',
        dataIndex: 'payUserName',
      },
      {
        title: '付款时间',
        dataIndex: 'payDate',
        render: (text) => {
          return formatDate(text, 'YYYY-MM-DD HH:MM');
        }
      },
      {
        title: '付款金额',
        dataIndex: 'actualPayMoney',
        render: (text) => {
          return Format.Money.Rmb(text);
        }
      },
      {
        title: '付款类型',
        dataIndex: 'payType',
        render: (text) => {
          return text === "1" ? "收货付款" : '预付款';
        }
      },
      {
        title: '付款凭证',
        dataIndex: 'payFileUrl',
        render: (text, row) => {
          if (!text) {
            if (actionList.contains('uploadPayFile')) {
              return <a onClick={e => this.setState({payFileModalProps: {visible: true, row,}})}>点击上传</a>;
            }
            return null;
          }
          return (
            <ImageModal src={text}/>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text, row) => {
          if (actionList.contains('remove-pay')) {
            return <a onClick={e => this.removePay(row.id)}>删除</a>
          }
          return null;
        }
      },
    ];
    return (
      <StandardModal
        title='付款列表'
        visible={visible}
        width={1000}
        footer={null}
        onCancel={e => this.setState({
          payRecordModalProps: {visible: false}
        })}
      >
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={payList}
          page={false}
          loading={loading.effects[`${modelNameSpace}/get`]}
        />
      </StandardModal>
    )
  }

  renderTable() {
    const {loading, pagination, actionList} = this.props;
    const {data: {list, total}, conditionList, pageIndex, pageSize, allContractMoney, allPayMoney, allProductNum, allTakeNum} = this.props[modelNameSpace];
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        align: 'center',
        width: 55,
        render: (text, row, index) => {
          return (pageIndex - 1) * pageSize + 1 + index;
        }
      },
      {
        title: '合同自定义编号',
        dataIndex: 'contractCustomNo',
      },
      // {
      //   title: '合同标题',
      //   dataIndex: 'contractTitle',
      // },
      {
        title: '供应商',
        dataIndex: 'supplierID',
        render: (text) => {
          return formatter.supplier[text];
        }
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        render: (text) => {
          return formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: '合同金额',
        align: 'center',
        children: [
          {
            title: '商品金额',
            dataIndex: 'totalMoney',
            align: 'right',
            render: (text) => {
              return Format.Money.Rmb(text);
            }
          },
          {
            title: '运费',
            dataIndex: 'freight',
            align: 'right',
            render: (text) => {
              return Format.Money.Rmb(text);
            }
          },
          {
            title: '总计',
            dataIndex: 'total',
            align: 'right',
            render: (text, row) => {
              return Format.Money.Rmb(row.totalMoney + (row.freight ? row.freight : 0));
            }
          }
        ]
      },
      {
        title: '需预付款金额',
        dataIndex: 'advancePay',
        align: 'right',
        render: (text) => {
          return Format.Money.Rmb(text);
        }
      },
      {
        title: '已收货总金额',
        dataIndex: 'takeMoney',
        align: 'right',
        render: (text) => {
          return Format.Money.Rmb(text);
        }
      },
      {
        title: '已付款总金额',
        dataIndex: 'actualpayMoney',
        align: 'right',
        render: (text) => {
          return Format.Money.Rmb(text || 0);
        }
      },
      {
        title: '商品总数量',
        dataIndex: 'allNum',
        align: 'right',
        render: (text) => {
          return text || 0;
        }
      },
      {
        title: '已收货数量',
        dataIndex: 'takeNum',
        align: 'right',
        render: (text) => {
          return text || 0;
        }
      },
      {
        title: '约束条件',
        dataIndex: 'check',
        render: (text, row, index) => {
          const checkDate = fetchServiceSync({
            url: '/Erp/Supply/Product/Purchase' +
            '/GetContractConditionList', params: {contractID: row.id}
          });
          const checkList = checkDate.data.toObject().list || [];
          return (
            <div>
              {checkList.map(x => {
                const takeNUm = x.takeNum || 0;
                let obj = {};
                if (takeNUm >= x.needDeliverNum) {
                  obj = {
                    status: 'success',
                    text: '已完成',
                  };
                }
                if (takeNUm < x.needDeliverNum && moment(x.endDate).endOf('days') > moment().endOf('days')) {
                  obj = {
                    status: 'processing',
                    text: '进行中',
                  }
                }
                if (takeNUm < x.needDeliverNum && moment(x.endDate).endOf('days') <= moment().endOf('days')) {
                  obj = {
                    status: 'error',
                    text: '未达标',
                  }
                }
                return (
                  <p>
                    <span style={{marginRight: 5}}>{formatDate(x.startDate, 'YYYY-MM-DD')}</span>
                    -
                    <span style={{marginLeft: 5, marginRight: 10}}>{formatDate(x.endDate, 'YYYY-MM-DD')}</span>
                    <span style={{marginRight: 10}}>需收货 {x.needDeliverNum} 个</span>
                    <span style={{marginRight: 10}}>已收货 {takeNUm} 个</span>
                    <Badge status={obj.status} text={obj.text}/>
                  </p>
                )
              })}
            </div>
          )
        }
      },
      {
        title: '合同PDF',
        dataIndex: 'fileUrl',
        render: (text, row, index) => {
          if (!text) {
            return <a onClick={e => this.changeFileUploadModalProps({visible: true, index, row,})}>点击上传</a>;
          }
          return (
            <div className={style.fileColumn}>
              <a href={text} target='_blank' style={{marginRight: 10}}>
                <Icon type='file-pdf' style={{fontSize: 18, color: 'green', cursor: 'pointer', marginRight: 5}}/>
                <span>{row.fileName}</span>
              </a>
            </div>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text, row) => {
          let obj = {};

          if (row.status === 0) {
            obj = {status: 'warning', text: '待审核'}
          }
          if (row.status === 1) {
            obj = {status: 'processing', text: '待收货'}
          }
          if (row.status === 2) {
            obj = {status: 'error', text: '已驳回'}
          }
          if (row.isSubmit === 0) {
            obj = {status: 'warning', text: '等待提交'}
          }
          if (row.isStop === 1) {
            obj = {status: 'error', text: '已终止'}
          }
          return (<Badge status={obj.status} text={obj.text}/>);
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        fixed: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '提交',
              isShow: row.isSubmit === 0 && actionList.contains("submit"),
              submit: () => this.submitContract(row.id)
            },
            {
              label: '查看详情',
              isShow: row.isSubmit === 1 || actionList.contains("detail-no-submit"),
              submit: () => {
                this.openDetailDrawer(row);
              }
            },
            {
              label: '付款列表',
              submit: () => {
                this.openPayRecordModal(row);
              }
            }
          ];
          const more = [
            {
              label: '收货付款',
              isShow: row.isSubmit === 1 && row.status === 1 && actionList.contains('take-pay'),
              submit: () => {
                this.setState({
                  payModalProps: {visible: true, isAdd: true, row, payType: "1"}
                })
              },
            },
            {
              label: '预付款',
              isShow: row.isSubmit === 1 && row.status === 1 && actionList.contains('advance-pay') && !row.advancePayID && row.advancePay !== 0,
              submit: () => {
                this.setState({
                  payModalProps: {visible: true, isAdd: true, row, payType: "0"}
                })
              },
            },
            {
              label: '编辑合同信息',
              submit: () => {
                this.setState({editContractModalProps: {visible: true, row,}});
              }
            },
            {
              label: '更改Pdf',
              submit: () => {
                this.changeFileUploadModalProps({visible: true, index, row});
              }
            },
            {
              label: '删除',
              isShow: (row.isSubmit === 0 && actionList.contains('remove') || (row.isSubmit === 1 && actionList.contains('submit-remove'))),
              submit: () => {
                this.removeContract(row.id);
              }
            }
          ];
          return (<TableActionBar action={action} more={more}/>)
        }
      }
    ];
    return (
      <div>
        <Card style={{marginBottom: 24, marginTop: 16}}>
          <Row>
            <Col span={6}>
              <div className='headerInfo'>
                <span>总合同金额</span>
                <p>{Format.Money.Rmb(allContractMoney)}</p>
                <em/>
              </div>
            </Col>
            <Col span={6}>
              <div className='headerInfo'>
                <span>总付款金额</span>
                <p>{Format.Money.Rmb(allPayMoney)}</p>
                <em/>
              </div>
            </Col>
            <Col span={6}>
              <div className='headerInfo'>
                <span>总商品数量</span>
                <p>{formatNumber(allProductNum, 0)}</p>
              </div>
            </Col>
            <Col span={6}>
              <div className='headerInfo'>
                <span>总收货数量</span>
                <p>{formatNumber(allTakeNum, 0)}</p>
              </div>
            </Col>
          </Row>
        </Card>
        <StandardTable
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          page={pagination({pageIndex, total}, this.getList)}
          loading={loading.effects[`${modelNameSpace}/get`]}
          bordered={true}
          scroll={{x: 2000}}
        />
      </div>
    )
  }

  render() {
    const fxLayoutProps = {
      pageHeader: {
        title: '商品采购合同'
      },
      header: {
        extra: this.renderSearchForm(),
      },
      body: {
        center: this.renderTable(),
      },
      // footer: {
      //   pagination: pagination({pageIndex, total}, this.getList),
      // }
    };
    return (
      <div>
        <FxLayout {...fxLayoutProps} />
        {this.state.fileUploadModalProps.visible ? this.renderFileUploaderModal() : null}
        {this.state.addContractModalProps.visible ? this.renderAddContractModal() : null}
        {this.state.detailDrawerProps.visible ? this.renderDetailDrawer() : null}
        {this.state.takeProductModalProps.visible ? this.renderTakeProductModal() : null}
        {this.state.payModalProps.visible ? this.renderPayModal() : null}
        {this.state.editContractModalProps.visible ? this.renderEditContractModal() : null}
        {this.state.payRecordModalProps.visible ? this.renderPayRecordModal() : null}
        {this.state.payFileModalProps.visible ? this.renderPayFileModal() : null}
      </div>
    )
  }

}
