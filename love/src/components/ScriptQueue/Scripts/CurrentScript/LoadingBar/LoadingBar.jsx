import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './LoadingBar.module.css';

export default class LoadingBar extends Component {
  static propTypes = {
    /** Percentage of Loading bar to display as progress */
    percentage: PropTypes.number,
  };

  static defaultProps = {
    percentage: 0,
  };

  render() {
    return (
      <div className={styles.backgroundBar} title={`Script completion: ${this.props.percentage}%`}>
          <span className={[styles.percentage, this.props.percentage > 50 ? styles.dark : ''].join(' ')}>
            {`${this.props.percentage.toFixed(0)}%`}
          </span>
        <div style={{ width: `${Math.min(this.props.percentage, 100)}%` }} className={styles.loadedBar}>
        </div>
      </div>
    );
  }
}
