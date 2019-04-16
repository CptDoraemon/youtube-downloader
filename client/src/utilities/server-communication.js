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
            this.resetAfterDownload = this.resetAfterDownload.bind(this);
            this.fetcher = this.fetcher.bind(this);
            this.sendIDResHandler = this.sendIDResHandler.bind(this);
            this.sendID = this.sendID.bind(this);
            this.requestDownload = this.requestDownload.bind(this);
            this.requestType = this.props.requestType;
            this.clearErrorMessageTimeout = null;
            this.downloadSuccessfulTimeout = null;
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
        resetAfterDownload() {
            this.setState({
                isSubmitDisabled: false,
                buttonType: 'submit',
                message: '',
                value: ''
            })
        }
        errorHandler(messageString) {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'error',
                message: messageString
            });
            this.clearErrorMessageTimeout = setTimeout(this.clearErrorMessage, 5000)
        }
        fetcher(url, data, resHandler) {
             fetch(url, {
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
                .then(resHandler)
                .catch(e => {
                    console.log(e);
                    this.errorHandler('Oops, something unexpected happened, please try again later')
                })
        }
        sendIDResHandler(json) {
            if (json.type === 'successful') {
                this.downloadID = json.downloadID;
                this.setState({
                    isSubmitDisabled: false,
                    buttonType: 'download',
                    message: json.message
                })
            } else if (json.type === 'failed') {
                this.errorHandler(json.message.toString())
            }
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

            this.fetcher('/sendid', data, this.sendIDResHandler);
        }
        requestDownload() {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'loading',
                message: 'Your download will start shortly'
            });
            const ID = this.downloadID;
            const url = encodeURI('/download?id=' + ID);
            window.open(url);
            // window.open('http://localhost:5000' + url);
            this.downloadSuccessfulTimeout = setTimeout(this.resetAfterDownload, 5000)
        };

        changeHandler(e) {
            this.setState({
                value: e.target.value
            })
        }
        componentWillUnmount() {
            clearTimeout(this.clearErrorMessageTimeout);
            this.clearErrorMessageTimeout = null;
            clearTimeout(this.downloadSuccessfulTimeout);
            this.downloadSuccessfulTimeout = null
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