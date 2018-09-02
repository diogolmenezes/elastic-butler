# ATENTION: Remember that before run butler in containers you need 
# edit config/env.json to include mongodb url

sudo rm -rf tmp/pids/server.pid
docker-compose -f ./docker-compose.yml up -d --build