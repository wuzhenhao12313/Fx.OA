import React from 'react';
import {Upload, Icon, message} from 'antd';
import {String} from '../../utils/rs/Util';
import Config from '../../utils/rs/Config';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isPic = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name);
  if (!isPic) {
    message.error('上传的图片格式不正确!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('上传的图片不能大于 2MB!');
  }
  return isLt2M && isPic;
}

export default class extends React.Component {
  state = {
    loading: false,
  };
  handleChange = (info) => {
    const {onChange} = this.props;
    const {response} = info.file;
    if (info.file.status === 'uploading') {
      this.setState({loading: true});
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      if (response) {
        const {data} = response;
        const _data = data.toObject();
        const {path} = _data;
        onChange(path);
      }
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.setState({
      imageUrl: '',
    })
  }

  render() {
    const {uploadText, actionName, showUploadList, size} = this.props;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">{uploadText || '上传图片'}</div>
      </div>
    );
    const {imageUrl} = this.props;
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={showUploadList || false}
        action={Config.uploadServer + `/${actionName}`}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {!String.IsNullOrEmpty(imageUrl) ?
          <img src={imageUrl} alt="" style={{width: size[0] || 100, height: size[1] || 100}}/> : uploadButton}
      </Upload>
    );
  }
}

