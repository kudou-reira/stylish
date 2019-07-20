import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';

import UploadScreen from '../screens/uploadScreen';
import ResultScreen from '../screens/resultScreen';
import SegmentationResult from '../components/segmentationResultComponent';

class HomeScreen extends Component {
    render() {
        return(
            <div className="container">
            	<Router>
                    <div>
                        <Switch>
                            <Route path="/result/:id?" component={ResultScreen} />
                            <Route exact path="/" component={UploadScreen} />
                        </Switch>
                    </div>
                </Router>
                {/* <div>
                    <Appbar />
                </div> */}
            </div>
        )
    }
}

export default HomeScreen;