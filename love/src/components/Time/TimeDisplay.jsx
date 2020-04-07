import React from 'react';
import PropTypes from 'prop-types';
import AnalogClock from '../GeneralPurpose/AnalogClock/AnalogClock';
import DigitalClock from '../GeneralPurpose/DigitalClock/DigitalClock';
import styles from './TimeDisplay.module.css';
import { DateTime } from "luxon"; 


export default class TimeDisplay extends React.Component {

  static propTypes = {
    /** Number of seconds to add to a TAI timestamp to convert it in UTC */
    taiToUtc: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      timestamp: DateTime.local(),
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      timestamp: DateTime.local(),
    });
  }

  render () {
    const localTime = this.state.timestamp;
    const utcTime = this.state.timestamp.toUTC().setLocale('en-GB');
    const serenaTime = this.state.timestamp.setZone('America/Santiago').setLocale('en-GB');
    const arizonaTime = this.state.timestamp.setZone('America/Phoenix').setLocale('en-GB');
    const illinoisTime = this.state.timestamp.setZone('America/Chicago').setLocale('en-GB');
    const taiTime = utcTime.minus({ 'seconds': this.props.taiToUtc });
    return (
      <div className={styles.container}>
        <div className={styles.group}>
          <ClockWrapper timestamp={localTime} title='Local Time' showAnalog/>
          <ClockWrapper timestamp={localTime} title='Sidereal Time' showAnalog hideOffset/>
        </div>
        <div className={styles.group}>
          <div className={styles.column}>
            <ClockWrapper timestamp={serenaTime} title='La Serena'/>
            <ClockWrapper timestamp={arizonaTime} title='Arizona'/>
            <ClockWrapper timestamp={illinoisTime} title='Illinois'/>
          </div>
          <div className={styles.column}>
            <ClockWrapper timestamp={utcTime} title='Universal Time'/>
            <ClockWrapper timestamp={taiTime} title='International Atomic Time (TAI)' hideOffset/>
            <ClockWrapper timestamp={illinoisTime} title='Modified JD' hideOffset/>
          </div>
        </div>
      </div>
    );
  }
}

function ClockWrapper ({timestamp, title, showAnalog, hideOffset}) {
  return (
    <div className={styles.clockWrapper}>
      <div className={styles.title}>
        { hideOffset ? title : `${title} (${timestamp.offsetNameShort})` }
      </div>
      <DigitalClock timestamp={timestamp}/>
      { showAnalog && (
        <div className={styles.analog}>
          <AnalogClock timestamp={timestamp}/>
        </div>
      )}
    </div>
  );
}