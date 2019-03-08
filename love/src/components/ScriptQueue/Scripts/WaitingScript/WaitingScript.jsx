import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import styles from './WaitingScript.module.css';
import scriptStyles from '../Scripts.module.css';
import StatusText from '../../../StatusText/StatusText';
import { getStatusStyle } from '../Scripts';

export default class WaitingScript extends Component {
  static propTypes = {
    /** SAL property: Index of Script SAL component */
    salIndex: PropTypes.number,
    /** SAL property: True if this is a standard script, False if an external script */
    isStandard: PropTypes.bool,
    /** SAL property: Path of script, relative to standard or external root directory */
    path: PropTypes.string,
    /** SAL property: Estimated duration of the script, excluding slewing to the initial position required by the script */
    estimatedTime: PropTypes.number,
    /** SAL property: State of the script; see Script_Events.xml for enum values; 0 if the script is not yet loaded */
    state: PropTypes.string,
    /** True if the script is displayed in compact view */
    isCompact: PropTypes.bool,
  };

  static defaultProps = {
    salIndex: 0,
    isStandard: true,
    path: 'auxtel/at_calsys_takedata.py',
    estimatedTime: 0,
    state: 'Unknown',
    isCompact: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
    };
  }

  onClick = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  render() {
    const { path } = this.props;
    const fileFolder = path.substring(0, path.lastIndexOf('/') + 1);
    const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    const fileExtension = path.substring(path.lastIndexOf('.'));
    return (
      <div className={scriptStyles.scriptContainer}>
        <div className={styles.waitingScriptContainer} onClick={this.onClick}>
          <div>
            <div className={scriptStyles.externalContainer}>
              <span className={scriptStyles.externalText}>{this.props.isStandard ? '[INTERNAL]' : '[EXTERNAL]'}</span>
            </div>
            <div className={scriptStyles.pathTextContainer}>
              {!this.props.isCompact ? <span className={scriptStyles.pathText}>{fileFolder}</span> : null}
              <span className={[scriptStyles.pathText, scriptStyles.highlighted].join(' ')}>{fileName}</span>
              {!this.props.isCompact ? <span className={scriptStyles.pathText}>{fileExtension}</span> : null}
            </div>
            <div className={styles.estimatedTimeContainer}>
              <span className={styles.estimatedTimeLabel}>Estimated time: </span>
              <span className={[styles.estimatedTimeValue, scriptStyles.highlighted].join(' ')}>
                {this.props.estimatedTime}
              </span>
            </div>
          </div>
          <div className={scriptStyles.statusTextContainer}>
            <StatusText status={getStatusStyle(this.props.state)}>{this.props.state}</StatusText>
          </div>
        </div>
        <div className={[styles.expandedSectionWrapper, this.state.expanded ? '' : styles.hidden].join(' ')}>
          <div className={[styles.expandedSection].join(' ')}>
            <p>Script config</p>
            <JSONPretty
              data={{ wait_time: '10.', sdasa: 1, dsadsa: true }}
              theme={{
                main:
                  'line-height:1.3;color:#66d9ef;background:var(--secondary-background-dimmed-color);overflow:auto;',
                key: 'color:#f92672;',
                string: 'color:#fd971f;',
                value: 'color:#a6e22e;',
                boolean: 'color:#ac81fe;',
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
