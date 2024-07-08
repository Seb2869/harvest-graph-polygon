#!/bin/bash

if [ -f .env ]; then
  export $(cat .env | xargs)
fi

DEPLOY_STUDIO_CMD=$(grep '"deploy-studio":' package.json | sed 's/.*deploy-studio": "\(.*\)".*/\1/')

VERSION=$(echo $DEPLOY_STUDIO_CMD | awk -F'--studio -l ' '{print $2}' | awk '{print $1}')
NAME=$(echo $DEPLOY_STUDIO_CMD | awk -F'--studio -l [^ ]* ' '{print $2}' | awk '{print $1}')

COMMIT=$(git log -1 --pretty=%B)

echo "VERSION: $VERSION"
echo "NAME: $NAME"
echo "COMMIT: $COMMIT"


URL=$DEPLOY_URL
echo "URL: $URL"

HEADER="Content-Type: application/json"

DATA=$(cat <<EOF
{
    "name": "$NAME",
    "version": "$VERSION",
    "commit": "$COMMIT"
}
EOF
)

curl --location "$URL/deploy" \
--header "$HEADER" \
--data "$DATA"