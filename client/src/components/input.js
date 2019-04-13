import React, { Component } from 'react';
import './input.css';
import { addMountAnimationToWrapper } from "../utilities/mounting-animations";

function Input (props) {
    const enhancedWrapperCSS = addMountAnimationToWrapper('app-form', props);
    const buttonCSS = props.isSubmitDisabled ? 'app-form-submit app-form-submit-disabled' : 'app-form-submit';

    let buttonContent = 'Uh-huh';
    switch (props.buttonType) {
        case 'submit':
            buttonContent = 'Uh-huh';
            break;
        case 'loading':
            buttonContent = 'HOLD ON';
            break;
        case 'error':
            buttonContent = 'ERROR';
            break;
        case 'download':
            buttonContent = 'Download?';
            break;
        default:
            buttonContent = 'Uh-huh';
            break;
    }
    const errorTimer = props.buttonType === 'error' ? <div className='app-form-submit-error-timer-active'> </div> : <div className='app-form-submit-error-timer-inactive'> </div> ;

    return (
        <React.Fragment>
            <form className={ enhancedWrapperCSS }>
                <input type='text' className='app-form-input' onChange={props.changeHandler} value={props.input}/>
                <div className={buttonCSS} onClick={props.submitHandler}>
                    { buttonContent }
                    { errorTimer }
                </div>
            </form>
            <div className='app-form-message'> { props.message === undefined ? null : props.message }</div>
        </React.Fragment>
    )
}

export { Input };