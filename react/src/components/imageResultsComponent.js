import React, { Component } from 'react';
import *  as actions from '../actions';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';

import ReactStars from 'react-stars'

import IndividualImage from './individualImageComponent';

const titleGap = {
    marginBottom: '2%'
}

const pointer = {
    cursor: 'pointer'
}

const center = {
    textAlign: 'center'
}

const infoContainer = {
    minHeight: '105px',
    maxHeight: '105px',
    padding: '6px 24px 6px 24px',
}

const hyperContainer = {
    minHeight: '180px',
    maxHeight: '180px',
    padding: '6px 24px 6px 24px',
}

const removeMargin = {
    marginBottom: '0px'
}

const cacheContainer = {
    display: 'flex',
    flexWrap: 'wrap'
}

const cacheImageContainer = {
    display: 'flex',
    flexDirection: 'column'
}

const bold = {
    fontWeight: 'bold',
    marginBottom: '0px',
    padding: '0px 0px 0px 0px'
}

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    dense: {
        marginTop: 19,
    },
    menu: {
        width: 200,
    },
    dialogPaper: {
        minWidth: '80vw',
        maxWidth: '80vw',
        minHeight: '80vh',
        maxHeight: '80vh',
    },
});
  

const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.spacing.unit,
        color: theme.palette.grey[500],
    },
  }))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
            <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
            </IconButton>
        ) : null}
        </MuiDialogTitle>
    );
});
  
const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
    }))(MuiDialogContent);

    const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit,
    },
}))(MuiDialogActions);


class ImageResults extends Component {
    constructor() {
        super();
        this.state = {
            user_info: null,
            database: '',
            open: false,
            openImage: false,
            individualImage: '',
            cacheToDisplay: '',
            minSize: 225,
            resize: {},
            tag: '',
            rating: 1,
            feedback: ''
        };
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };
    

    handleClickOpen = (image, resize) => {
        this.setState({
            open: true,
            cacheToDisplay: image,
            rating: image.rating,
            feedback: image.feedback,
            resize
        });
    };

    handleClose = () => {
        const { output_image, time_uploaded } = this.state.cacheToDisplay;
        const { rating, feedback } = this.state;
        const { database } = this.props;

        this.props.updateRating(database, output_image, time_uploaded, rating, feedback);
        this.setState({ 
            open: false,
            cacheToDisplay: '',
            resize: {},
            feedback: ''
        });
    };

    handleClickOpenImage = (image, tag) => {
        this.setState({
            openImage: true,
            individualImage: image,
            tag: tag
        });
    };

    handleCloseImage = () => {
        this.setState({ 
            openImage: false,
            individualImage: '',
            tag: ''
        });
    };

    ratingChanged = (newRating) => {
        this.setState({ rating: newRating });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.database !== this.state.database) {
            this.setState({ database: nextProps.database}, () => {
                this.props.queryDB(this.state.database);
            });
        }

        if(nextProps.userInfo !== this.state.user_info) {
            this.setState({ user_info: nextProps.userInfo });
        }
    }

    resizeImage(width, height) {
        var scaling = this.state.minSize/height;
        var resize = {
            height: this.state.minSize,
            width: parseInt(scaling * width)
        }
        return resize;
    }

    renderImages() {
        if(this.state.user_info !== undefined && this.state.user_info !== null) {
            if(this.state.user_info.CacheCollection !== null) {
                var uploads = this.state.user_info.CacheCollection.map((image) => {
                    const formatPath = image.output_image.replace(".", "");
                    const { width, height } = image;
                    var resize = this.resizeImage(width, height);
                    return (
                        <img 
                            style={pointer}
                            src={process.env.PUBLIC_URL + formatPath}
                            onClick={() => this.handleClickOpen(image, resize)}
                            width={resize.width}
                            height={resize.height}
                        />
                    )
                });
                return uploads;
            };
        };
    }

    renderCacheDialog() {
        const { classes } = this.props;
        const { file_type, time_uploaded, time_required, output_image, input_image, transfer_image, plot_image } = this.state.cacheToDisplay;
        // const images = [input_image, transfer_image, plot_image, output_image];
        return(
            <Dialog
                classes={{ paper: classes.dialogPaper }}
                onClose={this.handleClose}
                aria-labelledby="customized-dialog-title"
                open={this.state.open}
            >
                <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                    {output_image}
                </DialogTitle>
                <DialogContent style={infoContainer}>
                    <div style={removeMargin}>
                        <span style={bold}>Time Uploaded</span>: {this.timeConverter(time_uploaded)}
                    </div>
                    <div style={removeMargin}>
                        <span style={bold}>Time Required</span>: {time_required/10} seconds
                    </div>
                </DialogContent>
                <Divider />
                <Divider />
                <DialogContent style={cacheContainer}>
                    {this.renderCacheImages(input_image, transfer_image, plot_image, output_image)}
                </DialogContent>
                <DialogActions>
                    <DialogContent>
                        <Typography gutterBottom>
                            Rate your style transfer, please!
                        </Typography>
                        {this.renderRatings()}
                        {this.renderFeedback()}
                    </DialogContent>
                    <Button onClick={this.handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    renderFeedback() {
        return(
            <TextField
                id="standard-full-width"
                label="Feedback column"
                style={{ margin: 8 }}
                placeholder="I liked/disliked this style transfer..."
                helperText="Leave some feedback about your style transfer!"
                fullWidth
                onChange={this.handleChange('feedback')}
                margin="normal"
                value={this.state.feedback}
                InputLabelProps={{
                    shrink: true,
                }}
          />
        )
    }

    renderRatings() {
        return(
            <div>
                <ReactStars
                    count={5}
                    value={this.state.rating}
                    onChange={this.ratingChanged}
                    size={24}
                    color2={'#ffd700'} 
                />
            </div>
        )
    }

    renderHyperparameters(hyperparameters) {
        var format = [];
        for (var key in hyperparameters) {
            if (hyperparameters.hasOwnProperty(key)) {
                format.push(
                    <Typography>
                        <span style={bold}>{key}</span>: {hyperparameters[key]}
                    </Typography>
                );
            }
        }

        return format;
    }

    renderCacheImages(input, transfer, plot, output) {
        console.log("this is input", input);
        const images = [
            {
                'file': input,
                'tag': 'Input File'
            }, 
            {
                'file': transfer,
                'tag': 'Style File'
            }, 
            {
                'file': plot,
                'tag': 'Loss Graph'
            }, 
            {
                'file': output,
                'tag': 'Output File'
            }
        ];
        console.log("this is images", images);
        
        if(output !== undefined) {
            var cache = images.map((image) => {
                const formatPath = image.file.replace(".", "");
                // const formatPath = image.replace(".", "");
                const { height, width } = this.state.resize;
                return (
                    <div style={cacheImageContainer}>
                        <img
                            style={pointer}
                            src={process.env.PUBLIC_URL + formatPath}
                            height={height}
                            width={width}
                            onClick={() => this.handleClickOpenImage(formatPath, image.tag)}
                        />
                        <Typography style={center}>
                            <span style={bold}>{image.tag}</span>
                        </Typography>
                    </div>
                )
            });
            return cache;
        }
    }

    renderIndividualImage() {
        if(this.state.individualImage.length !== 0) {
            return(
                <IndividualImage 
                    handleClose={this.handleCloseImage}
                    tag={this.state.tag}
                    image={this.state.individualImage}
                    openImage={this.state.openImage}
                />
            )
        }

    }

    timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    render() {
        return(
            <div>
                <div style={titleGap}>
                    <Typography variant="h6" gutterBottom>
                        These are the output style images. Please click on them to view your style transfer.
                    </Typography>
                </div>
                {this.renderImages()}
                {this.renderCacheDialog()}
                {this.renderIndividualImage()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userInfo: state.segmentation.user_information
    };
}

export default withStyles(styles, { withTheme: true })(
    connect(mapStateToProps, actions)(ImageResults)
);