# We use Node image as base to build our own
FROM node:20

# Working directory in the containertaht will be done
WORKDIR /app

# dot means current directory in container (/app)
# Helps cache build step unless this package.json changes (instead of any change anywhere)
COPY package.json .

# THis argument needs to be passed in to be used bellow
# You must set this value in the docker-compose file
# (It gets passed to Dockerfile when is building the docker image)
ARG NODE_ENV

# Builds the app in container (dev versus prod)
# if brackets must have space on either side!!!
RUN if [ "$NODE_ENV" = "development" ]; \
  then npm install; \
  else npm install --only=production;\
  fi

# Copies all in current directory
COPY . ./

# Using env variable in dockerfile
ENV PORT=3000

# This line doesnt do anything - only for documentation purposes
EXPOSE ${PORT}

# command to run on container
CMD [ "node", "app.js"]
