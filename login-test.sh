#!/bin/bash
# Quick Login Test Script
# This script demonstrates how to login as different roles
# Usage: chmod +x login-test.sh && ./login-test.sh

API_URL="http://localhost:5000/api"

echo "=========================================="
echo "Kompi-Cyber Login Test Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Login as STUDENT
echo -e "${BLUE}Test 1: Login as STUDENT${NC}"
echo -e "${YELLOW}Email: student@kompi-cyber.local${NC}"
echo -e "${YELLOW}Password: StudentPass123!${NC}"
echo ""

STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@kompi-cyber.local",
    "password": "StudentPass123!"
  }')

echo "Response:"
echo "$STUDENT_RESPONSE" | jq '.'
STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | jq -r '.token' 2>/dev/null)
STUDENT_ROLE=$(echo "$STUDENT_RESPONSE" | jq -r '.user.roleId' 2>/dev/null)
echo -e "${GREEN}Token: ${STUDENT_TOKEN:0:30}...${NC}"
echo -e "${GREEN}Role ID: $STUDENT_ROLE${NC}"
echo ""

# Test 2: Login as TEACHER
echo -e "${BLUE}Test 2: Login as TEACHER${NC}"
echo -e "${YELLOW}Email: teacher@kompi-cyber.local${NC}"
echo -e "${YELLOW}Password: TeacherPass123!${NC}"
echo ""

TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@kompi-cyber.local",
    "password": "TeacherPass123!"
  }')

echo "Response:"
echo "$TEACHER_RESPONSE" | jq '.'
TEACHER_TOKEN=$(echo "$TEACHER_RESPONSE" | jq -r '.token' 2>/dev/null)
TEACHER_ROLE=$(echo "$TEACHER_RESPONSE" | jq -r '.user.roleId' 2>/dev/null)
echo -e "${GREEN}Token: ${TEACHER_TOKEN:0:30}...${NC}"
echo -e "${GREEN}Role ID: $TEACHER_ROLE${NC}"
echo ""

# Test 3: Login as COORDINATOR
echo -e "${BLUE}Test 3: Login as COORDINATOR${NC}"
echo -e "${YELLOW}Email: coordinator@kompi-cyber.local${NC}"
echo -e "${YELLOW}Password: CoordinatorPass123!${NC}"
echo ""

COORD_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@kompi-cyber.local",
    "password": "CoordinatorPass123!"
  }')

echo "Response:"
echo "$COORD_RESPONSE" | jq '.'
COORD_TOKEN=$(echo "$COORD_RESPONSE" | jq -r '.token' 2>/dev/null)
COORD_ROLE=$(echo "$COORD_RESPONSE" | jq -r '.user.roleId' 2>/dev/null)
echo -e "${GREEN}Token: ${COORD_TOKEN:0:30}...${NC}"
echo -e "${GREEN}Role ID: $COORD_ROLE${NC}"
echo ""

# Test 4: Login as ADMIN
echo -e "${BLUE}Test 4: Login as ADMIN${NC}"
echo -e "${YELLOW}Email: admin@kompi-cyber.local${NC}"
echo -e "${YELLOW}Password: AdminPass123!${NC}"
echo ""

ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kompi-cyber.local",
    "password": "AdminPass123!"
  }')

echo "Response:"
echo "$ADMIN_RESPONSE" | jq '.'
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token' 2>/dev/null)
ADMIN_ROLE=$(echo "$ADMIN_RESPONSE" | jq -r '.user.roleId' 2>/dev/null)
echo -e "${GREEN}Token: ${ADMIN_TOKEN:0:30}...${NC}"
echo -e "${GREEN}Role ID: $ADMIN_ROLE${NC}"
echo ""

# Test 5: Test teacher-only access (clone course)
if [ ! -z "$TEACHER_TOKEN" ] && [ "$TEACHER_TOKEN" != "null" ]; then
  echo -e "${BLUE}Test 5: Teacher cloning course (requireTeacherOnly)${NC}"
  CLONE_RESPONSE=$(curl -s -X POST "$API_URL/courses/1/clone" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"titleSuffix": "(Test Clone)"}')
  echo "Response:"
  echo "$CLONE_RESPONSE" | jq '.'
  echo ""
fi

# Test 6: Test coordinator access
if [ ! -z "$COORD_TOKEN" ] && [ "$COORD_TOKEN" != "null" ]; then
  echo -e "${BLUE}Test 6: Coordinator accessing progress endpoint${NC}"
  PROGRESS_RESPONSE=$(curl -s -X GET "$API_URL/progress/courses/1" \
    -H "Authorization: Bearer $COORD_TOKEN")
  echo "Response:"
  echo "$PROGRESS_RESPONSE" | jq '.' 2>/dev/null || echo "$PROGRESS_RESPONSE"
  echo ""
fi

echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo -e "${GREEN}✓ Student (Role 1): $STUDENT_ROLE${NC}"
echo -e "${GREEN}✓ Teacher (Role 2): $TEACHER_ROLE${NC}"
echo -e "${GREEN}✓ Coordinator (Role 4): $COORD_ROLE${NC}"
echo -e "${GREEN}✓ Admin (Role 3): $ADMIN_ROLE${NC}"
echo ""
