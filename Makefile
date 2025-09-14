# initialize shell
SHELL := /usr/bin/env bash
# define colors
COLOR_RESET  := $(shell tput sgr0)
COLOR_TITLE  := $(shell tput setaf 5) # magenta
COLOR_HEADER := $(shell tput setaf 3) # yellow
COLOR_CMD    := $(shell tput setaf 6) # cyan
COLOR_DONE   := $(shell tput setaf 2) # green
COLOR_ERROR  := $(shell tput setaf 1) # red
# project directories
BACK_DIR := ./back
FRONT_DIR := ./front
BACK_PID_FILE := $(BACK_DIR)/.pid
FRONT_PID_FILE := $(FRONT_DIR)/.pid
# development port settings
DEV_FRONT_PORT := 4321
DEV_BACK_PORT := 8080
# shows help message defaultly
.DEFAULT_GOAL := help
# do not show directory name in command output
MAKEFLAGS += --no-print-directory
# not show command all
.SILENT:
# ignore errors all
.IGNORE:

#
# development targets
#
.PHONY: dev.start dev.stop dev.back.start dev.back.stop dev.front.start dev.front.stop dev.check dev.health dev.status

# start both backend and frontend servers locally
dev.start:
	@echo "$(COLOR_TITLE)starting development servers...$(COLOR_RESET)"
	@echo ""
	make dev.back.start
	@echo ""
	make dev.front.start
	@echo ""
	@echo "$(COLOR_DONE)all development servers started successfully!$(COLOR_RESET)"

# stop both backend and frontend servers locally
dev.stop:
	@echo "$(COLOR_TITLE)stopping development servers...$(COLOR_RESET)"
	@echo ""
	make dev.back.stop
	@echo ""
	make dev.front.stop
	@echo ""
	@echo "$(COLOR_DONE)all development servers stopped successfully!$(COLOR_RESET)"

# start backend server locally (Deno + Denoflare)
dev.back.start:
	@set -e; \
	if [ -e $(BACK_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)backend server is already running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	cd $(BACK_DIR) && \
	echo "$(COLOR_HEADER)starting backend server...$(COLOR_RESET)" && \
	deno task dev > /dev/null 2>&1 & \
	echo "$(COLOR_HEADER)waiting for backend server to start...$(COLOR_RESET)" && \
	for i in {1..30}; do \
		sleep 1; \
		SERVER_PID=$$(lsof -i:$(DEV_BACK_PORT) -t 2>/dev/null); \
		if [ -n "$$SERVER_PID" ]; then \
			break; \
		fi; \
		if [ $$i -eq 30 ]; then \
			echo "$(COLOR_ERROR)timeout: backend server failed to start within 30 seconds...$(COLOR_RESET)"; \
			exit 1; \
		fi; \
	done; \
	echo $$SERVER_PID > $(BACK_PID_FILE) && \
	echo "$(COLOR_DONE)backend server started on port $(DEV_BACK_PORT) (PID: $$SERVER_PID)!$(COLOR_RESET)"

# stop backend server
dev.back.stop:
	@set -e; \
	if [ ! -e $(BACK_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)backend server is not running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	PID=$$(cat $(BACK_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		echo "$(COLOR_HEADER)stopping backend server...$(COLOR_RESET)" && \
		kill $$PID; \
	else \
		echo "$(COLOR_HEADER)process $$PID not found, trying to find running instance...$(COLOR_RESET)"; \
		PID=$$(lsof -i:$(DEV_BACK_PORT) -t); \
		if [ -n "$$PID" ]; then \
			echo "$(COLOR_HEADER)found process $$PID, killing it...$(COLOR_RESET)"; \
			kill $$PID; \
		fi; \
	fi; \
	rm -f $(BACK_PID_FILE); \
	echo "$(COLOR_DONE)backend server stopped!$(COLOR_RESET)"

# start frontend server locally
dev.front.start:
	@set -e; \
	if [ -e $(FRONT_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)frontend server is already running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	echo "$(COLOR_HEADER)starting frontend server...$(COLOR_RESET)" && \
	PORT=$(DEV_FRONT_PORT) $$PACKAGE_MANAGER dev > /dev/null 2>&1 & \
	echo "$(COLOR_HEADER)waiting for frontend server to start...$(COLOR_RESET)" && \
	sleep 3 && \
	for i in {1..45}; do \
		SERVER_PID=$$(lsof -i:$(DEV_FRONT_PORT) -t 2>/dev/null | head -1); \
		if [ -n "$$SERVER_PID" ] && ps -p $$SERVER_PID > /dev/null 2>&1; then \
			sleep 2; \
			VERIFY_PID=$$(lsof -i:$(DEV_FRONT_PORT) -t 2>/dev/null | head -1); \
			if [ "$$SERVER_PID" = "$$VERIFY_PID" ]; then \
				break; \
			fi; \
		fi; \
		sleep 1; \
		if [ $$i -eq 45 ]; then \
			echo "$(COLOR_ERROR)timeout: frontend server failed to start within 45 seconds...$(COLOR_RESET)"; \
			exit 1; \
		fi; \
	done; \
	echo $$SERVER_PID > $(FRONT_PID_FILE) && \
	echo "$(COLOR_DONE)frontend server started on port $(DEV_FRONT_PORT) (PID: $$SERVER_PID)!$(COLOR_RESET)"

# stop frontend server
dev.front.stop:
	@set -e; \
	if [ ! -e $(FRONT_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)frontend server is not running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	PID=$$(cat $(FRONT_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		echo "$(COLOR_HEADER)stopping frontend server...$(COLOR_RESET)" && \
		kill $$PID; \
	else \
		echo "$(COLOR_HEADER)process $$PID not found, trying to find running instance...$(COLOR_RESET)"; \
		PID=$$(lsof -i:$(DEV_FRONT_PORT) -t); \
		if [ -n "$$PID" ]; then \
			echo "$(COLOR_HEADER)found process $$PID, killing it...$(COLOR_RESET)"; \
			kill $$PID; \
		fi; \
	fi; \
	rm -f $(FRONT_PID_FILE); \
	echo "$(COLOR_DONE)frontend server stopped!$(COLOR_RESET)"


# comprehensive check (environment + dependencies)
dev.check:
	@echo ""
	@echo "$(COLOR_TITLE)environment check$(COLOR_RESET)"
	@echo ""
	@echo "  $(COLOR_HEADER)[runtime versions]$(COLOR_RESET)"
	@echo "    node.js: $$(node --version 2>/dev/null || echo '$(COLOR_ERROR)not installed...$(COLOR_RESET)')"
	@echo "    pnpm:    $$(pnpm --version 2>/dev/null || echo '$(COLOR_ERROR)not installed...$(COLOR_RESET)')"
	@echo "    deno:    $$(deno --version 2>/dev/null | head -1 || echo '$(COLOR_ERROR)not installed...$(COLOR_RESET)')"
	@echo ""
	@echo "  $(COLOR_HEADER)[configuration files]$(COLOR_RESET)"
	@if [ -f $(BACK_DIR)/.denoflare ]; then \
		echo "    denoflare:   $(COLOR_DONE).denoflare configured$(COLOR_RESET)"; \
	else \
		echo "    denoflare:   $(COLOR_ERROR).denoflare not found...$(COLOR_RESET)"; \
	fi
	@echo ""

# health check for running development services
dev.health:
	@echo ""
	@echo "$(COLOR_TITLE)service health check$(COLOR_RESET)"
	@echo ""
	@if [ -f $(FRONT_PID_FILE) ]; then \
		curl -s -o /dev/null -w "  frontend : %{http_code}\n" http://localhost:$(DEV_FRONT_PORT) || echo "  $(COLOR_ERROR)frontend: connection failed...$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_HEADER)frontend : not running...$(COLOR_RESET)"; \
	fi
	@if [ -f $(BACK_PID_FILE) ]; then \
		curl -s -o /dev/null -w "  backend  : %{http_code}\n" http://localhost:$(DEV_BACK_PORT)/spotify/now-playing || echo "  $(COLOR_ERROR)backend: connection failed...$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_HEADER)backend  : not running...$(COLOR_RESET)"; \
	fi

# check development server status
dev.status:
	@echo ""
	@echo "$(COLOR_TITLE)development server status$(COLOR_RESET)"
	@echo ""
	@if [ -f $(FRONT_PID_FILE) ]; then \
		FRONT_PID=$$(cat $(FRONT_PID_FILE)); \
		if ps -p $$FRONT_PID > /dev/null; then \
			echo "$(COLOR_DONE)frontend : running (pid: $$FRONT_PID, port: $(DEV_FRONT_PORT))$(COLOR_RESET)"; \
		else \
			echo "$(COLOR_ERROR)frontend : pid file exists but process not found...$(COLOR_RESET)"; \
		fi; \
	else \
		echo "$(COLOR_HEADER)frontend : not running...$(COLOR_RESET)"; \
	fi
	@if [ -f $(BACK_PID_FILE) ]; then \
		BACK_PID=$$(cat $(BACK_PID_FILE)); \
		if ps -p $$BACK_PID > /dev/null; then \
			echo "$(COLOR_DONE)backend  : running (pid: $$BACK_PID, port: $(DEV_BACK_PORT))$(COLOR_RESET)"; \
		else \
			echo "$(COLOR_ERROR)backend  : pid file exists but process not found...$(COLOR_RESET)"; \
		fi; \
	else \
		echo "$(COLOR_HEADER)backend  : not running...$(COLOR_RESET)"; \
	fi

#
# frontend tasks
#
.PHONY: front.build front.check front.deploy front.fmt front.test

# build frontend
front.build:
	@echo "$(COLOR_HEADER)building frontend...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run build
	@echo "$(COLOR_DONE)frontend build completed!$(COLOR_RESET)"

# run frontend quality checks (astro + format)
front.check:
	@echo "$(COLOR_HEADER)running frontend quality checks...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run check
	@echo "$(COLOR_DONE)frontend quality checks completed!$(COLOR_RESET)"

# deploy frontend to Cloudflare Pages
front.deploy:
	@echo "$(COLOR_HEADER)deploying frontend...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run deploy
	@echo "$(COLOR_DONE)frontend deployed to Cloudflare Pages!$(COLOR_RESET)"

# format frontend code
front.fmt:
	@echo "$(COLOR_HEADER)formatting frontend code...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run fmt
	@echo "$(COLOR_DONE)frontend code formatting completed!$(COLOR_RESET)"

# run frontend tests
front.test:
	@echo "$(COLOR_HEADER)running frontend tests...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run test
	@echo "$(COLOR_DONE)frontend tests completed!$(COLOR_RESET)"

#
# backend tasks
#
.PHONY: back.check back.deploy back.fmt back.tail back.test

# run backend quality checks (type + format + lint)
back.check:
	@echo "$(COLOR_HEADER)running backend quality checks...$(COLOR_RESET)"
	@cd $(BACK_DIR) && deno task check
	@echo "$(COLOR_DONE)backend quality checks completed!$(COLOR_RESET)"

# deploy backend
back.deploy:
	@echo "$(COLOR_HEADER)deploying backend...$(COLOR_RESET)"
	@cd $(BACK_DIR) && deno task deploy
	@echo "$(COLOR_DONE)backend deployed (denoflare push)!$(COLOR_RESET)"

# format backend code
back.fmt:
	@echo "$(COLOR_HEADER)formatting backend code...$(COLOR_RESET)"
	@cd $(BACK_DIR) && deno task fmt
	@echo "$(COLOR_DONE)backend code formatting completed!$(COLOR_RESET)"

# tail prod backend logs
back.tail:
	@echo "$(COLOR_HEADER)tailing prod backend logs...$(COLOR_RESET)"
	@cd $(BACK_DIR) && \
	deno task tail

# run backend tests
back.test:
	@echo "$(COLOR_HEADER)running backend tests...$(COLOR_RESET)"
	@cd $(BACK_DIR) && deno task test
	@echo "$(COLOR_DONE)backend tests completed!$(COLOR_RESET)"

#
# deployment targets
#
.PHONY: deploy.front deploy.back

# build frontend (uses package.json "build" script)
deploy.front:
	@echo "$(COLOR_HEADER)building frontend...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && \
	if command -v pnpm >/dev/null 2>&1; then \
		PACKAGE_MANAGER="pnpm"; \
	else \
		PACKAGE_MANAGER="npx pnpm"; \
	fi && \
	$$PACKAGE_MANAGER install && \
	$$PACKAGE_MANAGER run build
	@echo "$(COLOR_DONE)frontend built (astro build)!$(COLOR_RESET)"

# deploy backend (uses deno.json "deploy" task)
deploy.back:
	@echo "$(COLOR_HEADER)deploying backend...$(COLOR_RESET)"
	@cd $(BACK_DIR) && \
	deno task deploy
	@echo "$(COLOR_DONE)backend deployed (denoflare push)!$(COLOR_RESET)"

#
# universal targets
#
.PHONY: all clean help

# all runs help
all: help

# clean removes build artifacts and temporary files
clean:
	@echo "$(COLOR_TITLE)cleaning build artifacts...$(COLOR_RESET)"
	@echo ""
	rm -rf $(FRONT_DIR)/dist
	rm -rf $(FRONT_DIR)/.astro
	rm -rf $(BACK_DIR)/dist
	rm -f $(FRONT_PID_FILE)
	rm -f $(BACK_PID_FILE)
	@echo "$(COLOR_DONE)clean done!$(COLOR_RESET)"

# help shows available targets
help:
	@echo "  $(COLOR_TITLE)yanoPortfolio - development commands$(COLOR_RESET)"
	@echo ""
	@echo "    $(COLOR_HEADER)[development]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)dev.start$(COLOR_RESET)       - start both backend and frontend servers"
	@echo "      $(COLOR_CMD)dev.stop$(COLOR_RESET)        - stop both backend and frontend servers"
	@echo "      $(COLOR_CMD)dev.back.start$(COLOR_RESET)  - start backend server (denoflare)"
	@echo "      $(COLOR_CMD)dev.back.stop$(COLOR_RESET)   - stop backend server"
	@echo "      $(COLOR_CMD)dev.front.start$(COLOR_RESET) - start frontend server (astro)"
	@echo "      $(COLOR_CMD)dev.front.stop$(COLOR_RESET)  - stop frontend server"
	@echo "      $(COLOR_CMD)dev.check$(COLOR_RESET)       - comprehensive environment check"
	@echo "      $(COLOR_CMD)dev.health$(COLOR_RESET)      - health check for running services"
	@echo "      $(COLOR_CMD)dev.status$(COLOR_RESET)      - show development server status"
	@echo ""
	@echo "    $(COLOR_HEADER)[frontend]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)front.build$(COLOR_RESET)     - build frontend code"
	@echo "      $(COLOR_CMD)front.check$(COLOR_RESET)     - run frontend quality checks (astro + format)"
	@echo "      $(COLOR_CMD)front.deploy$(COLOR_RESET)    - deploy frontend to Cloudflare Pages"
	@echo "      $(COLOR_CMD)front.fmt$(COLOR_RESET)       - format frontend code"
	@echo "      $(COLOR_CMD)front.test$(COLOR_RESET)      - run frontend tests"
	@echo ""
	@echo "    $(COLOR_HEADER)[backend]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)back.check$(COLOR_RESET)      - run backend quality checks (type + format + lint)"
	@echo "      $(COLOR_CMD)back.deploy$(COLOR_RESET)     - deploy backend to Cloudflare Workers"
	@echo "      $(COLOR_CMD)back.fmt$(COLOR_RESET)        - format backend code"
	@echo "      $(COLOR_CMD)back.tail$(COLOR_RESET)       - tail prod backend logs"
	@echo "      $(COLOR_CMD)back.test$(COLOR_RESET)       - run backend tests"
	@echo ""
	@echo "    $(COLOR_HEADER)[universal]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)all$(COLOR_RESET)             - show this help message [alias for help]"
	@echo "      $(COLOR_CMD)clean$(COLOR_RESET)           - remove build artifacts and temporary files"
	@echo "      $(COLOR_CMD)help$(COLOR_RESET)            - show this help message"
	@echo ""
	@echo "    $(COLOR_HEADER)[deployment]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)deploy.front$(COLOR_RESET)    - build frontend only (astro build)"
	@echo "      $(COLOR_CMD)deploy.back$(COLOR_RESET)     - deploy backend only (deno task deploy)"
