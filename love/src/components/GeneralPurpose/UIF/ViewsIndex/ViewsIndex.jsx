import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import Button from '../../Button/Button';

import styles from './ViewsIndex.module.css';

class ViewsIndex extends Component {
  static propTypes = {
    /** Current views to display */
    views: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  createNewView = () => {
    this.props.history.push('/view-editor');
  }

  render() {
    console.log('views: ', this.props.views);
    return (
      <div className={styles.container}>
        <h1>UI Framework</h1>
        <h2>Available Views</h2>
        <ol className={styles.linkList}>
          { this.props.views.map((view, index) => (
            <li key={index} className={styles.linkListItem}>
              <span> {(index + 1) + '. '} </span>
              <span> {view.name} </span>
              <Button>
                Open
              </Button>
              <Button>
                Edit
              </Button>
            </li>
          )) }
        </ol>
        <Button onClick={this.createNewView}>
          New View
        </Button>
      </div>
    );
  }
}
export default withRouter(ViewsIndex);
