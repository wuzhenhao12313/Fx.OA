import React, {PureComponent} from 'react';
import {Form, Row, Button, Icon, Tag, Popover, Select} from 'antd';
import moment from 'moment';
import {IsArray} from '../../utils/rs/Util';
import TagRadio from '../Fx/TagRadio';
import AdvanceSearch from './AdvancedSearch';
import styles from './index.less';

const FormItem = Form.Item;
const Fragment = React.Fragment;
const Option = Select.Option;

@Form.create()
export default class extends React.Component {
  state = {
    tagsModal: {
      visible: false,
    },
    advSearchVisible: false,
    advExpand: false,
  }

  search = () => {
    const {form, onSearch} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSearch(fieldsValue);
    });
  }

  reload = () => {
    const {form, onSearch} = this.props;
    form.resetFields();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSearch(fieldsValue);
    });
  }

  getRow(row, idx, onlyButton) {
    const {advExpand} = this.state;
    const {item, onSearch, advSearch, searchTags, reset} = this.props;
    const {form: {getFieldDecorator}} = this.props;
    if (onlyButton) {
      return (
        <Fragment>
          {advSearch ?
            <FormItem key={idx + 2}>
              <Button
                onClick={e => this.setState({advExpand: !this.state.advExpand})}>
                <Icon type={'filter'}/>
                {advExpand ? '收起' : '筛选/排序'}
              </Button>
              {advExpand ? <span className={styles.sanjiao}></span> : null}
            </FormItem> : null
          }
          {!advSearch&&!!onSearch?
            <FormItem key={idx + 2}>
              <Button
                type='primary'
                onClick={e => this.search()}>
                <Icon type={'search'}/>
                搜索
              </Button>
            </FormItem> : null
          }
          {searchTags ?
            <FormItem key={idx + 2}>
              <Popover placement="bottomLeft" title={null} content={this.renderTagsBar()} trigger="click">
                <Button icon='tag'>快捷搜索</Button>
              </Popover>
            </FormItem> : null
          }
        </Fragment>
      )
    }
    row = IsArray(row) ? row : [row];
    return (
      <Row key={idx}>
        {row.map((i) => {
          let {config, isShow, key, render, ...restProps} = i;
          isShow = isShow == undefined ? true : isShow;
          if (!isShow) {
            return null;
          }
          return (
            <FormItem {...restProps} key={key} label={i.label}>
              {key ? getFieldDecorator(key,
                {
                  initialValue: i.value || i.initialValue,
                  ...config,
                })(i.render()) : (i.render())}
            </FormItem>
          );
        })}
        {idx === item.length - 1 && onSearch ?
          <FormItem key={idx + 1}>
            <Button type="primary" onClick={e => this.search()}>搜索</Button>
          </FormItem> : null
        }
        {idx === item.length - 1 && advSearch ?
          <FormItem key={idx + 2}>
            <Button
              onClick={e => this.setState({advExpand: !this.state.advExpand})}>
              <Icon type={'filter'}/>
              {advExpand ? '收起' : '筛选/排序'}
            </Button>
            {advExpand ? <span className={styles.sanjiao}></span> : null}
          </FormItem> : null
        }
        {idx === item.length - 1 && searchTags ?
          <FormItem key={idx + 2}>
            <Popover placement="bottomLeft" title={null} content={this.renderTagsBar()} trigger="click">
              <Button icon='tag'>快捷搜索</Button>
            </Popover>
          </FormItem> : null
        }
      </Row>
    );
  }

  getKeysText = (key) => {
    let {filters} = this.props;
    const {type, keys,} = filters;
    if(!type){
      return keys[key].join(',');
    }
    const _type = type[key];
    let result = null;
    if (_type) {
      switch (_type) {
        case 'rangeDate':
          const value = keys[key];
          const left = moment(value[0]).format('YYYY-MM-DD');
          const right = moment(value[1]).format('YYYY-MM-DD');
          result = `${left} 至 ${right}`;
          break;
      }
      return result;
    }
    return keys[key].join(',');
  }

  renderFilterBar() {
    let {filters} = this.props;
    const {labels, keys, type, onClearFilter} = filters;
    return (
      <div>
        {keys && Object.keys(keys).length > 0 ?
          <div className={styles.searchTagWrapper}>
            <div className={styles.searchTagBar}>
              <Icon className={styles.icon} type="filter" style={{marginRight: 5}}/>
              <span className={styles.text}>检索项：</span>
              {Object.keys(keys).map(key => {
                if (keys[key].length > 0) {
                  return (
                    <Tag
                      key={key}
                      closable
                      onClose={e => onClearFilter({[key]: null})}>
                      {labels[key]}：{this.getKeysText(key)}
                    </Tag>
                  )
                }
              })}
              <span className={styles.clearText} onClick={e => onClearFilter()}>清除</span>
            </div>
          </div> : null
        }
      </div>
    )
  }

  renderTagsBar() {
    const {searchTags} = this.props;
    const {options, onSearch} = searchTags;
    return (
      <div
        style={{minWidth: 200}}
      >
        <TagRadio
          mode="ant-tag"
          options={options}
          onSelect={value => onSearch(value)}
        />
      </div>
    )
  }

  renderSorter() {
    const {sorter,right} = this.props;
    return (
      <div style={{float: 'right', right: 0, top: 0}}>
        {sorter ?
          <Fragment>
            <Select
              style={{marginRight: 8}}
              defaultValue={sorter.current.sorterColumn}
              onSelect={value => sorter.onSorter({sorterColumn: value})}
            >
              {sorter.columns.map(_ => {
                return (
                  <Option key={_.value} value={_.value}>{_.title}</Option>
                )
              })}
            </Select>
            <Select
              defaultValue={sorter.current.sorterType}
              onSelect={value => sorter.onSorter({sorterType: value})}
            >
              <Option value='ascend'>升序</Option>
              <Option value='descend'>降序</Option>
            </Select>
          </Fragment> : null
        }
        {right}
      </div>
    )
  }

  renderAdvSearch() {
    const {advSearch, form} = this.props;
    let {filters} = this.props;
    const {onClearFilter} = filters || {};
    const {formItem, onSearch, reset} = advSearch;
    return (
      <AdvanceSearch
        formItem={formItem}
        form={form}
        reset={keys => {
          if (reset) {
            reset();
          } else {
            onClearFilter(keys);
          }
        }}
        onSearch={onSearch}
      />
    )
  }

  render() {
    const {item, style, wrappedComponentRef, filters, advSearch, sorter, extra,right} = this.props;
    const {advExpand} = this.state;
    const _ref = wrappedComponentRef ? {wrappedComponentRef: wrappedComponentRef} : {};
    return (
      <div className={styles.searchForm}>
        <div className={styles.mainForm}
             style={{display: 'inline-block'}}>
          <Form layout="inline" style={style} {..._ref}>
            {!item ? this.getRow(null, -1, true) : null}
            {item && item.map((row, idx) => {
              return this.getRow(row, idx);
            })}
          </Form>
          <div style={{float: 'right'}}>{extra}</div>
          <div style={{clear:'both'}}></div>
        </div>
        {sorter||right ?
          <div className={styles.sorterWrapper} style={{float: 'right', right: 0, top: 0}}>
            {this.renderSorter()}
          </div> : null}
        {advSearch ?
          <div className={styles.advanceForm}
               style={{display: advExpand ? 'block' : 'none', transition: 'all ease 0.3s'}}>
            {this.renderAdvSearch()}
          </div> : null}
        {filters ? this.renderFilterBar() : null}
      </div>
    );
  }
}

