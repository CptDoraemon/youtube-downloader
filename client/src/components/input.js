import React, { Component } from 'react';
import './input.css';

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            isPreloadAnimating: true
        };
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
    }

    inputChangeHandler(e) {
        this.setState({
            input: e.target.value
        })
    }
    submitHandler(e) {
        e.preventDefault();
        const videoId = this.state.input;


        const result = [];
        fetch('/getVideoInfo', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify({
                videoId: videoId
            })
        })
            .then(res => {
                result.push(res.blob());
                console.log(result)
            })
            .then(json => console.log(json));
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({isPreloadAnimating: false})
        }, 100)
    }
    render() {
        const wrapperCSS = this.state.isPreloadAnimating ? 'app-form fade-in' : 'app-form fade-in-backswing';
        return (
            <form className={ wrapperCSS }>
                <input type='text' className='app-form-input' onChange={this.inputChangeHandler} value={this.state.input}/>
                <input type='submit' value='Uh-huh' className='app-form-submit' onClick={this.submitHandler}/>
            </form>
        )
    }
}

export { Input };