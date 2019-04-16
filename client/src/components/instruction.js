import React, { Component } from 'react';
import './instruction.css'
import arrow from '../assets/arrow.png';
import { addMountAnimationToWrapper, fadeInComponent } from "../utilities/mounting-animations";

class Arrow extends Component{
    constructor(props) {
        super(props);
        this.arrowRef = React.createRef();
        this.setArrowOffsetX = this.setArrowOffsetX.bind(this);
        this.arrowAnchorXNow = 0;
    }
    setArrowOffsetX() {
        const arrowElPos = this.arrowRef.current.getBoundingClientRect();
        const arrowAnchorXNow = arrowElPos.left + 0.8 * arrowElPos.width;
        this.setState({arrowOffsetX: this.props.arrowAnchorXShouldBe - arrowAnchorXNow})
    }
    componentDidMount() {
        const arrowElPos = this.arrowRef.current.getBoundingClientRect();
        this.arrowAnchorXNow = arrowElPos.left + 0.8 * arrowElPos.width;

    }
    render() {
        const enhancedWrapperCSS = addMountAnimationToWrapper(null, this.props);
        const arrowOffsetX = this.props.arrowAnchorXShouldBe - this.arrowAnchorXNow;
        const arrowOffset = {
            transform: 'translateX(' + arrowOffsetX + 'px)'
        };

        return (
            <img src={arrow} alt='arrow' style={arrowOffset} ref={this.arrowRef} className={enhancedWrapperCSS}/>
        )
    }
}
const FadeInArrow = fadeInComponent(Arrow, 1000);

class Instruction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovering: false,
            arrowAnchorXShouldBe: 0
        };
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.highLightRef = React.createRef();
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
                className='instruction-url'
                onMouseOver={this.handleMouseOver}
                onMouseLeave={this.handleMouseLeave}>{urlArray[0]}
                <span className='instruction-highlight' style={{color: data.rgb}} ref={this.highLightRef}>
                    { urlArray[1] }
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
        const highLightElPos = this.highLightRef.current.getBoundingClientRect();
        const arrowAnchorXShouldBe = highLightElPos.left + 0.5 * highLightElPos.width;
        this.setState({arrowAnchorXShouldBe: arrowAnchorXShouldBe});
    }

    render() {
        const sampleUrlEl = this.appendHighLights(this.props.dataForThisMode);
        const enhancedWrapperCSS = addMountAnimationToWrapper('instruction-wrapper', this.props);

        return (
            <div className={enhancedWrapperCSS}>
                { sampleUrlEl }
                <FadeInArrow arrowAnchorXShouldBe={this.state.arrowAnchorXShouldBe}/>
            </div>
        )
    }
}

export { Instruction };