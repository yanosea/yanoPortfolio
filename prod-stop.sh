#!/bin/bash
if [ ! -e "prod.run" ]; then
  echo "prod not running"
  exit 1
fi
docker stop yanoportfolio-astronode
docker rm yanoportfolio-astronode
docker stop yanoportfolio-back
docker rm yanoportfolio-back
docker stop yanoportfolio-front
docker rm yanoportfolio-front
docker-compose down
docker image prune -af
mv .env .env.prod
mv .env.org .env
rm prod.run
