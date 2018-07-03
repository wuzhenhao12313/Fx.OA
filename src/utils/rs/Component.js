import React, {PureComponent} from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import moment from 'moment';
import Config from '../../utils/rs/Config';
import {String, IsArray} from "./Util";


function HOCFactory(wrappedComponent) {
  return class extends PureComponent {
    render() {
      let props = {
        ...this.props
      };

      if (typeof this.props.getInstance === "function") {
        props.ref = this.props.getInstance;
      }

      return <wrappedComponent {...props} />
    }
  }
}

const Component = {};

/**
 * 注入权限验证
 * @param code
 * @returns {function(*)}
 */
Component.Role = (code) => {
  return (WrappedComponent) => {
    class Role extends PureComponent {
      getWrappedInstance = () => {
        if (this.props.withRef) {
          return this.wrappedInstance;
        }
      }

      setWrappedInstance = (ref) => {
        this.wrappedInstance = ref;
      }

      componentWillMount() {
        const {model} = this.props;
        model.dispatch({
          type: 'validMenuAuth',
          payload: {
            appCode: Config.appCode,
            menuCode: code,
          },
        });
      }

      render() {
        const {model} = this.props;

        let {[model.name]: {menuAuth}} = this.props;

        menuAuth = menuAuth || {};
        const {actionList = [], columnList = []} = menuAuth;

        let props = {
          ...this.props
        };

        if (this.props.withRef) {
          props.ref = this.setWrappedInstance;
        }
        return <WrappedComponent actionList={actionList} columnList={columnList} {...props}/>;
      }
    }

    hoistNonReactStatic(Role, WrappedComponent);
    return Role;
  };
};

/**
 * 注入模型
 * @param model
 * @returns {function(*)}
 */
Component.Model = (model) => {
  return (WrappedComponent) => {
    class Model extends React.Component {
      getWrappedInstance = () => {
        if (this.props.withRef) {
          return this.wrappedInstance;
        }
      }

      setWrappedInstance = (ref) => {
        this.wrappedInstance = ref;
      }

      render() {
        const {dispatch} = this.props;
        const _model = {
          name: model,
          get: (payload) => {
            return dispatch({
              type: `${model}/get`,
              payload,
            });
          },
          add: (payload) => {
            return dispatch({
              type: `${model}/add`,
              payload,
            });
          },
          edit: (payload) => {
            return dispatch({
              type: `${model}/edit`,
              payload,
            });
          },
          remove: (payload) => {
            return dispatch({
              type: `${model}/remove`,
              payload,
            });
          },
          save: (isAdd, payload) => {
            const action = isAdd ? 'add' : 'edit';
            return dispatch({
              type: `${model}/${action}`,
              payload,
            });
          },
          call: (type, payload) => {
            return dispatch({
              type: `${model}/${type}`,
              payload,
            });
          },
          dispatch: ({type, payload}) => {
            return dispatch({
              type: `${model}/${type}`,
              payload,
            });
          },
          setState: (payload) => {
            return dispatch({
              type: `${model}/setState`,
              payload,
            });
          },
          push: (path) => {
            return dispatch({
              type: `${model}/changeRoute`,
              payload: {
                path
              }
            });
          },
          clear: () => {
            return dispatch({
              type: `${model}/clear`,
            });
          },
          resetState: () => {
            return dispatch({
              type: `${model}/resetState`,
            });
          },
          resetSearchValues: () => {
            return dispatch({
              type: `${model}/resetSearchValues`,
            });
          },
          resetPage: () => {
            return dispatch({
              type: `${model}/resetPage`,
            });
          }
        }
        let props = {
          ...this.props
        };
        if (this.props.withRef) {
          props.ref = this.setWrappedInstance;
        }
        return <WrappedComponent model={_model} {...props}/>;
      }
    }

    hoistNonReactStatic(Model, WrappedComponent);
    return Model;
  };
};

/**
 * 注入分页
 * @param model
 * @returns {function(*)}
 */
Component.Pagination = ({model}) => {
  return (WrappedComponent) => {
    class Pagination extends PureComponent {
      getWrappedInstance = () => {
        if (this.props.withRef) {
          return this.wrappedInstance;
        }
      }

      setWrappedInstance = (ref) => {
        this.wrappedInstance = ref;
      }

      render() {
        const _pageSize = localStorage.getItem('pageSize') === null ? 10
          : parseInt(localStorage.getItem('pageSize'));
        const {dispatch} = this.props;
        const pagination = ({total, pageIndex, pageSize}, action) => {
          return {
            showSizeChanger: true,
            hideOnSinglePage: false,
            pageSizeOptions: ["10", "20", "40", "60", "100", "200", "500"],
            // showTotal: (value) => {
            //   return `显示${1 + _pageSize * (pageIndex - 1)} - ${_pageSize * pageIndex}条记录 | 检索到 ${value}条记录`;
            // },
            total,
            current: pageIndex,
            pageSize: pageSize || _pageSize,
            onChange: (current) => {
              dispatch({
                type: `${model}/setState`,
                payload: {
                  pageIndex: current,
                },
              }).then(() => {
                action(current);
              });
            },
            onShowSizeChange: (current, size) => {
              if (!pageSize) {
                localStorage.setItem('pageSize', size);
              }
              dispatch({
                type: `${model}/setState`,
                payload: {
                  pageSize: size,
                  pageIndex: 1,
                },
              }).then(() => {
                action();
              });
            },
          };
        }
        let props = {
          ...this.props
        };

        if (this.props.withRef) {
          props.ref = this.setWrappedInstance;
        }
        return <WrappedComponent pagination={pagination} {...props}/>;
      }
    }

    hoistNonReactStatic(Pagination, WrappedComponent);
    return Pagination;
  };
};


Component.Utils = (settings) => {
  return (WrappedComponent) => {
    class Utils extends PureComponent {
      getWrappedInstance = () => {
        if (this.props.withRef) {
          return this.wrappedInstance;
        }
      }

      setWrappedInstance = (ref) => {
        this.wrappedInstance = ref;
      }

      render() {
        const _utils = {
          getFilterKeys: (formFieldsValue) => {
            if (settings && settings.filter) {
              const {model} = this.props;
              const values = {};
              const {[model.name]: {filter}} = this.props;
              const filters = {
                ...filter,
                ...formFieldsValue,
              };
              Object.keys(filters).map(key => {
                let type;
                const value = filters[key];
                const formatter = settings.filter[key] ? settings.filter[key].formatter : null;

                if (settings.filter[key] && settings.filter[key].type) {
                  type = settings.filter[key].type;
                  if (type === 'moment') {
                    if (value) {
                      values[key] = [moment(value).format(formatter || 'YYYY-MM-DD')];
                    }
                  }
                } else {
                  type = typeof filters[key];
                  if (type === 'string') {
                    if (!String.IsNullOrEmpty(value)) {
                      if (formatter) {
                        values[key] = [formatter[value]];
                      } else {
                        values[key] = [value];
                      }
                    }
                  }
                  if (type === 'number') {
                    if (value) {
                      values[key] = [value];
                    }
                  }
                  if (IsArray(value)) {
                    if (value && value.length > 0) {
                      const _valueList = [];
                      value.map(_i => {
                        if (formatter) {
                          _valueList.push(formatter[_i]);
                        } else {
                          _valueList.push(_i);
                        }
                      });
                      values[key] = _valueList;
                    }
                  }
                }
              });
              model.setState({
                filterKeys: values,
              });
            }
          },
          clearFilters: (key, form, get) => {
            const {model} = this.props;
            const {setFieldsValue, getFieldsValue} = form;
            const {[model.name]: {filterKeys}} = this.props;
            key = key || filterKeys;
            const modelFilter = {}, searchFilter = {};
            filterKeys && Object.keys(key).map(_key => {
              if (this.props[model.name].filter[_key]) {
                modelFilter[_key] = undefined;
              }
              if (getFieldsValue() && getFieldsValue()[_key]) {
                searchFilter[_key] = undefined;
              }
            });
            model.setState({
              filter: {
                ...this.props[model.name].filter,
                ...modelFilter,
              }
            }).then(() => {
              setFieldsValue({
                ...searchFilter,
              });
              get();
            });
          },
          changeSorter: (sorter) => {
            const {model} = this.props;
            return model.setState({
              sorter: {
                ...this.props[model.name].sorter,
                ...sorter,
              }
            });
          },
          changeFilter: (filter, form, get) => {
            const {model} = this.props;
            if (!get) {
              return model.setState({
                filter: {
                  ...this.props[model.name].filter,
                  ...filter,
                }
              });
            }
            if (settings && settings.filter) {
              model.setState({
                filter: {
                  ...this.props[model.name].filter,
                  ...filter,
                }
              }).then(() => {
                if (form) {
                  const {setFieldsValue, getFieldsValue} = form;
                  const obj = {};
                  Object.keys(filter).map(key => {
                    const type = settings.filter[key] ? settings.filter[key].type : null;
                    if (getFieldsValue() && getFieldsValue().hasOwnProperty([key])) {
                      if (type === 'moment') {
                        obj[key] = moment(filter[key]);
                      } else {
                        obj[key] = filter[key];
                      }
                    }
                  });
                  setFieldsValue({
                    ...obj,
                  });
                  get && get();
                }
              });
            }

          },
        }

        let props = {
          ...this.props
        };

        if (this.props.withRef) {
          props.ref = this.setWrappedInstance;
        }
        return <WrappedComponent utils={_utils} {...props}/>;
      }

    }

    hoistNonReactStatic(Utils, WrappedComponent);
    return Utils;
  }
}

export default Component;

