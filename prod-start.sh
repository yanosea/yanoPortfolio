#!/bin/bash
if [ -e "prod.run" ]; then
  echo "prod running"
  exit 1
fi
mv .env .env.org
mv .env.prod .env
docker-compose -f docker-compose-prod.yml build --no-cache --progress=plain
docker-compose -f docker-compose-prod.yml up -d
touch prod.run
