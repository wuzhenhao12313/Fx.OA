import React, {PureComponent} from 'react';
import {Upload, Icon, Modal, message} from 'antd';
import styles from './index.less';
import Config from '../../utils/rs/Config';
import {String} from '../../utils/rs/Util';


function beforeUpload(file) {
  const isPic = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name);
  if (!isPic) {
    message.error('上传的图片格式不正确!');
  }
  const isLt2M = file.size / 1024 / 1024 < 3;
  if (!isLt2M) {
    message.error('上传的图片不能大于 3MB!');
  }
  return isLt2M && isPic;
}

export default class extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    loading: false,
    fileList: [],
  }

  handleCancel = () => this.setState({previewVisible: false})

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleChange = (info) => {
    const {onChange} = this.props;
    let {fileList} = info;
    let _fileList = [];
    fileList.map(file => {
      if (file.status) {
        _fileList.push(file);
      }
    });
    this.setState({
      fileList: _fileList,
    });
    const list = [];
    fileList.map(file => {
      const {status, response} = file;
      if (status === 'done' && file.response) {
        const {data} = file.response;
        const _data = data.toObject();
        if (_data.fileList.length > 0) {
          list.push(_data.fileList[0]);
        }
      }
      if (status === 'default') {
        const {url} = file;
        list.push(url);
      }
    });
    onChange(list);
  }

  componentDidMount() {
    let {defaultFileList} = this.props;
    defaultFileList = defaultFileList || [];
    const defaultImageList = [];
    defaultFileList.map((file, index) => {
      defaultImageList.push({
        uid: -(index + 1),
        name: '',
        status: 'default',
        url: file,
      });
    });
    this.setState({
      fileList: defaultImageList,
    });
  }

  clearImageList = () => {
    this.setState({
      fileList: [],
    })
  }

  render() {
    const {type, max = 5, onChange, defaultFileList,disabled, ...restProps} = this.props;
    const {previewVisible, previewImage, fileList} = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus"/>
        <div className="ant-upload-text">上传</div>
      </div>
    );
    return (
      <div className={styles.fxPicturesWall}>
        <Upload
          name={type}
          listType="picture-card"
          fileList={fileList}
          multiple={true}
          action={Config.uploadServer + `/Image`}
          beforeUpload={beforeUpload}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          {...restProps}
        >
          {fileList.length >= max ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{width: '100%'}} src={previewImage}/>
        </Modal>
      </div>
    );
  }
}
