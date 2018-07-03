import React, {PureComponent} from 'react';
import {Row, Col, Card,} from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import Color from '../../utils/rs/Color';

export default class extends React.Component {

  getCol(item, index) {
    const {items, onSelect} = this.props;
    const {col, title, value, type, color, select, key, onClick} = item;
    const props = select ? {
      onClick: () => {
        if (onClick) {
          onClick();
        } else {
          onSelect(key);
        }
      }
    } : {};
    return (
      <Col key={key} span={col || 24 / items.length}>
        <div className={classNames({
          [styles.headerInfoItem]: true,
          [styles.click]: !!select,
        })} {...props}>
          <div className={styles.bar}></div>
          <span>{title}</span>
          <p style={{color: color || this.getColor(type)}}>{value}</p>
          {index + 1 !== items.length && <em />}
        </div>
      </Col>
    )
  }

  getColor = (type) => {
    let color;
    switch (type) {
      case "primary": {
        color = Color.Primary;
        break;
      }
      case "processing": {
        color = Color.Processing;
        break;
      }
      case "warning": {
        color = Color.Warning;
        break;
      }
      case "error": {
        color = Color.Error;
        break;
      }
      case "success": {
        color = Color.Success;
        break;
      }
      default: {
        color = Color.Default;
        break
      }
    }
    return color;
  }

  render() {
    const {items, bordered, title, ...restProps} = this.props;
    return (
      <Row>
        <div className={classNames({
          [styles.headerInfo]: true,
          [styles.bordered]: !!bordered,
        })}
             {...restProps}
        >
          {title ? <div className={styles.title}>{title}</div> : null}
          <Card bordered={false}>
            <Row>
              {items.map((item, index) => {
                return this.getCol(item, index);
              })}
            </Row>
          </Card>
        </div>
      </Row>
    )
  }
}

