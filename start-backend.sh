#!/bin/bash

# Quick Start Script for Calisthenics AI Backend
# This script sets up and starts the backend server

set -e  # Exit on error

echo "🏋️  Calisthenics AI - Backend Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Ollama is installed
echo -n "Checking Ollama installation... "
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}NOT FOUND${NC}"
    echo ""
    echo "Ollama is not installed. Please install it first:"
    echo "  macOS/Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  Windows: https://ollama.ai/download"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

# Check if Ollama is running
echo -n "Checking if Ollama is running... "
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${YELLOW}NOT RUNNING${NC}"
    echo "Starting Ollama..."
    ollama serve &
    sleep 3
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}Ollama started successfully${NC}"
    else
        echo -e "${RED}Failed to start Ollama${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}RUNNING${NC}"
fi

# Check if model is available
MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
echo -n "Checking for model $MODEL... "
if ! ollama list | grep -q "$MODEL"; then
    echo -e "${YELLOW}NOT FOUND${NC}"
    echo ""
    echo "Pulling model $MODEL (this may take a few minutes)..."
    ollama pull "$MODEL"
    echo -e "${GREEN}Model downloaded successfully${NC}"
else
    echo -e "${GREEN}FOUND${NC}"
fi

# Install Node.js dependencies
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}Dependencies installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=$MODEL
NODE_ENV=development
EOF
    echo -e "${GREEN}.env file created${NC}"
fi

echo ""
echo "===================================="
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Starting backend server..."
echo ""

# Start the server
npm start
