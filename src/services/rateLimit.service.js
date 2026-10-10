const redisClient = require('../config/redis');

const WINDOW_SECONDS = 15 * 60;

const MAX_FAILED_ATTEMPTS = 2;


const RECORD_FAILED_LOGIN_SCRIPT  = `
    local count = redis.call('INCR', KEYS[1])

    if count == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end

    local ttl = redis.call('TTL', KEYS[1])

    return { count, ttl}
`;

const recordFailedLogin = async (username) => {
    const key = `auth:login-failure:${username}`;

    const [count, ttl] = await redisClient.eval(
        RECORD_FAILED_LOGIN_SCRIPT,
        {
            keys: [key],
            arguments: [String(WINDOW_SECONDS)]
        }
    )

    return {
        count, 
        ttl,
        blocked: count > MAX_FAILED_ATTEMPTS
    };
}


const recoredFailedLoginIp = async (ip) => {
    const key = `auth:login-failure:${ip}`;

    const [count, ttl] = await redisClient.eval(RECORD_FAILED_LOGIN_SCRIPT, {
        keys: [key],
        arguments: [String(WINDOW_SECONDS)]
    });

    return {
        count,
        ttl,
        blocked: count > MAX_FAILED_ATTEMPTS
    }
}

const clearFailedLogins = async (username) => {
    await redisClient.del(`auth:login-failures:${username}`);
};

module.exports = {
    recordFailedLogin,
    clearFailedLogins,
    recoredFailedLoginIp
}