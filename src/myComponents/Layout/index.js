import React, {PureComponent} from 'react';
import {Select, Tabs, Badge, Spin} from 'antd';
import {connect} from 'dva';
import classNames from 'classnames';
import jQuery from 'jquery';
import ScrollWrapper from '../Fx/ScrollWrapper';
import Loader from '../Fx/Loader/';
import ConsoleTitle from '../Fx/ConsoleTitle';
import TagRadio from '../Fx/TagRadio';
import Pagination from '../Fx/Pagination';
import styles from './index.less';
import Config from '../../utils/rs/Config';

const Fragment = React.Fragment;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@connect(state => ({
  collapsed: state.global.collapsed,
}))
export default class extends PureComponent {
  state = {
    bodyHeight: '100%',
  }

  componentDidMount() {
    jQuery('.fx-layout-header').resize(function () {
      console.log(jQuery(`.fx-layout-header`).height())
    });
    // // this.resizeBody();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeBody);
  }

  resizeBody = () => {
    const {center} = this.props;
    const {footer} = center;
    const headerHeight = jQuery('.fx-layout-header').height();
    const footerHeight = footer ? 52 : 2;
    const topStageHeight = Config.webSetting.stageLayout === "left" ? 0 : 50;
    const bodyHeight = `calc(100vh - ${58 + topStageHeight + footerHeight + headerHeight}px)`;
    this.setState({
      bodyHeight,
    });
  }


  renderHeader() {
    const {header} = this.props;
    const {title, left, actions, extra, sorter, tabs, render,right, padding = true,style,titleStyle,type='h1',} = header;
    const _sorter = sorter || {};
    const _tabs = tabs || {};
    const {columns, current, onSorter} = _sorter;
    const {items, activeKey, onTabChange} = _tabs;
    const leftProps = left ? {left: <TagRadio {...left} />} : {};
    const actionProps = actions ? {actions,} : {};
    return (
      <Fragment>
        {header ?
          <div className={classNames({
            [`fx-layout-header`]: true,
            [styles.fxLayoutHeader]: true,
            [styles.fxLayoutHeaderNoPadding]: !padding,
            [styles.fxLayoutHeaderHasExtra]: extra || sorter,
            [styles.fxLayoutHeaderOnlyTitle]: (Object.keys(this.props.header).length === 1 && this.props.header.title),
            [styles.fxLayoutHeaderOnlyTab]: (Object.keys(this.props.header).length === 1 && this.props.header.tabs)
          })}>
            {render ? render() : null}
            {title ?
              <ConsoleTitle
                title={title}
                {...leftProps}
                {...actionProps}
                style={{...titleStyle}}
                type={type}
                bordered={false}
              /> : null}
            {extra||right ?
              <div style={{paddingTop: title ? 8 : 24,...style}}>
              <div>{extra}</div>
              <div style={{float: 'right', right: 0, top: 0}}>
                {sorter ?
                  <Fragment>
                    <Select
                      style={{marginRight: 8}}
                      defaultValue={current.sorterColumn}
                      onSelect={value => onSorter({sorterColumn: value})}
                    >
                      {columns.map(_ => {
                        return (
                          <Option key={_.value} value={_.value}>{_.title}</Option>
                        )
                      })}
                    </Select>
                    <Select
                      defaultValue={current.sorterType}
                      onSelect={value => onSorter({sorterType: value})}
                    >
                      <Option value='ascend'>升序</Option>
                      <Option value='descend'>降序</Option>
                    </Select>
                  </Fragment> : null
                }
                {right}
              </div>
                <div style={{clear:'both'}}></div>
            </div> : null}
            {tabs ? <Tabs activeKey={activeKey} onChange={key => onTabChange(key)} type='card'>
              {items.map(_ => {
                const tabTitle = _.count ? (
                  <div>
                  <span
                    style={{marginRight: 5}}
                  >{_.title}
                  </span>
                    <Badge
                      style={{position: 'relative', top: -2, left: 3}}
                      count={_.count}
                      overflowCount={999}
                      showZero={true}
                    />
                  </div>
                ) : _.title;
                return <TabPane tab={tabTitle} key={_.key} />
              })}
            </Tabs> : null}
          </div> : null}
      </Fragment>
    )
  }

  renderFooter() {
    const {footer, collapsed} = this.props;
    const bodyWidth = `calc(100vw - ${collapsed ? 50 : Config.siderBaseWidth}px)`;
    return (
      <Fragment>
        {footer&&footer.pagination.total>0 ?
          <div className={styles.fxLayoutFooter}>
            <Pagination pagination={footer.pagination}/>
          </div> : null}
      </Fragment>
    )
  }

  renderBody() {
    const {footer, body, left} = this.props;
    const {center, loading = false, padding = true, bg = true,render} = body;
    const topStageHeight = 9;
    const headerHeight = jQuery(`.fx-layout-header`).height();
    const footerHeight = footer ? 52 : 2;
    const bodyHeight = `calc(100vh - ${40 + topStageHeight + footerHeight + headerHeight}px)`;
    const wrapperHeight = `calc(100vh - ${40 + topStageHeight + footerHeight + headerHeight}px - 48px)`;
    const bodyWidth = `100%`;
    const loaderWidth = `calc(100% - ${this.props.left ? 200 : 0}px)`;
    return (
      <div
        className={classNames({
          [styles.fxLayoutWrap]: true,
          [styles.fxLayoutWrapOnlyCenter]: (!this.props.left) && (!!center),
          [styles.fxLayoutWrapLeftCenter]: (!!this.props.left) && (!!center),
        })}>
        {
          center ? (
            <div
              className={classNames({
                [styles.fxLayoutWrapBody]: true,
                [styles.fxLayoutWrapBodyNoPadding]: !padding,
                [styles.fxLayoutWrapBodyHasBg]: bg,
                [styles.fxLayoutWrapCenter]: true,
              })}>
              <div>
                <Spin
                  spinning={!!loading}
                >
                  {center}
                </Spin>
              </div>
            </div>
          ) : null
        }
        {left ?
          <div
            className={classNames({
              [styles.fxLayoutWrapLeft]: true,
            })}
            style={{
              top: `${40 + topStageHeight + footerHeight + headerHeight - (!this.props.header.tabs ? 18 : 27)}px`
            }}
          >
            {left}
          </div> : null}
        {
          render?render:null
        }
        {footer ? this.renderFooter() : null}
      </div>
    )
  }

  render() {
    const {body, header, footer, left,} = this.props;
    const stage = jQuery('#stage');
    return (
      <div
        className={classNames({
        [styles.fxLayout]: true,
        [styles.fxLayoutStageTop]: Config.webSetting.stageLayout === 'top' && stage.length > 0,
      })}
      >
        {header ? this.renderHeader() : null}
        {body ? this.renderBody() : null}
      </div>
    )
  }
}
