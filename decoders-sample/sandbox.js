const { NodeVM } = require('vm2');

function runDecoder (decoder, context) {
    const vm = new NodeVM({
        require: {
            external: false
        },
        console: 'redirect'
    });

    const logs = [];

    vm.on('console.log', (data) => {
        logs.push(data);
    });

    vm.on('console.dir', (data) => {
        logs.push(data);
    });

    vm.on('console.error', (data) => {
        logs.push(data);
    });

    try {
        const decodeExec = vm.run(decoder);

        const result = decodeExec(context);

        // Extract the values
        const decodedMetrics = result.value && result.value.metrics ? result.value.metrics : [];

        return { logs: logs, decodedMetrics: decodedMetrics };
    } catch (err) {
        logs.push(err);
        return { logs: logs, decodedMetrics: [] };
    }
}

module.exports = {
    runDecoder
};
