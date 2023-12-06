#!/usr/bin/python
#assuming in islandrio folder
from flask import Flask
import logging
import os
import subprocess
import threading
import datetime

print("Initializing...")

event_history = [
    {
        "type": "null",
        "name": "Placeholder Event",
        "time": str(datetime.datetime.now()),
        "data": "lorem ipsum",
        "err": "null"
    }
]

def daemon():
    global event_history
    print("Daemon successfully started")
    print("Killing existing processes...")
    os.system("taskkill /f /t /im node.exe")
    print("Starting WebSocket Server...")
    gameserv = subprocess.Popen("npm run gameserv", cwd="/httpdocs", shell=True)
    print("Starting WebServer Server...")
    webserv = subprocess.Popen("npm run webserv", cwd="/httpdocs", shell=True)
    while True:
        try:
            if(gameserv.poll() != None):
                #dead!!!
                event_history.append({
                    "type": "DOWN",
                    "name": "WebSocket Server Down",
                    "time": str(datetime.datetime.now()),
                    "data": "WebSocket Server exited with code " + str(gameserv.poll()),
                    "err": str(gameserv.poll())
                    })
                print("WebSocket Server Crashed (check dev portal)")
                print("Attempt autorestart")
                gameserv.kill()
                gameserv = subprocess.Popen("npm run gameserv", cwd="/httpdocs", shell=True)
            if(webserv.poll() != None):
                #dead!!!
                event_history.append({
                    "type": "DOWN",
                    "name": "WebServer Down",
                    "time": str(datetime.datetime.now()),
                    "data": "WebServer exited with code " + str(gameserv.poll()),
                    "err": str(gameserv.poll())
                    })
                print("WebServer Crashed (check dev portal)")
                print("Attempt autorestart")
                webserv.kill()
                webserv = subprocess.Popen("npm run webserv", cwd="/httpdocs", shell=True)
            print(event_history)
        except Exception as e:
            print("Ignoring fatal error in main daemon")
            print(e)

t = threading.Thread(target = daemon, daemon = True)
t.start()

PORT_NUMBER = 4321

app = Flask(__name__)

@app.route("/")
def index():
    with open("devportal/index.html", "r") as file:
        return file.read()

app.run(port=PORT_NUMBER, host="0.0.0.0")