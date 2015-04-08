import os

scriptPath = os.path.dirname(os.path.abspath(__file__))

os.system('docker build -t urodoz/sailfish-node:0.12.1 '+scriptPath+'/.')