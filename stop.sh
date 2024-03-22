#!/bin/bash
if [ ! -e "yanoPortfolio.run" ]; then
  echo "not running"
  exit 1
fi
docker-compose down
docker image prune -af
mv .env .env.prod
mv .env.org .env
rm yanoPortfolio.run
