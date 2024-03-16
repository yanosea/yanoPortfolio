#!/bin/bash
if [ -e "dev.run"  ]; then
  echo "dev running"
  exit 1
fi
mv .env .env.org
mv .env.dev .env
docker-compose -f docker-compose.yml build --no-cache --progress=plain
docker-compose -f docker-compose.yml up -d
touch dev.run
docker ps -a
