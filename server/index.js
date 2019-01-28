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

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/values/all', async (req, res) => {

    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        return res.send(values);
    })
})

app.get('/values/clear', async (req, res) => {
    await redisClient.flushall();
    await pgClient.query('TRUNCATE values').then(() => {
        return res.status(200).send();
    });
})

app.post('/values', async (req, res) => {
    
    let index = parseInt(req.body.index);

    if (index > 40) {
        return res
                .status(422)
                .send('Index too high');
    } else if (index < 0){
        return res
                .status(422)
                .send('Cannot be less than 0');
    }

    
    redisPub.publish('insert', index);

    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ proccessing: true });
})

app.listen(5000, err => {
    console.log('Server listening');
});