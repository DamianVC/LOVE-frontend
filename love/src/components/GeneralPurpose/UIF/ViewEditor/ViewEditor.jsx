import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { Rnd } from 'react-rnd';
import { toast } from 'react-toastify';

import Button from '../../Button/Button';
import Input from '../../Input/Input';
import Modal from '../../Modal/Modal';
import CustomView from '../CustomView';
import ComponentSelector from '../ComponentSelector/ComponentSelector';
import styles from './ViewEditor.module.css';
import { editViewStates } from '../../../../redux/reducers/uif';

import 'brace/mode/json';
import 'brace/theme/solarized_dark';

export default class ViewEditor extends Component {
  static propTypes = {
    /** Object representing the layout of the view being edited */
    editedViewCurrent: PropTypes.object,
    /** Object representing the extra data of the view being edited */
    editedViewSaved: PropTypes.object,
    /** Status of the view being edited */
    editedViewStatus: PropTypes.object,
    /** Function to update the edited view */
    updateEditedView: PropTypes.func,
    /** Function to save the edited view to the server (POST or PUT) */
    saveEditedView: PropTypes.func,
  };

  static defaultProps = {
    editedViewCurrent: null,
    editedViewSaved: null,
    editedViewStatus: {code: editViewStates.EMPTY},
    updateEditedView: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      layout: JSON.stringify(this.getEditedViewLayout(), null, 2),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editedViewStatus !== this.props.editedViewStatus) {
      if (this.props.editedViewStatus.code === editViewStates.SAVING) {
        console.log('SAVING');
      } else if (this.props.editedViewStatus.code === editViewStates.SAVED) {
        toast.success('View saved successfully');
      } else if (this.props.editedViewStatus.code === editViewStates.SAVE_ERROR) {
        const errorStr = this.props.editedViewStatus.details ? JSON.stringify(this.props.editedViewStatus.details) : null;
        toast.error(`Error saving view: ${errorStr}`);
      }
    }
  }

  getEditedViewLayout = () => {
    return this.props.editedViewCurrent ? this.props.editedViewCurrent.data : {};
  }

  updateEditedViewLayout = (newLayout) => {
    this.props.updateEditedView({
      ...this.props.editedViewCurrent,
      data: newLayout,
    });
  }

  onEditorChange = (newValue) => {
    this.setState({
      layout: newValue,
      showModal: false,
    });
  };

  applyEditorLayout = () => {
    let parsedLayout = {};
    try {
      parsedLayout = JSON.parse(this.state.layout);
    } catch (error) {
      parsedLayout = {};
    }
    this.updateEditedViewLayout(parsedLayout);
  };

  onLayoutChange = (newLayoutProperties) => {
    const oldLayoutStr = JSON.stringify(this.getEditedViewLayout(), null, 2);
    let newLayout = { ...this.getEditedViewLayout() };
    newLayoutProperties.forEach((elementProperties) => {
      const parsedProperties = { ...elementProperties };
      parsedProperties.i = parseInt(elementProperties.i, 10);
      parsedProperties.allowOverflow = elementProperties.allowOverflow;
      newLayout = this.updateElementProperties(newLayout, parsedProperties);
    });
    const newLayoutStr = JSON.stringify(newLayout, null, 2);
    this.setState({
      layout: newLayoutStr,
    });
    if (newLayoutStr !== oldLayoutStr) {
      this.updateEditedViewLayout(newLayout);
    }
  };

  updateElementProperties = (element, properties) => {
    const newElement = { ...element };
    if (element.properties.i === properties.i) {
      newElement.properties = {
        ...element.properties,
        x: properties.x,
        y: properties.y,
        w: properties.w,
        h: properties.h,
        cols: properties.cols,
      };
      return newElement;
    }
    if (element.properties.type == 'container') {
      Object.keys(element.content).map((key) => {
        newElement.content[key] = this.updateElementProperties(element.content[key], properties);
      });
    }
    return newElement;
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  showModal = (e) => {
    this.setState({ showModal: true });
  };

  receiveSelection = (selection) => {
    this.hideModal();
    const parsedLayout = { ...this.getEditedViewLayout() };
    const additionalContent = {};
    let startingIndex = 0;
    Object.keys(parsedLayout.content).forEach((compKey) => {
      startingIndex = Math.max(parsedLayout.content[compKey].properties.i, startingIndex);
    });
    startingIndex += 1;

    selection.forEach((componentDict) => {
      const { schema } = componentDict;
      const { defaultSize } = schema;
      const componentConfig = schema.props;
      const defaultConfig = {};
      Object.keys(componentConfig).forEach((key) => {
        defaultConfig[key] = componentConfig[key].default;
      });
      additionalContent[`newPanel-${startingIndex}`] = {
        properties: {
          type: 'component',
          x: 0,
          y: 0,
          w: defaultSize[0],
          h: defaultSize[1],
          allowOverflow: schema.allowOverflow,
          i: startingIndex,
        },
        content: componentDict.name,
        config: defaultConfig,
      };
      startingIndex += 1;
    });
    parsedLayout.content = { ...parsedLayout.content, ...additionalContent };
    this.updateEditedViewLayout(parsedLayout);
  };

  onComponentDelete = (component) => {
    let parsedLayout = { ...this.getEditedViewLayout() };
    Object.keys(parsedLayout.content).forEach((compKey) => {
      if (parsedLayout.content[compKey].content === component.content) delete parsedLayout.content[compKey];
    });
    this.updateEditedViewLayout(parsedLayout);
    return [];
  };

  save = () => {
    this.props.saveEditedView();
  };

  render() {
    return (
      <>
        <div className={styles.container}>
          <div>
            <CustomView
              layout={this.getEditedViewLayout()}
              onLayoutChange={this.onLayoutChange}
              onComponentDelete={this.onComponentDelete}
            ></CustomView>
          </div>
        </div>
        <Rnd
          default={{
            x: 800,
            y: 50,
            width: 500,
            height: 200,
          }}
          style={{ zIndex: 1000 }}
          bounds={'parent'}
          enableUserSelectHack={false}
          dragHandleClassName={styles.bar}
          onResize={this.onResize}
        >
          <div>
            <div className={styles.bar}>
              View:
              <Input
                className={styles.textField}
                defaultValue={
                  this.props.editedViewSaved && this.props.editedViewSaved.name
                    ? this.props.editedViewSaved.name
                    : 'Untitled view'
                }
              />
              <Button onClick={this.showModal}>Add Components</Button>
              <Button onClick={this.save}>Save Changes</Button>
            </div>
            <AceEditor
              mode="json"
              theme="solarized_dark"
              name="UNIQUE_ID_OF_DIV"
              onChange={this.onEditorChange}
              width={'100%'}
              value={this.state.layout}
              editorProps={{ $blockScrolling: true }}
              fontSize={18}
            />
            <Button onClick={this.applyEditorLayout}>Apply</Button>
          </div>
        </Rnd>
        <Modal isOpen={this.state.showModal} onRequestClose={this.hideModal} contentLabel="Component selection modal">
          <ComponentSelector selectCallback={this.receiveSelection} />
        </Modal>
      </>
    );
  }
}
