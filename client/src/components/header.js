import React, { Component } from 'react';
import './header.css';

function HeaderItem(props) {
    const dataObjForThisItem = props.data[props.index];

    let className = props.isSwitchingMode
        ? 'header-item-transition'
        : props.mode === props.index
            ? 'header-item-active'
            : 'header-item-inactive';
    className += props.isPreloadAnimating ? ' stretch' : ' stretch-backswing';
    return (
        <div
            className={className}
            style={{backgroundColor: dataObjForThisItem.rgb}}
            onClick={() => props.onClick(props.index)}
        >
            {dataObjForThisItem.headerText}
        </div>
    )
}
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPreloadAnimating: true
        }
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({isPreloadAnimating: false})
        }, 100)
    }
    render() {
        return (
            <div className='header'>
                { [0, 1, 2, 3].map(index => <HeaderItem key={index} index={index} isPreloadAnimating={this.state.isPreloadAnimating} {...this.props}/>) }
            </div>
        )
    }
}

export { Header };