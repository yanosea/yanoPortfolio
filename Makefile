# initialize variables
BACK_DIR := ./back
FRONT_DIR := ./front
RUN_FILE := ./.yanoPortfolio.run
DEV_ENV_FILE := ./.env.dev
BACK_PID_FILE := $(BACK_DIR)/.pid
FRONT_PID_FILE := $(FRONT_DIR)/.pid
# shows help message defaultly
.DEFAULT_GOAL := help

# include .env.dev file if it exists
ifneq (,$(wildcard $(DEV_ENV_FILE)))
	include $(DEV_ENV_FILE)
	export
endif

#
# prod
#
.PHONY: start stop

# start yanoPortfolio
start:
	@set -e; \
	if [ -e $(RUN_FILE) ]; then \
		echo "yanoPortfolio is running"; \
		exit 1; \
	fi; \
	docker-compose -f docker-compose.yml build --no-cache --progress=plain
	docker-compose -f docker-compose.yml up -d
	touch $(RUN_FILE)

# stop yanoPortfolio
stop:
	@set -e; \
	if [ ! -e $(RUN_FILE) ]; then \
		echo "yanoPortfolio is not running"; \
		exit 1; \
	fi; \
	docker-compose down
	docker image prune -af
	rm $(RUN_FILE)

#
# dev (local)
#
.PHONY: dev.start dev.stop dev.back.start dev.back.stop dev.front.start dev.front.stop

# start both backend and frontend servers locally
dev.start: dev.back.start dev.front.start
	@echo ""
	@echo "all development servers started successfully!"
	@echo ""

# stop both backend and frontend servers locally
dev.stop: dev.back.stop dev.front.stop
	@echo ""
	@echo "all development servers stopped successfully!"
	@echo ""

# start backend server locally
dev.back.start:
	@set -e; \
	if [ -e $(BACK_PID_FILE) ]; then \
		echo ""; \
		echo "backend server is already running..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ ! -f $(DEV_ENV_FILE) ]; then \
		echo ""; \
		echo "development environment file $(DEV_ENV_FILE) not found..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ -z "$(BACK_PORT)" ]; then \
		echo ""; \
		echo "BACK_PORT not found in $(DEV_ENV_FILE)..."; \
		echo ""; \
		exit 1; \
	fi; \
	cd $(BACK_DIR) && \
	set -a && source ../$(DEV_ENV_FILE) && set +a && \
	go run main.go > /dev/null 2>&1 & \
	sleep 2 && \
	SERVER_PID=$$(lsof -i:$(BACK_PORT) -t); \
	if [ -z "$$SERVER_PID" ]; then \
		echo ""; \
		echo "failed to start backend server..."; \
		echo ""; \
		exit 1; \
	fi; \
	echo $$SERVER_PID > $(BACK_PID_FILE) && \
	echo ""; \
	echo "backend server started on port $(BACK_PORT) (PID: $$SERVER_PID)!"; \
	echo "";

# stop backend server
dev.back.stop:
	@set -e; \
	if [ ! -e $(BACK_PID_FILE) ]; then \
		echo ""; \
		echo "backend server is not running..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ ! -f $(DEV_ENV_FILE) ]; then \
		echo ""; \
		echo "development environment file $(DEV_ENV_FILE) not found..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ -z "$(BACK_PORT)" ]; then \
		echo ""; \
		echo "BACK_PORT not found in $(DEV_ENV_FILE)..."; \
		echo ""; \
		exit 1; \
	fi; \
	PID=$$(cat $(BACK_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		kill $$PID; \
	else \
		echo "process $$PID not found, trying to find running instance..."; \
		PID=$$(lsof -i:$(BACK_PORT) -t); \
		if [ -n "$$PID" ]; then \
			echo ""; \
			echo "found process $$PID, killing it..."; \
			echo ""; \
			kill $$PID; \
		fi; \
	fi; \
	rm -f $(BACK_PID_FILE); \
	echo ""; \
	echo "backend server stopped!"; \
	echo "";

# start frontend server locally
dev.front.start:
	@set -e; \
	if [ -e $(FRONT_PID_FILE) ]; then \
		echo ""; \
		echo "frontend server is already running..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ ! -f $(DEV_ENV_FILE) ]; then \
		echo ""; \
		echo "development environment file $(DEV_ENV_FILE) not found..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ -z "$(FRONT_PORT)" ]; then \
		echo ""; \
		echo "FRONT_PORT not found in $(DEV_ENV_FILE)..."; \
		echo ""; \
		exit 1; \
	fi; \
	cd $(FRONT_DIR) && \
	echo "" && \
	echo "installing npm packages..." && \
	npm install && \
	echo "Packages installed successfully." && \
	echo "" && \
	echo "starting frontend server..." && \
	set -a && source ../$(DEV_ENV_FILE) && set +a && \
	npm start > /dev/null 2>&1 & \
	sleep 3 && \
	SERVER_PID=$$(lsof -i:$(FRONT_PORT) -t); \
	if [ -z "$$SERVER_PID" ]; then \
		echo ""; \
		echo "failed to start frontend server..."; \
		echo ""; \
		exit 1; \
	fi; \
	echo $$SERVER_PID > $(FRONT_PID_FILE) && \
	echo ""; \
	echo "frontend server started on port $(FRONT_PORT) (PID: $$SERVER_PID)..."; \
	echo "";

# stop frontend server
dev.front.stop:
	@set -e; \
	if [ ! -e $(FRONT_PID_FILE) ]; then \
		echo ""; \
		echo "frontend server is not running..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ ! -f $(DEV_ENV_FILE) ]; then \
		echo ""; \
		echo "development environment file $(DEV_ENV_FILE) not found..."; \
		echo ""; \
		exit 1; \
	fi; \
	if [ -z "$(FRONT_PORT)" ]; then \
		echo ""; \
		echo "FRONT_PORT not found in $(DEV_ENV_FILE)..."; \
		echo ""; \
		exit 1; \
	fi; \
	PID=$$(cat $(FRONT_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		kill $$PID; \
	else \
		echo "process $$PID not found, trying to find running instance..."; \
		PID=$$(lsof -i:$(FRONT_PORT) -t); \
		if [ -n "$$PID" ]; then \
			echo ""; \
			echo "found process $$PID, killing it..."; \
			echo ""; \
			kill $$PID; \
		fi; \
	fi; \
	rm -f $(FRONT_PID_FILE); \
	echo ""; \
	echo "frontend server stopped!"; \
	echo "";

# help
.PHONY: help
help:
	@echo ""
	@echo "available targets:"
	@echo ""
	@echo "  [prod]"
	@echo "    start    - start yanoPortfolio"
	@echo "    stop     - stop yanoPortfolio"
	@echo ""
	@echo "  [dev]"
	@echo "    dev.start       - start both backend and frontend servers locally"
	@echo "    dev.stop        - stop both backend and frontend servers locally"
	@echo "    dev.back.start  - start backend server locally (port $(BACK_PORT))"
	@echo "    dev.back.stop   - stop backend server locally"
	@echo "    dev.front.start - start frontend server locally (port $(FRONT_PORT))"
	@echo "    dev.front.stop  - stop frontend server locally"
	@echo ""
