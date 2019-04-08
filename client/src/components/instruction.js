import React, { Component } from 'react';
import './instruction.css'

class Instruction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovering: false,
            isPreloadAnimating: true
        };
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }
    handleMouseOver() {
        this.setState({isHovering: true}, this.props.transitionFrontSwing)
    }
    handleMouseLeave() {
        this.setState({isHovering: false}, this.props.transitionBackSwing)
    }
    appendHighLights(data) {
        const urlArray = data.instructionSampleUrl.split('**');
        const instructionArray = data.instruction.split('****');

        const infoCSS = this.state.isHovering ? 'instruction-highlight-info-active' : 'instruction-highlight-info-inactive';
        const pointerCSS = infoCSS + '-pointer';
        const emphasisCSS = {
            color: data.rgb,
            fontWeight: 700,
            textTransform: 'uppercase'
        };

        return (
            <div
                className='app-upper-example'
                onMouseOver={this.handleMouseOver}
                onMouseLeave={this.handleMouseLeave}>{urlArray[0]}
                <span
                    className='instruction-highlight' style={{color: data.rgb}}>{ urlArray[1] }
                        <span className={infoCSS} onMouseOver={(e) => e.stopPropagation()}>
                            { instructionArray[0] }
                            <span style={emphasisCSS}>{ data.color }</span>
                            { instructionArray[1] }
                        </span>
                    { [1, 2, 3].map(i => <span key={i} className={pointerCSS + '-' + i}> </span>) }
                </span>
                { urlArray[2] }
            </div>
        )
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({isPreloadAnimating: false})
        }, 100)
    }

    render() {
        const sampleUrlEl = this.appendHighLights(this.props.dataForThisMode);
        const wrapperCSS = this.state.isPreloadAnimating ? 'instruction-wrapper fade-in' : 'instruction-wrapper fade-in-backswing';

        return (
            <div className={wrapperCSS}>
                { sampleUrlEl }
                <img src='./arrow.png' alt='arrow' />
            </div>
        )
    }
}

export { Instruction };