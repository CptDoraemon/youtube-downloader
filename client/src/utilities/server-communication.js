import React, { Component } from 'react';

function withSubmissionMethods(WrappedComponent) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isSubmitDisabled: false,
                buttonType: 'submit', // submit, loading, error, download
                value: '',
                message: ''
            };
            this.submitHandler = this.submitHandler.bind(this);
            this.changeHandler = this.changeHandler.bind(this);
            this.errorHandler = this.errorHandler.bind(this);
            this.clearErrorMessage = this.clearErrorMessage.bind(this);
            this.requestType = this.props.requestType;
            this.clearErrorMessageTimeout = null;
            this.downloadID = '';
        }
        submitHandler(e) {
            e.preventDefault();
            if (this.state.isSubmitDisabled) return;

            if (this.state.buttonType === 'submit') {
                this.sendID()
            } else if (this.state.buttonType === 'download') {
                this.requestDownload()
            }
        }
        clearErrorMessage() {
            this.setState({
                isSubmitDisabled: false,
                buttonType: 'submit',
                message: ''
            })
        }
        errorHandler(messageString) {
            this.setState({
                isSubmitDisabled: false,
                buttonType: 'error',
                message: messageString
            });
            this.clearErrorMessageTimeout = setTimeout(this.clearErrorMessage, 5000)
        }

        sendID() {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'loading'
            });
            const data = {
                type: this.requestType,
                value: this.state.value
            };

            fetch('/sendid', {
                method: 'POST',
                mode: 'same-origin',
                cache: 'default',
                credentials: 'same-origin',
                headers: {
                    'content-type': 'application/json'
                },
                redirect: 'follow',
                referrer: 'client',
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(json => {
                    if (json.type === 'successful') {
                        this.downloadID = json.downloadID;
                        this.setState({
                            isSubmitDisabled: false,
                            buttonType: 'download'
                        })
                    } else if (json.type === 'failed') {
                        this.errorHandler(json.message.toString())
                    }
                }).catch(e => {
                    console.log(e);
                    this.errorHandler('Oops, something unexpected happened, please try again later')
            });
        }
        requestDownload() {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'loading'
            });
            const data = {
                downloadID: this.downloadID
            };

            fetch('/requestdownload', {
                method: 'POST',
                mode: 'same-origin',
                cache: 'default',
                credentials: 'same-origin',
                headers: {
                    'content-type': 'application/json'
                },
                redirect: 'follow',
                referrer: 'client',
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(json => {
                    if (json.type === 'successful') {
                        this.setState({
                            isSubmitDisabled: false,
                            buttonType: 'submit'
                        })
                    } else if (json.type === 'failed') {
                        this.errorHandler(json.message.toString)
                    }
                }).catch(e => {
                console.log(e);
                this.errorHandler('Oops, something unexpected happened, please try again later')
            });
        }

        changeHandler(e) {
            this.setState({
                value: e.target.value
            })
        }
        componentWillUnmount() {
            clearTimeout(this.clearErrorMessageTimeout);
            this.clearErrorMessageTimeout = null
        }
        render() {
            const injectProps = {
                submitHandler: this.submitHandler,
                changeHandler: this.changeHandler,
                isSubmitDisabled: this.state.isSubmitDisabled,
                value: this.state.value,
                buttonType: this.state.buttonType,
                message: this.state.message
            };
            return <WrappedComponent {...this.props} {...injectProps} />
        }
    }
}

export { withSubmissionMethods };