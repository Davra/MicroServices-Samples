module.exports = function(context){

    console.log("Starting decoding")

    var payload = Buffer.from(context.payload);
    var metrics = [];

    const tempA = payload.readUInt16LE(6) * 0.0003178914
    const pressuremA = payload.readUInt16LE(8) * 0.0003178914 
    const battery_voltage = payload.readUInt16LE(4) * 0.000536177

    metrics.push({name: 'battery', value: battery_voltage})
    metrics.push({name: 'pressure', value: pressuremA})
    metrics.push({name: 'temperature', value: tempA})

    context.value = {
        metrics : metrics
    }
    
    console.log("Finished decoding")

    return context
};

// Sample context
// {payload: "0xFFEEDDCCBBAA998877665544332211", serialNumber: "1234", name: "myDevice"}