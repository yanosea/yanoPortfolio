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
DEV_FRONT_PORT := 3000
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
# serve targets
#
.PHONY: serve serve.stop back.serve back.serve.stop front.serve front.serve.stop

# start both backend and frontend servers locally
serve:
	@echo "$(COLOR_TITLE)starting development servers...$(COLOR_RESET)"
	@echo ""
	make back.serve
	@echo ""
	make front.serve
	@echo ""
	@echo "$(COLOR_DONE)all development servers started successfully!$(COLOR_RESET)"

# stop both backend and frontend servers locally
serve.stop:
	@echo "$(COLOR_TITLE)stopping development servers...$(COLOR_RESET)"
	@echo ""
	make back.serve.stop
	@echo ""
	make front.serve.stop
	@echo ""
	@echo "$(COLOR_DONE)all development servers stopped successfully!$(COLOR_RESET)"

# start backend server locally
back.serve:
	@set -e; \
	if [ -e $(BACK_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)backend server is already running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	cd $(BACK_DIR) && \
	echo "$(COLOR_HEADER)starting backend server...$(COLOR_RESET)" && \
	deno task serve > /dev/null 2>&1 & \
	echo "$(COLOR_HEADER)waiting for backend server to start...$(COLOR_RESET)" && \
	for i in {1..60}; do \
		sleep 1; \
		SERVER_PID=$$(lsof -i:$(DEV_BACK_PORT) -t 2>/dev/null | head -1); \
		if [ -n "$$SERVER_PID" ]; then \
			break; \
		fi; \
		if [ $$i -eq 60 ]; then \
			echo "$(COLOR_ERROR)timeout: backend server failed to start within 60 seconds...$(COLOR_RESET)"; \
			exit 1; \
		fi; \
	done; \
	echo $$SERVER_PID > $(BACK_PID_FILE) && \
	echo "$(COLOR_DONE)backend server started on port $(DEV_BACK_PORT) (PID: $$SERVER_PID)!$(COLOR_RESET)"

# stop local backend server
back.serve.stop:
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
front.serve:
	@set -e; \
	if [ -e $(FRONT_PID_FILE) ]; then \
		echo "$(COLOR_ERROR)frontend server is already running...$(COLOR_RESET)"; \
		exit 1; \
	fi; \
	cd $(FRONT_DIR) && \
	echo "$(COLOR_HEADER)starting frontend server...$(COLOR_RESET)" && \
	deno task lume -s --port $(DEV_FRONT_PORT) > /dev/null 2>&1 & \
	echo "$(COLOR_HEADER)waiting for frontend server to start...$(COLOR_RESET)" && \
	for i in {1..60}; do \
		sleep 1; \
		SERVER_PID=$$(lsof -i:$(DEV_FRONT_PORT) -t 2>/dev/null | head -1); \
		if [ -n "$$SERVER_PID" ]; then \
			break; \
		fi; \
		if [ $$i -eq 60 ]; then \
			echo "$(COLOR_ERROR)timeout: frontend server failed to start within 60 seconds...$(COLOR_RESET)"; \
			exit 1; \
		fi; \
	done; \
	echo $$SERVER_PID > $(FRONT_PID_FILE) && \
	echo "$(COLOR_DONE)frontend server started on port $(DEV_FRONT_PORT) (PID: $$SERVER_PID)!$(COLOR_RESET)"

# stop local frontend server
front.serve.stop:
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

#
# frontend tasks
#
.PHONY: front.check front.deploy front.fmt front.test

# run frontend quality checks
front.check:
	@echo "$(COLOR_HEADER)running frontend quality checks...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && deno task check
	@echo "$(COLOR_DONE)frontend quality checks completed!$(COLOR_RESET)"

# deploy frontend to Cloudflare Pages
front.deploy:
	@echo "$(COLOR_HEADER)deploying frontend...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && deno task deploy
	@echo "$(COLOR_DONE)frontend deployed to Cloudflare Pages!$(COLOR_RESET)"

# format frontend code
front.fmt:
	@echo "$(COLOR_HEADER)formatting frontend code...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && deno task fmt
	@echo "$(COLOR_DONE)frontend code formatting completed!$(COLOR_RESET)"

# run frontend tests
front.test:
	@echo "$(COLOR_HEADER)running frontend tests...$(COLOR_RESET)"
	@cd $(FRONT_DIR) && deno task test
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
# documentation tasks
#
.PHONY: docs.diagram

# generate architecture diagram
docs.diagram:
	@echo "$(COLOR_HEADER)generating architecture diagram...$(COLOR_RESET)"
	@mmdc -i docs/architecture.mmd -o docs/architecture.svg -c docs/mermaid-config.json
	@echo "$(COLOR_DONE)architecture diagram generated!$(COLOR_RESET)"

#
# universal targets
#
.PHONY: all clean help test

# all runs help
all: help

# clean removes build artifacts and temporary files
clean:
	@echo "$(COLOR_TITLE)cleaning build artifacts...$(COLOR_RESET)"
	@echo ""
	rm -rf $(FRONT_DIR)/node_modules
	rm -rf $(FRONT_DIR)/_cache
	rm -rf $(FRONT_DIR)/_site
	rm -f $(FRONT_PID_FILE)
	rm -f $(BACK_PID_FILE)
	@echo "$(COLOR_DONE)clean done!$(COLOR_RESET)"

# help shows available targets
help:
	@echo "  $(COLOR_TITLE)yanoPortfolio - development commands$(COLOR_RESET)"
	@echo ""
	@echo "    $(COLOR_HEADER)[serve]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)serve$(COLOR_RESET)           - start both backend and frontend servers"
	@echo "      $(COLOR_CMD)serve.stop$(COLOR_RESET)      - stop both backend and frontend servers"
	@echo ""
	@echo "    $(COLOR_HEADER)[frontend]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)front.serve$(COLOR_RESET)     - start frontend server (lume)"
	@echo "      $(COLOR_CMD)front.serve.stop$(COLOR_RESET) - stop frontend server"
	@echo "      $(COLOR_CMD)front.check$(COLOR_RESET)     - run frontend quality checks (lume + format)"
	@echo "      $(COLOR_CMD)front.deploy$(COLOR_RESET)    - deploy frontend to Cloudflare Pages"
	@echo "      $(COLOR_CMD)front.fmt$(COLOR_RESET)       - format frontend code"
	@echo "      $(COLOR_CMD)front.test$(COLOR_RESET)      - run frontend tests"
	@echo ""
	@echo "    $(COLOR_HEADER)[backend]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)back.serve$(COLOR_RESET)      - start backend server (denoflare)"
	@echo "      $(COLOR_CMD)back.serve.stop$(COLOR_RESET) - stop backend server"
	@echo "      $(COLOR_CMD)back.check$(COLOR_RESET)      - run backend quality checks (type + format + lint)"
	@echo "      $(COLOR_CMD)back.deploy$(COLOR_RESET)     - deploy backend to Cloudflare Workers"
	@echo "      $(COLOR_CMD)back.fmt$(COLOR_RESET)        - format backend code"
	@echo "      $(COLOR_CMD)back.tail$(COLOR_RESET)       - tail prod backend logs"
	@echo "      $(COLOR_CMD)back.test$(COLOR_RESET)       - run backend tests"
	@echo ""
	@echo "    $(COLOR_HEADER)[documentation]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)docs.diagram$(COLOR_RESET)    - generate architecture diagram (SVG from Mermaid)"
	@echo ""
	@echo "    $(COLOR_HEADER)[universal]$(COLOR_RESET)"
	@echo "      $(COLOR_CMD)all$(COLOR_RESET)             - show this help message [alias for help]"
	@echo "      $(COLOR_CMD)clean$(COLOR_RESET)           - remove build artifacts and temporary files"
	@echo "      $(COLOR_CMD)help$(COLOR_RESET)            - show this help message"
	@echo "      $(COLOR_CMD)test$(COLOR_RESET)            - run all tests"

# run all tests
test: back.test front.test
