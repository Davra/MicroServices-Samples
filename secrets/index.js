const crypto = require("crypto");
const express = require('express');
const fs = require("fs");

const app = express();

app.get('/', function (req, res) {
  res.send('davra.com node microservice!');
});

app.post("/encrypt", (req, res) => {
    let text = "";
    req.on("data", chunk => {text = text + chunk});
    req.on("end", () => {
        try {
            
            let payload = JSON.parse(text);
            let msg = payload.msg;
            if(!msg){
                res.writeHead(400);
                res.write(JSON.stringify({
                    status: "ERROR",
                    errMsg: "You must upload a JSON string with a msg field to encrypt"
                }));
                res.end();
                return;
            }
            
            
            let iv = Buffer.from(fs.readFileSync("/etc/secrets/my-encryption-key/iv", "utf8"), "hex");   
            let key = Buffer.from(fs.readFileSync("/etc/secrets/my-encryption-key/key", "utf8"), "hex");
            let cipher = crypto.createCipheriv("aes256", key, iv);
            let encrypted = cipher.update(msg, "utf8", "base64");
            encrypted = encrypted + cipher.final("base64");
            res.writeHead(200, {"content-type": "application/json"});
            res.write(JSON.stringify({cipherText: encrypted}));
            res.end();
        }
        catch(err){
            console.error(err);
            res.writeHead(500);
            res.write("Failed to encrypt message");
            res.end();
        }
    });
});

app.post("/decrypt", (req, res) => {
    let text = "";
    req.on("data", chunk => {text = text + chunk});
    req.on("end", () => {
        try {
            
            let payload = JSON.parse(text);
            let cipherText = payload.cipherText;
            if(!cipherText){
                res.writeHead(400);
                res.write(JSON.stringify({
                    status: "ERROR",
                    errMsg: "You must upload a JSON string with a cipherText field to decrypt"
                }));
                res.end();
                return;
            }
            
            
            let iv = Buffer.from(fs.readFileSync("/etc/secrets/my-encryption-key/iv", "utf8"), "hex");   
            let key = Buffer.from(fs.readFileSync("/etc/secrets/my-encryption-key/key", "utf8"), "hex");
            let decipher = crypto.createDecipheriv("aes256", key, iv);
            let decrypted = decipher.update(cipherText, "base64", "utf8");
            decrypted = decrypted + decipher.final("utf8");
            res.writeHead(200, {"content-type": "application/json"});
            res.write(JSON.stringify({msg: decrypted}));
            res.end();
        }
        catch(err){
            console.error(err);
            res.writeHead(500);
            res.write("Failed to encrypt message");
            res.end();
        }
    });
});

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});
