
const Kafka = require('node-rdkafka');
const aggregator = require('./aggregator.js');

const config = {
    DEBUG: true,
    bucket_size: 60 * 60 * 1000,
    bucket_ttl: 24 * 60 * 60 * 1000
};

aggregator.init(config);

let consumer;

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
        setInterval(() => {
            const assignments = consumer.assignments();
            if (!assignments || assignments.length === 0) {
                console.log('No partitions assigned to this consumer, resubscribing');
                consumer.subscribe([process.env.IoT_DATA_TOPIC_NAME]);
            }
        }, 30000);
    
        consume();
    })
    .on('event.error', (err) => {
        console.error('Error reported from kafka %O', err);
        if (err.message && err.message.toLowerCase().indexOf('timeout') < 0) {
            console.error('This looks fatal, exiting');
            process.exit(1);
        }
    });
    
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

function connectConsumer () {
    console.log('Attempting to connect to kafka');
    consumer.connect({ timeout: 10000 }, (err) => {
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
            setImmediate(consume);
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

