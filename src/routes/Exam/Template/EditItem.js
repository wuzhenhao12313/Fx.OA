import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  InputNumber,
  Select,
  Rate,
} from 'antd';
import moment from 'moment';
import Debounce from 'lodash-decorators/debounce';
import Component from '../../../utils/rs/Component';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import StandardModal from '../../../myComponents/Modal/Standard';
import EditForm from '../../../myComponents/Form/Edit';
import StandardTable from '../../../myComponents/Table/Standard';
import styles from './index.less';

const modelNameSpace = 'exam-template';
const Option = Select.Option;
const Fragment = React.Fragment;

@connect(state => ({
  levelCountList: state[modelNameSpace].levelCountList,
  levelCountCanAddList: state[modelNameSpace].levelCountCanAddList,
  loading: state.loading,
}))
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    levelCountList: [
      {
        level: 0.5,
        count: 0,
      },
      {
        level: 1.0,
        count: 0,
      },
      {
        level: 1.5,
        count: 0,
      },
      {
        level: 2.0,
        count: 0,
      },
      {
        level: 2.5,
        count: 0,
      },
      {
        level: 3.0,
        count: 0,
      },
      {
        level: 3.5,
        count: 0,
      },
      {
        level: 4.0,
        count: 0,
      },
      {
        level: 4.5,
        count: 0,
      },
      {
        level: 5.0,
        count: 0,
      },
    ],
    modalLoading: false,
  }

  levelCountList = [
    {
      level: 0.5,
      count: 0,
    },
    {
      level: 1.0,
      count: 0,
    },
    {
      level: 1.5,
      count: 0,
    },
    {
      level: 2.0,
      count: 0,
    },
    {
      level: 2.5,
      count: 0,
    },
    {
      level: 3.0,
      count: 0,
    },
    {
      level: 3.5,
      count: 0,
    },
    {
      level: 4.0,
      count: 0,
    },
    {
      level: 4.5,
      count: 0,
    },
    {
      level: 5.0,
      count: 0,
    },
  ];

  ref = {
    editForm: null,
  }

  reset = () => {
    const {model} = this.props;
    const {resetFields} = this.ref.editForm.props.form;
    resetFields();
    model.setState({
      levelCountList: this.levelCountList,
    });
  }

  save = () => {
    const {onOk, levelCountList} = this.props;
    const {getFieldsValue, resetFields} = this.ref.editForm.props.form;
    const values = {
      levelCount: JSON.stringify(levelCountList),
      ...getFieldsValue(),
    };
    onOk(values, this.reset);
  }

  @Debounce(600)
  onLevelCountChange = (value, index) => {
    const {levelCountList, model} = this.props;
    levelCountList[index].count = value;
    model.setState({
      levelCountList,
    });
  }

  getLevelCountCanAdd = (values) => {
    const {model} = this.props;
    if (values.questionType && values.questionCategory) {
      model.call("getLevelCountCanAdd", values);
    } else {
      model.setState({
        levelCountCanAddList: [],
      })
    }
  }

  changeCategoryAddType = (value) => {
    const {getFieldsValue} = this.ref.editForm.props.form;
    const {questionCategory, questionType} = getFieldsValue();
    const obj = {
      questionCategory,
      questionType,
      ...value,
    };
    this.getLevelCountCanAdd(obj);
  }

  componentDidMount() {
    const {dataRow, model} = this.props;
    const {levelCount, questionType, questionCategory} = dataRow;
    this.getLevelCountCanAdd({questionCategory, questionType});
    if (levelCount) {
      this.setState({
        modalLoading: true,
      });
      model.setState({
        levelCountList: levelCount.toObject(),
      }).then(() => {
        this.setState({
          modalLoading: false,
        });
      });
    }
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.setState({
      levelCountList: this.levelCountList,
    });
  }

  renderForm() {
    const {dataRow, levelCountList, levelCountCanAddList, loading} = this.props;
    const {questionCategory, questionType, level, count, levelCount} = dataRow;
    const item = [
      {
        key: 'questionCategory',
        label: '题目业务类别',
        initialValue: questionCategory || undefined,
        config: {
          rules: [{
            required: true, message: '请选择题目业务类别',
          }],
        },
        render: () => {
          return (
            <AutoSelect
              typeCode="question-category"
              placeholder='请选择题目业务类别'
              onSelect={value => this.changeCategoryAddType({questionCategory: value})}
            />
          )
        }
      },
      {
        key: 'questionType',
        label: '题目类别',
        initialValue: questionType || undefined,
        config: {
          rules: [{
            required: true, message: '请选择题目类别',
          }],
        },
        render: () => {
          return (
            <AutoSelect
              typeCode="question-type"
              placeholder='请选择题目类别'
              onSelect={value => this.changeCategoryAddType({questionType: value})}
            />
          )
        }
      },
      {
        key: 'level',
        render: () => {
          const columns = [
            {
              title: '题目等级',
              dataIndex: 'level',
              render: (text) => {
                return (
                  <Rate
                    allowHalf
                    allowClear
                    value={text}
                    disabled
                  />
                )
              }
            },
            {
              title: '题目可添加数量',
              dataIndex: 'canAddCount',
              render: (text, row, index) => {
                const _list = levelCountCanAddList.filter(x => x.level === row.level);
                return _list.length > 0 ? _list[0].count : 0;
              }
            },
            {
              title: '题目数量',
              dataIndex: 'count',
              render: (text, row, index) => {
                return <InputNumber value={text} onChange={value => this.onLevelCountChange(value, index)}/>
              }
            }
          ];
          return (
            <StandardTable
              mode="simple"
              loading={loading.effects[`${modelNameSpace}/getLevelCountCanAdd`]}
              rowKey={row => row.level}
              showIndex={true}
              tools={null}
              columns={columns}
              dataSource={levelCountList}
              page={false}
            />
          )
        }
      },
    ];
    return (
      <EditForm
        labelCol={5}
        item={item}
        wrappedComponentRef={node => this.ref.editForm = node}
      />
    )
  }

  render() {
    const {visible, onCancel,} = this.props;
    return (
      <Fragment> {visible ?
        <StandardModal
          style={{top: 30}}
          visible={visible}
          width={600}
          mask={false}
          lodaing={this.state.modalLoading}
          title="编辑模板条目"
          onCancel={onCancel}
          onOk={this.save}
        >
          {this.renderForm()}
        </StandardModal> : null}
      </Fragment>

    )
  }
}
