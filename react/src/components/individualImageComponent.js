import React, { Component } from 'react';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';

const styles = {
    dialogPaper: {
        minWidth: '75vw',
        maxWidth: '75vw',
        minHeight: '75vh',
        maxHeight: '75vh',
    },
};

const center = {
    width: '73vw',
    height: '60vh',
    lineHeight: '60vh',
    textAlign: 'center',
    verticalAlign: 'middle'
}

const centerImg = {
    verticalAlign: 'middle'
}

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
    const { children, classes, onClose, handleClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
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

class IndividualImage extends Component {
    renderIndividualImage(image) {
        return(
            <div style={center}>
                <img
                    src={process.env.PUBLIC_URL + image}
                    style={centerImg}
                />
            </div>
        );
    }

    render() {
        const { classes, nLabels, image, handleClose } = this.props;
        return(
            <Dialog
                classes={{ paper: classes.dialogPaper }}
                onClose={this.props.handleClose}
                aria-labelledby="customized-dialog-title"
                open={this.props.openImage}
            >
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Number of Labels: {nLabels}
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {this.renderIndividualImage(image)}
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={this.props.handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles, { withTheme: true })(IndividualImage);
