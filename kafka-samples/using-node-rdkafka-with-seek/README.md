A sample Davra Custom Service that uses node-rdkafka (rather than kafka-node).

node-rdkafka is a wrapper on librdkafka and exposes more control over your Producers & Consumers.

In this sample we use it to skip to the latest data for a topic.

This goes against the typical Kafka use case where a consumer does not want to miss any data should the consumer fail.
It could be used in a scenario where, for example, the service needs to retrieve the very latest data following recovery 
from a prior failure rather than working through the full history of missed data.

Note that an npm install of node-rdkafka requires the library to be built from scratch which needs a number of dependencies
in your Docker image.  In Dockerfile you can see we still use node: alpine to keep things lightweight but then install the
necessary dependencies into the container prior to the npm install.
