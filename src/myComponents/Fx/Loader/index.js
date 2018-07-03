import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import jQuery from 'jquery';
import styles from './index.less';

const Fragment = React.Fragment;

class Loader extends React.Component {
  render() {
    const {style, spinning} = this.props;
    return (
      <Fragment>
        <div style={style} className={classNames(styles.loader, {
            [styles.hidden]: !spinning,
            [styles.show]: spinning,
          }
        )}>
          <div className={styles.warpper}>
            <div className={styles.inner}/>
            <div className={styles.text}>LOADING</div>
          </div>
        </div>
      </Fragment>
    )
  }

}


Loader.propTypes = {
  spinning: PropTypes.bool,
}

export default Loader;
