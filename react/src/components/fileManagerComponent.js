import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Cookies from 'js-cookie';

import Dropzone from 'react-dropzone';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import *  as actions from '../actions';

const baseStyle = {
	width: 500,
	height: 100,
	borderWidth: 2,
	borderColor: '#666',
	borderStyle: 'dashed',
	borderRadius: 5,
	display: 'inline-block',
	marginTop: 20,
	marginBottom: 20
};

const activeStyle = {
	borderStyle: 'solid',
	borderColor: '#6c6',
	backgroundColor: '#eee'
};

const rejectStyle = {
	borderStyle: 'solid',
	borderColor: '#c66',
	backgroundColor: '#eee'
};

const thumbsContainer = {
	display: 'flex',
	flexDirection: 'row',
	flexWrap: 'wrap',
	marginTop: 16
};

const thumb = {
	display: 'inline-flex',
	borderRadius: 2,
	border: '1px solid #eaeaea',
	marginBottom: 8,
	marginRight: 8,
	width: 200,
	height: 200,
	padding: 4,
	boxSizing: 'border-box'
};

const thumbInner = {
	display: 'flex',
	minWidth: 0,
	overflow: 'hidden'
}

const img = {
	display: 'block',
	width: 'auto',
	height: '100%'
};

const center = {
	display: 'block',
	textAlign: 'center'
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
  });

class FileManager extends Component {
	constructor() {
		super()
		this.state = {
			files1: [],
			files2: [],
			email: Cookies.get('email')
		};
	}

	componentDidMount() {

	}
	
	componentWillUnmount() {
		// revoke the data uris to avoid memory leaks
		this.state.files1.forEach(file => URL.revokeObjectURL(file.preview));
		this.state.files2.forEach(file => URL.revokeObjectURL(file.preview));
	}
	
	handleDrop1 = (files) => {
		// single image, no concat
		this.setState({
			files1: [].concat(files.map(file => Object.assign(file, {
				preview: URL.createObjectURL(file)
			})))
		});
	}

	handleDrop2 = (files) => {
		// single image, no concat
		this.setState({
			files2: [].concat(files.map(file => Object.assign(file, {
				preview: URL.createObjectURL(file)
			})))
		});
	}

	handleChange = (name) => (event) => {
		// give error if string, change id to outlined error using a ref tag
		this.setState({ [name]: parseInt(event.target.value) });
	};

	handleTextChange = (name) => (event) => {
		this.setState({ [name]: event.target.value });
	}

	renderEmailField(classes) {
		const param = {
			label: 'Email',
			property: 'email'
		}

		return <TextField
			error={this.checkEmail()}
			id="outlined-email-input"
			label={param.label}
			value={this.state[param.property]}
			onChange={this.handleTextChange(param.property)}
			type="email"
			className={classes.textField}
			InputLabelProps={{
				shrink: true,
			}}
			margin="normal"
		/>
	}

	renderParams() {
		const { classes } = this.props;

		if(this.state.files1.length !== 0 && this.state.files2.length !== 0) {
			return(
				<div style={center}>
					<form className={classes.container} noValidate autoComplete="off" style={center}>
						{this.renderEmailField(classes)}
					</form>
				</div>
			)
		}
	}

	renderMessage1() {
		return(
			<div className="block">
				<Typography variant="h6">
					{this.state.files1.length === 0 ? 'You have no uploaded input image.' : 'Input Image:'}
				</Typography>
			</div>
		)
	}

	renderMessage2() {
		return(
			<div className="block">
				<Typography variant="h6">
					{this.state.files2.length === 0 ? 'You have no uploaded transfer image.' : 'Transfer Image:'}
				</Typography>
			</div>
		)
	}

	checkEmail() {
		var re = /\S+@\S+\.\S+/;
    	return !(re.test(this.state.email));
	}

	renderUploadButton() {
		if(this.state.files1.length !== 0 && this.state.files2.length !== 0) {
			return(
				<div>
					<Button
						disabled={this.checkEmail()}
						variant="outlined" 
						color="primary"
						onClick={() => this.onClickUpload()}
					>
						Upload
					</Button>
				</div>
			)
		}
	}

	getBase64(file) {
		let reader = new FileReader();

		return new Promise((resolve, reject) => {
			reader.readAsDataURL(file);

			reader.onerror = (error) => {
				console.log('Error: ', error);
				reject(new DOMException("Problem parsing input file."));
			};

			reader.onload = () => {
				resolve(reader.result)
			};
		})
	}

	async onClickUpload() {
		// format files for upload
		const promises1 = this.state.files1.map(async (file) => {
			let base64String = '';
			base64String = await this.getBase64(file)

			const dummyObj = Object.assign({}, this.state);
			delete dummyObj['files'];
			const hyperparameters = Object.assign({}, {...dummyObj});
			delete hyperparameters.email;

			return {
				fileName: file.name,
				size: file.size,
				type: file.type,
				timeUploaded: (Date.now() / 1000),
				base64String,
				hyperparameters,
				email: this.state.email
			}
		})

		const promises2 = this.state.files2.map(async (file) => {
			let base64String = '';
			base64String = await this.getBase64(file)

			const dummyObj = Object.assign({}, this.state);
			delete dummyObj['files'];
			const hyperparameters = Object.assign({}, {...dummyObj});
			delete hyperparameters.email;

			return {
				fileName: file.name,
				size: file.size,
				type: file.type,
				timeUploaded: (Date.now() / 1000),
				base64String,
				email: this.state.email
			}
		})

		const prepareFiles1 = await Promise.all(promises1);
		const prepareFiles2 = await Promise.all(promises2);
		console.log("this is prepareFiles1", prepareFiles1);
		console.log("this is prepareFiles2", prepareFiles2);

		this.props.sendImages(prepareFiles1, prepareFiles2);
		Cookies.set('email', this.state.email, { expires: 7 });
		this.props.history.push("/result");
	}

	renderTransferDrop() {
		const {files2} = this.state;
		const thumbs = files2.map(file => (
			<div style={thumb} key={file.name}>
				<div style={thumbInner}>
				<img
					src={file.preview}
					style={img}
				/>
				</div>
			</div>
		));

		if(this.state.files1.length !== 0) {
			return(
				<div>
					<Dropzone 
					accept="image/*"
					onDrop={this.handleDrop2}
					>
						{({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles, rejectedFiles }) => {
							let styles = {...baseStyle}
							styles = isDragActive ? {...styles, ...activeStyle} : styles
							styles = isDragReject ? {...styles, ...rejectStyle} : styles
	
							return (
								<div
									{...getRootProps()}
									style={styles}
								>
									<input {...getInputProps()} />
									<div style={{ marginTop: "1%"}} >
										{isDragAccept ? 'Drop' : 'Drag'} files here or click for file dialog...
									</div>
									{isDragReject && <div>Unsupported file type...</div>}
								</div>
							)
						}}
					</Dropzone>
					{this.renderMessage2()}
					<div style={{display: 'inline-block'}}>
						<aside style={thumbsContainer}>
							{thumbs}
						</aside>
					</div>
					{this.renderParams()}
				</div>
			)
		}
	}
		  
	renderDropzone() {
		const {files1} = this.state;
		const thumbs = files1.map(file => (
			<div style={thumb} key={file.name}>
				<div style={thumbInner}>
				<img
					src={file.preview}
					style={img}
				/>
				</div>
			</div>
		));
		
		return(
			<div>
				<Dropzone 
					accept="image/*"
					onDrop={this.handleDrop1}
				>
					{({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles, rejectedFiles }) => {
						let styles = {...baseStyle}
						styles = isDragActive ? {...styles, ...activeStyle} : styles
						styles = isDragReject ? {...styles, ...rejectStyle} : styles

						return (
							<div
								{...getRootProps()}
								style={styles}
							>
								<input {...getInputProps()} />
								<div style={{ marginTop: "1%"}} >
									{isDragAccept ? 'Drop' : 'Drag'} files here or click for file dialog...
								</div>
								{isDragReject && <div>Unsupported file type...</div>}
							</div>
						)
					}}
				</Dropzone>
				{this.renderMessage1()}
				<div style={{display: 'inline-block'}}>
					<aside style={thumbsContainer}>
						{thumbs}
					</aside>
				</div>
				{this.renderTransferDrop()}
			</div>
		)
	}

	render() {
		return(
			<div>
				{this.renderDropzone()}
				{this.renderUploadButton()}
			</div>
		)
	}
}

export default withStyles(styles, { withTheme: true })(
    connect(null, actions)(withRouter(FileManager))
)