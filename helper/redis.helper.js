const { Redis } = require('ioredis')
const redis = new Redis();

const setCacheData = (key, data) => {
    // const expireInSeconds = 60 * 10
    const expireInSeconds = 60 * 1440
    const jsonData = JSON.stringify(data)
    return new Promise((resolve, reject) => {
        redis.set(key, jsonData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                redis.expire(key, expireInSeconds, (err, reply) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

const getCacheData = (key) => {
    return new Promise((resolve, reject) => {
        redis.get(key).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    });
}

const deleteCacheData = (...key) => {
    return new Promise((resolve, reject) => {
        redis.del(key, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// const updateCacheData = async (key, newData) => {
//     try {
//         const data = await getCacheData(key);

//         if (data) {
//             return await redis.rPush(key, ...newData);
//         } else {
//             return await setCacheData(key, newData);
//         }
//     } catch (error) {
//         console.error('Error updating cache data:', error);
//         throw error;
//     }
// };



module.exports = { setCacheData, getCacheData, deleteCacheData }