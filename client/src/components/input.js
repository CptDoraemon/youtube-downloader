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

    return (
        <form className={ enhancedWrapperCSS }>
            <input type='text' className='app-form-input' onChange={props.changeHandler} value={props.input}/>
            <div className={buttonCSS} onClick={props.submitHandler}>
                { buttonContent }
            </div>
            {/*<input type='submit' value='Uh-huh' className='app-form-submit' onClick={props.submitHandler} disabled={props.isSubmitDisabled}/>*/}
        </form>
    )
}

export { Input };