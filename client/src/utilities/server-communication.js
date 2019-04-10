import React, { Component } from 'react';

function withSubmissionMethods(WrappedComponent) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isSubmitDisabled: false,
                buttonType: 'submit', // submit, loading, error, download
                value: ''
            };
            this.submitHandler = this.submitHandler.bind(this);
            this.changeHandler = this.changeHandler.bind(this);
            this.requestType = this.props.requestType;
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
        sendID() {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'loading'
            });
            const data = {
                type: this.requestType,
                value: this.state.value
            };
            setTimeout(() => {
                this.setState({
                    isSubmitDisabled: false,
                    buttonType: 'download'
                })
            }, 2000);
        }
        requestDownload() {
            this.setState({
                isSubmitDisabled: true,
                buttonType: 'loading'
            });
            setTimeout(() => {
                this.setState({
                    isSubmitDisabled: false,
                    buttonType: 'submit'
                })
            }, 2000);
        }

        changeHandler(e) {
            this.setState({
                value: e.target.value
            })
        }
        render() {
            const injectProps = {
                submitHandler: this.submitHandler,
                changeHandler: this.changeHandler,
                isSubmitDisabled: this.state.isSubmitDisabled,
                value: this.state.value,
                buttonType: this.state.buttonType
            };
            return <WrappedComponent {...this.props} {...injectProps} />
        }
    }
}

export { withSubmissionMethods };