const ax = require('axios');

const platformRequest = ax.create({
    baseURL: 'https://xxxxx.davra.com/',
    headers: {
        Authorization: 'Bearer XXXXXXXXXXXXX'
    }
});

async function getDevices (qs) {
    var devices =  await platformRequest.get(`api/v1/devices?${qs}`).then( ({data}) => data.records).catch(err => console.log(err))
    return devices
}

async function getDecoderCode (uuid) {
    var decoder =  await platformRequest.get(`api/v1/decoders/${uuid}/code`).then( ({data}) => data).catch(err => console.log(err))
    return decoder
}

async function pushDecoderLog (uuid, log) {
    await platformRequest.post(`api/v1/decoders/${uuid}/log`, log).then( ({data}) => data).catch(err => console.log(err))
}

async function createDevice (device) {
    var data = await platformRequest.post('api/v1/devices', device).then(({ data }) =>  data).catch(err => console.log(err))
    return data
}

async function sendIotdataPayload (payload) {
    await platformRequest.put('api/v1/iotdata', payload).then(({ data }) =>  data).catch(err => console.log("Error sendig IOT DATA"))
}




module.exports = {
    getDevices,
    sendIotdataPayload,
    createDevice,
    getDecoderCode,
    pushDecoderLog
};