#!/bin/bash
### BEGIN INIT INFO
#
# Convert Workspace to Python
# ===========================
#
# This script converts NodeJS microservice base to a Python one.
#
# # Description: 
#
# Installs Python & pip, then anything in requirements.txt
# (Typically Flask at least, requests.py for any external API calls.)
# Also deletes NodeJS setup, levaes a clean Flask starter pack,
# with similar dev & docker image environments.
#
# # Key points are:
#
# * keep the same debian:jessie base
# * Docker image for production similar to dev. environment
# * this means Python 3.4
# * Flask is installed & used by default
# * Dev environment is set to debug with hot reloading
#
# # NOTE: You'll probably need to run `chmod +x convertWorkspace.sh` (make executable)
#        and `sed -i -e 's/\r$//' convertWorkspace.sh`  (convert line endings)
#        before running as `./convertWorkspace.sh`
# 
# # ALSO NOTE: Only run this once obviously, as it's a bit brutal in over-writing some key files...
#
# # TODO: configure a proper deployment config for production/Docker image
# 
### END INIT INFO

# Author: Karl Chadwick <karl.chadwick@davra.io>

# console.log some green text for easier logging of info messages:
clog () {
    echo -e "\e[32m - INFO:  $1 \e[0m"
}


clog "remove NodeJS files"
rm -f index.js
rm -f package.json

clog "general system update, then install/update python"
apt update -y
apt upgrade -y
apt install -y python3-venv python3-pip

clog "install py requirements"
cat <<EOT >> requrements.txt
Flask
requests
EOT
pip3 install -r requrements.txt


clog "update startup scipt"
cat <<EOT > start.sh
#!/bin/bash

# set flask env variables, then run
export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_APP=main.py
# set Docker image for production (default)
export FLASK_ENV=development

flask run --port=8080 --host=0.0.0.0

EOT
chmod +x start.sh


clog "create main.py to test"
cat <<EOT > main.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello world python!"

EOT



clog "update docker file"

cat <<EOT > Dockerfile
FROM debian:jessie-slim

# general system update, then install/update python
RUN apt update -y  
RUN apt upgrade -y
RUN apt install -y python3-venv python3-pip

# install py requirements
COPY requirements.txt ./
RUN pip install -r requirements.txt

# copy app files
COPY . /microservice
WORKDIR /microservice

EXPOSE  8080
CMD ["sh", "start.sh"]

EOT

