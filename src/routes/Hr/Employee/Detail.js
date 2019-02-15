import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Input,
  Card,
  Badge,
  Row,
  Col,
  Button,
  Tag,
  Spin,
  Divider
} from 'antd';
import round from 'lodash/round';
import ceil from 'lodash/ceil';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import DescriptionList from '../../../components/DescriptionList';
import Component from '../../../utils/rs/Component';
import Format from '../../../utils/rs/Format';
import {String,} from '../../../utils/rs/Util';
import AvatarUpload from '../../../myComponents/Fx/AvatarUpload';
import Picture from '../../../myComponents/Fx/Picture';
import ConsoleTitlePanel from '../../../myComponents/Fx/ConsoleTitlePanel';
import StandardTable from '../../../myComponents/Table/Standard';
import TableActionBar from '../../../myComponents/Table/TableActionBar';
import EditForm from '../../../myComponents/Form/Edit';
import StandardModal from '../../../myComponents/Modal/Standard';

import styles from './index.less';

const modelNameSpace = 'employee-detail';
const ButtonGroup = Button.Group;
const {Description} = DescriptionList;
const Fragment = React.Fragment;

@connect(state => ({
  [modelNameSpace]: state[modelNameSpace],
  loading: state.loading,
}))//注入state
@Component.Model(modelNameSpace)//注入model
export default class extends PureComponent {
  state = {
    contractColumn: [
      {
        title: '合同编号',
        dataIndex: 'contractNo',
        key: 'contractNo',
      },
      {
        title: '合同基数',
        dataIndex: 'contractBase',
        key: 'contractBase',
        className: 'align-center',
        render: (value) => {
          return Format.Money.Rmb(value);
        }
      },
      {
        title: '开始时间',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '到期时间',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '合同时长（月）',
        dataIndex: 'contractLength',
        key: 'contractLength',
        className: 'align-center',
        render: (value, row) => {
          const {startDate, endDate} = row;
          return round(moment(endDate).diff(moment(startDate), 'month', true));
        }
      },
      {
        title: '是否终止',
        dataIndex: 'isStop',
        key: 'isStop',
        className: 'align-center',
        render: (value) => {
          if (value === 0) {
            return "否"
          }
          return "是";
        }
      },
      {
        title: '终止时间',
        dataIndex: 'stopDate',
        key: 'stopDate',
        className: 'align-center',
        render: (value) => {
          return Format.Date.Format(value, 'YYYY-MM-DD');
        }
      },
      {
        title: '合同状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          return this.getBadgeInfo(record);
        },
      },
    ],
    operationType: 'info',
  };

  cache = {
    insuranceEditRow: {},
    contractEditRow: {}
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }


  changeEditData = (data, dataName) => {
    const {value, key, index} = data;
    const {model} = this.props;
    const list = this.props[modelNameSpace][dataName];
    if (dataName == 'empInsurance') {
      if (key === "city" || key === "area") {
        const _value = list[index]["insuredArea"].toObject();
        list[index]["insuredArea"] = JSON.stringify({
          ..._value,
          [key]: value,
        });
      } else {
        list[index][key] = value;
      }
    }
    model.setState({
      [dataName]: list,
    });
  }

  componentDidMount() {
    const {userID} = this.props;
    if (userID) {
      this.getInfo();
    }
  }

  getInfo = () => {
    const {model, userID} = this.props;
    model.get({userID,});
  }

  getBadgeInfo = (record) => {
    const {startDate, endDate, isStop} = record;
    if (isStop === 1) {
      return <Badge status='error' text='已终止'/>
    }
    if (moment(endDate) < moment()) {
      return <Badge status="default" text='已过期'/>
    }
    if (moment(endDate) - moment() < 30 * 24 * 60 * 60 * 1000) {
      const value = (moment(endDate).diff(moment(), 'days', true));
      return (
        <Fragment>
          <p style={{marginBottom: 5}}><Badge status="success" text='已生效'/></p>
          <p><Badge status="warning" text={`${ceil(value)}天后过期`}/></p>
        </Fragment>
      )
    }
    if (moment(startDate) >= moment()) {
      const value = (moment(startDate).diff(moment(), 'days', true));
      return <Badge status="processing" text={`${ceil(value)}天后生效`}/>
    }
    return <Badge status="success" text='已生效'/>;
  }

  getStatus = (type) => {
    const info = {};
    switch (type) {
      case 'working':
        info.status = "success";
        info.text = '已转正';
        break;
      case 'trial':
        info.status = "processing";
        info.text = '试用期';
        break;
      case 'temporary':
        info.status = "default";
        info.text = '临时员工';
        break;
      case 'retire':
        info.status = "waring";
        info.text = '已退休';
        break;
      case 'quit':
        info.status = "error";
        info.text = '已离职';
        break;
      default:
        info.status = "error";
        info.text = '已离职';
        break;
    }
    return info;
  }

  changeTab = (key) => {
    this.setState({
      operationType: key,
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

  renderContractTable() {
    const {
      [modelNameSpace]: {empContract}, loading,
    } = this.props;
    const {contractColumn} = this.state;

    return (
      <StandardTable
        mode="simple"
        rowKey={record => record.recordID}
        columns={contractColumn}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={empContract}
        pagination={false}
      />
    );
  }

  renderInsuranceTable() {
    const {
      [modelNameSpace]: {empInsurance}, loading,
    } = this.props;
    const insuranceColumn = [
      {
        title: '编号',
        key: 'serialNo',
        dataIndex: 'serialNo',
      },
      {
        title: '社保号',
        key: 'number',
        dataIndex: 'number',
      },
      {
        title: '社保区域',
        key: 'insuredArea',
        dataIndex: 'insuredArea',
        className: 'align-center',
        children: [
          {
            title: '市',
            key: 'city',
            dataIndex: 'city',
            className: 'align-center',
            render: (value, row) => {
              const {insuredArea} = row;
              const _area = String.IsNullOrEmpty(insuredArea) ? {city: '', area: ''} : insuredArea.toObject();
              const {city, area} = _area;
              return city;
            }
          },
          {
            title: '区',
            key: 'area',
            dataIndex: 'area',
            className: 'align-center',
            render: (value, row) => {
              const {insuredArea} = row;
              const _area = String.IsNullOrEmpty(insuredArea) ? {city: '', area: ''} : insuredArea.toObject();
              const {city, area} = _area;
              return area;
            }
          },
        ],
      },
      {
        title: '参保时间',
        key: 'insuredDate',
        dataIndex: 'insuredDate',
        className: 'align-center',
        render: (value) => {
          return moment(value).format('YYYY-MM-DD');
        }
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        className: 'align-center',
        render: (value) => {
          let text = value === 1 ? '参保中' : '已中断';
          let type = value === 1 ? 'processing' : 'error';
          return <Badge text={text} status={type}/>;
        }
      },
      {
        title: '操作',
        dataIndex: 'op',
        key: 'op',
        className: 'align-right',
        render: (text, record, index) => {
          const action = record["edit"] ? [
            {
              label: '保存',
              isShow: true,
              submit: () => {
                this.edit(index);
              }
            },
            {
              label: '取消',
              isShow: true,
              submit: () => {
                const {model, [modelNameSpace]: {data: {list, total}}} = this.props;
                list[index] = this.cacheOriginData[index];
                model.setState({
                  data: {
                    list,
                    total,
                  }
                }).then(_ => {
                  delete this.cacheOriginData[index];
                  this.changeEditData({key: 'edit', value: false, index});
                });
              }
            },
          ] : [
            {
              label: '编辑',
              isShow: true,
              submit: () => {
                if (!record["edit"]) {
                  this.cacheOriginData[index] = cloneDeep(record);
                }
                this.changeEditData({key: 'edit', value: true, index});
              }
            },
            {
              label: '删除',
              isShow: true,
              submit: () => {
                this.remove(record.recordID, index);
              }
            }
          ];
          return (
            <TableActionBar action={action}/>
          )
        },
      },
    ];
    return (
      <StandardTable
        mode="simple"
        rowKey={record => record.recordID}
        columns={insuranceColumn}
        loading={loading.effects[`${modelNameSpace}/get`]}
        dataSource={empInsurance}
        pagination={false}
      />
    );
  }

  renderInfo() {
    const {[modelNameSpace]: {employee, positionList = [],salary}, model} = this.props;
    const {
      jobNumber, empName, workPhotoUrl, entryDate, correctionDate, depName, sex,
      birthday, birthdayType, companyName, workStatus, mobile, email, leaveDate, positionLevel, salarySubsidy, payday,
      graduationSchool, graduationDate, major, education, foreignLanguages, computerLevel, hobby, specialty, maritalStatus,
      originPlace, homeAddress, residentialAddress, ID, bankCard, openingBank, recruitment, emergencyContact, emergencyContactPhone
    }
      = employee;
    return (
      <div style={{marginBottom: 24, padding: '12px 16px'}} bordered={false}>
        <ConsoleTitlePanel title="基本资料">
          <DescriptionList style={{marginBottom: 24}} col="4">
            <Description term="员工姓名">{empName}</Description>
            <Description term="性别">{sex === 'man' ? '男' : '女'}</Description>
            <Description term="出生日期">{Format.Date.Format(birthday, 'YYYY-MM-DD')}</Description>
            <Description term="年龄">{moment().diff(moment(birthday), 'year')}</Description>
            <Description term="所属公司">{companyName}</Description>
            <Description term="所在部门">{depName}</Description>
            <Description term="职位">
              <div>
                {positionList.map((position, idx) => {
                  return <Tag key={idx}>{position}</Tag>
                })}
              </div>
            </Description>
            <Description term="职位等级">{positionLevel}</Description>
            <Description term="入职日期">{Format.Date.Format(entryDate, 'YYYY-MM-DD')}</Description>
            <Description term="转正日期">{Format.Date.Format(correctionDate, 'YYYY-MM-DD')}</Description>
            <Description term="工龄">{moment().diff(moment(entryDate), 'month')}个月</Description>
            <Description term="手机号">{mobile}</Description>
          </DescriptionList>
        </ConsoleTitlePanel>
        <ConsoleTitlePanel title="工资相关">
          <DescriptionList style={{marginBottom: 24}} col="4">
            <Description term="基本工资">{salary}</Description>
            <Description term="其他补助">{salarySubsidy}</Description>
            <Description term="结薪日">{payday}</Description>
          </DescriptionList>
        </ConsoleTitlePanel>
        <ConsoleTitlePanel title="学历相关">
          <DescriptionList style={{marginBottom: 24}} col="4">
            <Description term="毕业院校">{graduationSchool}</Description>
            <Description term="毕业时间">{Format.Date.Format(graduationDate, 'YYYY')}</Description>
            <Description term="专业">{major}</Description>
            <Description term="学历">{education}</Description>
            <Description term="外语语种">{foreignLanguages ? foreignLanguages.toObject().map(i => {
              const {foreign, level} = i;
              return <Tag key={foreign}>{`${foreign}/${level}`}</Tag>
            }) : null}</Description>
          </DescriptionList>
        </ConsoleTitlePanel>
        <ConsoleTitlePanel title="其他资料">
          <DescriptionList style={{marginBottom: 24}} col="4">
            <Description term="籍贯">{originPlace}</Description>
            <Description term="家庭地址">{homeAddress}</Description>
            <Description term="现居住地">{residentialAddress}</Description>
            <Description term="身份证号">{ID}</Description>
            <Description term="银行卡号">{bankCard}</Description>
            <Description term="开户行">{openingBank}</Description>
            <Description term="招聘渠道">{recruitment}</Description>
            <Description term="紧急联系人">{emergencyContact}</Description>
            <Description term="紧急联系电话">{emergencyContactPhone}</Description>
            <Description
              term="婚姻状况">{maritalStatus && maritalStatus !== 0 ? maritalStatus === 0 ? '未婚' : '已婚' : null}</Description>
            <Description term="邮箱">{email}</Description>
            <Description
              term="生日类型">{String.IsNullOrEmpty(birthdayType) ? null : birthdayType === '01' ? '阴历' : '阳历'}</Description>
            <Description term="离职日期">{Format.Date.Format(leaveDate, 'YYYY-MM-DD')}</Description>
            <Description term="电脑水平">{computerLevel}</Description>
            <Description term="爱好">{hobby}</Description>
            <Description term="特长">{specialty}</Description>
          </DescriptionList>
        </ConsoleTitlePanel>
      </div>
    )
  }

  render() {
    const {loading, visible, onCancel} = this.props;
    const {operationType} = this.state;
    const {[modelNameSpace]: {employee, positionList,}, model} = this.props;
    const {jobNumber, empName, workPhotoUrl, entryDate, correctionDate, depName, sex, birthday, companyName, workStatus} = employee;
    const {} = employee;
    const tabList = [{
      key: 'info',
      tab: '完整资料',
    }, {
      key: 'contract',
      tab: '合同记录',
    },
      {
        key: 'insurance',
        tab: '社保记录',
      }];
    const action = (
      <div>
        <Button type="primary" icon="retweet" onClick={e => this.getInfo()}>刷新</Button>
      </div>
    );
    const extra = (
      <Row>
        <Col>
          <div className={styles.textSecondary}>状态</div>
          <div className={styles.heading}>{this.getStatus(workStatus)['text']}</div>
        </Col>
      </Row>
    );
    const description = (
      <div>
        <Row gutter={24}>
          <Col span={3}>
            <Picture size={[60, 75]} modalSize={[400, 498]} value={workPhotoUrl}/>
          </Col>
          <Col span={21}>
            <DescriptionList className={styles.headerList} size="small" col="3">
              <Description term="员工姓名">{empName}</Description>
              <Description term="性别">{sex === 'man' ? '男' : '女'}</Description>
              <Description term="年龄">{moment().diff(moment(birthday), 'year')}</Description>
              <Description term="所属公司">{companyName}</Description>
              <Description term="所在部门">{depName}</Description>
              <Description term="职位">
                <div>
                  {positionList.map((position, idx) => {
                    return <Tag key={idx}>{position}</Tag>
                  })}
                </div>
              </Description>
              <Description term="入职日期">{moment(entryDate).format('YYYY-MM-DD')}</Description>
              <Description term="转正日期">{moment(correctionDate).format('YYYY-MM-DD')}</Description>
              <Description term="工龄">{moment().diff(moment(entryDate), 'month')}个月</Description>
            </DescriptionList>
          </Col>
        </Row>
      </div>
    );
    return (
      <StandardModal
        visible={visible}
        title='详细资料'
        width={1200}
        loading={loading.effects[`${modelNameSpace}/get`]}
        style={{top: 20}}
        onCancel={onCancel}
        footer={null}
      >
        <PageHeaderLayout
          showHeader
          title={`工号：${jobNumber}`}
          tabList={tabList}
          action={action}
          extraContent={extra}
          content={description}
          activeTabKey={operationType}
          onTabChange={key => this.changeTab(key)}
        >
          {operationType === 'info' ? this.renderInfo() : null}
          {operationType === 'contract' ? <div
            style={{marginTop:24}}
            bordered={false}>
            {this.renderContractTable()}
          </div> : null}
          {operationType === 'insurance' ? <div
            style={{marginTop:24}} >
            {this.renderInsuranceTable()}
          </div> : null}
        </PageHeaderLayout>
      </StandardModal>
    );
  }
}


