const config     = require('./config');

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require('pg');
const pgClient = new Pool({
    user    : config.pgUser,
    host    : config.pgHost,
    database: config.pgDatabase,
    password: config.pgPassword,
    port    : config.pgPort
});
pgClient.on('error', () => console.log("PG Connection Error"))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

const redis = require('redis');
const redisClient = redis.createClient({
    host: config.redisHost,
    port: config.redisPort,
    retry_strategy: () => 1000
})
const redisPub = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send('ping');
});

app.get('/values/all', async (req, res) => {

    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    })
})

app.post('/values', async (req, res) => {
    
    const { index } = req.body;

    if (parseInt(index) > 40) {
        return res
                .status(422)
                .send('Index too high');
    }

    redisClient.hset('values', index, 'No values');
    redisPub.publish('insert', index);

    pgClient.query('INSERT INTO valies(number) VALUES($1)', [index]);

    res.send({ proccessing: true });
})

app.listen(5000, err => {
    console.log('Server listening');
});