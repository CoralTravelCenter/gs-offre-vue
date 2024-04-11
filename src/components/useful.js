import dayjs from "dayjs";

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
        if (setup_object.fixedItems.length > 1) {
            config.fixed = setup_object.fixedItems.map(item => {
                return { key: item.name, frame: item.timeframe.map(d => dayjs(d).format('YYYY-MM-DD')) }
            });
        } else {
            const item = setup_object.fixedItems[0];
            if (setup_object.isFixedNamed) {
                config.fixed = [{ key: item.name, frame: item.timeframe.map(d => dayjs(d).format('YYYY-MM-DD')) }]
            } else {
                config.fixed = item.timeframe.map(d => dayjs(d).format('YYYY-MM-DD'));
                if (setup_object.timeframeMonthly) config.monthly = true;
            }
        }
    } else if (setup_object.timeframeType === 'fluid') {
        config.fluid = [`P${ setup_object.fluidSince }D`, `P${ setup_object.fluidUntil }D`];
        if (setup_object.timeframeMonthly) config.monthly = true;
    }
    return config;
}

export function nightsRuntimeConfig(string_or_array_json) {
    let nights_parsed;
    try {
        nights_parsed = JSON.parse(string_or_array_json);
        if (Array.isArray(nights_parsed)) return nights_parsed;
        if (Number(nights_parsed)) return [Number(nights_parsed)];
    } catch (ex) {
        return string_or_array_json.replace(/[^0-9,]/g, '').split(',');
    }
    return null;
}