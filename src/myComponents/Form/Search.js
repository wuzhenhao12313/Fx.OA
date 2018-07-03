import React, {PureComponent} from 'react';
import {Form, Row, Button, Icon, Tag, Popover, Select} from 'antd';
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

  getRow(row, idx) {
    row = IsArray(row) ? row : [row];
    const {item, onSearch, advSearch, searchTags, reset,advExpand,onToggleAdvSearch} = this.props;
    const {form: {getFieldDecorator}} = this.props;
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
              type="default"
              className="ant-btn-default"
              onClick={e => onToggleAdvSearch()}>
              高级搜索
              <Icon type={advExpand ? 'up' : 'down'}/>
            </Button>
          </FormItem> : null
        }
        {idx === item.length - 1 && searchTags ?
          <FormItem key={idx + 2}>
            <Popover placement="bottomLeft" title={null} content={this.renderTagsBar()} trigger="click">
              <Button type="default" className="ant-btn-default" icon='tag'>快捷搜索</Button>
            </Popover>
          </FormItem> : null
        }
      </Row>
    );
  }

  renderFilterBar() {
    let {filters} = this.props;
    const {labels, keys, onClearFilter} = filters;
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
                      onClose={e => onClearFilter({[key]: null})}>{labels[key]}：{keys[key].join(',')}
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
    const {sorter} = this.props;
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
      </div>
    )
  }

  renderAdvSearch() {
    const {advSearch, form} = this.props;
    let {filters} = this.props;
    const {onClearFilter} = filters;
    const {formItem, onSearch} = advSearch;
    return (
      <AdvanceSearch
        formItem={formItem}
        form={form}
        reset={keys => onClearFilter(keys)}
        onSearch={onSearch}
      />
    )
  }

  render() {
    const {item, style, wrappedComponentRef, filters, advSearch, sorter,advExpand} = this.props;
    const _ref = wrappedComponentRef ? {wrappedComponentRef: wrappedComponentRef} : {};
    return (
      <div className={styles.searchForm}>
        <div className={styles.mainForm}
             style={{display: 'inline-block', maxWidth: `calc(100% - ${sorter ? 200 : 0}px)`}}>
          <Form layout="inline" style={style} {..._ref}>
            {item.map((row, idx) => {
              return this.getRow(row, idx);
            })}
          </Form>
        </div>
        {sorter ? <div className={styles.sorterWrapper} style={{float: 'right', right: 0, top: 0}}>
          {this.renderSorter()}
        </div> : null}
        {filters ? this.renderFilterBar() : null}
        {advSearch ?
          <div className={styles.advanceForm} style={{display: advExpand ? 'block' : 'none',transition:'all ease 0.3s'}}>
            {this.renderAdvSearch()}
          </div> : null}
      </div>
    );
  }
}

