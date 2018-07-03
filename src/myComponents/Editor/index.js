import React from 'react';
import Editor from 'wangeditor';
import {message} from 'antd';
import Config from '../../utils/rs/Config';
import styles from './index.less';

export default class extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      editorContent: ''
    }
  }


  componentDidMount() {
    const {defaultValue, onChange} = this.props;
    const elem = this.refs.editorElem;
    const editor = new Editor(elem);
    // 使用 onchange 函数监听内容的变化，并实时更新到 state 中
    editor.customConfig.onchange = html => {
      onChange(html);
      this.setState({
        editorContent: html
      });
    }
    editor.customConfig.uploadImgServer = Config.uploadServer + `/Image`;//上传接口
    editor.customConfig.withCredentials = true;//携带cookie
    editor.customConfig.uploadImgTimeout = 15000;//超时响应时间15s
    editor.customConfig.uploadImgHooks = {
      success: function (xhr, editor, result) {
      },
      customInsert: function (insertImg, result, editor) {
        // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
        // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
        const {data} = result;
        const {fileList} = data.toObject();
        fileList.map(file => {
          insertImg(file);
        });
        // result 必须是一个 JSON 格式字符串！！！否则报错
      }
    }
    editor.create();
    editor.txt.html(defaultValue);
  }

  render() {
    return (
      <div ref="editorElem" style={{textAlign: 'left'}}>
      </div>
    )
  }
}

