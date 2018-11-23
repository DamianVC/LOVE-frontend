import React, { Component } from 'react';
import './App.css';
import sockette from 'sockette';
import TelemetryLog from './components/TelemetryLog/TelemetryLog';
import RawTelemetryTable from './components/HealthStatusSummary/RawTelemetryTable/RawTelemetryTable';
import fakeData from './components/HealthStatusSummary/RawTelemetryTable/fakeData';
class App extends Component {

  constructor() {
    super();
    this.state ={
      telemetryName: "interestedProposal"
		}
		

    const socket = sockette('ws://localhost:8000/ws/subscription/', {
      onopen: e => socket.json({ "option": "subscribe", "data": this.state.telemetryName }),
      onmessage: this.receiveMsg,
    });
    socket.onmessage = (e => console.log('Receirewrewrweved:', e));
    window.socket = socket;
  }

  receiveMsg = (msg) => {
    let data = JSON.parse(msg.data);
    if(typeof data.data === 'object'){

      this.setState({ ...data.data});
    }
  }

  render() {
    return (
      <div className="App">
        <RawTelemetryTable data={fakeData}></RawTelemetryTable>
				<TelemetryLog telemetry={{...this.state}} 
											telemetryName={this.state.telemetryName}></TelemetryLog>
      </div>
    );
  }
}

export default App;


