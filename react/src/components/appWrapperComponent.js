import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import FileUpload from './fileUploadComponent';
import SegmentationResult from './segmentationResultComponent';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';


const drawerWidth = 240;

const styles = theme => ({
	root: {
		display: 'flex',
	},
	appBar: {
		transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth,
		transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginLeft: 12,
		marginRight: 20,
	},
	hide: {
		display: 'none',
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: '0 8px',
		...theme.mixins.toolbar,
		justifyContent: 'flex-end',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing.unit * 3,
		transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: -drawerWidth,
	},
	contentShift: {
		transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	},
});

class AppWrapper extends Component {
	state = {
		open: true,
	};

	handleDrawerOpen = () => {
		this.setState({ open: true });
	};

	handleDrawerClose = () => {
		this.setState({ open: false });
	};

	onClickSidebar = (text, path) => {
		this.props.history.push(path)
	}

	renderComponent = () => {
		let pathname = this.checkPath();
		// here i made it so i can't accept path params, which is bad

		switch(pathname) {
			case '':
				return(
					<div>
						<FileUpload />
					</div>
				)
				break;
			default:
				return(
					<div>
						<SegmentationResult />
					</div>
				)
		}
	}

	renderSelectedSidebar = (path) => {
		let pathname = this.checkPath();

		if(path.replace('/', '') === pathname) {
			return true;
		}

		return false;
	}

	checkPath = () => {
		let pathname = this.props.location.pathname.replace('/', '');
		return pathname;
	}

	render() {
		const { classes, theme } = this.props;
		const { open } = this.state;

		const linkItems = [
			{
				text: 'Upload Images',
				path: '/',
				icon: 'N/A'
			},
			{
				text: 'Style Transfer Results',
				path: '/result',
				icon: 'M/A'
			}
		];

		return (
			<div className={classes.root}>
				<CssBaseline />
				<AppBar
					position="fixed"
					className={classNames(classes.appBar, {
						[classes.appBarShift]: open,
					})}
				>
					<Toolbar disableGutters={!open}>
						<IconButton
							color="inherit"
							aria-label="Open drawer"
							onClick={this.handleDrawerOpen}
							className={classNames(classes.menuButton, open && classes.hide)}
						>
						<MenuIcon />
						</IconButton>
						<Typography variant="h6" color="inherit" noWrap>
							DeLTA-Mark Demo
						</Typography>
					</Toolbar>
				</AppBar>
				<Drawer
					className={classes.drawer}
					variant="persistent"
					anchor="left"
					open={open}
					classes={{
						paper: classes.drawerPaper,
					}}
				>
					<div className={classes.drawerHeader}>
						<IconButton onClick={this.handleDrawerClose}>
							{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
						</IconButton>
					</div>
					<Divider />
					<List>
						{linkItems.map((obj, index) => (
							<MenuItem
								selected={this.renderSelectedSidebar(obj.path)}
								button key={obj.text}
								onClick={() => this.onClickSidebar(obj.text, obj.path)}
							>
								{/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
								<ListItemText primary={obj.text} />
							</MenuItem>
						))}
					</List>
				</Drawer>
				<main
					className={classNames(classes.content, {
						[classes.contentShift]: open,
					})}
				>
					<div className={classes.drawerHeader} />
					{this.renderComponent()}
				</main>
			</div>
		);
	}
}

AppWrapper.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};

export default withRouter((withStyles(styles, { withTheme: true })(AppWrapper)))

// export default withStyles(styles, { withTheme: true })(AppBar);