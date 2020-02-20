import React from 'react';
import { connect } from 'react-redux';
import {
  getUsername,
  getLastSALCommand,
  getMode,
  getView,
  getViewsStatus,
  getLastManagerHeartbeat,
} from '../../redux/selectors';
import { logout } from '../../redux/actions/auth';
import { clearViewToEdit } from '../../redux/actions/uif';
import Layout from './Layout';

const LayoutContainer = ({ ...props }) => {
  return <Layout {...props} />;
};

const mapStateToProps = (state) => {
  const user = getUsername(state);
  const lastSALCommand = getLastSALCommand(state);
  const mode = getMode(state);
  const getCurrentView = (id) => getView(state, id);
  const getManagerHeartbeat = () => getLastManagerHeartbeat(state);
  const viewsStatus = getViewsStatus(state);
  return { user, lastSALCommand, mode, getCurrentView, viewsStatus, getLastManagerHeartbeat: getManagerHeartbeat };
};

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(logout()),
  clearViewToEdit: () => dispatch(clearViewToEdit),
});

export default connect(mapStateToProps, mapDispatchToProps)(LayoutContainer);
