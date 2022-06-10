import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { Rnd } from 'react-rnd';
import YAML from 'yaml';
import yaml from 'js-yaml';
import Form from '@rjsf/core';
import _ from 'lodash';
import 'brace/mode/yaml';
import 'brace/theme/solarized_dark';
import { SCRIPT_DOCUMENTATION_BASE_URL } from 'Config';
import Select from 'components/GeneralPurpose/Select/Select';
import styles from './ConfigPanel.module.css';
import Input from '../../GeneralPurpose/Input/Input';
import Button from '../../GeneralPurpose/Button/Button';
import DeleteIcon from '../../icons/DeleteIcon/DeleteIcon';
import RotateIcon from '../../icons/RotateIcon/RotateIcon';
import CloseIcon from '../../icons/CloseIcon/CloseIcon';
import RowExpansionIcon from '../../icons/RowExpansionIcon/RowExpansionIcon';
import Hoverable from '../../GeneralPurpose/Hoverable/Hoverable';
import InfoPanel from '../../GeneralPurpose/InfoPanel/InfoPanel';
import ManagerInterface from '../../../Utils';
import SaveIcon from 'components/icons/SaveIcon/SaveIcon';
import SaveNewIcon from 'components/icons/SaveNewIcon/SaveNewIcon';

const NO_SCHEMA_MESSAGE = '# ( waiting for schema . . .)';

const EMPTY = 'EMPTY';
const VALIDATING = 'VALIDATING';
const VALID = 'VALID';
const ERROR = 'ERROR';
const SERVER_ERROR = 'SERVER_ERROR';
const NEED_REVALIDATION = 'NEED_REVALIDATION';
const DEFAULT_CONFIG_NAME = 'last_script';

const logLevelMap = {
  Debug: 10,
  Info: 20,
  Warning: 30,
  Error: 40,
};

const DEFAULT_CONFIG_VALUE = `# Insert your config here:
# e.g.:
# wait_time: 3600
# fail_run: false
# fail_cleanup: false`;

export default class ConfigPanel extends Component {
  static propTypes = {
    launchScript: PropTypes.func,
    closeConfigPanel: PropTypes.func,
    configPanel: PropTypes.object,
  };

  static defaultProps = {
    closeConfigPanel: () => 0,
    launchScript: () => 0,
    configPanel: {
      configSchema: NO_SCHEMA_MESSAGE,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      value: DEFAULT_CONFIG_VALUE,
      autoFilledValue: '',
      width: 500,
      height: 500,
      loading: false,
      pauseCheckpoint: '',
      stopCheckpoint: '',
      orientation: 'stacked',
      sizeWeight: 0.5,
      resizingStart: undefined,
      configErrors: [],
      configErrorTitle: '',
      validationStatus: EMPTY,
      logLevel: 'Warning',
      manualConfig: true,
      showSchema: true,
      selectedConfiguration: null,
      configurationList: [],
      configurationOptions: [],
      configurationChanged: false,
      configurationName: DEFAULT_CONFIG_NAME,
      formData: null
    };
  }

  ObjectFieldTemplate = (props) => {
    return (
      <div>
        {props.title}
        {props.description}
        {props.properties.map((element) => (
          <div className="property-wrapper">{element.content}</div>
        ))}
      </div>
    );
  };

  CustomTitleField = (props) => {
    return <div className={styles.formTitleModifier}>{props.title}</div>;
  };

  CustomDescriptionField = (prop) => {
    return <div className={styles.formDescriptionModifier}>{this.props.description}</div>;
  };

  CustomSelect = (props) => {
    return (
      <Select
        className={styles.customSelect}
        options={props.options.enumOptions}
        option={props.value}
        onChange={({ value }) => props.onChange(value)}
      />
    );
  };

  CustomCheckbox = (props) => {
    return (
      <>
        <div>{props.label}</div>
        <div>{props.schema.description}</div>
        <input
          checked={props.value}
          type="checkbox"
          onChange={() =>
            this.setState((state) => ({
              formData: { ...state.formData, [props.label]: !props.value },
            }))
          }
        ></input>
      </>
    );
  };

  CustomInput = (props) => {
    return (
      <Input
        value={props.value}
        type={props.schema.type}
        className={styles.formInput}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    );
  };

  ArrayTemplate = (props) => {
    return (
      <>
        <div className={styles.formSchemaTitleModifier}>{props.title}</div>
        <div className={styles.formSchemaDescriptionModifier}>{props.schema.description}</div>
        <div className={styles.arrayContainer}>
          {props.items.map((element) => {
            return (
              <>
                <div className={styles.deleteItemButtonContainer}>
                  <div className={styles.arrayElement}>{element.children}</div>
                  <div className={styles.deleteItem}>
                    <button
                      type="button"
                      className={styles.deleteItemButton}
                      onClick={element.onDropIndexClick(element.index)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </>
            );
          })}
          <div className={styles.availableScriptTypeSeparator} />

          <div className={styles.addNewArray}>
            {props.canAdd && (
              <Button className={styles.customButton} onClick={props.onAddClick}>
                + Add new entry
              </Button>
            )}
          </div>
        </div>
      </>
    );
  };

  validateConfig = (newValue, noRevalidation) => {
    this.setState({ value: newValue });
    /** Do nothing if schema is not available
     * stay in EMPTY state
     */
    let schema = this.props.configPanel.configSchema;
    if (!schema) {
      this.setState({ validationStatus: EMPTY });
      return;
    }

    /** Do nothing if still validating and comes from keypress-event (!noRevalidation) */
    if (this.state.validationStatus === VALIDATING && !noRevalidation) {
      this.setState({
        validationStatus: NEED_REVALIDATION,
      });
      return;
    }

    /** Request validation otherwise, and set state VALIDATING */
    this.setState({ validationStatus: VALIDATING });
    ManagerInterface.requestConfigValidation(newValue, this.props.configPanel.configSchema)
      .then((r) => {
        /** Go to VALIDATING again and perform new request in componentDidUpdate */
        if (this.state.validationStatus === NEED_REVALIDATION) {
          this.setState({ validationStatus: VALIDATING });
        }

        /** Server error */
        if (!r.ok) {
          this.setState({ validationStatus: SERVER_ERROR });
          return;
        }
        return r.json();
      })
      .then((r) => {
        /** Handle SERVER_ERROR*/
        if (!r) return;

        /** Valid schema should show no message */
        if (r.output) {
          this.setState({
            validationStatus: VALID,
            autoFilledValue: YAML.stringify(r.output),
            configErrors: [],
            configErrorTitle: '',
            formData: yaml.load(newValue),
          });
          return;
        }
        if (!r.error) return;

        /** Handle yaml syntax errors */
        if (r.error) {
          if (r.title === 'ERROR WHILE PARSING YAML STRING') {
            const message = `${r.error.problem}\n ${YAML.stringify({
              line: r.error.problem_mark.line,
              column: r.error.problem_mark.column,
              pointer: r.error.problem_mark.pointer,
              index: r.error.problem_mark.index,
            })} `;
            this.setState({
              validationStatus: ERROR,
              configErrorTitle: r.title,
              configErrors: [
                {
                  name: r.error.problem_mark.name,
                  message,
                },
              ],
            });
          }

          /** Handle validation errors */
          if (r.title === 'INVALID CONFIG YAML') {
            this.setState({
              validationStatus: ERROR,
              configErrorTitle: r.title,
              configErrors: [
                {
                  name: `.${r.error.path} `,
                  message: r.error.message,
                },
              ],
            });
          }
        }
      });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.configPanel?.script?.path &&
      prevProps.configPanel?.script?.path !== this.props.configPanel?.script?.path
    ) {
      ManagerInterface.getScriptConfiguration(
        this.props.configPanel?.script?.path ?? '',
        this.props.configPanel?.script?.type ?? '',
      ).then((data) => {
        const options = data.map((conf) => ({ label: conf.config_name, value: conf.id }));
        const configuration = data.find((conf) => conf.config_name === 'last_script');
        this.setState((state) => ({
          configurationOptions: options,
          configurationList: data,
          selectedConfiguration: configuration ? {label: configuration.config_name, value: configuration.id} : null, 
          value: configuration?.config_schema ?? DEFAULT_CONFIG_VALUE,
          configurationName: configuration?.config_name ?? DEFAULT_CONFIG_NAME,
          formData: configuration ? yaml.load(configuration.config_schema) : null
        }));
      });
    }

    if (this.state.validationStatus !== prevState.validationStatus) {
      const { validationStatus } = this.state;

      if (validationStatus === VALIDATING && prevState.validationStatus === NEED_REVALIDATION) {
        this.validateConfig(this.state.value, true);
      }
    }

    if (!_.isEqual(prevProps.configPanel, this.props.configPanel)) {
      this.setState({ formData: null });
    }
  };

  onCheckpointChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onResize = (event, direction, element) => {
    this.setState({
      width: parseInt(element.style.width.replace(/px/g, '')),
      height: parseInt(element.style.height.replace(/px/g, '')),
    });
  };

  closeConfigPanel = () => {
    this.props.closeConfigPanel();
  };

  rotatePanel = () => {
    this.setState({
      orientation: this.state.orientation === 'beside' ? 'stacked' : 'beside',
    });
  };

  onLaunch = () => {
    this.setState({
      loading: true,
    });
    const script = this.props.configPanel.script;
    const isStandard = script.type === 'standard';
    const logLevel = logLevelMap[this.state.logLevel] ?? 20;
    this.props.launchScript(
      isStandard,
      script.path,
      this.state.value,
      'description',
      2,
      this.state.pauseCheckpoint,
      this.state.stopCheckpoint,
      logLevel,
    );
  };

  startResizingWithMouse = (ev) => {
    this.setState({ resizingStart: { x: ev.clientX, y: ev.clientY, sizeWeight: this.state.sizeWeight } });
    document.onmousemove = this.onMouseMove;
    document.onmouseup = this.onMouseUp;
  };

  onMouseMove = (ev) => {
    if (this.state.resizingStart) {
      const currentX = ev.clientX;
      const currentY = ev.clientY;

      const { orientation, resizingStart, width, height } = this.state;
      const displacement = orientation === 'stacked' ? currentY - resizingStart.y : currentX - resizingStart.x;
      const total = orientation === 'stacked' ? height : width;
      const boundary = 150 / height; //150px aprox of titles and buttons
      const newWeight = Math.min(Math.max(resizingStart.sizeWeight + displacement / total, boundary), 1 - boundary);
      this.setState({
        sizeWeight: newWeight,
      });
      ev.preventDefault();
    }
  };
  onMouseUp = () => {
    document.onmousemove = null;
    document.onmouseup = null;
  };

  onLogLevelChange = (value) => {
    this.setState({ logLevel: value });
  };

  getDocumentationLink = (scriptPath, isStandard) => {
    const extensionIndex = scriptPath.lastIndexOf('.');
    const cleanPath = scriptPath.substring(0, extensionIndex);
    const dirIndex = cleanPath.lastIndexOf('/');
    const scriptDirectory = dirIndex > 0 ? cleanPath.substring(0, dirIndex + 1) : '';
    const scriptName = dirIndex > 0 ? cleanPath.substring(dirIndex + 1) : cleanPath;
    const cleanScriptName = scriptName
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    const cleanDirectory = scriptDirectory.split('/').join('.');
    const camelCasePath = `${cleanDirectory}${cleanScriptName}`;
    const fullPath = `lsst.ts.standardscripts.${camelCasePath}`;
    return `${SCRIPT_DOCUMENTATION_BASE_URL}/${fullPath}.html`;
  };

  render() {
    const { orientation } = this.state;
    const scriptName = this.props.configPanel.name ? this.props.configPanel.name : '';
    const scriptPath = this.props.configPanel.script ? this.props.configPanel.script?.path : '';
    const isStandard = this.props.configPanel.script ? this.props.configPanel.script?.type === 'standard' : false;
    const sidePanelSize = {
      stacked: {
        firstWidth: `${this.state.width}px`,
        firstHeight: `calc(${this.state.height * this.state.sizeWeight}px - 6em)`,
        secondWidth: `${this.state.width}px`,
        secondHeight: `calc(${this.state.height * (1 - this.state.sizeWeight)}px - 8em)`,
      },
      beside: {
        firstWidth: `calc(${this.state.width * this.state.sizeWeight}px - 1em)`,
        firstHeight: `calc(${this.state.height}px - 11em)`,
        // secondWidth: `calc(${this.state.width * (1 - this.state.sizeWeight)}px - 1em)`,
        secondWidth: '100%',
        secondHeight: `calc(${this.state.height}px - 11em)`,
      },
    };

    const dividerClassName = {
      stacked: styles.horizontalDivider,
      beside: styles.verticalDivider,
    };

    const newSchema = this.props.configPanel.newSchema;

    const uiSchema = {
      "ui:submitButtonOptions": {
        "props":{
          "disabled":true
        },
        "submitText": "Hola"
      }
    };

    const widgets = {
      SelectWidget: this.CustomSelect,
      TextWidget: this.CustomInput,
      CheckboxWidget: this.CustomCheckbox,
    };

    const fields = {
      TitleField: this.CustomTitleField,
    };

    let configurationChanged = false;
    const configuration = this.state.configurationList.find(
      (conf) => conf.id === this.state.selectedConfiguration?.value,
    );
    if (configuration && this.state.value !== configuration.config_schema) {
      configurationChanged = true;
    }

    let configurationNameChanged = false;
    if (
      this.state.configurationList.findIndex((conf) => {
        return conf.config_name === this.state.configurationName;
      }) === -1
    ) {
      configurationNameChanged = true;
    }

    return this.props.configPanel.show ? (
      <Rnd
        default={{
          x: this.props.configPanel.x,
          y: this.props.configPanel.y,
          width: `${this.state.width}px`,
          height: `calc(${this.state.height}px)`,
        }}
        style={{ zIndex: 1000, position: 'fixed' }}
        bounds={'window'}
        enableUserSelectHack={false}
        dragHandleClassName={styles.bar}
        onResize={this.onResize}
      >
        <div className={[styles.configPanelContainer, 'nonDraggable'].join(' ')}>
          <div className={[styles.topBar, styles.bar].join(' ')}>
            <span className={styles.title}>{`Configuring script: ${scriptName}`}</span>
            <div className={styles.topButtonsContainer}>
              <span className={styles.rotateButton} onClick={this.rotatePanel}>
                <RotateIcon orientation={orientation} />
              </span>

              <span className={styles.closeButton} onClick={this.closeConfigPanel}>
                <CloseIcon />
              </span>
            </div>
          </div>
          <div className={[styles.body, orientation === 'beside' ? styles.sideBySide : ''].join(' ')}>
            <div className={[styles.test, orientation === 'beside' ? styles.rotated : ''].join(' ')}>
              <h3>
                SCHEMA <span className={styles.readOnly}>(Read only)</span>
                <div
                  className={styles.collapsableSchema}
                  onClick={() => {
                    this.setState((state) => ({ showSchema: !state.showSchema }));
                  }}
                >
                  {orientation !== 'beside' &&
                    (this.state.showSchema ? (
                      <RowExpansionIcon style={styles.upIcon} />
                    ) : (
                      <RowExpansionIcon style={styles.downIcon} expanded={true} />
                    ))}
                  {orientation === 'beside' &&
                    (this.state.showSchema ? (
                        <RowExpansionIcon style={styles.leftIcon} />
                      ) : (
                        <RowExpansionIcon style={styles.rightIcon} />
                      ))}
                </div>
              </h3>
            </div>
            {this.state.showSchema && (
              <div className={styles.sidePanel}>
                {isStandard && (
                  <a
                    className={styles.documentationLink}
                    target="_blank"
                    href={this.getDocumentationLink(scriptPath, isStandard)}
                  >
                    Go to documentation
                  </a>
                )}

                <AceEditor
                  mode="yaml"
                  theme="solarized_dark"
                  name="UNIQUE_ID_OF_DIV"
                  width={sidePanelSize[orientation].firstWidth}
                  height={sidePanelSize[orientation].firstHeight}
                  value={
                    this.props.configPanel.configSchema === '' ? NO_SCHEMA_MESSAGE : this.props.configPanel.configSchema
                  }
                  editorProps={{ $blockScrolling: true }}
                  fontSize={18}
                  readOnly
                  showPrintMargin={false}
                />
              </div>
            )}
            {this.state.showSchema && (
              <div
                className={[styles.divider, dividerClassName[orientation]].join(' ')}
                onMouseDown={this.startResizingWithMouse}
                // onMouseLeave={this.stopResizingWithMouse}
                // onMouseOut={this.stopResizingWithMouse}
              ></div>
            )}
            <div className={styles.sidePanel}>
              <div className={styles.middleBar}>
                <div className={styles.configSelector}>
                  <div
                    className={[styles.manualConfig, this.state.manualConfig ? styles.selectedConfig : ''].join(' ')}
                    onClick={() => {
                      this.setState({ manualConfig: true });
                    }}
                  >
                    MANUAL CONFIG
                  </div>
                  <div
                    className={[styles.automaticConfig, !this.state.manualConfig ? styles.selectedConfig : ''].join(
                      ' ',
                    )}
                    onClick={() => {
                      this.setState({ manualConfig: false });
                    }}
                  >
                    FORM CONFIG
                  </div>
                </div>
                <div className={styles.scriptOptions}>
                  {(configurationChanged || configurationNameChanged) && (
                    <Input
                      value={this.state.configurationName}
                      onChange={(e) => this.setState({ configurationName: e.target.value })}
                      className={styles.schemaInput}
                    />
                  )}

                  {!configurationChanged && !configurationNameChanged  &&(
                    <Select
                      options={this.state.configurationOptions}
                      placeholder="Select an option"
                      value={this.state.selectedConfiguration}
                      onChange={(e) => {
                        const configuration = this.state.configurationList.find((conf) => conf.id === e.value);
                        this.setState({
                          selectedConfiguration: e,
                          value: configuration?.config_schema ?? '',
                          configurationName: configuration.config_name,
                        });
                      }}
                    />
                  )}
                  {configurationNameChanged && (
                    <Button
                      disabled={[ERROR, VALIDATING, NEED_REVALIDATION].includes(this.state.validationStatus) || (!configurationChanged && !configurationNameChanged) }
                      status="transparent"
                      className={styles.saveDivs}
                      onClick={() => {
                        const scriptPath = this.props.configPanel.script.path;
                        const scriptType = this.props.configPanel.script.type;
                        const configName = this.state.configurationName;
                        const configSchema = this.state.value;
                        ManagerInterface.postScriptConfiguration(scriptPath, scriptType, configName, configSchema).then(
                          (data) => {
                            this.setState((state) => ({
                              selectedConfiguration: { label: data.config_name, value: data.id },
                              configurationOptions: [
                                ...state.configurationOptions,
                                { label: data.config_name, value: data.id },
                              ],
                              configurationList: [data, ...state.configurationList],
                            }));
                          },
                        );
                      }}
                    >
                      <SaveNewIcon />
                    </Button>
                  )}
                  {!configurationNameChanged && (
                    <Button
                      disabled={[ERROR, VALIDATING, NEED_REVALIDATION].includes(this.state.validationStatus) || !configurationChanged}
                      status="transparent"
                      className={styles.saveDivs}
                      onClick={() => {
                        const id = configuration.id;
                        const configSchema = this.state.value;
                        ManagerInterface.updateScriptName(id, configSchema).then((data) => {
                          this.setState((state) => ({
                            configurationOptions: [
                              ...state.configurationOptions,
                              { label: data.config_name, value: data.id },
                            ],
                            configurationList: [
                              data,
                              ...state.configurationList.filter((conf) => {
                                return conf.id !== data.id;
                              }),
                            ],
                          }));
                        });
                      }}
                    >
                      <SaveIcon />
                    </Button>
                  )}
                </div>
              </div>
              <div className={styles.sidePanelHeaderContainer}>
                {' '}

                <Hoverable>
                  <div/>
                  {this.state.configErrors.length > 0 && (
                    <InfoPanel className={styles.infoPanel}>
                      <div className={styles.infoPanelBody}>
                        <div className={styles.infoPanelFirstLine}>{this.state.configErrorTitle}</div>
                        <ul>
                          {this.state.configErrors.map((error, index) => {
                            if (!error.name) {
                              return <span key={`noname-${index}`}>{error.message}</span>;
                            }
                            return (
                              <li key={`${error.name}-${index}`}>
                                <span className={styles.errorName}>{error.name}:</span>
                                <span> {error.message}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </InfoPanel>
                  )}
                </Hoverable>
              </div>
              {newSchema && !this.state.manualConfig && (
                <Form
                  schema={newSchema}
                  uiSchema={uiSchema}
                  widgets={widgets}
                  fields={fields}
                  className={styles.scriptForm}
                  formData={this.state.formData}
                  ArrayFieldTemplate={this.ArrayTemplate}
                  onChange={(e) => {
                    this.setState({ formData: e.formData });
                  }}
                  onSubmit={(e) => {
                    this.setState({
                      value: yaml.dump(e.formData, { flowLevel: 2 }),
                      manualConfig: true,
                    });
                  }}
                />
              )}
              {this.state.manualConfig && (
                <AceEditor
                  mode="yaml"
                  theme="solarized_dark"
                  name="UNIQUE_ID_OF_DIV"
                  onChange={this.validateConfig}
                  width={sidePanelSize[orientation].secondWidth}
                  height={sidePanelSize[orientation].secondHeight}
                  value={this.state.value}
                  editorProps={{ $blockScrolling: true }}
                  fontSize={18}
                  tabSize={2}
                  showPrintMargin={false}
                />
              )}
            </div>
          </div>
          <div className={[styles.bottomBar, styles.bar].join(' ')}>
            <div className={styles.checkpointsRegexpContainer}>
              <span>Pause checkpoints</span>
              <span>.*</span>
              <Input className={styles.checkpointsInput} onChange={this.onCheckpointChange('pauseCheckpoint')} />

              <span>Stop checkpoints</span>
              <span> .*</span>
              <Input className={styles.checkpointsInput} onChange={this.onCheckpointChange('stopCheckpoint')} />

              <span className={styles.logLevelLabel}>Log level</span>
              <Select
                className={styles.logLevelSelect}
                options={['Debug', 'Info', 'Warning', 'Error']}
                option={this.state.logLevel}
                placeholder="Warning"
                onChange={(selection) => this.onLogLevelChange(selection.value)}
              />
            </div>
            <div className={styles.addBtnContainer}>
              <Button
                title="Enqueue script"
                size="large"
                onClick={() => {
                  this.onLaunch();
                  const configuration = this.state.configurationList.find(
                    (conf) => conf.config_name === DEFAULT_CONFIG_NAME,
                  );
                  if (configuration) {
                    const id = configuration.id;
                    const configSchema = this.state.value;
                    ManagerInterface.updateScriptName(id, configSchema);
                  } else {
                    const scriptPath = this.props.configPanel.script.path;
                    const scriptType = this.props.configPanel.script.type;
                    const configName = DEFAULT_CONFIG_NAME;
                    const configSchema = this.state.value;
                    ManagerInterface.postScriptConfiguration(scriptPath, scriptType, configName, configSchema);
                  }
                }}
                disabled={[ERROR, VALIDATING, NEED_REVALIDATION].includes(this.state.validationStatus)}
                command
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Rnd>
    ) : null;
  }
}
