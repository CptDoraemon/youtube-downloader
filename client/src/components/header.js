import React, { Component } from 'react';
import './header.css';
import { addMountAnimationToWrapper, stretchInComponent } from "../utilities/mounting-animations";

function HeaderItem(props) {
    const dataObjForThisItem = props.data[props.index];

    let className = props.isSwitchingMode
        ? 'header-item-transition'
        : props.mode === props.index
            ? 'header-item-active'
            : 'header-item-inactive';
    const enhancedWrapperClassName = addMountAnimationToWrapper(className, props);
    return (
        <div
            className={enhancedWrapperClassName}
            style={{backgroundColor: dataObjForThisItem.rgb}}
            onClick={() => props.onClick(props.index)}
        >
            {dataObjForThisItem.headerText}
        </div>
    )
}
const StretchInHeaderItem = stretchInComponent(HeaderItem, 100);

class Header extends Component {
    render() {
        return (
            <div className='header'>
                { [0, 1, 2, 3].map(index => <StretchInHeaderItem key={index} index={index} {...this.props}/>) }
            </div>
        )
    }
}

export { Header };