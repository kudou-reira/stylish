package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type userParams struct {
	UserID string `json:"db_id"`
}

type userUpdate struct {
	UserID       string  `json:"db_id"`
	FileName     string  `json:"file_name"`
	TimeUploaded float32 `json:"time_uploaded"`
	Rating       float32 `json:"rating"`
	Feedback string `json:"feedback"`
}


// type userUpdate struct {
// 	UserID       string  `json:"db_id"`
// 	FileName     string  `json:"file_name"`
// 	TimeUploaded float32 `json:"time_uploaded"`
// 	Rating       float32 `json:"rating"`
// 	Feedback string `json:"feedback"`
// }

type userCollection struct {
	Id              primitive.ObjectID `bson:"_id,omitempty"`
	UserEmail       string             `bson:"userEmail"`
	CacheCollection []cache            `bson:"cacheCollection"`
}

type cache struct {
	OutputImage string   `bson:"outputImage" json:"output_image"`
	PlotImage string   `bson:"plotImage" json:"plot_image"`
	InputImage string          `bson:"inputImage" json:"input_image"`
	TransferImage string		`bson:"transferImage" json:"transfer_image"`
	TimeRequired  float32         `bson:"timeRequired" json:"time_required"`
	TimeUploaded  float32         `bson:"timeUploaded" json:"time_uploaded"`
	Email         string          `bson:"email" json:"email"`
	Rating        float32         `bson:"rating" json:"rating"`
	Feedback string `bson:"feedback" json:"feedback"`
}

// type cachedImage struct {
// 	NLabels       int    `bson:"nLabels" json:"nLabels"`
// 	OutputPath string `bson:"output_path" json:"output_path"`
// }

// type hyperparameters struct {
// 	MaxIter            int32   `bson:"maxIter" json:"maxIter"`
// 	MinLabels          int32   `bson:"minLabels" json:"minLabels"`
// 	LearningRate       float32 `bson:"learningRate" json:"lr"`
// 	NumberConvolutions int32   `bson:"nConv" json:"nConv"`
// 	NumberSuperpixels  int32   `bson:"numSuperpixels" json:"num_superpixels"`
// 	Compactness        int32   `bson:"compactness" json:"compactness"`
// 	NumberChannel      int32   `bson:"nChannel" json:"nChannel"`
// 	Momentum           float32 `bson:"momentum" json:"momentum"`
// }

var info *mongo.Database
var userData *mongo.Collection

func main() {
	fmt.Println("this is before connect to mongo")
	connectToMongo()

	r := mux.NewRouter()
	// routes consist of a path and a handler function.

	r.HandleFunc("/test", test).Methods("GET")
	r.HandleFunc("/process_cache", processData).Methods("POST")
	r.HandleFunc("/queryDB", queryDB).Methods("POST")
	r.HandleFunc("/updateRating", updateRating).Methods("POST")

	// bind to a port and pass our router in
	http.Handle("/", &middleWareServer{r})

	log.Fatal(http.ListenAndServe(":8080", nil))
	// log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}

func typeof(v interface{}) string {
	return fmt.Sprintf("%T", v)
}

func connectToMongo() error {
	ctx, _ := context.WithTimeout(context.Background(), 20*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")

	info = client.Database("cache")
	userData = info.Collection("users")

	fmt.Println("this is type of client", typeof(client))
	fmt.Println("this is type of database", typeof(info))
	fmt.Println("this is type of collection", typeof(userData))

	return nil
}

func processData(w http.ResponseWriter, r *http.Request) {
	fmt.Println("this is processData")
	if r != nil {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Println(err)
		}
		log.Println(string(body))

		var c cache
		err = json.Unmarshal(body, &c)
		if err != nil {
			panic(err)
		}

		fmt.Println("this is go server processData")

		// fmt.Println("this is c contents", c.Segmentations)
		// fmt.Println("this is c time required", c.TimeRequired)
		// fmt.Println("this is c name", c.FileName)
		// fmt.Println("this is hyperparameters", c.Parameters)
		fmt.Println("this is the email", c.Email)

		// { size: { h: 14, w: 21, uom: "cm" } }
		filter := bson.D{{"userEmail", c.Email}}

		var objID string

		res, objID := checkUser(c, filter, userData)

		if res == false {
			objID = saveData(c, userData)
		} else {
			updataData(c, filter, userData)
		}

		rootLink := "http://localhost:3050/result/"

		link := generateResultLink(rootLink, objID)

		fmt.Println("this is the generated link", link)

		temp := []byte(link)
		w.Write(temp)
	}
}

func queryDB(w http.ResponseWriter, r *http.Request) {
	if r != nil {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		log.Println(string(body))

		var user userParams
		err = json.Unmarshal(body, &user)
		if err != nil {
			fmt.Println("this is err", err)
		}

		userID, err := primitive.ObjectIDFromHex(user.UserID)
		if err != nil {
			fmt.Println("couldn't convert userID to hex", err)
		}

		fmt.Println("this is userID", userID)

		filter := bson.D{{"_id", userID}}

		userResult := fetchUser(filter)

		fmt.Println("this is fetch user", userResult)
		fmt.Println("this is type of result", typeof(userResult))

		// now i have to marshal this to json and send it back
		jsonData, err := json.Marshal(userResult)
		if err != nil {
			fmt.Println(err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}
}

func updateRating(w http.ResponseWriter, r *http.Request) {
	if r != nil {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		log.Println(string(body))

		var userItem userUpdate
		err = json.Unmarshal(body, &userItem)
		if err != nil {
			fmt.Println("this is err", err)
		}

		userID, err := primitive.ObjectIDFromHex(userItem.UserID)
		if err != nil {
			fmt.Println("couldn't convert userID to hex", err)
		}

		fmt.Println("this is updateRating", userItem)
		fmt.Println("this is userID", userID)

		singleFilter := bson.D{{"_id", userID}}

		// tripleFilter := bson.D{
		// 	{"_id", userID},
		// 	{"cacheCollection.fileName", userItem.FileName},
		// 	{"cacheCollection.timeUploaded", userItem.TimeUploaded},
		// }

		tripleFilter := bson.D{
			{"_id", userID},
			{"cacheCollection.timeUploaded", userItem.TimeUploaded},
		}

		userResult := updateItemRating(userItem, singleFilter, tripleFilter, userData)

		fmt.Println("this is fetch user", userResult)
		fmt.Println("this is type of result", typeof(userResult))

		// now i have to marshal this to json and send it back
		jsonData, err := json.Marshal(userResult)
		if err != nil {
			fmt.Println(err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}
}

func test(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)

	temp := []byte("welcome to the server")
	w.Write(temp)
}

type middleWareServer struct {
	r *mux.Router
}

func (s *middleWareServer) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	if origin := req.Header.Get("Origin"); origin != "" {
		rw.Header().Set("Access-Control-Allow-Origin", origin)
		rw.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		rw.Header().Set("Access-Control-Allow-Headers",
			"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	}
	// Stop here if its Preflighted OPTIONS request
	if req.Method == "OPTIONS" {
		return
	}
	// Lets Gorilla work
	s.r.ServeHTTP(rw, req)
}
