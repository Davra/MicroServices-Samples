const {
    getDevices,
    createDevice,
    pushDecoderLog,
    sendIotdataPayload,
    getDecoderCode
} = require('./api');

const {
    runDecoder
} = require('./sandbox');

const moment = require('moment')

let devicesBySerial = {};

setInterval(() => (devicesBySerial = {}), 2 * 60 * 60 * 1000); // Clear device cache

function getDevice(sn) {
    return new Promise((resolve, reject) => {
        if (!devicesBySerial[sn]) {
            return getDevices(`serialNumber=${sn}`)
                .then(([device]) => {
                    devicesBySerial[sn] = device;
                    resolve(devicesBySerial[sn]);
                })
                .catch(reject);
        }
        resolve(devicesBySerial[sn]);
    });
}

async function createNewDevice(data) {

    const newDevice = {
        name: data.name,
        serialNumber: data.serialNumber,
    };
    return await createDevice(newDevice);

}

async function processData(data) {
    try {
        const sn = data.serialNumber

        let device = await getDevice(sn)
        if (!device) {
            device = await createNewDevice(data)
        }

        if (!device || !device.customAttributes.decoder) {
            throw new Error(`Device and/or decoder for serial number ${sn} does not exist`);
        }

        const decoder = await getDecoderCode(device.customAttributes.decoder)
        console.log(decoder)

        let result = runDecoder(decoder, data)
        result.result = result.decodedMetrics
        delete result.decodedMetrics
        result.payload = data.payload
        result.timestamp = moment().valueOf()
        pushDecoderLog(device.customAttributes.decoder, result)

        const payload = result.result.map(metric => ({
            name: metric.name,
            value: metric.value,
            timestamp: moment().valueOf(),
            UUID: device.UUID,
            msg_type: 'datum'
        }));

        return sendIotdataPayload(payload);
    } catch (e) {
        console.log(e)
    }

}

module.exports = {
    processData
};
