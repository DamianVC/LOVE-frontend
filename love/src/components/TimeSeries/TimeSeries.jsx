import React, { Component } from 'react'
import RawTelemetryTable from '../HealthStatusSummary/RawTelemetryTable/RawTelemetryTable';
import ManagerInterface from '../../Utils';
import Vega from '../Vega/Vega';
import TimeSeriesControls from './TimeSeriesControls/TimeSeriesControls';
import moment from 'moment'

export default class TimeSeries extends Component {

    constructor() {
        super();

        this.state = {
            specDataType: "quantitative",
            telemetryName: "test",
            step: 0,
            lastMessageData: []
        }

        this.managerInterface = new ManagerInterface();
    }

    getSpec = (data, name) => {
        return {
            "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
            "description": "Google's stock price over time.",
            "data": {
                "values": data,
                "name": "telemetries"
            },
            "mark": this.state.specDataType === "quantitative" ? "line" : "point",
            "encoding": {
                "x": {
                    "field": "date",
                    "type": "temporal",
                    "title": "date"
                },
                "y": {
                    "field": "value",
                    "type": this.state.specDataType,
                    "title": name
                },
                "color": {
                    "field": "source",
                    "type": "nominal",
                    "legend": {
                        "title": "Parameter Names" + " ".repeat(32),
                    },
                }

            }
        }
    }

    getSpecDataType = (dataType) => {
        if (dataType === 'String')
            return "nominal";
        else
            return "quantitative";
    }

    onSetSelection = (selectedRows) => {
        const streams = selectedRows.map((rowKeyValue) => {
            return rowKeyValue.key.split('-')[1];
        });
        const streamsSet = new Set(streams);
        streamsSet.forEach((stream) => {
            this.managerInterface.subscribeToTelemetry(stream, this.onReceiveMsg);
        });
        this.setState({
            telemetryName: selectedRows[0].key,
            specDataType: this.getSpecDataType(selectedRows[0].value.dataType),
            subscribedStreams: streamsSet,
            selectedRows: selectedRows,
            step: 1
        });
    }

    componentWillUnmount = () => {
        this.state.subscribedStreams.forEach((stream) => {
            this.managerInterface.unsubscribeToTelemetry(stream, (msg) => console.log(msg));
        });
    }

    onReceiveMsg = (msg) => {
        let data = JSON.parse(msg.data);
        let newEntries = [];
        if (typeof data.data === 'object') {
            let timestamp = new Date();
            timestamp = timestamp.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
            Object.keys(data.data).forEach((stream) => {
                Object.entries(data.data[stream]).forEach((entry) => {
                    const key = ['scheduler', stream, entry[0]].join('-');
                    // console.log(key, this.state.selectedRows);
                    // console.log(this.state.selectedRows.includes(key));
                    if (this.state.selectedRows.map((r) => r.key).includes(key)) {
                        const newEntry = {
                            "value": entry[1]['value'],
                            "date": timestamp,
                            "source": key.split('-')[2],
                            "dataType": entry[1]['dataType'],
                        }
                        newEntries.push(newEntry);
                    }
                });
            });
            this.setState({
                lastMessageData: newEntries,
            })
        }
    }

    setTimeWindow = (timeWindow) => {
        let date = new Date();
        let newDate = moment(date).subtract(timeWindow.value, timeWindow.unit).toDate()
        console.log(timeWindow);
        console.log(date, newDate);
    }

    render() {
        const columnsToDisplay = ['selection_column', 'component', 'stream', 'name', 'param_name', 'data_type', 'value', 'units'];
        return (
            this.state.step === 0 ?
                <RawTelemetryTable telemetries={this.props.telemetries} {...this.state} columnsToDisplay={columnsToDisplay} checkedFilterColumn='units' onSetSelection={this.onSetSelection}></RawTelemetryTable>
                :
                <>
                    <h1>Plot title</h1>
                    <TimeSeriesControls liveMode={true} setTimeWindow={this.setTimeWindow}></TimeSeriesControls>
                    <Vega spec={this.getSpec(this.state.lastMessageData, this.state.telemetryName.split('-')[2])}
                        lastMessageData={this.state.lastMessageData}></Vega>
                </>
        )
    }
}

