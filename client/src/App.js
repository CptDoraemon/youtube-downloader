import React, { Component } from 'react';
import './App.css';

import { Header } from "./components/header";
import { Instruction } from "./components/instruction";
import { Input } from "./components/input";
import { data } from "./data";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 0,
            isSwitchingMode: false,
        };
        this.setMode = this.setMode.bind(this);
        this.transitionFrontSwing = this.transitionFrontSwing.bind(this);
        this.transitionBackSwing = this.transitionBackSwing.bind(this);
        this.data = data;
    }
    setMode(index) {
        this.setState({
            mode: index,
            isSwitchingMode: true
        }, () => {
            setTimeout(() => this.setState({isSwitchingMode: false}), 500)
        });

    }
    transitionFrontSwing() {
        this.setState({
            isTransiting: true
        })
    }
    transitionBackSwing() {
        this.setState({
            isTransiting: false
        })
    }
    render() {
        const headerProps = {
            mode: this.state.mode,
            onClick: this.setMode,
            isSwitchingMode: this.state.isSwitchingMode,
            data: this.data
        };
        const wrapperCSS = this.state.isTransiting || this.state.isSwitchingMode? 'app-wrapper-transition app-wrapper' : 'app-wrapper';

        const body = (
            <React.Fragment>
                <Instruction transitionFrontSwing={this.transitionFrontSwing}
                             transitionBackSwing={this.transitionBackSwing}
                             dataForThisMode={this.data[this.state.mode]}/>
                <Input />
                <div className='app-lower'> </div>
            </React.Fragment>
        );

        return (
            <div className={wrapperCSS}>
                <Header {...headerProps} />
                { this.state.isSwitchingMode ? null : body }
            </div>
        )
    }
}

export default App;
