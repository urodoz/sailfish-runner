import os

scriptPath = os.path.dirname(os.path.abspath(__file__))

os.system('docker build -t urodoz/sailfish-node-base:1.0 '+scriptPath+'/.')