import React from 'react';
import { Link } from 'dva/router';
import Exception from '../../components/Exception';

export default () => (
  <Exception type="403" style={{ height:`calc(100vh - 50px)` }} linkElement={Link} />
);
