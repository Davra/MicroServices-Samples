const opcua = require("node-opcua");

const HOST = 'ruban.gaston.developers.davra.io';
const PORT = 30463;

// const UUID= '';
// const value = 42;

const [,,host, UUID, value] = process.argv;

if (!host || !UUID) {
    console.log('Please specify a host, value and a UUID');
    process.exit();
}
console.log(`Sending ${value} to ${host}`);

// const endpointUrl = `opc.tcp://${HOST}:${PORT}`;
const endpointUrl = `opc.tcp://${host}`;
const client = opcua.OPCUAClient.create({
    endpoint_must_exist: false
});
client.on("backoff", (retry, delay) => 
    console.log("still trying to connect to ", endpointUrl ,": retry =", retry, "next attempt in ", delay/1000, "seconds" )
);

client.connect(endpointUrl)
    .then(() => {
        return client.createSession()
    })
    .then((session) => {
        const methodToCall = {
            objectId: "ns=1;i=1000",
            methodId: "ns=1;i=1001",
            inputArguments: [
                new opcua.Variant({ dataType: opcua.DataType.String, value: UUID }),
                new opcua.Variant({ dataType: opcua.DataType.UInt32, value }),
            ]
        }
        session.call(methodToCall)
            .then(response => console.log('response', JSON.stringify(response)))
            .then(() => session.close())
            .then(() => process.exit(0));
    })
    .catch(err => {
        console.log('error', err);
        process.exit(1);
    });
