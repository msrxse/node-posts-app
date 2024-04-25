     
# Nodejs and Express example with MongoDB

## Run the System

```bash
cd backend && node app.js
```

# Working with docker compose

The docker commands translates to the given docker file:

```bash
docker compose up -d --build  // where -d is detached mode
docker compose down -v // where -v removes associated volmnes
```
- This command does build image and run container
- name convention for image name: `foldername_name-of-service`
- `--build` flag // because only looks for image name so changes to dockerfile and or package wont rebuild image  k


# Working with docker commands

```bash
// build
docker build . // build current directory
docker build -t node-app-image . // build with specific tag

docker image ls // view all
docker image rm {id} -f // delete image with id, -f=force (w/out stoping it)
                        // must run when package.json is changed
                        // also must run if changes to Dockerfile
                        // instead -fv to also remove related volumes

// run 
docker run -d --name node-app node-app-image // -d=detached mode
docker ps // to view all running containers
docker rm node-app -f // must remove before rebuild the image
docker logs node-app 
```

## Docker command to run above container
```bash
docker run -p 3000:3000 -d --name node-app node-app-image
// -p 3000:3000 = host machine entry port:container entry port

// with hot-reload use bind-mount (see Development hot-reload section)
docker run -p 3000:3000 -v $(pwd):/app -d --name node-app node-app-image

// to unsync node_modules (see Development hot-reload section)
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules -d --name node-app node-app-image

```
## Final docker command
-  (we will transport this to docker-compose)

```bash
docker run 
  -v $(pwd):/app:ro 
  -v /app/node_modules
  # --env PORT=3000 // you can override default PORT as stated in Dockerfile 
  --env-file= ./.env (or just use .env file)
  -p 3000:3000 
  -d 
  --name node-app 
  node-app-image

```

## How to log into container (eg. to view files) 
-  Make sure no unnecessary files (use dockerignore)
```bash
docker exec -it node-app bash
ls // view files
cat app.js // to view contents of file
printenv // allows to print all env variables in container
exit // to
```
## dockerignore
- Dockerfile does build image so Dockerfile doesnt need to be in the container.
- Also dont need to copy node_modules folder, we will move away from having a node_modules in our machine.
- .dockerignore doesnt need to be there as well

## Development hot-reload
- Use volumes (bind-mount) allows to sync folder in 
  machine or file system to folder in docker dontainer

- Bind mount in docker command:

```bash
docker run -v $(pwd):/app    // then rest of params

// where 'path-to-folder-in-local-machine' : 'path-to-folder-in-container'

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
docker run -v $(pwd):/app:ro    // then rest of params

// where ro means changes to container wont affect local files/code

```

## env file
- The flag -env can pass env variables to the container but you can as well
write then out in an .env file. (pass the --env-file flag to docker command)

```bash
docker run  --env-file= ./.env (or just use .env file)   ....rest of flags
```