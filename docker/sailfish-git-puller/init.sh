#!/usr/bin/env bash

#Host injection
node /opt/git-parsing/add_hosts.js

mkdir -p /root/.ssh
echo $SAILFISH_SSH_KEY > /root/.ssh/id_dsa.pub
echo $SAILFISH_PRIVATE_SSH_KEY | base64 --decode > /root/.ssh/id_dsa

chmod 600 /root/.ssh/id_dsa*

ssh-keyscan $SAILFISH_REPOSITORY_SERVER_PORT -H $SAILFISH_REPOSITORY_SERVER > /etc/ssh/ssh_known_hosts

if [ "$SAILFISH_TYPE" == "light" ]
then
    #Get all branches and store on a file
    cd /opt/git-parsing && git ls-remote --heads $SAILFISH_REPOSITORY > /opt/git-parsing/sailfish_branches.output
    cd /opt/git-parsing && node parse_branches.js
    cd /opt/git-parsing && git init && git remote add origin $SAILFISH_REPOSITORY && git fetch origin
    cd /opt/git-parsing && node parse_commits.js
fi

if [ "$SAILFISH_TYPE" == "default" ]
then
    git clone $SAILFISH_REPOSITORY frame
    chmod 777 frame && cd frame && git checkout $SAILFISH_COMMIT
fi

