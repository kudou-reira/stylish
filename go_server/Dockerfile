FROM golang:latest

ENV GOBIN /go/bin
# for install go packages
# RUN go get github.com/go-sql-driver/mysql

# Copy the local package files to the container's workspace.
ADD . /go/src/github.com/kudou-reira/myproject

WORKDIR /go/src/github.com/kudou-reira/myproject

RUN go get go.mongodb.org/mongo-driver/mongo
RUN go get go.mongodb.org/mongo-driver/bson
RUN go get go.mongodb.org/mongo-driver/mongo/options

RUN go get github.com/tockins/realize
RUN go get github.com/pilu/fresh
RUN go get -u github.com/gorilla/mux


CMD ["realize", "start", "--no-config", "--run"]


# Document that the service listens on port 8080.
EXPOSE 8080
