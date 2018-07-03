import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Row,
  Col,
  Form,
  Select,
  Badge,
  Alert
} from 'antd';
import Component from '../../../utils/rs/Component';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import StandardModal from '../../../myComponents/Modal/Standard';
import StandardTable from '../../../myComponents/Table/Standard';
import {fetchDictSync} from '../../../utils/rs/Fetch';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import EditItemPanel from './EditItem';


const formatter = {
  categoryCode: {},
  questionType: {},
};

const tagData = fetchDictSync({typeCode: 'question-category'});
tagData.forEach(item => {
  formatter.categoryCode[item.itemCode] = item.itemName;
});

const typeData = fetchDictSync({typeCode: 'question-type'});
typeData.forEach(item => {
  formatter.questionType[item.itemCode] = item.itemName;
});


const modelNameSpace = 'exam-template';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Option = Select.Option;
const OptionGroup = Select.OptGroup;
const Fragment = React.Fragment;

@connect(state => ({
  item: state[modelNameSpace].item,
  levelCountList: state[modelNameSpace].levelCountList,
  loading: state.loading,
}))
@Form.create()
@Component.Model(modelNameSpace)//注入model
export default class extends React.Component {
  state = {
    modal: {
      visible: false,
      dataRow: {},
      index: -1,
    },
    trashModal: {
      visible: false,
    },
    score: 0,
  }

  saveTemplate = () => {
    const {onOk, form: {getFieldsValue, validateFields}, item: {row, list}} = this.props;
    const _itemList = [];
    validateFields(err => {
      if (!err) {
        list.map(x => {
          if (x.itemID === 0 && x.isDelete === 1) {

          } else {
            _itemList.push(x);
          }
        });
        const values = {
          templateEntity: {
            ...row,
            ...getFieldsValue(),
          },
          itemList: _itemList,
          templateScore: this.state.score,
        };
        console.log(values)
        onOk(values);
      }
    });

  }

  saveItem = (values, resetFields) => {
    const {index} = this.state.modal;
    const {item: {list,}, model} = this.props;
    if (index === -1) {
      list.push({
        ...values,
        status: 1,
        itemID: 0,
        isDelete: 0,
      });
    } else {
      let _item = list[index];
      _item = {
        ..._item,
        ...values,
      };
      list.splice(index, 1, _item);
    }
    model.setState({
      item: {
        ...this.props.item,
        list,
      }
    }).then(res => {
      if (index === -1) {
        resetFields()
      } else {
        this.setState({
          modal: {
            visible: false,
          }
        })
      }

      this.getTemplateScore();
    });
  }

  removeItem = (index) => {
    const {item: {list}, model} = this.props;
    list.filter(x => x.isDelete !== 1)[index].isDelete = 1;
    model.setState({
      item: {
        ...this.props.item,
        list
      }
    });
    this.getTemplateScore();
  }

  returnItem = (index) => {
    const {item: {list}, model} = this.props;
    list.filter(x => x.isDelete === 1)[index].isDelete = 0;
    model.setState({
      item: {
        ...this.props.item,
        list
      }
    });
    this.getTemplateScore();
  }

  getScoreByQuestionType = (questionType) => {
    let score = 0;
    switch (questionType) {
      case "1":
        score = 2;
        break;
      case "2":
        score = 2;
        break;
      case "3":
        score = 4;
        break;
      case "4":
        score = 5;
        break;
      case "5":
        score = 10;
        break;

    }
    return score;
  }

  getTemplateScore = () => {
    const {item: {list}} = this.props;
    let score = 0;
    list.filter(x => x.isDelete !== 1).map(tmpItem => {
      let {levelCount, questionType} = tmpItem;
      levelCount = levelCount ? levelCount.toObject() : [];
      levelCount.map(levelCountItem => {
        const {count} = levelCountItem;
        score += (count * this.getScoreByQuestionType(questionType));
      });
    });
    this.setState({
      score,
    });
  }

  componentDidMount() {
    const {templateID, model} = this.props;
    if (templateID !== 0) {
      model.call("getRow", {templateID}).then(res => {
        this.getTemplateScore();
      });
    }
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.setState({
      item: {
        row: {},
        list: [],
      }
    })
  }

  renderForm() {
    const {item: {row, list}, form: {getFieldDecorator}} = this.props;
    return (
      <Form layout='vertical' className="ant-form-slim">
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="模板标题">
              {getFieldDecorator('title', {
                rules: [
                  {required: true, message: '请输入模板模板标题!', type: 'string'},
                ],
                initialValue: row ? row.title : null,
              })(
                <Input placeholder='请输入模板模板标题!'/>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="职位标签">
              {getFieldDecorator('categoryCode', {
                rules: [
                  {required: true, message: '请选择岗位标签!'},
                ],
                initialValue: row ? row.categoryCode : undefined,
              })(
                <AutoSelect typeCode="exam-position-tag" placeholder="请选择岗位标签"/>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="岗位等级">
              {getFieldDecorator('positionLevel', {
                rules: [
                  {required: true, message: '请选择岗位等级!'},
                ],
                initialValue: row ? row.positionLevel : null,
              })(
                <Select
                  allowClear
                  placeholder="请选择岗位等级"
                >
                  <OptionGroup label="业务岗">
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="B3">B3</Option>
                    <Option value="B4">B4</Option>
                    <Option value="B5">B5</Option>
                    <Option value="B6">B6</Option>
                    <Option value="B7">B7</Option>
                    <Option value="B8">B8</Option>
                    <Option value="B9">B9</Option>
                    <Option value="B10">B10</Option>
                  </OptionGroup>
                  <OptionGroup label="职能岗">
                    <Option value="S1">S1</Option>
                    <Option value="S2">S2</Option>
                    <Option value="S3">S3</Option>
                    <Option value="S4">S4</Option>
                    <Option value="S5">S5</Option>
                    <Option value="S6">S6</Option>
                    <Option value="S7">S7</Option>
                    <Option value="S8">S8</Option>
                    <Option value="S9">S9</Option>
                    <Option value="S10">S10</Option>
                  </OptionGroup>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem label="描述">
              {getFieldDecorator('desc', {
                initialValue: row ? row.desc : null,
              })(
                <TextArea autosize={{minRows: 4}}/>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )

  }

  renderTable() {
    const {item: {list,}} = this.props;
    const columns = [
      {
        title: '题目业务类别',
        dataIndex: 'questionCategory',
        render: (text) => {
          return formatter.categoryCode[text];
        }
      },
      {
        title: '题目类别',
        dataIndex: 'questionType',
        render: (text) => {
          return formatter.questionType[text];
        }
      },
      {
        title: '等级/数量',
        dataIndex: 'levelCount',
        render: (text) => {
          text = text ? text.toObject() : [];
          return (
            <Fragment>
              {text.map((i, idx) => {
                const {level, count} = i;
                if (count > 0) {
                  return (
                    <div key={idx}>
                      <span style={{width: 70, display: 'inline-block'}}>等级：{level}</span>
                      <span>数量：{count}</span>
                    </div>
                  )
                }
                return null;
              })}
            </Fragment>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          const obj = {};
          switch (text) {
            case 1:
              obj.label = '已启用';
              obj.status = 'success';
              break;
            case 0:
              obj.label = '已禁用';
              obj.status = 'warning';
              break;
          }
          return <Badge status={obj.status} text={obj.label}/>
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '编辑',
              submit: () => {
                this.setState({
                  modal: {
                    visible: true,
                    dataRow: row,
                    index,
                  }
                });
              }
            },
            {
              label: '删除',
              submit: () => {
                this.removeItem(index);
              }
            }
          ];
          return (<TableActionBar action={action}/>)
        }
      }
    ];
    const actions = [
      {
        isShow: true,
        button: {
          icon: 'plus',
          text: '新增条件',
          type: 'primary',
          // className: 'ant-btn-default',
          onClick: () => {
            this.setState({
              modal: {
                visible: true,
                dataRow: {},
                index: -1,
              }
            });
          }
        },
      }, {
        isShow: true,
        button: {
          icon: 'delete',
          text: '临时回收站',
          type: 'dashed',
          onClick: () => {
            this.setState({
              trashModal: {
                visible: true,
              }
            });
          }
        },
      }
    ];
    return (
      <StandardTable
        mode="simple"
        rowKey={record => record.itemID}
        dataSource={list.filter(x => x.isDelete !== 1)}
        showIndex={true}
        columns={columns}
        actions={actions}
        tools={null}
        page={false}
        footer={() => <div>当前模板分值：<span>{this.state.score}</span></div>}
      />
    )
  }

  renderTrashModal() {
    const {trashModal: {visible}} = this.state;
    return (
      <StandardModal
        visible={visible}
        title="临时回收站"
        width={600}
        footer={null}
        onCancel={e => {
          this.setState({
            trashModal: {visible: false}
          })
        }}
      >
        {this.renderTrashTable()}
      </StandardModal>
    )
  }

  renderTrashTable() {
    const {item: {list,}} = this.props;
    const columns = [
      {
        title: '题目业务类别',
        dataIndex: 'questionCategoryName',
      },
      {
        title: '题目类别',
        dataIndex: 'questionTypeName',
      },
      {
        title: '等级/数量',
        dataIndex: 'levelCount',
        render: (text) => {
          text = text ? text.toObject() : [];
          return (
            <Fragment>
              {text.map((i, idx) => {
                const {level, count} = i;
                if (count > 0) {
                  return (
                    <div key={idx}>
                      <span style={{width: 70, display: 'inline-block'}}>等级：{level}</span>
                      <span>数量：{count}</span>
                    </div>
                  )
                }
                return null;
              })}
            </Fragment>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => {
          const obj = {};
          switch (text) {
            case 1:
              obj.label = '已启用';
              obj.status = 'success';
              break;
            case 0:
              obj.label = '已禁用';
              obj.status = 'warning';
              break;
          }
          return <Badge status={obj.status} text={obj.label}/>
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        align: 'right',
        render: (text, row, index) => {
          const action = [
            {
              label: '还原',
              submit: () => {
                this.returnItem(index)
              }
            },
          ];
          return (<TableActionBar action={action}/>)
        }
      }
    ];
    return (
      <StandardTable
        mode="simple"
        rowKey={record => record.itemID}
        dataSource={list.filter(x => x.isDelete === 1)}
        showIndex={true}
        columns={columns}
        tools={null}
        page={false}
      />
    )
  }

  render() {
    const {visible, onCancel, loading} = this.props;
    const {modal, trashModal} = this.state;
    return (
      <Fragment>
        <StandardModal
          title="编辑模板"
          loading={loading.effects[`${modelNameSpace}/getRow`]}
          width={800}
          scroll={true}
          visible={visible}
          onCancel={onCancel}
          onOk={this.saveTemplate}
        >
          <Alert message="所有编辑操作将会在点击确定按钮后生效" type="warning" style={{marginBottom: 16}} closable/>
          {this.renderForm()}
          <div style={{marginTop: 24}}>
            {this.renderTable()}
          </div>
        </StandardModal>
        {modal.visible ? <EditItemPanel
          visible={modal.visible}
          dataRow={modal.dataRow}
          onOk={this.saveItem}
          onCancel={_ => this.setState({
            modal: {
              visible: false,
              dataRow: {},
            }
          })}
        /> : null}
        {trashModal.visible ? this.renderTrashModal() : null}
      </Fragment>

    )
  }
}
