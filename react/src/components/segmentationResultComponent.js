import React, { Component } from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';
import * as actions from '../actions';

import ImageResults from './imageResultsComponent';

import Typography from '@material-ui/core/Typography';

class SegmentationResult extends Component {
    constructor() {
        super();
        this.state = {
            task_id: '',
            database_id: '',
            upload: false
        };
    }

    componentDidMount() {
        this.setState({ database_id: this.props.match.params.id });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.results.image_status !== null) {
            this.setState({ task_id: nextProps.results.image_status.task_id, database_id: this.props.match.params.id });
        }
    }

    renderTaskMessage() {
        return(
            <div>
                {this.renderExtraMessage()}
                <Typography variant="h4" gutterBottom>
                    ID {this.state.task_id}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Please wait for an email (or if your task ID is empty, upload an image first).
                </Typography>
            </div>
        )
    }

    renderExtraMessage() {
        if(this.state.task_id !== undefined) {
            if(this.state.task_id.length !== 0) {
                return(
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Your segmentation has been received:
                        </Typography>
                    </div>
                )
            }
    
            else {
                return(
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            Your segmentation has not been received, or it has completed.
                        </Typography>
                    </div>
                )
            }
    
        }
    }

    renderSegmentations() {
        return (
            <ImageResults 
                database={this.state.database_id}
            />
        )
    }

    renderSegmentationDisplay() {
        if(this.state.database_id === undefined) {
            return this.renderTaskMessage();
        } 
        else {
            return this.renderSegmentations();
        }
    }

    render() {
        return(
            <div>
                <Typography variant="h4" gutterBottom>
                    Segmentation Results
                </Typography>
                <div style={{ textAlign: "center" }}>
                    {this.renderSegmentationDisplay()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        results: state.segmentation
    };
}

export default connect(mapStateToProps, actions)(withRouter(SegmentationResult));
