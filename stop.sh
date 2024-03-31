#!/bin/bash
if [ ! -e "yanoPortfolio.run" ]; then
  echo "not running"
  exit 1
fi
docker-compose down
docker image prune -af
rm yanoPortfolio.run
