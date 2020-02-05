# Putting IoT devices onto a map and updating live
This example shows a microservice which connects to kafka, filters on gps position updates of iot devices and writes the iot data to a websocket.

The second half of the example is a widget which opens a websocket client connection to the microservice and renders the devices onto a google maps map, updating the markers in response to websocket data.

## Note: the client example assumes you call your microservice 'iotdata-stream', if you don't call your microservice by this name you must change the line containing 'var ws = createWebSocket("/microservices/iotdata-stream");' accordingly
