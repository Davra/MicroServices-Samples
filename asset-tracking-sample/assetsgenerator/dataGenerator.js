const axios = require('axios');
const moment = require('moment')
const platformRequest = axios.create({
    baseURL: 'https://XXXXXX.davra.com/',
    headers: {
        Authorization: 'Bearer XXXXXXXXXX'
    }
});

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}
//route A
//route B-C is connected
//route D-E is connected
var { routesA, routesB, routesC, routesD, routesE } = require('./routes.json')

async function generateData() {
    var date = await formatDate()
    console.log(date)
    const projectUUID = await platformRequest.get('/api/v1/twins?name=asset-tracking').then(({ data }) => data[0].UUID).catch(err => console.log(err))
    var devices = await platformRequest.get(`/api/v1/devices?labels.Project=${projectUUID}`).then(({ data }) => data.records).catch(err => console.log(err))
    console.log(devices)

    //Journey A
    var deviceAIndex = randomIntFromInterval(0, devices.length - 1)
    var deviceA = devices[deviceAIndex]
    devices.splice(deviceAIndex, 1)
    var deviceAlatest = await platformRequest.get('api/v1/iotdata/devices/counters/latest/' + deviceA.UUID).then(({ data }) => data[0]).catch(err => console.log(err))
    var totalmetricA = deviceAlatest.latestMetrics.find(metric => metric.name == 'assetTracking.totalkm')
    var latestKmA = parseFloat(totalmetricA && totalmetricA.latestValue ? totalmetricA.latestValue : "0")
    var timeA = moment(date, "YYYY-MM-DD").startOf('day').add(5, 'hours')
    var gasA = 50
    routesA.forEach(coordinates => {
        var speed = randomIntFromInterval(20, 65)

        latestKmA = latestKmA + speed / 60


        if (gasA < 10) {
            gasA = 50
        } else {
            gasA--
        }

        var iotdata = [{
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeA.valueOf(),
            UUID: deviceA.UUID,
            name: "assetTracking.speed",
            value: speed
        },

        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeA.valueOf(),
            UUID: deviceA.UUID,
            name: "assetTracking.gas",
            value: gasA
        },
        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeA.valueOf(),
            UUID: deviceA.UUID,
            name: "assetTracking.totalkm",
            value: latestKmA
        }]

        platformRequest.put('api/v1/iotdata', iotdata).catch(err => console.log(err))
        timeA.add(1, "minutes")

    })


    //Journey B - Journey C
    var deviceBIndex = randomIntFromInterval(0, devices.length - 1)
    var deviceB = devices[deviceBIndex]
    devices.splice(deviceBIndex, 1)
    var deviceBlatest = await platformRequest.get('api/v1/iotdata/devices/counters/latest/' + deviceB.UUID).then(({ data }) => data[0]).catch(err => console.log(err))
    var totalmetricB = deviceBlatest.latestMetrics.find(metric => metric.name == 'assetTracking.totalkm')

    var latestKmB = parseFloat(totalmetricB && totalmetricB.latestValue ? totalmetricB.latestValue : "0")
    var timeB = moment(date, "YYYY-MM-DD").startOf('day').add(8, 'hours')
    var gasB = 50
    routesB.forEach(coordinates => {
        var speed = randomIntFromInterval(20, 65)

        latestKmB = latestKmB + speed / 60


        if (gasB < 10) {
            gasB = 50
        } else {
            gasB--
        }

        var iotdata = [{
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeB.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.speed",
            value: speed
        },

        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeB.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.gas",
            value: gasB
        },
        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeB.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.totalkm",
            value: latestKmB
        }]

        platformRequest.put('api/v1/iotdata', iotdata).catch(err => console.log(err))
        timeB.add(1, "minutes")

    })

    deviceBlatest = await platformRequest.get('api/v1/iotdata/devices/counters/latest/' + deviceB.UUID).then(({ data }) => data[0]).catch(err => console.log(err))
    totalmetricB = deviceBlatest.latestMetrics.find(metric => metric.name == 'assetTracking.totalkm')

    var latestKmC = parseFloat(totalmetricB && totalmetricB.latestValue ? totalmetricB.latestValue : "0")
    var timeC = moment(date, "YYYY-MM-DD").startOf('day').add(13, 'hours')
    var gasC = 50
    routesC.forEach(coordinates => {
        var speed = randomIntFromInterval(20, 65)

        latestKmC = latestKmC + speed / 60


        if (gasC < 10) {
            gasC = 50
        } else {
            gasC--
        }

        var iotdata = [{
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeC.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.speed",
            value: speed
        },

        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeC.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.gas",
            value: gasC
        },
        {
            msg_type: "datum",
            longitude: coordinates[0],
            latitude: coordinates[1],
            timestamp: timeC.valueOf(),
            UUID: deviceB.UUID,
            name: "assetTracking.totalkm",
            value: latestKmC
        }]

        platformRequest.put('api/v1/iotdata', iotdata).catch(err => console.log(err))
        timeC.add(1, "minutes")

    })

}

generateData()
