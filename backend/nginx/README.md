# Config with comments

```bash
server {
 listen: 80;

  # redirect traffic to our node container
  # filtered to /api calls, in the future you can add react app endpoints here as well
  location: /api {
    # Nginx will strip away a few details that we need back. Most are good practices
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;

    # Next we provide the url of servers you want to send traffic too
    # Because nginx is in a container it also have access to DNS from docker compose networks
    # Note that node-app is the service name which also has a DNS assocciated to
    proxy_pass http://node-app:3000;

    proxy_redirect off;
  }
}
```

# Scaling up node containers

- To handle increased in traffic, instead of allowing more ports in local machine we can add a load balancer. We will use Nginx.
- Nginx is a great web server as well.
- We will have a Nginx container and itwill be main entrance in our application so we no longert are going to publish any ports on out node instances.
- Instead we publish one port of out Nginx container, port 80.
- So port 3000 will be mapped to port 80, which is the default for Nginx
- Nginx then will act as a load balancer, so all requests will be balanced in between our 2 node instances. In general Nginx will be able to load balance all request to all of out node instances.
- This is a clearer solution because we will only need to publsh one port and it will scale very well

- On node-app we no longer need to publish any port:

```bash
  node-app:
    build: .
    # ports:
    #   - "3000:3000"
```

# How to get `default.conf` into the container

- We could do out own custom Nginx image that includes the conf file or we can just configure a volume (bind-mount) to just sync the 2 files.

# Scaling your application

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --scale node-app=2
```

- Now if you set a console.log() in one the the routes, then if you look at the logs of each node-app application instance and note that any new API call will toggle in between the 2 apps, logging out your console log. Basically load balancing any new request into the 2 application instances.
- To see logs grap ids of the node app instaces with `docker ps` then `docker logs {id-one} -f` and `docker logs {id-2} -f`. Adding for example a console.log() to the endpoint will show it runned into each instance aternatively.

# Accessing Nginx container

- You can verify if the Docker internal DNS is able to resolve the service names by connecting to the NGINX container and using the ping command.

```bash
docker exec -it backend-nginx-1 /bin/sh
ping node-app
  PING node-app (172.27.0.4): 56 data bytes
  64 bytes from 172.27.0.4: seq=0 ttl=64 time=0.154 ms
  ...
  --- node-app ping statistics ---
  10 packets transmitted, 10 packets received, 0% packet loss
  round-trip min/avg/max = 0.154/0.204/0.297 ms
 exit
```
