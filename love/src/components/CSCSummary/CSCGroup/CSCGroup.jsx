import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './CSCGroup.module.css';
import CSCDetailContainer from '../CSCDetail/CSCDetail.container';
import CSCExpandedContainer from '../CSCExpanded/CSCExpanded.container';
import CSCGroupLogContainer from '../CSCGroupLog/CSCGroupLog.container';

export default class CSCGroup extends Component {
  static propTypes = {
    name: PropTypes.string,
    realm: PropTypes.string,
    cscs: PropTypes.array,
    onCSCClick: PropTypes.func,
    selectedCSCs: PropTypes.array,
    hierarchy: PropTypes.object,
    embedded: PropTypes.bool,
  };

  static defaultProps = {
    name: '',
    realm: '',
    cscs: [],
    onCSCClick: () => 0,
    subscribeToStreams: () => 0,
    selectedCSCs: [],
    hierarchy: {},
    embedded: false,
  };

  componentDidMount = () => {
    if (this.props.cscs !== undefined) {
      this.props.cscs.forEach((csc) => {
        this.props.subscribeToStreams(csc.name, csc.salindex);
      });
    }
  };

  renderExpandedView = (selectedCSC) => {
    const groupView = selectedCSC.csc === 'all';

    return groupView ? (
      <CSCGroupLogContainer
        realm={selectedCSC.realm}
        group={selectedCSC.group}
        name={selectedCSC.csc}
        onCSCClick={this.props.onCSCClick}
        hierarchy={this.props.hierarchy}
        embedded={true}
      />
    ) : (
      <CSCExpandedContainer
        realm={selectedCSC.realm}
        group={selectedCSC.group}
        name={selectedCSC.csc}
        salindex={selectedCSC.salindex}
        onCSCClick={this.props.onCSCClick}
      />
    );
  };

  render() {
    let selectedCSC = this.props.selectedCSCs.filter((data) => {
      return data.realm === this.props.realm && data.group === this.props.name;
    });
    const expanded = selectedCSC.length > 0;
    [selectedCSC] = selectedCSC;
    return expanded ? (
      this.renderExpandedView(selectedCSC)
    ) : (
      <div className={styles.CSCGroupContainer}>
        <div
          className={styles.CSCGroupTitle}
          onClick={() => this.props.onCSCClick(this.props.realm, this.props.name, 'all')}
        >
          {this.props.name}
        </div>
        <div className={styles.CSCDetailsContainer}>
          {this.props.cscs.map((csc) => {
            return (
              <div key={csc.name + csc.salindex} className={styles.CSCDetailContainer}>
                <CSCDetailContainer
                  realm={this.props.realm}
                  group={this.props.name}
                  name={csc.name}
                  salindex={csc.salindex}
                  onCSCClick={this.props.onCSCClick}
                  embedded={true}
                  shouldSubscribe={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
