#!/bin/bash
# CourseShare - Quick Start Script
# This script starts the application on Mac/Linux

echo ""
echo "========================================"
echo "  CourseShare - Starting Application"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed!"
echo ""

# Navigate to server directory
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "Starting CourseShare Server..."
echo ""
echo "========================================"
echo "  Server running on http://localhost:5000"
echo "========================================"
echo ""
echo "Opening browser... (please wait)"
sleep 2

# Try to open the browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5000
fi

# Start the server
npm start
