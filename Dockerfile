FROM mcr.microsoft.com/mssql/server:2022-latest

ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express

COPY db/ /init/
COPY docker-init.sh /docker-init.sh

USER root
RUN chmod +x /docker-init.sh

USER mssql
ENTRYPOINT ["/bin/bash", "/docker-init.sh"]
