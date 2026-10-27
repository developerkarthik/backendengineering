
const locks = new Map();

const withProductLock = async (productId, operation) => {
    let key = String(productId);
    let previous = locks.get(key) ?? Promise.resolve();

    let release;

    let current = new Promise((resolve) => {
        release = resolve;
    });

    let queued = previous.then(() => current);
    locks.set(key, queued);

    await previous

    try{
        return await operation()
    }finally{
        release()
        if(locks.get(key) === queued){
            locks.delete(key)
        }
    }
}

module.exports = {withProductLock}