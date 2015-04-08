import os

scriptPath = os.path.dirname(os.path.abspath(__file__))

os.system('docker build -t urodoz/sailfish-python:2.7 '+scriptPath+'/.')