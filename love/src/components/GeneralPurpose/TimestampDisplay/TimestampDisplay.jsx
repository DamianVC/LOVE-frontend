import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Hoverable from '../Hoverable/Hoverable';
import { relativeTime, formatTimestamp, isoTimestamp } from '../../../Utils';
import styles from './TimestampDisplay.module.css';

/**
 * Component that displays a time in relative time, as a timestamp with hover,
 * and allows you to copy the value as ISO string format to the clipboard onclick
 */
TimestampDisplay.propTypes = {
  /** Value to display in seconds */
  secs: PropTypes.number,
  /** Diferrence between TAI and UTC timestamps in seconds */
  taiToUtc: PropTypes.number,
  /** Optional className */
  className: PropTypes.string,
  /** Optional default value when secs is zero */
  defValue: PropTypes.string,
};

export default function TimestampDisplay({ secs, taiToUtc, className, defValue='' }) {
  const [copied, setCopied] = useState(false);
  const ms = secs * 1000;
  const hoverValue = formatTimestamp(ms);
  const copyValue = isoTimestamp(ms);
  const displayValue = secs ? relativeTime(secs, taiToUtc) : defValue;

  const onClick = () => {
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
  };

  const cleanCopied = () => {
    if (copied) {
      setCopied(false);
    }
  };

  return (
    <Hoverable bottom>
      <div
        className={[className, styles.dataCell].join(' ')}
        onClick={onClick}
        onMouseOut={cleanCopied}
      >
        {displayValue}
      </div>
      <div className={styles.tooltip}>
        {copied ? "Copied!" : hoverValue + " (click to copy ISO str)"}
      </div>
    </Hoverable>
  );
}
