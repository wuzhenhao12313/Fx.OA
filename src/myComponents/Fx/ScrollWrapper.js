import React from 'react';
import jQuery from 'jquery';

const Fragment = React.Fragment;

export default class extends React.Component {
  state = {
    needLoading: false,
  }

  load = () => {
    const {id} = this.props;
    const parentHeight = jQuery(`#${id}`).height();
    const childHeight = jQuery(`.${id}_inner`).height();
    if (parentHeight < childHeight) {
      const scrollStyle = localStorage.getItem('scrollStyle') === null ? '3d-dark' : localStorage.getItem('scrollStyle').toString();
      jQuery(`#${id}`).mCustomScrollbar("destroy").mCustomScrollbar({
        axis: "yx",
        scrollButtons: {enable: true},
        theme: scrollStyle,
      });
    }
  }

  render() {
    // this.load();
    const {id} = this.props;
    return (
      <div id={id}>
        <div className={`${id}_inner`}>{ this.props.children}</div>
      </div>);
  }
}
