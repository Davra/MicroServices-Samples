# Using microservice secrets
This sample demonstrates the use of user-mounted secrets. In this sample we are creating a microservice that accepts a message to be encrypted and responds with the cipher text. We also have an endpoint which accepts cipher text and returns the decrypted message.

First we create an AES-256 encryption key:

```
openssl enc -nosalt -aes-256-cbc -k my-aes-key -P
```
you will get the following output:

```
key=74DBDC65......................
iv=7599D4... 
```

Create a secret:

```
curl -X POST -u <username:password> -d '{"name": "my-encyrption-key", "value": { "key": "74DBDC652910CBC6AEF24EE63C5AE5F64316...", "iv": "7599D4..." }}' -H "content-type: application/json" https://demo.davra.com/api/v1/secrets
```
This will return a JSON response, within that will be the UUID of the secret you created

Now update your workspace to mount the secret:
```
curl -u "username:password" -X PATCH -d '{"secrets": [{"secretUUID": "<the UUID of the secret just created>", "mountPath": "/etc/secrets/my-aes-key"}]}' -H "content-type: application/json" https://demo.davra.com/api/v1/microservice/workspaces/<UUID of your workspace>
```
Note: doing the above will restart your workspace!

When your workspace comes back up you will find a new directory in your workspace /etc/secrets/my-aes-key with two files contained within called 'key' and 'iv'. This verifies that the secret has been correctly mounted and now you may execute your microservice. 


Copy the contents of index.js to your index.js file in your microservice workspace. Open a new terminal and call npm install followed by npm start.

Usage:

Using the Http client in your workspace enter the following into the input field:
```javascript
{
   "msg": "ssssssh its a secret"
}
```
In the uri field append '/encrypt' to the path it should look like this:
```
/api/v1/microservices/workspaces/<your workspace UUID>/proxy/encrypt
```
Click 'SEND'

you should see a message in the response field that looks something like the following (your encryption key will yield different cipher text):
```javascript
{
   "cipherText": "LwnQm5rlH98uC2d6+ABCQkFAvXm0jgYAQEYxHw3j1Iw="
}
```
Now, copy the response eitirely and paste it into the input field and change the uri replacing 'encrypt' with 'decrypt', it should like this:
```
/api/v1/microservices/workspaces/<your workspace UUID>/proxy/decrypt
```
Click 'SEND'

The response filed will show your oiginal message:
```javascript
{
   "msg": "ssssssh its a secret"
}
```

## Now for production
So we're happy that we can do the encryption/decryption from the workspace. We now need to build the microservice and then mount the secret to the production container:
- Commit and push your code to the git repo
- Open the build tab and click Build
- Mount secret to the production microservice:
```
curl -u "username:password" -X PATCH -d '{"config.secrets": [{"secretUUID": "<the UUID of the secret just created>", "mountPath": "/etc/secrets/my-aes-key"}]}' -H "content-type: application/json" https://demo.davra.com/api/v1/serviceadmin/<UUID of your microservice>
```

## Detach a secret
If you no-longer wish to use the secret in your workspace you can unmount the secret by clearing the secrets array of your microservice:

```
curl -u "username:password" -X PATCH -d '{"secrets": []}' -H "content-type: application/json" https://demo.davra.com/api/v1/microservice/workspaces/<UUID of your workspace>
```
Note: doing the above will restart your workspace!

