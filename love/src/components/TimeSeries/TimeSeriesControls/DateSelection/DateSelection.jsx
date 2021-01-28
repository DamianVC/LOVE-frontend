import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import styles from './DateSelection.module.css';
import './react-datetime.css';
import moment from 'moment';
import TextField from 'components/TextField/TextField';
// import Input from 'components/GeneralPurpose/Input/Input';

export default class DateSelection extends PureComponent {
  static propTypes = {
    setHistoricalData: PropTypes.func,
    dateSelectorDates: PropTypes.array,
  };

  constructor() {
    super();
    this.state = {
      startDate: null,
      endDate: null,
      timeWindow: 60,
    };
  }

  isDateValid = (date) => {
    const d = new Date(date);
    return d instanceof Date && !Number.isNaN(d.getTime());
  };

  onDateSelected = (date) => {
    if (!this.isDateValid(date)) return;
    this.setState(
      {
        startDate: date,
      },
      () => {
        this.props.setHistoricalData([this.state.startDate, null]);
      },
    );
  };

  onTimeWindowChange = (minutes) => {
    this.setState({
      timeWindow: minutes <= 60 ? minutes : 60,
    });
  };

  onSubmitQuery = () => {
    const { startDate, timeWindow } = this.state;
    // TODO: add query interface
    // queryEFD(startDate, timeWindow)
  };

  componentDidMount() {
    this.setState(
      {
        startDate: this.props?.dateSelectorDates?.[0],
        endDate: this.props?.dateSelectorDates?.[1],
      },
      () => {
        this.props.setHistoricalData?.([this.state.startDate, this.state.endDate]);
      },
    );
  }

  render() {
    const { timeWindow } = this.state;
    const currentMoment = moment();
    return (
      <div className={styles.datesContainer}>
        <div className={styles.fromDateContainer}>
          <span className={styles.datetimeDescription}>From:</span>
          <div className={styles.datetimeContainer}>
            <Datetime
              inputProps={{ placeholder: 'Click to set initial date', readOnly: true }}
              onChange={(date) => this.onDateSelected(date, true)}
              initialViewMode="time"
              initialValue={this.props?.dateSelectorDates?.[0]}
              isValidDate={(currentDate) => currentDate.isBefore(currentMoment)}
            />
          </div>
        </div>
        <div className={styles.toDateContainer}>
          <span className={styles.datetimeDescription}>Time window:</span>
          <div className={styles.datetimeContainer}>
            <TextField
              className={styles.customTimeWindowInput}
              type="text"
              value={timeWindow}
              onChange={(event) => this.onTimeWindowChange(parseInt(event.target.value))}
              onFocus={(event) => event.target.select()}
            />
            {/* <Input
              // className={styles.input}
              type="number"
              min={0}
              max={60}
              value={timeWindow}
              onChange={(event) => this.onTimeWindowChange(parseInt(event.target.value))}
            /> */}
          </div>
        </div>
        <button className={styles.queryButton} onClick={(event) => console.log(this.state.timeWindow)}>
          Submit
        </button>
      </div>
    );
  }
}
