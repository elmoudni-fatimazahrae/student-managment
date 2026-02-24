#!/bin/bash
# Complete setup and deployment script for Student Management System
# For Unix/MacOS/Linux systems

set -e

PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TASK=${1:-full}

echo "========================================="
echo "Student Management System Setup Script"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

check_requirements() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed!${NC}"
        echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed!${NC}"
        echo -e "${YELLOW}Please install Git from: https://git-scm.com/${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    GIT_VERSION=$(git --version)
    
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
    echo -e "${GREEN}✅ Git ${GIT_VERSION}${NC}"
    echo ""
}

setup_project() {
    echo -e "${YELLOW}Setting up project...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Install dependencies
    echo -e "${CYAN}Installing dependencies...${NC}"
    npm install
    
    # Initialize Git
    echo -e "${CYAN}Initializing Git repository...${NC}"
    git init
    git config user.email "f.elmoudni@esisa.ac.ma"
    git config user.name "Student Management"
    git add .
    git commit -m "Initial commit: Complete student management system with Next.js, SQLite, and NextAuth"
    
    echo -e "${GREEN}✅ Git repository initialized${NC}"
    
    # Initialize database
    echo -e "${CYAN}Initializing database...${NC}"
    npm run db:init
    
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
}

start_dev() {
    echo -e "${YELLOW}Starting development server...${NC}"
    echo -e "${CYAN}Application will be available at: http://localhost:3000${NC}"
    echo ""
    echo -e "${CYAN}Login credentials:${NC}"
    echo -e "  Email: ${YELLOW}admin@example.com${NC}"
    echo -e "  Password: ${YELLOW}password123${NC}"
    echo ""
    
    cd "$PROJECT_DIR"
    npm run dev
}

build_project() {
    echo -e "${YELLOW}Building project for production...${NC}"
    
    cd "$PROJECT_DIR"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful!${NC}"
        echo -e "${CYAN}To start production server, run: npm start${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

deploy_vercel() {
    echo -e "${YELLOW}Preparing for Vercel deployment...${NC}"
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${CYAN}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Push to GitHub
    echo -e "${CYAN}Pushing code to GitHub...${NC}"
    echo ""
    echo -e "${YELLOW}Make sure you have:${NC}"
    echo -e "  1. Created a GitHub repository at: https://github.com/elmoudni-fatimazahrae/student-managment${NC}"
    echo -e "  2. Set up your GitHub credentials${NC}"
    echo ""
    
    cd "$PROJECT_DIR"
    
    if ! git remote get-url origin &> /dev/null; then
        git remote add origin https://github.com/elmoudni-fatimazahrae/student-managment.git
    fi
    
    git status
    
    echo ""
    read -p "Ready to push to GitHub? (yes/no): " response
    
    if [ "$response" = "yes" ]; then
        git branch -M main
        git push -u origin main
        echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
    fi
    
    # Deploy to Vercel
    echo ""
    echo -e "${YELLOW}Starting Vercel deployment...${NC}"
    vercel
}

run_full_setup() {
    check_requirements
    setup_project
    
    echo -e "${CYAN}Setup complete! What would you like to do next?${NC}"
    echo -e "${YELLOW}1. Start development server${NC}"
    echo -e "${YELLOW}2. Build for production${NC}"
    echo -e "${YELLOW}3. Deploy to Vercel${NC}"
    echo -e "${YELLOW}4. Nothing, I'll do it myself${NC}"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1) start_dev ;;
        2) build_project ;;
        3) deploy_vercel ;;
        4) echo -e "${GREEN}Goodbye!${NC}" ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
}

# Main execution
case $TASK in
    setup)
        check_requirements
        setup_project
        ;;
    dev)
        check_requirements
        start_dev
        ;;
    build)
        check_requirements
        build_project
        ;;
    deploy)
        check_requirements
        deploy_vercel
        ;;
    full|*)
        run_full_setup
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
