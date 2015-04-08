import os

scriptPath = os.path.dirname(os.path.abspath(__file__))

os.system('docker build -t urodoz/sailfish-git-puller:1.0 '+scriptPath+'/.')