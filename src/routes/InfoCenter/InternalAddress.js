import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Tag,
  Avatar,
  Row,
  Col,
  Card,
  List,
  Spin,
  Affix,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Component from '../../utils/rs/Component';
import {String} from '../../utils/rs/Util';
import SearchForm from  '../../myComponents/Form/Search';
import DepartmentTree from '../../myComponents/Tree/Department';
import FxLayout from '../../myComponents/Layout/';
import ViewCard from '../../myComponents/Fx/ViewCard';

const modelNameSpace = 'internalAddress';
const Fragment=React.Fragment;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))
@Component.Model(modelNameSpace)
@Component.Role('oa_internalAddress')
@Component.Pagination({model: modelNameSpace})
export default class extends PureComponent {
  state = {
    selectedKeys: [],
  };

  getList = (page) => {
    const {model, [modelNameSpace]: {searchValues, pageIndex, pageSize,total}} = this.props;
    const {selectedKeys} = this.state;
    model.setState({
      pageIndex: page || pageIndex,
      data: {
        list: [],
        total,
      }
    }).then(() => {
      model.get({
        ...searchValues,
        depID: selectedKeys.length === 0 ? 0 : selectedKeys[0],
        pageIndex,
        pageSize,
      });
    });
  }

  reset = (selectedKeys) => {
    const {resetFields} = this.searchForm;
    const {model} = this.props;
    model.resetSearchValues().then(() => {
      resetFields();
      this.setState({
        selectedKeys,
      }, () => this.getList(1))
    });
  }

  onSearch = (searchValues) => {
    const {model: {setState}} = this.props;
    setState({
      searchValues,
    }).then(() => {
      this.setState({
        selectedKeys: [],
      }, () => this.getList(1));
    });
  }

  renderSearchForm() {
    const {[modelNameSpace]: {searchValues}} = this.props;
    const {userName} = searchValues;
    const item = [
      [
        {
          key: 'userName',
          value: userName,
          render: () => {
            return (<Input style={{width:200}} placeholder="请输入用户姓名"/>);
          }
        }
      ],
    ];
    return (
      <SearchForm
        item={item}
        onSearch={values => this.onSearch(values)}
        ref={node => this.searchForm = node}
      />
    )
  }

  componentDidMount() {
    this.getList();
  }

  renderCard(card) {
    const {headImage, userName, depName, mobile1, mobile2, mobile3, qq, dingding, email, positionList, jobNumber} = card;
    return (
      <Card
      >
        <Row gutter={16}>
          <Col span={6}>
            <Avatar src={headImage} size="large" style={{width: 60, height: 60, borderRadius: 60}}/>
            {positionList.map((position, idx) => <div key={idx} style={{marginBottom: 5}}><Tag>{position}</Tag></div>)}
          </Col>
          <Col span={18}>
            <p><strong>{userName}</strong></p>
            <p>工号：{jobNumber}</p>
            <p>从属于：{depName}</p>
            <p>手机：{mobile1}</p>
            {!String.IsNullOrEmpty(mobile2) ? <p>备用手机：{mobile1}</p> : null}
            <p>QQ：{qq}</p>
            <p>邮箱：{email}</p>
          </Col>
        </Row>
      </Card>
    )
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderList() {
    const {[modelNameSpace]: {data: {list,}},} = this.props;
    return (
    <div>
      <List
        style={{marginBottom:'-20px'}}
        grid={{gutter: 24, column: 2}}
        dataSource={list}
        renderItem={item => (
          <List.Item>
            {this.renderCard(item)}
          </List.Item>
        )}
      />
    </div>
    )
  }

  render() {
    const {[modelNameSpace]: {data: {total}, pageIndex,}, pagination, loading} = this.props;
    const fxLayoutProps = {
      header: {
        extra:this.renderSearchForm(),
      },
      body: {
        loading: loading.effects[`${modelNameSpace}/get`],
        center: this.renderList(),
      },
      footer: {
        pagination: pagination({pageIndex, total}, this.getList),
      }
    };
    return (
      <FxLayout
        {...fxLayoutProps}
      >
      </FxLayout>
    );
  }
}



