FROM urodoz/sailfish-node-base:1.0
MAINTAINER Albert Lacarta <urodoz@gmail.com>

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.20.0/install.sh | bash
RUN cat /root/.nvm/nvm.sh >> installnode.sh

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 0.12.1

RUN echo "nvm install $NODE_VERSION" >> installnode.sh
RUN echo "nvm alias default $NODE_VERSION" >> installnode.sh
RUN echo "nvm use default" >> installnode.sh

RUN sh installnode.sh

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH
