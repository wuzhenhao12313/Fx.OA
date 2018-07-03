import React, {PureComponent} from 'react';
import {Modal} from 'antd';
import EditForm from '../Form/Edit';
import StandardModal from '../Modal/Standard';
import EditMutiLineForm from '../Form/EditMutiLine';

export default class extends React.Component {

  render() {
    const {visible, title, onCancel, mode = "custom", width = 500, onSubmit, item, labelCol = 4, reset, refForm, ...restProps} = this.props;
    const _refForm = refForm ? {wrappedComponentRef: refForm} : {};
    return (
      <div>
        {visible ?
          <StandardModal
            destroyOnClose
            width={width}
            visible={visible}
            title={title}
            onCancel={onCancel}
            footer={null}
            {...restProps}
          >
            {mode === "custom" ? <EditForm
              onSubmit={onSubmit}
              item={item}
              labelCol={labelCol}
              reset={reset}
              {..._refForm }/> : null}
            {
              mode === "muti-line" ?
                <EditMutiLineForm
                  onSubmit={onSubmit}
                  item={item}
                  reset={reset}
                  {..._refForm }
                /> : null
            }
          </StandardModal>
          : null}
      </div>
    )
  }
}
