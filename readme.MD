To build docker:
docker build -t my-express-app .

To run the container:
docker run -p 3001:3001 my-express-app

To access the service:
http://localhost:3001/data
