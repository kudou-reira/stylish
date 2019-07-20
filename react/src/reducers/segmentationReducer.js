import { SEND_IMAGE, QUERY_DB, UPDATE_RATING } from '../actions/types';

const INITIAL_STATE = {
	image_status: null,
	user_information: null,
}

export default function(state = INITIAL_STATE, action) {
	switch(action.type) {
		case SEND_IMAGE:
			return {...state, image_status: action.payload};
		case QUERY_DB:
			return {...state, user_information: action.payload};
		case UPDATE_RATING:
			return {...state, user_information: action.payload};
		default:
			return state;
	}
}
