
const Kafka = require('node-rdkafka');
const aggregator = require('./aggregator.js');

const config = {
    DEBUG: true,
    bucket_size: 60 * 60 * 1000,
    bucket_ttl: 24 * 60 * 60 * 1000
};

aggregator.init(config);

let consumer;
let partitionAssignmentInterval;

function kafkaErrorHandler (err, exitOnFatal = false) {
    let handledError = false;

    console.error('Error reported from kafka %O', err);
    const message = (err.message || '').toLowerCase();
    const reconnectionMessages = [
        'all broker connections are down',
        'authorization'
    ];
    if (reconnectionMessages.find(m => message.includes(m))) {
        consumer.disconnect(() => {
            console.log('Consumer disconnected');
            connectConsumer();
        });
        handledError = true;
    } else if (message.indexOf('timeout') < 0) {
        if (exitOnFatal) {
            handledError = true;
            console.error('This looks fatal, exiting');
            process.exit(1);
        }
    }

    return handledError;
}

function createConsumer () {
    consumer = new Kafka.KafkaConsumer({
        'group.id': process.env.KAFKA_CONSUMER_GROUP_ID,
        'metadata.broker.list': process.env.KAFKA_HOST,
        'enable.auto.commit': true,
        'security.protocol': 'ssl',
        'ssl.key.location': '/etc/davra/tls/tls.key',
        'ssl.certificate.location': '/etc/davra/tls/tls.crt',
        'ssl.ca.location': '/etc/davra/tls/ca-cert'
    }, {});
    
    consumer.on('ready', function () {
        console.log('Kafka consumer ready !!!!!');
    
        // Subscribe to the tenants IoT data topic.
        consumer.subscribe([process.env.IoT_DATA_TOPIC_NAME]);
    
        // poll consumer to ensure at least one partition of the topic is assigned to it
        if (partitionAssignmentInterval) {
            clearInterval(partitionAssignmentInterval);
        }
        partitionAssignmentInterval = setInterval(() => {
            const assignments = consumer.assignments();
            if (!assignments || assignments.length === 0) {
                console.log('No partitions assigned to this consumer, resubscribing');
                consumer.subscribe([process.env.IoT_DATA_TOPIC_NAME]);
            }
        }, 30000);
    
        consume();
    })
    .on('event.error', kafkaErrorHandler);
    
    process.on('exit', () => {
        console.log('Process exiting disconnecting consumer');
        consumer.unsubscribe(() => {
            console.log('unsubscribed');
            consumer.disconnect(() => {
                console.log('Consumer disconnected');
            });
        });
    });
}

let connectionInProgress = false;
function connectConsumer () {
    console.log('Attempting to connect to kafka');
    if (connectionInProgress) return;
    connectionInProgress = true;
    consumer.connect({ timeout: 10000 }, (err) => {
        connectionInProgress = false;
        if (err) {
            console.log('\n\n\n\n##########################################\n\n\n\n\nFailed to connect to Kafka!\n\n\n\n##########################################', err);
            setTimeout(connectConsumer, 1000);
        } else {
            console.log('\n\n\n\n##########################################\n\n\n\n\nConnected to kafka         \n\n\n\n##########################################');
        }
    });
}

function consume () {
    const batchSize = 50;
    consumer.consume(batchSize, async (err, messages) => {
        if (err) {
            console.error('Error returned from consume call', err);
            if (!kafkaErrorHandler(err)) {
                setImmediate(consume);
            }
            return;
        }

        messages.forEach(message => aggregator.processMessage(message));
        setImmediate(consume);
    });
}

createConsumer();
connectConsumer();

/*Instruct all aggregators to flush to iotdata*/
setInterval(function(){
    aggregator.writeToStore().catch((err) => {console.error('Error writing to iotdata', err);});
}, 2500);

