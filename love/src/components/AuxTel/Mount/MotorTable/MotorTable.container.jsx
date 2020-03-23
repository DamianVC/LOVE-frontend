import React from 'react';
import { connect } from 'react-redux';
import MotorTable from './MotorTable';
import { getMountMotorsState, getMountMotorsSubscriptions } from '../../../../redux/selectors';
import { addGroupSubscription, requestGroupSubscriptionRemoval } from '../../../../redux/actions/ws';

export const schema = {
  description: `Table containing low level information about the AT mount motors and drives`,
  defaultSize: [53, 11],
  props: {
    titleBar: {
      type: 'boolean',
      description: 'Whether to display the title bar',
      isPrivate: false,
      default: false,
    },
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: false,
      default: 'ATMount motors',
    },
    margin: {
      type: 'boolean',
      description: 'Whether to display component with a margin',
      isPrivate: false,
      default: true,
    },
  },
};

const MotorTableContainer = ({ ...props }) => {
  return <MotorTable {...props} />;
};

const mapStateToProps = (state) => {
  const mountMotorState = getMountMotorsState(state, 0);
  return mountMotorState;
};

const mapDispatchToProps = (dispatch) => {
  const index = 0;
  const mountMotorSubscriptions = getMountMotorsSubscriptions(index);
  return {
    subscribeToStream: () => {
      mountMotorSubscriptions.forEach((stream) => dispatch(addGroupSubscription(stream)));
    },
    unsubscribeToStream: () => {
      mountMotorSubscriptions.forEach((stream) => dispatch(requestGroupSubscriptionRemoval(stream)));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MotorTableContainer);
