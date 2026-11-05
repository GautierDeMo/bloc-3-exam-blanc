#!/bin/bash
# Black-box test of the comments API
# Usage: bash server/tests/comments.api.test.sh   (override with API_URL=http://localhost:5031/api)
# Requires the API running and the blog_mysql_dev container (used for the CASCADE check and cleanup)
API=${API_URL:-http://localhost:5030/api}
JSON='Content-Type: application/json'

# Prints PASS or FAIL for one test case
#   $1 = test name
#   $2 = expected value
#   $3 = actual value
check() {
  if [ "$2" = "$3" ]; then echo "PASS  $1 -> $3"; else echo "FAIL  $1 -> expected $2, got $3"; fi
}

# Runs curl with the given arguments and prints only the HTTP status code (body discarded)
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

# --- Setup: two users, so we can check that B cannot touch A's comment ---

for user in a b; do
  curl -s -X POST "$API"/auth/register -H "$JSON" -d "{\"username\":\"test_$user\",\"email\":\"$user@test.fr\",\"password\":\"secret123\"}" > /dev/null
done
# Extract the "token" value from the JSON login response
TOKEN_USER_A=$(curl -s -X POST "$API"/auth/login -H "$JSON" -d '{"email":"a@test.fr","password":"secret123"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
TOKEN_USER_B=$(curl -s -X POST "$API"/auth/login -H "$JSON" -d '{"email":"b@test.fr","password":"secret123"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

# --- Creation: rejected requests ---

check "POST without token"            403 "$(code -X POST "$API"/articles/1/comments -H "$JSON" -d '{"content":"x"}')"
check "POST empty content"            400 "$(code -X POST "$API"/articles/1/comments -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":"   "}')"
check "POST numeric content"          400 "$(code -X POST "$API"/articles/1/comments -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":42}')"
check "POST on missing article 999"   404 "$(code -X POST "$API"/articles/999/comments -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":"x"}')"

# --- Creation: A posts a comment on article 1 (its id is extracted from the JSON response) ---

COMMENT_ID=$(curl -s -X POST "$API"/articles/1/comments -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":"comment by A"}' | sed -E 's/.*"id":([0-9]+).*/\1/')
echo "      created comment id=$COMMENT_ID on article 1"

# --- Reading: the comment only shows up on its own article ---

check "GET article 1 contains it"     yes "$(curl -s "$API"/articles/1/comments | grep -q "comment by A" && echo yes || echo no)"
check "GET article 2 does not"        no  "$(curl -s "$API"/articles/2/comments | grep -q "comment by A" && echo yes || echo no)"

# --- Attack: B is logged in but is not the author ---

check "PUT by B (not author)"         403 "$(code -X PUT "$API"/articles/1/comments/"$COMMENT_ID" -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_B" -d '{"content":"hacked"}')"
check "DELETE by B (not author)"      403 "$(code -X DELETE "$API"/articles/1/comments/"$COMMENT_ID" -H "Authorization: Bearer $TOKEN_USER_B")"

# --- Update by the author ---

# The comment belongs to article 1, so going through article 2's URL must fail
check "PUT through wrong article"     404 "$(code -X PUT "$API"/articles/2/comments/"$COMMENT_ID" -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":"x"}')"
check "PUT by A empty content"        400 "$(code -X PUT "$API"/articles/1/comments/"$COMMENT_ID" -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":""}')"
check "PUT by A"                      200 "$(code -X PUT "$API"/articles/1/comments/"$COMMENT_ID" -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_A" -d '{"content":"edited by A"}')"
check "GET shows edited content"      yes "$(curl -s "$API"/articles/1/comments | grep -q "edited by A" && echo yes || echo no)"

# --- Deletion by the author ---

check "DELETE by A"                   200 "$(code -X DELETE "$API"/articles/1/comments/"$COMMENT_ID" -H "Authorization: Bearer $TOKEN_USER_A")"
check "GET no longer has it"          no  "$(curl -s "$API"/articles/1/comments | grep -q "edited by A" && echo yes || echo no)"
check "DELETE again"                  404 "$(code -X DELETE "$API"/articles/1/comments/"$COMMENT_ID" -H "Authorization: Bearer $TOKEN_USER_A")"

# --- Cascade: comments disappear with their article ---

# -F sends multipart/form-data: the article route expects a form because of the image upload (multer)
ARTICLE_ID=$(curl -s -X POST "$API"/articles -H "Authorization: Bearer $TOKEN_USER_A" -F title=cascade-test -F content=body | sed -E 's/.*"id":([0-9]+).*/\1/')
curl -s -X POST "$API"/articles/"$ARTICLE_ID"/comments -H "$JSON" -H "Authorization: Bearer $TOKEN_USER_B" -d '{"content":"to be cascaded"}' > /dev/null
curl -s -X DELETE "$API"/articles/"$ARTICLE_ID" -H "Authorization: Bearer $TOKEN_USER_A" > /dev/null
# The article no longer exists in the API, so we count its comments directly in MySQL
check "CASCADE on article delete"     0 "$(docker exec blog_mysql_dev mysql -uroot blog_db -N -e "SELECT COUNT(*) FROM comments WHERE article_id=$ARTICLE_ID")"

# --- Cleanup: removing the test users cascades to their articles and comments ---

docker exec blog_mysql_dev mysql -uroot blog_db -e "DELETE FROM users WHERE email LIKE '%@test.fr'" 2>/dev/null
echo "      test users removed"
