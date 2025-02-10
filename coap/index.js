const coap = require('coap');
const api = require('@connecthing.io/connecthing-api');
const API_HOST = process.env.DAVRA_API_HOST

function saveTimeSeriesData(UUID, metricName, metricValue) {
    var dataToSend = {
        UUID,
        name: metricName,
        value: metricValue,
        'msg_type': 'datum'
    }
    api.request({
        url: API_HOST+'api/v1/iotdata',
        contentType: 'application/json',
        body: JSON.stringify(dataToSend),
        method: 'PUT',
        callback: () =>{}
    });
}

const server = coap.createServer();
 
// the default CoAP port is 5683
server.listen(function() {
    server.on('request', function(req, res) {
        console.log('REQUEST', req.rsinfo);
        console.log('PAYLOAD', req.payload);
        console.log('PAYLOAD str', req.payload.toString());
        const data = JSON.parse(req.payload.toString());
        const {
            UUID,
            value
        } = data;
        saveTimeSeriesData(UUID, 'test.metric', value);
        res.end('OK');
    });
});
