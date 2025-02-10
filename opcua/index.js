const opcua = require('node-opcua');
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
        url: API_HOST+'/api/v1/iotdata',
        contentType: 'application/json',
        body: JSON.stringify(dataToSend),
        method: 'PUT',
        callback: () =>{}
    });
}

const PORT = 4334;
const server = new opcua.OPCUAServer({
    port: PORT
});


server.initialize()
    .then(() => {
        console.log('Server initialized');
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        const myDevice = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: 'global'
        });

        const method = namespace.addMethod(myDevice, {
            browseName: 'setTemperature',
            inputArguments:  [
                {
                    name:'UUID',
                    description: { text: 'device UUID' },
                    dataType: opcua.DataType.String        
                },
                {
                    name:'temperature',
                    description: { text: 'current temperature' },
                    dataType: opcua.DataType.UInt32        
                }
            ],
            outputArguments: [{
                    name:'response',
                    description:{ text: 'response' },
                    dataType: opcua.DataType.String ,
                    valueRank: 1
            }]
        });

        method.bindMethod((inputArguments,context,callback) => {
            const [{ value: UUID }, { value: temperature }] = inputArguments;

            console.log('Received new temperature', temperature, 'for device', UUID);
            saveTimeSeriesData(UUID, 'test.metric', temperature);
            const callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                        dataType: opcua.DataType.String,
                        value: 'OK'
                }]
            };
            callback(null,callMethodResult);
        });

        return server.start()
            .then(()=> {
                console.log('Server is now listening on port', PORT);
                const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                console.log('the primary server endpoint url is ', endpointUrl );
            });
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });