import React, {PureComponent} from 'react';
import {
  Input,
  Row,
  Col,
  Form,
  Select,
  Button,
  Popover,
  Cascader,
  Tag,
  Spin,
} from 'antd';
import CloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import Component from '../../../utils/rs/Component';
import {fetchService, fetchDict} from '../../../utils/rs/Fetch';
import {createTreeDataByRelation} from '../../../utils/utils';
import ImageUploader from '../../../myComponents/Fx/ImageUploader';
import AutoSelect from '../../../myComponents/Fx/AutoSelect';
import DepartmentSelect from '../../../myComponents/Select/Department';
import PositionSelect from '../../../myComponents/Select/Position';
import StandardDatePicker from '../../../myComponents/Date/StandardDatePicker';
import StandardModal from '../../../myComponents/Modal/Standard';
import styles from './index.less';

const modelNameSpace = 'employee-edit';
const FormItem = Form.Item;
const Option = Select.Option;
const Fragment = React.Fragment;

@Form.create()
@Component.Model(modelNameSpace)//注入model
export default class extends React.Component {
  state = {
    isAdd: true,
    workPhotoUrl: '',
    companyList: [],
    positionLevelList: [],
    foreignList: [],
    foreignLanguagesOptions: [],
  }

  save = () => {
    const {onOk, userID} = this.props;
    const {model, form} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let {
        depID, jobNumber, name, sex, workStatus, birthday, mobile,
        email, entryDate, correctionDate, leaveDate, payday, positionLevel, salarySubsidy,
        birthdayType, recruitmentChannel, companyID, graduationSchool, graduationDate, major,
        computerLevel, hobby, specialty, maritalStatus, emergencyContact, emergencyContactPhone,
        originPlace, homeAddress, residentialAddress, ID, bankCard, openingBank, education, userPositionList,
        dingID,
      } = fieldsValue;
      const {workPhotoUrl, isAdd, foreignList} = this.state;
      const userEntity = {
        'dep_id': depID,
        'org_id': 1,
        'user_account': jobNumber,
        'user_password': '123456',
        'user_name': name,
      }
      birthday = birthday ? birthday.format('YYYY-MM-DD') : null;
      entryDate = entryDate ? entryDate.format('YYYY-MM-DD') : null;
      correctionDate = correctionDate ? correctionDate.format('YYYY-MM-DD') : null;
      leaveDate = leaveDate ? leaveDate.format('YYYY-MM-DD') : null;
      graduationDate = graduationDate ? graduationDate.format('YYYY-MM-DD') : null;
      const employeeEntity = {
        userID,
        jobNumber,
        depID,
        sex,
        workStatus,
        name,
        birthday,
        mobile,
        email,
        entryDate,
        correctionDate,
        leaveDate,
        payday,
        positionLevel,
        salarySubsidy,
        birthdayType,
        workPhotoUrl,
        recruitmentChannel,
        companyID,
        dingID,
      };
      const employeeExtraEntity = {
        userID,
        graduationSchool,
        graduationDate,
        major,
        foreignLanguages: foreignList.length > 0 ? JSON.stringify(foreignList) : null,
        computerLevel,
        hobby,
        specialty,
        maritalStatus,
        emergencyContact,
        emergencyContactPhone,
        originPlace,
        homeAddress,
        residentialAddress,
        ID,
        bankCard,
        openingBank,
        education,
      }
      userPositionList = userPositionList.map(i => i.value.toInt())
      const payload = isAdd ? {userEntity, employeeEntity, employeeExtraEntity, userPositionList} : {
        employeeEntity,
        employeeExtraEntity,
        userPositionList,
      };
      const promise = isAdd ? model.add(payload) : model.edit(payload);
      promise.then(res => {
        if (res.success) {
          const {employee} = res.data.toObject();
          onOk(employee, isAdd);
        }
      });
    });
  }

  toggleModal = (modal) => {
    this.setState({
      modal,
    });
  }

  componentDidMount() {
    const {userID} = this.props;
    this.setState({
      isAdd: !userID,
    });
    fetchService({
      url: '/Api/Company/Get',
    }).then(data => {
      const {list} = data;
      this.setState({
        companyList: list,
      });
    });
    fetchService({
      url: '/OA/PositionLevel/Get',
    }).then(data => {
      const {list} = data;
      this.setState({
        positionLevelList: list,
      });
    });
    fetchDict({typeCode: "foreign-language"}).then(data => {
      this.setState({
        foreignLanguagesOptions: createTreeDataByRelation(data, 'itemName', 'itemCode', "itemID"),
      })
    });
    if (userID) {
      this.getInfo();
    }
  }

  getInfo = () => {
    const {model, userID} = this.props;
    if (userID!==0){
      model.get({userID,}).then(_ => {
        const {[modelNameSpace]: {employee: {workPhotoUrl, foreignLanguages}}} = this.props;
        this.setState({
          workPhotoUrl,
          foreignList: foreignLanguages ? foreignLanguages.toObject() : [],
        });
      });
    }

  }

  changeAvatar = (imageUrl) => {
    const {model} = this.props;
    model.setState({
      currentImageUrl: imageUrl,
    });
  }

  changeWorkPhoto = (workPhotoUrl) => {
    this.setState({
      workPhotoUrl,
    })
  }

  changeForeign = (value) => {
    const length = value.length;
    let foreign, level;
    if (length !== 0) {
      foreign = value[0];
      level = length === 1 ? '' : value[1];
      const obj = {
        foreign,
        level
      };
      const array = CloneDeep(this.state.foreignList);
      array.push(obj);
      this.setState({
        foreignList: array,
      })
    }
  }

  deleteForeign = (e, idx) => {
    const array = CloneDeep(this.state.foreignList);
    array.remove(idx);
    this.setState({
      foreignList: array,
    })
  }

  componentWillUnmount() {
    const {model} = this.props;
    model.resetState();
  }

  render() {
    const {loading, model, visible, onCancel} = this.props;
    const {[modelNameSpace]: {employee, positionList}, form: {getFieldDecorator}} = this.props;
    let {
      userID, depID, jobNumber, name, sex, workStatus, birthday, mobile,
      email, entryDate, correctionDate, leaveDate, payday, positionLevel, salarySubsidy, foreignLanguages,
      birthdayType, recruitmentChannel, companyID, graduationSchool, graduationDate, major,
      computerLevel, hobby, specialty, maritalStatus, emergencyContact, emergencyContactPhone,
      originPlace, homeAddress, residentialAddress, ID, bankCard, openingBank, education, workPhotoUrl,dingID,
    } = employee;
    const userPosition = [];
    const {isAdd} = this.state;
    positionList.forEach(i => {
      userPosition.push({label: i.positionName, value: i.position.toString()});
    });
    return (
      <StandardModal
        style={{top: 20}}
        width={1100}
        visible={visible}
        title='编辑资料'
        onCancel={onCancel}
        onOk={e => this.save()}
        loading={loading.effects[`${modelNameSpace}/get`]}
        confirmLoading={loading.effects[`${modelNameSpace}/get`]}
      >
        <div >
          <Row gutter={24}>
            <Col span={6}>
              <ImageUploader
                imageUrl={this.state.workPhotoUrl}
                actionName="WorkPhoto"
                uploadText="添加工作照"
                size={[120, 150]}
                onChange={url => this.changeWorkPhoto(url)}
              />
            </Col>
            <Col span={18}>
              <Form layout='vertical' className="ant-form-slim">
                <Row gutter={24}>
                  <Col span={8}>
                    <FormItem label="员工工号">
                      {getFieldDecorator('jobNumber', {
                        rules: [
                          {required: true, message: '请输入员工工号!', type: 'string'},
                        ],
                        initialValue: jobNumber,
                      })(
                        <Input placeholder="请输入工号" disabled={!isAdd}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="员工姓名">
                      {getFieldDecorator('name', {
                        rules: [
                          {required: true, message: '请输入员工姓名!', type: 'string'},
                        ],
                        initialValue: name,
                      })(
                        <Input placeholder="请输入员工姓名"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="工作状态">
                      {getFieldDecorator('workStatus', {
                        rules: [
                          {required: true, message: '请选择工作状态!', type: 'string'},
                        ],
                        initialValue: workStatus,
                      })(
                        <AutoSelect typeCode="job-status" placeholder="请选择工作状态" ignore={['quit','waiting-quit','retire']}/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <FormItem label="所属公司">
                      {getFieldDecorator('companyID', {
                        rules: [
                          {required: true, message: '请选择所属公司!', type: 'number'},
                        ],
                        initialValue: companyID,
                      })(
                        <Select placeholder="请选择所属公司">
                          {this.state.companyList.map(company => {
                            const {companyID, companyName} = company;
                            return (<Option value={companyID} key={companyID}>{companyName}</Option>)
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="所属部门">
                      {getFieldDecorator('depID', {
                        rules: [
                          {required: true, message: '请选择所属部门!', type: 'string'},
                        ],
                        initialValue: depID.toString(),
                      })(
                        <DepartmentSelect placeholder="请选择所属部门"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="职位">
                      {getFieldDecorator('userPositionList', {
                        rules: [
                          {required: true, message: '请选择职位!', type: 'array'},
                        ],
                        initialValue: userPosition,
                      })(
                        <PositionSelect placeholder="请选择所属职位"/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
          <Row>
            <Form layout='vertical' className="ant-form-slim">
              <Row gutter={24}>
                <Col span={6}>
                  <FormItem label="性别">
                    {getFieldDecorator('sex', {
                      rules: [
                        {required: true, message: '请选择员工性别!', type: 'string'},
                      ],
                      initialValue: sex,
                    })(
                      <AutoSelect typeCode="sex" placeholder="请选择员工性别"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="出生日期">
                    {getFieldDecorator('birthday', {
                      rules: [
                        {required: true, message: '请选择出生日期!'},
                      ],
                      initialValue: birthday ? moment(birthday) : null,
                    })(
                      <StandardDatePicker style={{width: '100%'}} placeholder="请选择出生日期"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="生日类型">
                    {getFieldDecorator('birthdayType', {
                      rules: [
                        {required: true, message: '请选择生日类型!'},
                      ],
                      initialValue: birthdayType || '02',
                    })(
                      <AutoSelect typeCode="birthday-type" placeholder="请选择生日类型"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="联系电话">
                    {getFieldDecorator('mobile', {
                      rules: [
                        {required: true, message: '请输入联系电话!'},
                      ],
                      initialValue: mobile,
                    })(
                      <Input placeholder="请输入联系电话"/>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={6}>
                  <FormItem label="入职日期">
                    {getFieldDecorator('entryDate', {
                      rules: [
                        {required: true, message: '请选择入职日期!'},
                      ],
                      initialValue: entryDate ? moment(entryDate) : null,
                    })(
                      <StandardDatePicker style={{width: '100%'}} placeholder="请选择入职日期"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="转正日期">
                    {getFieldDecorator('correctionDate', {
                      initialValue: correctionDate ? moment(correctionDate) : null,
                    })(
                      <StandardDatePicker style={{width: '100%'}} placeholder="请选择转正日期"/>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="薪资等级">
                    {getFieldDecorator('positionLevel', {
                      initialValue: positionLevel,
                    })(
                      <Select showSearch placeholder="请选择薪资等级">
                        {this.state.positionLevelList.map(positionLevel => {
                          const {levelCode} = positionLevel;
                          return (<Option value={levelCode} key={levelCode}>{levelCode}</Option>)
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="招聘渠道">
                    {getFieldDecorator('recruitmentChannel', {
                      initialValue: recruitmentChannel,
                    })(
                      <AutoSelect typeCode="recruitment-channels" placeholder="请选择招聘渠道"/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Row>
          <Form layout='vertical' className="ant-form-slim">
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label="毕业院校">
                  {getFieldDecorator('graduationSchool', {
                    initialValue: graduationSchool,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="毕业时间">
                  {getFieldDecorator('graduationDate', {
                    initialValue: graduationDate ? moment(graduationDate) : null,
                  })(
                    <StandardDatePicker style={{width: '100%'}}/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="专业">
                  {getFieldDecorator('major', {
                    initialValue: major,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="学历">
                  {getFieldDecorator('education', {
                    initialValue: education,
                  })(
                    <AutoSelect typeCode="education"/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label="婚姻状况">
                  {getFieldDecorator('maritalStatus', {
                    initialValue: maritalStatus? maritalStatus.toString() : maritalStatus===0?'0':null,
                  })(
                    <AutoSelect typeCode="marital-status"/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="紧急联系人">
                  {getFieldDecorator('emergencyContact', {
                    initialValue: emergencyContact,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="紧急联系电话">
                  {getFieldDecorator('emergencyContactPhone', {
                    initialValue: emergencyContactPhone,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="籍贯">
                  {getFieldDecorator('originPlace', {
                    initialValue: originPlace,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label="家庭地址（或暂住地）">
                  {getFieldDecorator('homeAddress', {
                    initialValue: homeAddress,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="现居住地">
                  {getFieldDecorator('residentialAddress', {
                    initialValue: residentialAddress,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="身份证号">
                  {getFieldDecorator('ID', {
                    initialValue: ID,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="银行卡号">
                  {getFieldDecorator('bankCard', {
                    initialValue: bankCard,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label="开户行">
                  {getFieldDecorator('openingBank', {
                    initialValue: openingBank,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="外语语种">
                  <Row>
                    <Col span={20}>
                      <div className={styles.foreignDiv}>
                        {this.state.foreignList.map((foreign, idx) => {
                          return <Tag key={idx} closable
                                      onClose={e => this.deleteForeign(e, idx)}>{`${foreign.foreign}/${foreign.level}`}</Tag>
                        })}
                      </div>
                    </Col>
                    <Col span={4}>
                      <Popover
                        placement="topRight"
                        title='添加外语语种'
                        content={
                          <Fragment>
                            <Cascader options={this.state.foreignLanguagesOptions} onChange={this.changeForeign}/>
                            <Button type='primary' icon="plus" style={{marginLeft: 10}}/>
                          </Fragment>
                        }
                        trigger="click"
                      >
                        <Button type='primary' icon="plus" style={{float: 'right'}}/>
                      </Popover>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="电脑水平">
                  {getFieldDecorator('computerLevel', {
                    initialValue: computerLevel,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="爱好">
                  {getFieldDecorator('hobby', {
                    initialValue: hobby,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label="特长">
                  {getFieldDecorator('specialty', {
                    initialValue: specialty,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="结薪日">
                  {getFieldDecorator('payday', {
                    initialValue: payday,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="离职日期">
                  {getFieldDecorator('leaveDate', {
                    initialValue: leaveDate ? moment(leaveDate) : null,
                  })(
                    <StandardDatePicker style={{width: '100%'}} placeholder="请选择离职日期"/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="电子邮箱">
                  {getFieldDecorator('email', {
                    initialValue: email,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="其他补助">
                  {getFieldDecorator('salarySubsidy', {
                    initialValue: salarySubsidy,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="钉钉ID">
                  {getFieldDecorator('dingID', {
                    initialValue: dingID,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </StandardModal>
    );
  }
}


