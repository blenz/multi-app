const config = require('./config');
const redis = require('redis');


const redisClient = redis.createClient({
    host: config.redisHost,
    port: config.redisPort,
    retry_strategy: () => 1000
})
const redisSub = redisClient.duplicate();


function fib(index) {
    if (index <= 1) return 1;

    return fib(index - 1) + fib(index - 2);
}

redisSub.on('message', (channel, message) => {

    const num = parseInt(fib(message - 1));

    redisClient.hset('values', message, num);
});
redisSub.subscribe('insert');