import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Modal,
  Card,
} from 'antd';
import PageHeaderLayout from '../layouts/PageHeaderLayout';
import Component from '../utils/rs/Component';
import AvatarUpload from '../myComponents/Fx/AvatarUpload';
import EditForm from '../myComponents/Form/Edit';

const modelNameSpace = 'user-center';

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    modal: {
      visible: false,
      content: null,
      isAdd: true,
      title: '添加App',
    },
  };

  save = (values) => {
    Modal.confirm({
      title: '保存个人信息',
      content: '确定要保存吗，更改后将无法恢复。',
      onOk: () => {
        const {model, [modelNameSpace]: {currentImageUrl}, dispatch} = this.props;
        values.headImage = currentImageUrl;
        model.call("save", {...values}).then(res => {
          if (res) {
            this.getInfo();
            dispatch({
              type: 'global/getUserInfo',
            })
          }
        });
      }
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    const {model} = this.props;
    model.get();
  }

  changeAvatar = (imageUrl) => {
    const {model} = this.props;
    model.setState({
      currentImageUrl: imageUrl,
    });
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  renderEditPanel() {
    const {[modelNameSpace]: {userInfo, currentImageUrl}} = this.props;
    const {userName, enName, nickName, mobile1, mobile2, mobile3, email, dingding, qq} = userInfo;
    const item = [
      {
        key: 'headImage',
        label: '头像',
        render: () => (
          <AvatarUpload
            imageUrl={currentImageUrl}
            onChange={imageUrl => this.changeAvatar(imageUrl)}
          />),
      },
      {
        key: 'userName',
        label: '姓名',
        value: userName,
        render: () => <Input style={{width: 200}} disabled/>,
      },
      {
        key: 'enName',
        label: '英文名',
        value: enName,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'nickName',
        label: '花名',
        value: nickName,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'mobile1',
        label: '手机号1',
        value: mobile1,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'mobile2',
        label: '手机号2',
        value: mobile2,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'mobile3',
        label: '手机号3',
        value: mobile3,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'email',
        label: '邮箱',
        value: email,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'dingding',
        label: '钉钉',
        value: dingding,
        render: () => <Input style={{width: 200}}/>,
      },
      {
        key: 'qq',
        label: 'QQ',
        value: qq,
        render: () => <Input style={{width: 200}}/>,
      },
    ];
    return (
      <EditForm
        item={item}
        onSubmit={values => this.save(values)}
      />
    )
  }

  render() {
    const {loading} = this.props;
    return (
      <PageHeaderLayout>
        <Card
          title="个人信息"
          style={{width: 600}}
          showTitle={false}
          onReload={e => this.getInfo()}
          loading={loading.effects[`${modelNameSpace}/get`]}
        >
          {this.renderEditPanel()}
        </Card>
      </PageHeaderLayout>
    );
  }
}

