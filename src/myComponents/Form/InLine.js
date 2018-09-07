import React from 'react';
import {Form} from 'antd';

const Fragment=React.Fragment;
const FormItem=Form.Item;

@Form.create()
export default class extends React.Component {

  render() {
    const {item, form: {getFieldDecorator}} = this.props;
    if (item && item.length > 0) {
      return (
        <Form
          layout='inline'
          {...this.props}
        >
          {
            item.map((i,idx)=>{
              const {label,key,isShow=true,hasFeedback,children,render,...restProps}=i;
              if(isShow){
                return(
                  <FormItem key={idx} hasFeedback={hasFeedback} label={label} style={{marginRight:idx===item.length-1?0:16}}>
                    {children ? children :
                      <Fragment>
                        {getFieldDecorator(key, {
                            ...restProps,
                          }
                        )(i.render())}
                      </Fragment>
                    }
                  </FormItem>
                )
              }
              return null;
            })
          }
        </Form>
      )
    }
    return null;
  }
}
