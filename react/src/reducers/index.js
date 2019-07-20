import { combineReducers } from 'redux';
import segmentationReducer from './segmentationReducer';

export default combineReducers({
	segmentation: segmentationReducer
});
