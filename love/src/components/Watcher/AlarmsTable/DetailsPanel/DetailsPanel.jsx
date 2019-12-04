import React, { useState } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
import Button from '../../../GeneralPurpose/Button/Button';
import styles from './DetailsPanel.module.css';

const timeoutOptions = [
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
];

const severityOptions = [
  { value: 1, label: 'WARNING' },
  { value: 2, label: 'ALERT' },
  { value: 3, label: 'CRITICAL' },
];

const initialState = {
  timeout: timeoutOptions[0],
  muteSeverity: severityOptions[0],
};

export default function DetailsPanel({ alarm, muteAlarm, unmuteAlarm }) {

  const [timeout, setTimeout] = useState(initialState.timeout);
  const [muteSeverity, setMuteSeverity] = useState(initialState.muteSeverity);

  const acknowledgedBy = alarm.acknowledgedBy ? alarm.acknowledgedBy : 'Not acknowledged';
  const mutedBy = alarm.mutedBy ? alarm.mutedBy : 'Not muted';
  const muted = alarm.mutedBy !== '';

  return (
    <div className={styles.expandedColumn}>
      <div>
        <div className={styles.title}>Acknowledged by:</div>
        <div>
          <p>{acknowledgedBy}</p>
        </div>

        <div className={styles.title}>Alarm reason:</div>
        <div>
          <p>{alarm.reason}</p>
        </div>
      </div>

      { muted ? (
        <div>
          <div className={styles.title}> Muted for: </div>
          <div>
            <p>{acknowledgedBy}</p>
          </div>
          <div className={styles.title}> Time remaining: </div>
          <div>
            <p>{acknowledgedBy}</p>
          </div>
          <div className={styles.title}> Muted by: </div>
          <div>
            <p>{mutedBy}</p>
          </div>
          <Button
            title='unmute'
            status='primary'
            disabled={!muted}
            onClick={(event) => {unmuteAlarm(event)}}
          >
            UNMUTE
          </Button>
        </div>

      ) : (
        <div>
          <div className={styles.title}> Select the muting time range: </div>
          <Dropdown
            className={styles.dropDownClassName}
            controlClassName={styles.dropDownControlClassName}
            menuClassName={[styles.dropDownMenuClassName, alarm.acknowledged ? null : styles.unack].join(' ')}
            arrowClassName={styles.arrowClassName}
            options={timeoutOptions}
            onChange={(option) => setTimeout(option)}
            value={timeout}
            placeholder="Select an option"
          />

          <div className={styles.title}> Select the muting severity: </div>
            <Dropdown
              className={styles.dropDownClassName}
              controlClassName={styles.dropDownControlClassName}
              menuClassName={[styles.dropDownMenuClassName, alarm.acknowledged ? null : styles.unack].join(' ')}
              arrowClassName={styles.arrowClassName}
              options={severityOptions}
              onChange={(option) => setMuteSeverity(option)}
              value={muteSeverity}
              placeholder="Select an option"
            />

          <Button
            title='mute'
            status='info'
            disabled={muted}
            onClick={(event) => {muteAlarm(event, timeout.value, muteSeverity.value)}}
          >
            MUTE
          </Button>
        </div>
      )}
    </div>
  );
}
