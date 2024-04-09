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

export function timeframeRuntimeConfig(setup_object) {
    console.log('++++ timeframeRuntimeConfig setup_object: %o', setup_object);
    const config = {};
    if (setup_object.timeframeType === 'fixed') {
        setup_object.fixedItems.map(item => {

        });
    } else if (setup_object.timeframeType === 'fluid') {

    }
    return config;
}