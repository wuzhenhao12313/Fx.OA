import React from 'react';
import styles from './index.less';

export default class extends React.Component {

  state = {
    currentMember: []
  }


  componentDidMount() {
    const {member} = this.props;
    const length = member.length;
    // if (length < 10) {
    //   for (let i = 0; i < (10 - length); i++) {
    //     member.push({
    //       id: null,
    //       userName: null,
    //       allRoundScore: null,
    //       targetScore: null,
    //       cooScore: null,
    //       gmScore: null,
    //       workingScore: null,
    //       customExtractRate: null,
    //     });
    //   }
    // }
    this.setState({
      currentMember: member,
    });
  }


  getManagerTotalScore = (row) => {
    const {recordConfig} = this.props;
    const {
      m_baseScoreRate,
      m_targetScoreRate,
      m_cooScoreRate,
      m_gmScoreRate,
      m_memberScoreRate,
    } = recordConfig || {};
    const {baseScore = 0, targetScore = 0, cooScore = 0, gmScore = 0, employeeScore = 0} = row;
    const result = baseScore * m_baseScoreRate + targetScore * m_targetScoreRate
      + cooScore * m_cooScoreRate + gmScore * m_gmScoreRate + employeeScore * m_memberScoreRate;
    return result.toFixed(2);
  }

  getEmployeeTotalScore = (row) => {
    const {recordConfig} = this.props;
    const {
      e_allRoundScoreRate,
      e_targetScoreRate,
      e_cooScoreRate,
      e_gmScoreRate,
      e_workingScoreRate,
    } = recordConfig || {};
    const {allRoundScore = 0, targetScore = 0, cooScore = 0, gmScore = 0, workingScore = 0} = row;
    const result = allRoundScore * e_allRoundScoreRate + targetScore * e_targetScoreRate
      + cooScore * e_cooScoreRate + gmScore * e_gmScoreRate + workingScore * e_workingScoreRate;
    if (result === 0) {
      return null;
    }
    return !isNaN(result) ? result.toFixed(2) : null;
  }


  getRate = (x) => {
    if (x.notInRate === 1) {
      return null;
    }
    const {member} = this.props;
    let all = 0;
    member.filter(y => y.notInRate!==1).forEach(i => {
      const _score = this.getEmployeeTotalScore(i) || 0;
      all += _score * 1;
    });
    if (all === 0) {
      return null;
    }
    const current = this.getEmployeeTotalScore(x) || null;
    return current ? `${((this.getEmployeeTotalScore(x) / all) * 100).toFixed(2)}%` : null;
  }


  render() {
    const {year, month, depName, manager, member,recordConfig} = this.props;
    let {userName, baseScore, targetScore, cooScore, gmScore, employeeScore} = manager[0];
    const {
      m_baseScoreRate,
      m_targetScoreRate,
      m_cooScoreRate,
      m_gmScoreRate,
      m_memberScoreRate,
      e_allRoundScoreRate,
      e_targetScoreRate,
      e_cooScoreRate,
      e_gmScoreRate,
      e_workingScoreRate,
    } = recordConfig;
    baseScore = (baseScore || baseScore === 0) && !isNaN(baseScore) ? baseScore * 1 : null;
    targetScore = (targetScore || targetScore === 0) && !isNaN(targetScore) ? targetScore * 1 : null;
    cooScore = (cooScore || cooScore === 0) && !isNaN(cooScore) ? cooScore * 1 : null;
    gmScore = (gmScore || gmScore === 0) && !isNaN(gmScore) ? gmScore * 1 : null;
    employeeScore = (employeeScore || employeeScore === 0) && !isNaN(employeeScore) ? employeeScore * 1 : null;
    const printerItemStyle = {
      marginBottom: 100,
      height: `calc(100vh)`
    };

    const titleStyle = {
      border: '1px solid',
      textAlign: 'center',
      fontSize: 16,
      color: '#000',
      width: 1113,
      background: '#d9d9d9',
      fontFamily: '微软雅黑',
      webkitPrintColorAdjust: 'exact',
      padding: '5px 2px',
    };

    const tableStyle = {
      borderLeft: '1px solid',
      borderRight: '1px solid',
      width: 1113,
      webkitPrintColorAdjust: 'exact',
      fontFamily: '微软雅黑',
    }

    const thCommon = {
      padding: '5px 4px',
      borderRight: '1px solid',
      borderBottom: '1px solid',
      fontWeight: 'bold',
      fontSize: 13,
      webkitPrintColorAdjust: 'exact',
    }

    const tdCommon = {
      padding: '5px 4px',
      borderRight: '1px solid',
      borderBottom: '1px solid',
      textAlign: 'center',
      fontSize: 13,
      webkitPrintColorAdjust: 'exact',
    }

    const autographStyle = {
      height: 200,
      width: 1113,
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderLeft: '1px solid',
      webkitPrintColorAdjust: 'exact',
      position: 'relative',
    }

    const memberAutoGraph = {
      position: 'relative',
      top: 20,
      width: 440,
      height: 150,
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderTop: '1px solid',
      webkitPrintColorAdjust: 'exact',
    }


    const managerAutoGraph = {
      position: 'absolute',
      top: 20,
      right: 0,
      width: 400,
      height: 150,
      borderLeft: '1px solid',
      borderBottom: '1px solid',
      borderTop: '1px solid',
      webkitPrintColorAdjust: 'exact',
    }

    const managerAutoGraphItem = {
      position: 'relative',
    }

    return (
      <div style={printerItemStyle}>
        <div style={titleStyle}>{year}年（{month}）月（{depName}）部门绩效考核统计</div>
        <table style={tableStyle}>
          <tr>
            <th
              style={
                {
                  ...thCommon,
                  width: 100,
                  maxWidth: 100,
                  textAlign: 'left',
                }
              }>部门经理
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 80,
                  maxWidth: 80,
                  textAlign: 'left',
                  fontWeight: 100,
                }
              }
            >
              项目
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 140,
                  maxWidth: 140,
                  textAlign: 'center',
                }
              }
            >
              基础评分
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 140,
                  maxWidth: 140,
                  textAlign: 'center',
                }
              }
            >
              指标完成
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 140,
                  maxWidth: 140,
                  textAlign: 'center',
                }
              }
            >
              运营总监考评
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 140,
                  maxWidth: 140,
                  textAlign: 'center',
                }
              }
            >
              总经理考评
            </th>
            <th
              style={
                {
                  ...thCommon,
                  width: 140,
                  maxWidth: 140,
                  textAlign: 'center',
                }
              }
            >
              组员打分
            </th>
            <th style={{
              ...thCommon,
              textAlign: 'center',
              width: 233,
              maxWidth: 233,
            }} rowSpan={3} colSpan={2}>
              综合得分
            </th>
          </tr>
          <tr>
            <td style={
              {...tdCommon, textAlign: 'left', background: '#d9d9d9', fontSize: 20, fontWeight: 100}
            } rowSpan={3}>
              {userName}
            </td>
            <td style={{...tdCommon, textAlign: 'left'}}>说明</td>
            <td style={{...tdCommon}}>该项为固定分</td>
            <td style={{...tdCommon}}>部门指标完成率*100</td>
            <td style={{...tdCommon}}>领导日常考核</td>
            <td style={{...tdCommon}}>领导日常考核</td>
            <td style={{...tdCommon}}>按平均分计算</td>
          </tr>
          <tr>
            <td style={{...tdCommon, textAlign: 'left'}}>占比</td>
            <td style={{...tdCommon}}>{m_baseScoreRate*100+"%"}</td>
            <td style={{...tdCommon}}>{`${m_targetScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${m_cooScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${m_gmScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${m_memberScoreRate*100}%`}</td>
          </tr>
          <tr>
            <td style={{...tdCommon, textAlign: 'left'}}>打分</td>
            <td style={{
              ...tdCommon,
              background: '#d9d9d9'
            }}>{baseScore || baseScore === 0 ? baseScore.toFixed(2) : null}</td>
            <td style={{
              ...tdCommon,
              background: '#d9d9d9'
            }}>{targetScore || targetScore === 0 ? targetScore.toFixed(2) : null}</td>
            <td style={{
              ...tdCommon,
              background: '#d9d9d9'
            }}>{cooScore || cooScore === 0 ? cooScore.toFixed(2) : null}</td>
            <td style={{...tdCommon, background: '#d9d9d9'}}>{gmScore || gmScore === 0 ? gmScore.toFixed(2) : null}</td>
            <td style={{
              ...tdCommon,
              background: '#d9d9d9'
            }}>{employeeScore || employeeScore === 0 ? employeeScore.toFixed(2) : null}</td>
            <td style={{...tdCommon, background: '#d9d9d9'}} colSpan={2}>{this.getManagerTotalScore(manager[0])}</td>
          </tr>
          <tr>
            <td style={
              {
                ...tdCommon,
                textAlign: 'left',
                fontWeight: 'bold',
                borderTop: '2px solid',
              }
            } rowSpan={3}>部门组员
            </td>
            <td
              style={
                {
                  ...tdCommon,
                  textAlign: 'left',
                  borderTop: '2px solid',
                }
              }
            >
              项目
            </td>
            <td style={{...tdCommon, fontWeight: 'bold', borderTop: '2px solid',}}>
              综合素质
            </td>
            <td
              style={
                {
                  ...tdCommon,
                  fontWeight: 'bold',
                  borderTop: '2px solid',
                }
              }
            >
              指标完成
            </td>
            <td
              style={
                {
                  ...tdCommon, fontWeight: 'bold', borderTop: '2px solid',
                }
              }
            >
              运营总监考评
            </td>
            <td
              style={
                {
                  ...tdCommon, fontWeight: 'bold', borderTop: '2px solid',
                }
              }
            >
              部门经理考评
            </td>
            <td
              style={
                {
                  ...tdCommon, fontWeight: 'bold', borderTop: '2px solid',
                }
              }
            >
              工作考评
            </td>
            <td style={{
              ...tdCommon,
              fontWeight: 'bold',
              borderTop: '2px solid',
            }}
                rowSpan={3}> 综合得分
            </td>
            <td style={{
              ...tdCommon,
              fontWeight: 'bold',
              borderTop: '2px solid',
            }}
                rowSpan={3}>
              提成系数
            </td>
          </tr>
          <tr>
            <td style={{...tdCommon, textAlign: 'left'}}>说明</td>
            <td style={{...tdCommon}}>工作经验&能力</td>
            <td style={{...tdCommon}}>部门指标完成率*100</td>
            <td style={{...tdCommon}}>领导日常考核</td>
            <td style={{...tdCommon}}>领导日常考核</td>
            <td style={{...tdCommon}}>工作质量效率</td>
          </tr>
          <tr>
            <td style={{...tdCommon, textAlign: 'left'}}>占比</td>
            <td style={{...tdCommon}}>{`${e_allRoundScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${e_targetScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${e_cooScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${e_gmScoreRate*100}%`}</td>
            <td style={{...tdCommon}}>{`${e_workingScoreRate*100}%`}</td>
          </tr>
          {this.state.currentMember.map(x => {
            let {userName, allRoundScore, targetScore, cooScore, gmScore, workingScore, customExtractRate,} = x;
            allRoundScore = (allRoundScore || allRoundScore === 0) && !isNaN(allRoundScore) ? allRoundScore * 1 : null;
            targetScore = (targetScore || targetScore === 0) && !isNaN(targetScore) ? targetScore * 1 : null;
            cooScore = (cooScore || cooScore === 0) && !isNaN(cooScore) ? cooScore * 1 : null;
            gmScore = (gmScore || gmScore === 0) && !isNaN(gmScore) ? gmScore * 1 : null;
            workingScore = (workingScore || workingScore === 0) && !isNaN(workingScore) ? workingScore * 1 : null;
            return (
              <tr>
                <td style={{...tdCommon, textAlign: 'left', background: '#d9d9d9',}}>{userName}</td>
                <td style={{...tdCommon, textAlign: 'left'}}>打分</td>
                <td style={{
                  ...tdCommon,
                  background: '#d9d9d9'
                }}>{allRoundScore || allRoundScore === 0 ? allRoundScore.toFixed(2) : null}</td>
                <td style={{
                  ...tdCommon,
                  background: '#d9d9d9'
                }}>{targetScore || targetScore === 0 ? targetScore.toFixed(2) : null}</td>
                <td style={{
                  ...tdCommon,
                  background: '#d9d9d9'
                }}>{cooScore || cooScore === 0 ? cooScore.toFixed(2) : null}</td>
                <td style={{
                  ...tdCommon,
                  background: '#d9d9d9'
                }}>{gmScore || gmScore === 0 ? gmScore.toFixed(2) : null}</td>
                <td style={{...tdCommon, background: '#d9d9d9'}}>{workingScore ? workingScore.toFixed(2) : null}</td>
                <td style={{...tdCommon, background: '#d9d9d9'}}>{this.getEmployeeTotalScore(x)}</td>
                <td style={{
                  ...tdCommon,
                  background: '#d9d9d9'
                }}>{customExtractRate ? `${customExtractRate}%` : this.getRate(x)}</td>
              </tr>
            )
          })}
        </table>
        <div style={autographStyle}>
          <div style={memberAutoGraph}>
            <div style={{position: 'relative', top: 20, marginLeft: 5}}>组员签字区域</div>
          </div>
          <div style={managerAutoGraph}>
            <div style={{...managerAutoGraphItem, marginTop: 20,}}><span
              style={{display: 'inline-block', width: 265, paddingLeft: 5}}>部门经理签字：</span><span>日期：</span></div>
            <div style={{...managerAutoGraphItem, marginTop: 15,}}><span
              style={{display: 'inline-block', width: 265, paddingLeft: 5}}>运营总监签字：</span><span>日期：</span></div>
            <div style={{...managerAutoGraphItem, marginTop: 15,}}><span
              style={{display: 'inline-block', width: 265, paddingLeft: 5}}>财务总监签字：</span><span>日期：</span></div>
            <div style={{...managerAutoGraphItem, marginTop: 15,}}><span
              style={{display: 'inline-block', width: 265, paddingLeft: 5}}>总经办签字：</span><span>日期：</span></div>
          </div>
        </div>
      </div>
    )
  }
}
