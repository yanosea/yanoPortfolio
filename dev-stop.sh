#!/bin/bash
if [ ! -e "dev.run"  ]; then
  echo "dev not running"
  exit 1
fi
docker stop yanoportfolio-astronode-dev
docker rm yanoportfolio-astronode-dev
docker stop yanoportfolio-back-dev
docker rm yanoportfolio-back-dev
docker-compose down
docker image prune -af
mv .env .env.dev
mv .env.org .env
rm dev.run
docker ps -a
