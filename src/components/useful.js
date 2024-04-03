export async function gas(method, ...params) {
    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler((result) => {
                resolve(result);
            })
            .withFailureHandler((err) => {
                reject(err);
            })[method](...params);
    });
}