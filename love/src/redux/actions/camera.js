import { RECEIVE_IMAGE_SEQUENCE_DATA, RECEIVE_CAMERA_STATE_DATA, RECEIVE_READOUT_DATA } from './actionTypes';
import { imageStates } from '../../Constants';

export const receiveImageSequenceData = (data) => {
  let imageState, imageData;
  if (data.startIntegration) {
    imageData = data.startIntegration;
    imageState = imageStates.INTEGRATING;
  }
  else if (data.startReadout) {
    imageData = data.startReadout;
    imageState = imageStates.READING_OUT;
  }
  else if (data.endReadout) {
    imageData = data.endReadout;
    imageState = imageStates.END_READOUT;
  }
  else if (data.endOfImageTelemetry) {
    imageData = data.endOfImageTelemetry;
    imageState = imageStates.END_TELEMETRY;
  }
  return {
    type: RECEIVE_IMAGE_SEQUENCE_DATA,
    data: imageData,
    imageState,
  };
};

export const receiveCameraStateData = (data) => {
  let cameraStateData, cameraStateKey;
  if (data.ATCamera.raftsDetailedState) {
    cameraStateData = data.ATCamera.raftsDetailedState;
    cameraStateKey = 'raftsDetailedState';
  }
  else if (data.ATCamera.shutterDetailedState) {
    cameraStateData = data.ATCamera.shutterDetailedState;
    cameraStateKey = 'shutterDetailedState';
  }
  else if (data.ATCamera.imageReadinessDetailedState) {
    cameraStateData = data.ATCamera.imageReadinessDetailedState;
    cameraStateKey = 'imageReadinessDetailedState';
  }
  else if (data.ATCamera.calibrationDetailedState) {
    cameraStateData = data.ATCamera.calibrationDetailedState;
    cameraStateKey = 'calibrationDetailedState';
  }
  return {
    type: RECEIVE_CAMERA_STATE_DATA,
    data: cameraStateData,
    cameraStateKey,
  };
};

export const receiveReadoutData = (data) => {
  return {
    type: RECEIVE_READOUT_DATA,
    data: data.ATCamera.imageReadoutParameters,
  };
}