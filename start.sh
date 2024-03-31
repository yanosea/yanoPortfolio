#!/bin/bash
if [ -e "yanoPortfolio.run" ]; then
  echo "already running"
  exit 1
fi
docker-compose -f docker-compose.yml build --no-cache --progress=plain
docker-compose -f docker-compose.yml up -d
touch yanoPortfolio.run
