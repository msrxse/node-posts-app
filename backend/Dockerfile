# We use Node image as base to build our own
FROM node:20

# Working directory in the containertaht will be done
WORKDIR /app

# dot means current directory in container (/app)
# Helps cache build step unless this package.json changes (instead of any change anywhere)
COPY package.json .

# Builds the app in container
RUN npm install

# Copies all in current directory
COPY . ./

# Using env variable in dockerfile
ENV PORT=3000

# This line doesnt do anything - only for documentation purposes
EXPOSE ${PORT}

# command to run on container
CMD [ "npm", "run", "dev" ]
