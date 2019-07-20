const express = require('express');
 
const app = express();
 
app.get('/test', (req, res) => {
    res.send('test from node');
});
 
app.listen(6000, () => {
    console.log('Listening on port 6000');
});