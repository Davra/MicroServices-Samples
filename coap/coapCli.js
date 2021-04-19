const coap = require('coap');

function send (host, message) {
    const req = coap.request(`coap://${host}`);
    req.on('response', function(res) {
        res.pipe(process.stdout);

        res.on('end', () => process.exit());
    });
    req.end(message);
}

const [,,host, message] = process.argv;

if (!host || !message) {
    console.log('Please specify a host an a message');
    process.exit();
}
console.log(`Sending ${message} to ${host}`);
send(host, message);