import React, {PureComponent} from 'react';
import {
  Table,
  Icon,
  Tag,
  Form,
  Button,
  Dropdown,
  Menu,
  Tooltip,
  Modal,
  Row,
  Col,
  Checkbox
} from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import {treeToObj} from '../../utils/rs/Util';
import {fetchService, postService} from '../../utils/rs/Fetch';
import StandardModal from '../Modal/Standard';

const FormItem = Form.Item;
const CheckGroup = Checkbox.Group;
const Fragment = React.Fragment;
const ButtonGroup = Button.Group;

const getWindowHeight = () => window.innerHeight || document.documentElement.clientHeight;

@Form.create()
export default class extends PureComponent {
  state = {
    modal: {
      setting: {
        visible: false,
      },
      adv: {
        visible: false,
      }
    },
    visibleColumns: [],
    hideColumns: [],
    showDataSource: false,
  }

  toggleModal = (config) => {
    this.setState({
      modal: {
        ...this.state.modal,
        ...config,
      }
    })
  }

  getTableColumns = () => {
    const {columns, id} = this.props;
    fetchService({
      url: '/User/Config/GetUserTableColumns',
      params: {
        tableID: id,
      }
    }).then(data => {
      const {tableColumn} = data;
      let hideColumns = [], visibleColumns = [];
      if (tableColumn) {
        columns.map(x => {
          if (tableColumn.toList().contains(x.dataIndex)) {
            hideColumns.push(x.dataIndex);
          } else {
            visibleColumns.push(x.dataIndex)
          }
        });
      } else {
        columns.map(x => {
          if (x.hide) {
            hideColumns.push(x.dataIndex);
          } else {
            visibleColumns.push(x.dataIndex)
          }
        });
      }
      this.setState({
        hideColumns,
        visibleColumns,
        showDataSource: true,
      });
    });
  }

  saveSetting = (visibleColumns) => {
    const {id} = this.props;
    postService({
      url: '/User/Config/SetUserTableColumns',
      params: {
        tableID: id,
        columns: visibleColumns.join(","),
      }
    });
  }

  setColumns = () => {
    const {form, id, columns} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const {visibleColumns} = fieldsValue;
      const hideList = [];
      columns.map(item => {
        if (!visibleColumns.contains(item.dataIndex)) {
          hideList.push(item.dataIndex);
        }
      })

      this.setState({
        visibleColumns,
        hideColumns: hideList,
        modal: {
          ...this.state.modal,
          setting: {
            visible: false,
          }
        }
      }, _ => this.saveSetting(hideList));
    });
  }

  renderSettingModal() {
    const {modal: {setting: {visible}}, visibleColumns} = this.state;
    const {columns, form} = this.props;
    const {getFieldDecorator} = form;
    const _columns = columns.map(x => {
      return {title: x.title, key: x.dataIndex};
    });
    return (
      <StandardModal
        visible={visible}
        width={600}
        title="自定义列表项"
        onCancel={e => this.toggleModal({setting: {visible: false}})}
        onOk={e => this.setColumns()}
      >
        <Form layout='vertical'>
          <FormItem style={{marginBottom: 0, paddingBottom: 0}}>
            {getFieldDecorator('visibleColumns', {
              initialValue: visibleColumns,
            })(
              <CheckGroup style={{width: '100%'}}>
                <Row>
                  {_columns.map(x => {
                    return <Col key={x.key} span={6} style={{padding: "8px 6px"}}>
                      <Checkbox value={x.key}>{x.title}</Checkbox>
                    </Col>
                  })}
                </Row>
              </CheckGroup>
            )}
          </FormItem>
        </Form>
      </StandardModal>
    )
  }

  renderSimpleSearch() {
    return (
      <div className={styles.simpleSearch}>
        {this.renderActions()}
      </div>
    )
  }

  renderListToolbar() {
    const {tools = ["export", "setting"], refresh, customTools} = this.props;
    return (
      <div className={styles.listToolbar}>
        {customTools ? customTools : null}
        {tools && tools.contains("refresh") ? <Tooltip placement="top" title="刷新列表数据">
          <Button type="default" className='ant-btn-default' icon="retweet"
                  onClick={refresh} style={{marginRight: tools.contains("setting") ? 3 : 0}}/>
        </Tooltip> : null}
        {tools && tools.contains("export") ? <Tooltip placement="top" title="导出列表数据">
          <Button type="default" className='ant-btn-default' icon="export"
                  style={{marginRight: tools.contains("setting") ? 3 : 0}}/>
        </Tooltip> : null}
        {tools && tools.contains("setting") ? <Tooltip placement="top" title="自定义列表项">
          <Button type="default" className='ant-btn-default' icon="setting"
                  onClick={e => this.toggleModal({setting: {visible: true}})}/>
        </Tooltip> : null}
      </div>
    )
  }

  renderAdvModal() {
    const {modal: {adv: {visible}}} = this.state;
    return (
      <Modal
        className="ant-modal-fx"
        visible={visible}
        title="高级搜索"
        onCancel={e => this.toggleModal({adv: {visible: false}})}
        footer={null}
      >
        <div className="adv-search">
        </div>
      </Modal>
    )
  }

  renderFilterBar() {
    const {columns, currentFilters, onClearFilter} = this.props;
    const _columns = treeToObj(columns);
    return (
      <Fragment>
        {currentFilters && Object.keys(currentFilters).length > 0
        && Object.keys(currentFilters).filter(x => !!currentFilters[x] && currentFilters[x].length > 0).length > 0 ?
          <div style={{marginBottom: 5, marginTop: 2}}>
            <Icon type="filter" style={{marginRight: 5}}/>
            <span style={{marginRight: 5, color: '#999'}}>检索项：</span>
            {Object.keys(currentFilters).map(key => {
              const obj = _columns.filter(_ => _.key === key);
              const {title, filters} = obj[0];
              const valueList = [];
              if (currentFilters[key]) {
                currentFilters[key].forEach(value => {
                  const _obj = filters.filter(_ => _.value.toString() === value)[0];
                  const {text} = _obj;
                  valueList.push(text);
                });
                return <Tag style={{marginTop: 6}} key={key} closable
                            onClose={e => onClearFilter(key)}>{title}：{valueList.join(' , ')}</Tag>
              }
              return null;
            })}
            <span style={{marginLeft: 10, color: '#999', cursor: 'pointer'}} onClick={e => onClearFilter()}>清除</span>
          </div> : null
        }
      </Fragment>
    )
  }

  renderActions() {
    const {actions} = this.props;
    return (
      <Fragment>
        {actions && actions.length > 0 ?
          <Form layout="inline" className={classNames({[styles.actionForm]: true, ['ant-form-action']: true})}>
            {actions.map((tool, idx) => {
              let {isShow, render, button, dropdown} = tool;
              isShow = isShow === undefined ? true : isShow;
              if (isShow) {
                return (
                  <FormItem key={idx}>
                    {render ? render() : null}
                    {button ? <Button  {...button}>{button.text}</Button> : null}
                    {dropdown ?
                      <Dropdown trigger={["click"]} disabled={dropdown.disabled} overlay={
                        <Menu onClick={dropdown.menuClick}>
                          {dropdown.menu.map((item, _index) => {
                            const props = item.onClick ? {onClick: item.onClick} : {};
                            if (item.isShow || item.isShow === undefined) {
                              return (<Menu.Item key={item.key} {...props}>
                                {item.icon ? <Icon style={{marginRight: 8}} type={item.icon}/> : null}{item.label}
                              </Menu.Item>)
                            }
                          })}
                        </Menu>}
                      >
                        <Button {...dropdown.button}>
                          {dropdown.button.text}<Icon type="down"/>
                        </Button>
                      </Dropdown> : null}
                  </FormItem>
                )
              }
              return null;
            })}
          </Form> : null}
      </Fragment>
    )
  }

  renderTable() {
    const {mode, columns, loading, dataSource, bordered = true, title, id,  showIndex, ...restProps} = this.props;
    const {showDataSource} = this.state;
    let _columns = mode === 'simple' || !id ? columns : columns.filter(x => !this.state.hideColumns.contains(x.dataIndex));
    if (showIndex) {
      _columns.unshift({
        title: '#',
        width: 55,
        dataIndex: '_index',
        render: (text, row, index) => {
          return index + 1;
        }
      });
    }

    const _loading = mode === 'simple' ? loading : loading || !showDataSource || (loading && (!showDataSource));
    return (
      <Fragment>
        {title ? <div className={styles.fxTableTitle}>{title}</div> : null}
        <Table
          size="default"
          pagination={false}
          columns={_columns}
          bordered={bordered}
          dataSource={!_loading ? dataSource : []}
          loading={_loading}
          locale={{
            emptyText: (
              <div className="text-size-16">
                <Icon type="info-circle-o" className="text-size-16 text-success"/>没有查询到符合条件的记录
              </div>)
          }}
          {...restProps}
        />
      </Fragment>

    )
  }

  componentDidMount() {
    const {mode, id} = this.props;
    if (mode !== 'simple' && id) {
      this.getTableColumns();
    } else {
      this.setState({
        showDataSource: true,
      });
    }
  }

  render() {
    const {mode, actions, tools, customTools,tableID, bordered = true, style} = this.props;
    return (
      <div style={style} className={classNames({
        [styles.fxTableStandard]: true,
        [styles.fxTableStandardBordered]: !!bordered,
        [styles.simpleMode]: mode === "simple"
      })}>
        {actions || tools || customTools ? <div className={styles.fxTableHeader}>
          {this.renderSimpleSearch()}
          {tools || customTools ? this.renderListToolbar() : null}
          {this.renderFilterBar()}
        </div> : null}
        <div className={styles.fxTableBody} id={tableID}>{this.renderTable()}</div>
        {this.state.modal.setting.visible ? this.renderSettingModal() : null}
        {this.state.modal.adv.visible ? this.renderAdvModal() : null}
      </div>
    );
  }
}

