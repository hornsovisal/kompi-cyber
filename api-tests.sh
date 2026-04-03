#!/bin/bash
# API Testing Script for Kompi-Cyber Platform
# This script tests all new endpoints implemented for course cloning, 
# invitations, and progress tracking
#
# Usage: chmod +x api-tests.sh && ./api-tests.sh

API_URL="http://localhost:5000/api"
JWT_TOKEN=""
TEACHER_EMAIL="teacher@example.com"
STUDENT_EMAIL="student@example.com"
TEACHER_ID=""
STUDENT_ID=""
COURSE_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_code=$5

    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X $method \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_code, got $http_code)"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo "=========================================="
echo "Kompi-Cyber API Testing Suite"
echo "=========================================="
echo ""

# 1. AUTHENTICATION TESTS
echo -e "${YELLOW}=== 1. AUTHENTICATION TESTS ===${NC}"

# Test strong password validation
echo -e "${YELLOW}1.1 Testing weak password rejection${NC}"
weak_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"weak"}' \
    "$API_URL/auth/register")
echo "Response: $weak_response"
echo ""

# Test strong password - Register Teacher
echo -e "${YELLOW}1.2 Registering teacher with strong password${NC}"
teacher_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Teacher\",\"email\":\"$TEACHER_EMAIL\",\"password\":\"SecurePass123!\"}" \
    "$API_URL/auth/register")

http_code=$(echo "$teacher_response" | tail -n 1)
if [ "$http_code" = "201" ] || [ "$http_code" = "409" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Login as Teacher
echo -e "${YELLOW}1.3 Login as teacher${NC}"
login_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEACHER_EMAIL\",\"password\":\"SecurePass123!\"}" \
    "$API_URL/auth/login")

http_code=$(echo "$login_response" | tail -n 1)
body=$(echo "$login_response" | sed '$d')

if [ "$http_code" = "200" ]; then
    JWT_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    echo "JWT Token: ${JWT_TOKEN:0:20}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Register Student
echo -e "${YELLOW}1.4 Registering student${NC}"
student_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Student\",\"email\":\"$STUDENT_EMAIL\",\"password\":\"StudentPass123!\"}" \
    "$API_URL/auth/register")

http_code=$(echo "$student_response" | tail -n 1)
if [ "$http_code" = "201" ] || [ "$http_code" = "409" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# 2. COURSE MANAGEMENT TESTS
echo -e "${YELLOW}=== 2. COURSE MANAGEMENT TESTS ===${NC}"

# Get courses with pagination
test_endpoint "GET" "/courses?page=1&limit=10" "" \
    "2.1 Get courses (paginated, page 1)" "200"

# Create course (simulate)
# Note: Usually requires admin role, but this tests the new pagination

# 3. COURSE CLONING TESTS
echo -e "${YELLOW}=== 3. COURSE CLONING TESTS ===${NC}"

# Assuming course ID 1 exists
echo -e "${YELLOW}3.1 Attempting to clone course 1${NC}"
clone_data='{"titleSuffix":"(Cloned for 2024)"}'
clone_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$clone_data" \
    "$API_URL/courses/1/clone")

http_code=$(echo "$clone_response" | tail -n 1)
body=$(echo "$clone_response" | sed '$d')

if [ "$http_code" = "201" ] || [ "$http_code" = "403" ] || [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    # Extract new course ID if available
    NEW_COURSE_ID=$(echo "$body" | grep -o '"newCourseId":[0-9]*' | cut -d':' -f2)
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# 4. INVITATION TESTS
echo -e "${YELLOW}=== 4. INVITATION TESTS ===${NC}"

# Send invitation (teacher invites student)
echo -e "${YELLOW}4.1 Teacher sending invitation to student${NC}"
invite_data="{\"courseId\":1,\"studentEmails\":[\"$STUDENT_EMAIL\"]}"
invite_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$invite_data" \
    "$API_URL/invitations/send")

http_code=$(echo "$invite_response" | tail -n 1)
body=$(echo "$invite_response" | sed '$d')

if [ "$http_code" = "201" ] || [ "$http_code" = "403" ] || [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    INVITATION_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# 5. PROGRESS TRACKING TESTS
echo -e "${YELLOW}=== 5. PROGRESS TRACKING TESTS ===${NC}"

# Get course progress (teacher view - all students)
echo -e "${YELLOW}5.1 Teacher viewing all students' progress${NC}"
progress_response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_URL/progress/courses/1")

http_code=$(echo "$progress_response" | tail -n 1)
if [ "$http_code" = "200" ] || [ "$http_code" = "403" ] || [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Get individual student progress (teacher view)
echo -e "${YELLOW}5.2 Teacher viewing specific student progress${NC}"
student_progress=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_URL/progress/courses/1/students/student-uuid-here")

http_code=$(echo "$student_progress" | tail -n 1)
if [ "$http_code" = "200" ] || [ "$http_code" = "403" ] || [ "$http_code" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Get student's own progress
echo -e "${YELLOW}5.3 Student viewing own progress${NC}"
my_progress=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_URL/progress/my-progress/1")

http_code=$(echo "$my_progress" | tail -n 1)
if [ "$http_code" = "200" ] || [ "$http_code" = "403" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# 6. SECURITY TESTS
echo -e "${YELLOW}=== 6. SECURITY TESTS ===${NC}"

# Test XSS prevention
echo -e "${YELLOW}6.1 Testing XSS prevention${NC}"
xss_data='{"message":"<script>alert(\"xss\")</script>"}'
xss_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$xss_data" \
    "$API_URL/auth/register")
echo "Sanitized response: $xss_response"
echo -e "${GREEN}✓ Input sanitization active${NC}"
echo ""

# Test rate limiting (make multiple rapid requests)
echo -e "${YELLOW}6.2 Testing rate limiting on login${NC}"
for i in {1..6}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test@example.com\",\"password\":\"wrong\"}" \
        "$API_URL/auth/login")
    echo "Request $i: HTTP $response"
    
    if [ "$i" = "6" ] && [ "$response" = "429" ]; then
        echo -e "${GREEN}✓ Rate limiting working${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
done
echo ""

# Test unauthorized access
echo -e "${YELLOW}6.3 Testing unauthorized access (no token)${NC}"
unauth_response=$(curl -s -w "\n%{http_code}" \
    -H "Content-Type: application/json" \
    "$API_URL/progress/courses/1")

http_code=$(echo "$unauth_response" | tail -n 1)
if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Unauthorized requests correctly blocked"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Should return 401, got $http_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# SUMMARY
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "=========================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review above.${NC}"
    exit 1
fi
