import React, { Component } from 'react';
import './mounting-animations.css';

const fadeInComponent = mountAnimationBackbone('fade-in-backswing', 'fade-in');
const stretchInComponent = mountAnimationBackbone('stretch-backswing', 'stretch');

function mountAnimationBackbone(backswingClassNameString, classNameString) {
    return function (WrappedComponent, delayInMS) {
        return class extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    isStaringAnimation: false
                };
                this.timeOut = null;
                this.startAnimation = this.startAnimation.bind(this);
            }
            startAnimation() {
                this.setState({
                    isStaringAnimation: true
                })
            }
            componentDidMount() {
                this.timeOut = setTimeout(this.startAnimation, delayInMS)
            }
            componentWillUnmount() {
                clearTimeout(this.timeOut);
                this.timeOut = null;
            }
            render() {
                const mountingAnimationClassName = this.state.isStaringAnimation ? backswingClassNameString : classNameString;
                return (
                    <WrappedComponent {...this.props} mountingAnimationClassName={mountingAnimationClassName} />
                )
            }
        }
    };
}

function addMountAnimationToWrapper(wrapperClassNameString, props) {
    if (props.mountingAnimationClassName === undefined) {
        return wrapperClassNameString
    } else {
        if (wrapperClassNameString === null) {
            return props.mountingAnimationClassName
        } else {
            return wrapperClassNameString + ' ' + props.mountingAnimationClassName
        }
    }
}


export { fadeInComponent, stretchInComponent, addMountAnimationToWrapper };