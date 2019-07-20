import axios from 'axios';
import { SEND_IMAGE, QUERY_DB, UPDATE_RATING } from './types';

//async dispatch is a function
export const sendImages = (files1, files2) => async dispatch => {
	const res = await axios.post('/neural-network-service/queue', {
		files1,
		files2
	});
	dispatch({ type: SEND_IMAGE, payload: res.data });
};

export const queryDB = (db_id) => async dispatch => {
	const res = await axios.post('/go-service/queryDB', {
		db_id
	});
	dispatch({ type: QUERY_DB, payload: res.data });
}

export const updateRating = (db_id, file_name, time_uploaded, rating, feedback) => async dispatch => {
	const res = await axios.post('/go-service/updateRating', {
		db_id,
		file_name,
		time_uploaded,
		rating,
		feedback
	});
	dispatch({ type: UPDATE_RATING, payload: res.data });
}