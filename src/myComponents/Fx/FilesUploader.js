import React, {PureComponent} from 'react';
import {Upload, Icon, message, Button} from 'antd';
import Config from '../../utils/rs/Config';

function beforeUpload(file, reg, text) {
  const isFile = reg.test(file.name);
  if (!isFile) {
    message.error(`只能上传${text}格式的文件`);
  }
  const isLt2M = file.size / 1024 / 1024 < 100;
  if (!isLt2M) {
    message.error('上传的文件不能大于 100MB!');
  }
  return isLt2M && isFile;
}

const Fragment = React.Fragment;

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
    let result=false;
    let doMsg="";
    fileList.map(file => {
      const {status, response} = file;
      if (status === 'done' && response) {
        const {data,success,msg} = file.response;
        if(data){
          const _data = data.toObject();
          if (_data.fileList.length > 0) {
            list.push({
              name: file.name,
              url: _data.fileList[0],
            });
          }
        }else {
          result=success;
          doMsg=msg;
        }
      }
      if (status === 'default') {
        const {name, url} = file;
        list.push({
          name,
          url,
        });
      }
    });
    onChange(list,result,doMsg);
  }

  updateDefaultFileList = () => {
    let {defaultFileList} = this.props;
    defaultFileList = defaultFileList || [];
    const _defaultFileList = [];
    defaultFileList.map((file, index) => {
      const {name, url} = file;
      _defaultFileList.push({
        uid: -(index + 1),
        name,
        status: 'done',
        url,
      });
    });
    this.setState({
      fileList: _defaultFileList,
    });
  }

  clearFileList = () => {
    this.setState({
      fileList: [],
    });
  }

  componentDidMount() {
    this.updateDefaultFileList();
  }

  render() {
    const {type, max = 5, desc,handle,btnName, onChange, defaultFileList, ...restProps} = this.props;
    const regObj = {}
    switch (type) {
      case "compress":
        regObj.reg = /\.(rar|zip|7z)$/;
        regObj.text = 'rar,zip,7z';
        regObj.name = 'Compress';
        break;
      case "excel":
        regObj.reg = /\.(csv|xls|xlsx)$/;
        regObj.text = 'csv,xls,xlsx';
        regObj.name = 'Excel';
        break;
      case "pdf":
        regObj.reg = /\.(pdf)$/;
        regObj.text = 'pdf';
        regObj.name = 'Pdf';
        break;
      case "txt":
        regObj.reg = /\.(txt)$/;
        regObj.text = 'txt';
        regObj.name = 'Txt';
        break;
      default :
        regObj.name = "File";
    }
    const beforeupload = type ? {beforeUpload: file => beforeUpload(file, regObj.reg, regObj.text)} : {};
    const {fileList} = this.state;
    return (
      <Upload
        name={type}
        action={Config.uploadServer + `/${regObj.name}`}
        {...beforeupload}
        {...restProps}
        fileList={fileList}
        onChange={this.handleChange}
        withCredentials={true}
      >
        {fileList.length >= max ? null :
          <Fragment>
            {!handle?<Button>
              <Icon type="upload"/> {btnName?'上传':btnName}
            </Button>:handle}
            {desc ? <span style={{marginLeft: 10}}> {desc}</span> : null}
          </Fragment>
        }
      </Upload>
    );
  }
}
