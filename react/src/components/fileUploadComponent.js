import React, { Component } from 'react';
import FileManager from './fileManagerComponent';

import *  as actions from '../actions';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';

class FileUpload extends Component {
    onClickButton = () => {
        console.log("button clicked")
        this.props.sendImages();
    }

    render() {
        return(
            <div className="center">
                <Typography variant="h4">
                    Welcome to the Neural Style Transfer demo, please upload an input image below to get started:
                </Typography>
                <FileManager />
            </div>
        )
    }
}

export default connect(null, actions)(FileUpload);