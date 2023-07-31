const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app_result = express();
const port = 8008;

//The above is required and what we did with express and lodash
//Also port no. and file name(app result) is expressed

//Function to get numbers from a URL
async function getNumbersFromUrl(url){
    try{
        const  response = await axios.get(url);
        return response.data.numbers;
    } catch(errors){
        console.error('Error fetching data from ${url}:', error.message);
        return [];

    }
}

// TO GET /numbers API
app_result.get('/numbers', async(req,res) => {
    const { url } = req.query;
    if(!url){
        return res.status(400).json({ error: 'URL parameter "url" is required.'});

    }

    const urls = Array.isArray(url) ? url : [url];
    const promises = urls.map(getNumbersFromUrl);

    try{
        const  results = await Promise.allSettled(promises);

        const  numbers = results
        .filter(result => result.status === 'fulfilled' && Array.isArray(result.value))
        .flatMap(result => result.value);

        const mergedNumbers = _.uniq(numbers).sort((a,b) => a - b);

        res.json({numbers: mergedNumbers});
    } catch(error){
        console.error('Error processing requests:',error.message);
        res.status(500).json({ error: 'Internal server error.'});
    }
});

//Start the server
app_result.listen(port, () => {
    console.log('Server running at http://localhost:${port}');
});