FROM node:25.2

USER 1000:1000
SHELL ["/bin/bash"]
WORKDIR /opt/taskdesk
EXPOSE 5173

ENTRYPOINT ["npm", "run", "dev"]
