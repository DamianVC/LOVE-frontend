import { flatMap } from '../Utils';

export const getToken = (state) => state.auth.token;

export const getUsername = (state) => state.auth.username;

export const getPermCmdExec = (state) => state.auth.permissions.cmd_exec;

export const getTokenStatus = (state) => state.auth.status;

export const getStreamsData = (state, groupNames) => {
  if (state.ws === undefined) return undefined;

  const filteredList = state.ws.subscriptions.filter((s) => groupNames.includes(s.groupName));
  const dict = {};

  filteredList.forEach((s) => {
    dict[s.groupName] = s.data;
  });
  return dict;
};

export const getStreamData = (state, groupName) => {
  return getStreamsData(state, [groupName])[groupName];
};

export const getTimestampedStreamData = (state, groupName) => {
  if (state.ws === undefined) return undefined;
  const filteredElement = state.ws.subscriptions.filter((s) => s.groupName === groupName)[0];
  const data = filteredElement ? filteredElement.data : undefined;
  const timestamp = filteredElement ? filteredElement.timestamp : undefined;
  return {
    data: data,
    timestamp: timestamp,
  };
};

export const getCameraState = (state) => {
  return state.camera;
};

export const getLastSALCommand = (state) => {
  return state.ws.lastSALCommand;
};
export const getDomeState = (state) => {
  const domeSubscriptions = [
    'telemetry-ATDome-1-position',
    'event-ATDome-1-azimuthState',
    'event-ATDome-1-azimuthCommandedState',
    'event-ATDome-1-dropoutDoorState',
    'event-ATDome-1-mainDoorState',
    'event-ATDome-1-allAxesInPosition',
    'telemetry-ATMCS-1-mountEncoders',
    'event-ATMCS-1-detailedState',
    'event-ATMCS-1-atMountState',
    'event-ATMCS-1-target',
    'event-ATMCS-1-allAxesInPosition',
    'event-ATMCS-1-m3State',
    'telemetry-ATPtg-1-currentTimesToLimits',
  ];
  const domeData = getStreamsData(state, domeSubscriptions);
  return {
    dropoutDoorOpeningPercentage: domeData['telemetry-ATDome-1-position']
      ? domeData['telemetry-ATDome-1-position']['dropoutDoorOpeningPercentage']
      : 0,
    mainDoorOpeningPercentage: domeData['telemetry-ATDome-1-position']
      ? domeData['telemetry-ATDome-1-position']['mainDoorOpeningPercentage']
      : 0,
    azimuthPosition: domeData['telemetry-ATDome-1-position']
      ? domeData['telemetry-ATDome-1-position']['azimuthPosition']
      : 0,
    azimuthState: domeData['event-ATDome-1-azimuthState'],
    azimuthCommandedState: domeData['event-ATDome-1-azimuthCommandedState'],
    domeInPosition: domeData['event-ATDome-1-allAxesInPosition'],
    dropoutDoorState: domeData['event-ATDome-1-dropoutDoorState'],
    mainDoorState: domeData['event-ATDome-1-mainDoorState'],
    mountEncoders: domeData['telemetry-ATMCS-1-mountEncoders'],
    detailedState: domeData['event-ATMCS-1-detailedState'],
    atMountState: domeData['event-ATMCS-1-atMountState'],
    mountInPosition: domeData['event-ATMCS-1-allAxesInPosition'],
    target: domeData['event-ATMCS-1-target'],
    m3State: domeData['event-ATMCS-1-m3State'],
    currentTimesToLimits: domeData['currentTimesToLimits'],
  };
};

export const getMountSubscriptions = (index) => {
  return [
    //ATHexapod
    `event-ATHexapod-${index}-inPosition`,
    `event-ATHexapod-${index}-readyForCommand`,
    `telemetry-ATHexapod-${index}-positionStatus`,
    //ATPneumatics
    `event-ATPneumatics-${index}-m1CoverState`,
    `event-ATPneumatics-${index}-m1CoverLimitSwitches`,
    `event-ATPneumatics-${index}-m1VentsLimitSwitches`,
    `telemetry-ATPneumatics-${index}-loadCell`,
    `telemetry-ATPneumatics-${index}-m1AirPressure`,
    //ATMCS
    `event-ATMCS-${index}-m3InPosition`,
    `event-ATMCS-${index}-m3State`,
    `event-ATMCS-${index}-m3PortSelected`,
    `event-ATMCS-${index}-nasmyth1RotatorInPosition`,
    `event-ATMCS-${index}-nasmyth2RotatorInPosition`,
    `event-ATMCS-${index}-nasmyth1LimitSwitchCCW`,
    `event-ATMCS-${index}-nasmyth1LimitSwitchCW`,
    `event-ATMCS-${index}-nasmyth2LimitSwitchCCW`,
    `event-ATMCS-${index}-nasmyth2LimitSwitchCW`,
  ];
};

export const getMountState = (state, index) => {
  const mountSubscriptions = getMountSubscriptions(index);
  const mountData = getStreamsData(state, mountSubscriptions);
  return {
    //ATHexapod
    hexapodInPosition: mountData[`event-ATHexapod-${index}-inPosition`]
      ? mountData[`event-ATHexapod-${index}-inPosition`]['inPosition']
      : 0,
    hexapodReadyForCommand: mountData[`event-ATHexapod-${index}-readyForCommand`]
      ? mountData[`event-ATHexapod-${index}-readyForCommand`]['ready']
      : 0,
    hexapodReportedPosition: mountData[`telemetry-ATHexapod-${index}-positionStatus`]
      ? mountData[`telemetry-ATHexapod-${index}-positionStatus`]['reportedPosition']
      : 'Unknown',
    //ATPneumatics
    m1CoverState: mountData[`event-ATPneumatics-${index}-m1CoverState`]
      ? mountData[`event-ATPneumatics-${index}-m1CoverState`]
      : 0,
    m1CoverLimitSwitches: mountData[`event-ATPneumatics-${index}-m1CoverLimitSwitches`]
      ? mountData[`event-ATPneumatics-${index}-m1CoverLimitSwitches`]
      : {},
    m1VentsLimitSwitches: mountData[`event-ATPneumatics-${index}-m1VentsLimitSwitches`],
    loadCell: mountData[`telemetry-ATPneumatics-${index}-loadCell`]
      ? mountData[`telemetry-ATPneumatics-${index}-loadCell`]['cellLoad']
      : 'Unknown',
    m1AirPressure: mountData[`telemetry-ATPneumatics-${index}-m1AirPressure`]
      ? mountData[`telemetry-ATPneumatics-${index}-m1AirPressure`]['pressure']
      : 'Unknown',
    //ATMCS
    m3InPosition: mountData[`event-ATMCS-${index}-m3InPosition`]
      ? mountData[`event-ATMCS-${index}-m3InPosition`]['inPosition']
      : 0,
    nasmyth1RotatorInPosition: mountData[`event-ATMCS-${index}-nasmyth1RotatorInPosition`]
      ? mountData[`event-ATMCS-${index}-nasmyth1RotatorInPosition`]['inPosition']
      : 0,
    nasmyth2RotatorInPosition: mountData[`event-ATMCS-${index}-nasmyth2RotatorInPosition`]
      ? mountData[`event-ATMCS-${index}-nasmyth2RotatorInPosition`]['inPosition']
      : 0,
    m3State: mountData[`event-ATMCS-${index}-m3State`] ? mountData[`event-ATMCS-${index}-m3State`]['state'] : 0,
    m3PortSelected: mountData[`event-ATMCS-${index}-m3PortSelected`]
      ? mountData[`event-ATMCS-${index}-m3PortSelected`]['selected']
      : 0,
    nasmyth1LimitSwitchCCW: mountData[`event-ATMCS-${index}-nasmyth1LimitSwitchCCW`]
      ? mountData[`event-ATMCS-${index}-nasmyth1LimitSwitchCCW`]['active']
      : 'Unknown',
    nasmyth1LimitSwitchCW: mountData[`event-ATMCS-${index}-nasmyth1LimitSwitchCW`]
      ? mountData[`event-ATMCS-${index}-nasmyth1LimitSwitchCW`]['active']
      : 'Unknown',
    nasmyth2LimitSwitchCCW: mountData[`event-ATMCS-${index}-nasmyth2LimitSwitchCCW`]
      ? mountData[`event-ATMCS-${index}-nasmyth2LimitSwitchCCW`]['active']
      : 'Unknown',
    nasmyth2LimitSwitchCW: mountData[`event-ATMCS-${index}-nasmyth2LimitSwitchCW`]
      ? mountData[`event-ATMCS-${index}-nasmyth2LimitSwitchCW`]['active']
      : 'Unknown',
  };
};

export const getLATISSState = (state) => {
  const latissSubscriptions = [
    // Spectrograph
    'event-ATSpectrograph-0-reportedFilterPosition',
    'event-ATSpectrograph-0-reportedDisperserPosition',
    'event-ATSpectrograph-0-reportedLinearStagePosition',
    'event-ATSpectrograph-0-lsState',
    'event-ATSpectrograph-0-fwState',
    'event-ATSpectrograph-0-gwState',
    // Camera
    'event-ATCamera-0-shutterDetailedState',
    'event-ATCamera-0-raftsDetailedState',
  ];
  const latissData = getStreamsData(state, latissSubscriptions);
  const reportedFilterPosition = latissData['event-ATSpectrograph-0-reportedFilterPosition'];
  const reportedDisperserPosition = latissData['event-ATSpectrograph-0-reportedDisperserPosition'];
  const reportedLinearStagePosition = latissData['event-ATSpectrograph-0-reportedLinearStagePosition'];
  const lsState = latissData['event-ATSpectrograph-0-lsState'];
  const fwState = latissData['event-ATSpectrograph-0-fwState'];
  const gwState = latissData['event-ATSpectrograph-0-gwState'];
  const shutterDetailedState = latissData['event-ATCamera-0-shutterDetailedState'];
  const raftsDetailedState = latissData['event-ATCamera-0-raftsDetailedState'];

  return {
    reportedFilterPosition: reportedFilterPosition
      ? reportedFilterPosition[reportedFilterPosition.length - 1]['position'].value
      : 0,
    reportedFilterName: reportedFilterPosition
      ? reportedFilterPosition[reportedFilterPosition.length - 1]['name'].value
      : '',
    reportedDisperserPosition: reportedDisperserPosition
      ? reportedDisperserPosition[reportedDisperserPosition.length - 1]['position'].value
      : 0,
    reportedDisperserName: reportedDisperserPosition
      ? reportedDisperserPosition[reportedDisperserPosition.length - 1]['name'].value
      : '',
    reportedLinearStagePosition: reportedLinearStagePosition
      ? reportedLinearStagePosition[reportedLinearStagePosition.length - 1]['position'].value
      : 0,
    lsState: lsState ? lsState[lsState.length - 1]['state'].value : 0,
    fwState: fwState ? fwState[fwState.length - 1]['state'].value : 0,
    gwState: gwState ? gwState[gwState.length - 1]['state'].value : 0,
    shutterDetailedState: shutterDetailedState
      ? shutterDetailedState[shutterDetailedState.length - 1]['substate'].value
      : 0,
    raftsDetailedState: raftsDetailedState ? raftsDetailedState[raftsDetailedState.length - 1]['substate'].value : 0,
  };
};

export const getKey = (dict, key, def) => {
  if (dict && dict !== {} && Object.keys(dict).includes(key)) {
    return dict[key];
  } else {
    return def;
  }
};

export const getScriptQueueState = (state, salindex) => {
  const scriptQueueData = getStreamData(state, `event-ScriptQueueState-${salindex}-stream`);
  return {
    state: getKey(scriptQueueData, 'state', undefined),
    availableScriptList: getKey(scriptQueueData, 'available_scripts', undefined),
    waitingScriptList: getKey(scriptQueueData, 'waiting_scripts', undefined),
    current: getKey(scriptQueueData, 'current', 'None'),
    finishedScriptList: getKey(scriptQueueData, 'finished_scripts', undefined),
  };
};

/**
 * Returns all heartbeats in the state that belong to a scriptqueue of specific salindex.
 *
 * @param {obj} state
 * @param {integer} salindex
 */
export const getScriptHeartbeats = (state, salindex) => {
  return state.heartbeats.scripts.filter((heartbeat) => heartbeat.queueSalIndex === salindex);
};

export const getSummaryStateValue = (state, groupName) => {
  const summaryState = getStreamData(state, groupName);
  let summaryStateValue = undefined;
  if (summaryState) {
    summaryStateValue = summaryState[summaryState.length - 1].summaryState.value;
  }
  return summaryStateValue;
};

/**
 * Returns the whole lits of heartbeats
 * @param {object} state
 */
export const getCSCHeartbeats = (state) => {
  return state.heartbeats.cscs;
};

/**
 * Selects the heartbeat object of a (csc, salindex)
 * @param {object} state
 * @param {string} csc
 * @param {number} salindex
 */
export const getCSCHeartbeat = (state, csc, salindex) => {
  return state.heartbeats.cscs.find((heartbeat) => heartbeat.csc === csc && heartbeat.salindex === salindex);
};

/**
 * Reshape the output of getStreamsData into a dictionary indexed by "csc-salindex" for all "csc-salindex" pairs
 * for which a subscription to a given category and stream exists in the state.
 * Currently hardcoded to use salindex=1 only
 * @param {object} state
 * @param {string} category
 * @param {array} CSCsSalindexList: array [cscname {string}, salindex {int}] pairs
 * @param {string} stream
 * @param {bool} lastDataOnly: flag to return the last data only instead of the whole array, e.g., {csc: Object} instead of {csc: Array[]}
 */
export const getAllStreamsAsDictionary = (state, category, CSCsSalindexList, stream, lastDataOnly = false) => {
  const groupNames = CSCsSalindexList.map(([CSC, salindex]) => `${category}-${CSC}-${salindex}-${stream}`);
  const streams = getStreamsData(state, groupNames);

  const dictionary = {};
  CSCsSalindexList.forEach(([CSC, salindex]) => {
    const groupName = `${category}-${CSC}-${salindex}-${stream}`;
    if (Object.keys(streams).includes(groupName)) {
      dictionary[`${CSC}-${salindex}`] = streams[groupName];
      if (dictionary[`${CSC}-${salindex}`] && lastDataOnly) {
        dictionary[`${CSC}-${salindex}`] = dictionary[`${CSC}-${salindex}`][0];
      }
    }
  });

  return dictionary;
};

export const getCSCLogMessages = (state, csc, salindex) => {
  const logMessageData = state.summaryData.logMessageData.find(
    (data) => data.csc === csc && data.salindex === salindex,
  );

  if (!logMessageData) return [];

  return logMessageData.messages;
};

export const getCSCErrorCodeData = (state, csc, salindex) => {
  const errorCodeData = state.summaryData.errorCodeData.find((data) => data.csc === csc && data.salindex === salindex);
  if (!errorCodeData) return [];

  return errorCodeData.errorCodeData;
};

/**
 * Returns a sorted list of errorCode data for a CSC group
 * @param {object} state Redux state
 * @param {array} group Group of CSCs as in the hierarchy [{name: 'Test', salindex:1}, {name: 'Test', salindex: 2}]
 */
export const getGroupSortedErrorCodeData = (state, group) => {
  const filtered = state.summaryData.errorCodeData.filter((cscData) => {
    const searchIndex = group.findIndex((csc) => cscData.csc === csc.name && cscData.salindex === csc.salindex);
    return searchIndex > -1;
  });

  const flatMapped = flatMap(filtered, (cscData) => {
    return cscData.errorCodeData.map((data) => {
      return {
        csc: cscData.csc,
        salindex: cscData.salindex,
        ...data,
      };
    });
  });

  const sorted = flatMapped.sort((msg1, msg2) => {
    return msg1.private_rcvStamp.value > msg2.private_rcvStamp.value ? -1 : 1;
  });

  return sorted;
};

export const getAllTelemetries = (state) => {
  if (state.ws === undefined) return undefined;
  return getStreamData(state, 'telemetry-all-all-all');
};

export const getAllEvents = (state) => {
  if (state.ws === undefined) return undefined;
  return getStreamData(state, 'event-all-all-all');
};
