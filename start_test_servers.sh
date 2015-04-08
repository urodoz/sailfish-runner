#!/usr/bin/env bash
CWD=$(pwd)

docker stop sailfish-git-server
docker rm sailfish-git-server

docker build -t sailfish-git-server $CWD/docker/sailfish-git-server/.

docker run -d \
    -p 0.0.0.0:13522:22 \
    --name=sailfish-git-server \
    -v $CWD/docker/test_repository:/repository:rw \
    sailfish-git-server
