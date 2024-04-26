     
# Nodejs and Express example with MongoDB

Blog/posts application demo CRUD with node backend

## Run the System
```bash
cd backend && docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
or without docker:

```bash
cd backend && npm install && npm run dev
```

# Working with docker compose

The docker commands translates to the given docker file:

```bash
docker compose up -d --build  # where -d is detached mode
# Allowing dev file to override default dockerfile
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build  # where -d is detached mode
docker compose down -v # where -v removes associated volumes (dont use -v if you using a db volume)
```
- This command does build image and run container
- name convention for image name: `foldername_name-of-service`
- `--build` flag // because only looks for image name so changes to dockerfile and or package wont rebuild image  k
- `-f` flag allows dev/prod (last) file to override default (initial) dockerfile
- dev file allows hot-reloading but prod doesnt (will need `--build` flag is you need to merge any changes)



# Working with docker commands

```bash
# build
docker build . # build current directory
docker build -t node-app-image . # build with specific tag

docker image ls # view all
docker image rm {id} -f # delete image with id, -f=force (w/out stoping it)
                        # must run when package.json is changed
                        # also must run if changes to Dockerfile
                        # instead -fv to also remove related volumes

# run 
docker run -d --name node-app node-app-image # -d=detached mode
docker ps # to view all running containers
docker rm node-app -f # must remove before rebuild the image
docker logs node-app 
```

## Docker command to run above container
```bash
docker run -p 3000:3000 -d --name node-app node-app-image
# -p 3000:3000 = host machine entry port:container entry port

# with hot-reload use bind-mount (see Development hot-reload section)
docker run -p 3000:3000 -v $(pwd):/app -d --name node-app node-app-image

# to unsync node_modules (see Development hot-reload section)
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules -d --name node-app node-app-image

```
## Final docker command
-  (we will transport this to docker-compose)

```bash
docker run 
  -v $(pwd):/app:ro 
  -v /app/node_modules
  # --env PORT=3000 // you can override default PORT as stated in Dockerfile 
  --env-file= ./.env # (or just use .env file)
  -p 3000:3000 
  -d 
  --name node-app 
  node-app-image

```

## How to log into container (eg. to view files) 
-  Make sure no unnecessary files (use dockerignore)
```bash
docker exec -it node-app bash
ls # view files
cat app.js # to view contents of file
printenv # allows to print all env variables in container
exit
```
## dockerignore
- Dockerfile does build image so Dockerfile doesnt need to be in the container.
- Also dont need to copy node_modules folder, we will move away from having a node_modules in our machine.
- .dockerignore doesnt need to be on the container as well

## Development hot-reload
- Use volumes (bind-mount) allows to sync folder in 
  machine or file system to folder in docker dontainer

- Bind mount in docker command:

```bash
docker exec -it backend-mongo-1 bash # where 'path-to-folder-in-local-machine' : 'path-to-folder-in-container'
```

```
- We need a anonimous-volume so we can unsync out local node_modules 
  (we want to be able to remove it from local but for it to stay on the container)
  Use another -v flag

```bash
docker run -v $(pwd):/app -v /app/node_modules   ....rest of flags
```
- this volume is more specific and allows to override the anterior bind-mount
so node_modules wont be touch!

## Docker container should be read-only
```bash
docker run -v $(pwd):/app:ro    # then rest of params

# where ro means changes to container wont affect local files/code

```

## env file
- The flag -env can pass env variables to the container but you can as well
write then out in an .env file. (pass the --env-file flag to docker command)

```bash
docker run  --env-file= ./.env (or just use .env file)   ....rest of flags
```

## Login into mongo DB instance

```bash
docker exec -it backend-mongo-1 mongosh -u root -p mypassword

```
```bash
  test> db # shows all dbs
  test
  test> use mydb # create new db
  switched to db mydb
  mydb> show dbs # doesnt show db since there is nothing in it
  admin   100.00 KiB
  config   12.00 KiB
  local    72.00 KiB
  mydb> db.books.insert({"name": "harry potter"}) # inserting record on it
  mydb> db.books.find()
  [ { _id: ObjectId('662a61a6ddd232fdb43b9274'), name: 'harry potter' } ]
  mydb> show dbs # now shows db
  admin   100.00 KiB
  config   12.00 KiB
  local    72.00 KiB
  mydb     40.00 KiB
  mydb> exit

```

- Note that tearing the container down with -v flag will also remove the volume - all the db data will disappear.
- We use a volume to persist data
- When tearing down dont use the `-v flag`

## Finding out the ip adress of mongo_db container

```bash
docker ps # to get container name
docker inspect backend-node-app-1 
```
- But instead of the commands above you can use the name of the service instead,
docker already sets it up for you. So use `ip-address=name-of-mongo-service` when connecting to mongoose.

- To know if mongoose has connected correctly you can ping it
 - See (https://www.mongodb.com/docs/manual/reference/command/ping/)

```bash
 docker exec -it backend-mongo-1 mongosh
db.runCommand({ ping: 1 })
{ ok: 1 } # correct response
```