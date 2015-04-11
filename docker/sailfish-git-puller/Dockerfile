FROM ubuntu:14.04
MAINTAINER Albert Lacarta <urodoz@gmail.com>

RUN apt-get update && apt-get install -y git-core

#Node JS
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update && apt-get install -y nodejs

RUN mkdir -p /workspace && mkdir -p /root/.ssh
WORKDIR /workspace

#Git parsing
RUN mkdir -p /opt/git-parsing
ADD node_modules /opt/git-parsing/node_modules
ADD reader.js /opt/git-parsing/reader.js
ADD parse_branches.js /opt/git-parsing/parse_branches.js
ADD parse_commits.js /opt/git-parsing/parse_commits.js

#Host injection
ADD add_hosts.js /opt/git-parsing/add_hosts.js

ADD init.sh /opt/init.sh
RUN chmod +x /opt/init.sh

CMD ["/opt/init.sh"]
