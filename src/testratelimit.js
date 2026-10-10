const redisClient = require('./config/redis');

const { recordFailedLogin, clearFailedLogins } = require('./services/rateLimit.service');


const test = async () => {
    const username = `learning-test-${Date.now()}`;
    try{
        await redisClient.connect();

        for(let i=0; i<6; i++){
            const result = await recordFailedLogin(username);
            console.log(i, result);
        }
    }finally{
        await clearFailedLogins(username).catch(() => {});

        if(redisClient.isOpen){
            await redisClient.quit();
        }
    }
}

test();