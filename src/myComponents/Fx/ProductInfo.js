import React from 'react';
import {Modal, Spin} from 'antd';
import {fetchProdService} from '../../utils/rs/Fetch';
import Config from '../../utils/rs/Config';

class ProductInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      proId: 0,
      smUrl: null,
      bgUrl: null,
      visible: false,
      loading: true,
    };
  }


  componentDidMount() {
    const {proId}=this.props;
    if(proId){
      this.getImg();
    }else {
      this.setState({
        loading:false,
      })
    }
  }

  getImg = (proId) => {
    fetchProdService({
      url: '/Api/Product/GetProductImageByID',
      params: {
        productID: proId === undefined ? this.props.proId : proId,
      }
    }).then(res => {
      if (res.model) {
        const data = JSON.parse(res.model);
        this.setState({
          smUrl: data.smUrl,
          bgUrl: data.bgUrl,
          loading: false,
        });
      }
      this.setState({
        loading: false,
      });
    }).catch(() => {
      this.setState({
        loading: false,
      });
    });
  }

  closeModal = () => {
    this.setState({
      visible: false,
    });
  }

  openModal = () => {
    this.setState({
      visible: true,
    });
  }


  render() {
    return (
      <div>
        <div onClick={() => this.openModal()}>
          {this.state.loading ?
            <div style={{width: 40, height: 40, margin: 'auto'}}><img src={Config.defaultImage} alt="LOADING"/></div> :
            <img alt="" style={{width: 40, height: 40, cursor: 'pointer'}} src={this.state.smUrl}/>
          }
        </div>
        {this.state.visible ?
        <Modal
          footer={null}
          width={600}
          visible={this.state.visible}
          onCancel={() => this.closeModal()}
          destroyOnClose={true}
          maskClosable={true}
        >
          <img alt="" src={this.state.bgUrl} style={{width: 550, height: 500}}/>
        </Modal> : null}</div>


    );
  }
}

export default ProductInfo;
