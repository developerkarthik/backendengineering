


const redisClient = require('./redis');

async function testRedis() {
    try {
        await redisClient.connect();

        console.log('Redis connected successfully');

        // await redisClient.set('learning:test', 'Redis works!');
        // const value = await redisClient.get('learning:test');

        // console.log('Value:', value);

        // await redisClient.set('learning:ttl', 'expires soon', {
        //     EX: 10
        // });

        // console.log('TTL:', await redisClient.ttl('learning:ttl'));
    } catch (error) {
        console.error('Redis test failed:', error.message);
        process.exitCode = 1;
    } finally {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    }
}

testRedis();
