# MQTT Microservice sample

## Broker

To set up a broker a new microservice needs to be created and deployed.  
Once deployed, the API can be used to update its docker image  
For example, to use mosquitto:

```
curl -X PATCH 'http://{TENANT}.davra.com/api/v1/microservices/{MICROSERVICE_UUID}' \
--header 'Authorization: Bearer {AUTH_TOKEN}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "config.dockerImage": "registry.hub.docker.com/library/eclipse-mosquitto"
}'
```

Now to enable direct access to the microservice we add a TCP route with microservice port set to 1883.  
We copy the url and port of the new route to use when setting up the client.

## Client

Create a new microservice and use the files on the `client` directory of this repo (`index.js` and `package.json`)  
Replace the `MQTT_BROKER` variable value with the url and port of the broker microservice.  
Replace the `TOPIC_NAME` variable value with the topic to use.  
Open the terminal and run `npm start`  

To test it we can use a client like [this one](http://mqtt-explorer.com/)  
Publish a message to the topic used before and you should see it being logged on the console.