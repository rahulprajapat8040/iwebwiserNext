const express = require('express');
const cors = require('cors')
require('dotenv').config()
const app = express()
const path = require('path')
const redis = require('redis');
const { Service } = require('./models/index.js'); // Add this line

require('./config/db')
require('./utils/relation').relation()

const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

client.connect();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads') ));
app.use(cors())


const PORT = process.env.PORT || 8001;


require('./routes')(app);


app.get('/', (req,res)=>{
    res.send('Hello World!')
})

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    console.log(error);
    return res.status(statusCode).json({ message: error.message, statusCode: statusCode });
    // return responseGenerator(res, err, message, statusCode, false)
    // return responseGen(res, error.message, statusCode);
});


app.listen(PORT, () => {
    console.log(`server running way........ ${PORT}`);
})

    