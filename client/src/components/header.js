import React, { Component } from 'react';
import './header.css';

function HeaderItem(props) {
    const dataObjForThisItem = props.data[props.index];

    const className = props.isSwitchingMode
        ? 'header-item-transition'
        : props.mode === props.index
            ? 'header-item-active'
            : 'header-item-inactive';
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
    render() {
        return (
            <div className='header'>
                { [0, 1, 2, 3].map(index => <HeaderItem key={index} index={index} {...this.props}/>) }
            </div>
        )
    }
}

export { Header };