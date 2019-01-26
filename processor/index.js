const config = require('./config');
const redis = require('redis');


const redisClient = redis.createClient({
    host: config.redisHost,
    port: config.redisPort,
    retry_strategy: () => 1000
})
const redisSub = redisClient.duplicate();


function fib(index) {
    if (index < 2) return 1;

    return fib(index - 2) + fib(index - 1);
}

redisSub.on('message', (channel, message) => {

    const num = parseInt(fib(message));

    redisClient.hset('values', message, num);
});
redisSub.subscribe('insert');