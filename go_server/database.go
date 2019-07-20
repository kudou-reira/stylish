package main

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func fetchUser(filter primitive.D) userCollection {
	fmt.Println("this is filter in fetchuser", filter)
	var result userCollection

	err := userData.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		fmt.Println(err)
	}

	return result
}

func checkUser(c cache, filter primitive.D, userData *mongo.Collection) (bool, string) {
	var result userCollection

	err := userData.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		fmt.Println(err)
	}

	str := fmt.Sprint(result.Id)
	objID := getObjID(str)

	_, err = strconv.Atoi(objID)
	if err != nil {
		// handle error
		return true, objID
	}

	return false, ""
}

func saveData(c cache, userData *mongo.Collection) string {
	tempUserCollection := userCollection{
		UserEmail:       c.Email,
		CacheCollection: []cache{c},
	}

	ctx, _ := context.WithTimeout(context.Background(), 20*time.Second)

	insertResult, err := userData.InsertOne(ctx, tempUserCollection)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Inserted a single document: ", insertResult)
	fmt.Println("this is the inserted id", insertResult.InsertedID)
	fmt.Println("this is the type of inserted id", typeof(insertResult.InsertedID))

	str := fmt.Sprint(insertResult.InsertedID)
	objID := getObjID(str)

	fmt.Println("this is the obj id", objID)

	return objID
}

func updataData(c cache, filter primitive.D, userData *mongo.Collection) {
	fmt.Println("this is update data")

	ctx, _ := context.WithTimeout(context.Background(), 20*time.Second)

	_, err := userData.UpdateOne(ctx, filter, bson.D{
		{"$push", bson.D{{"cacheCollection", c}}},
	})
	if err != nil {
		fmt.Println(err)
	}
}

func updateItemRating(userItem userUpdate, singleFilter primitive.D, tripleFilter primitive.D, userData *mongo.Collection) userCollection {
	fmt.Println("this is updateItemRating")

	ctx, _ := context.WithTimeout(context.Background(), 20*time.Second)
	fmt.Println("this is userItem rating", userItem.Rating)
	fmt.Println("this userItem", userItem.Feedback)
	fmt.Println("this is the timeUploaded", userItem.TimeUploaded)
	fmt.Println("this is the fileName", userItem.FileName)

	_, err := userData.UpdateOne(ctx, tripleFilter, bson.D{
		{"$set", bson.D{{"cacheCollection.$.rating", userItem.Rating}}},
		{"$set", bson.D{{"cacheCollection.$.feedback", userItem.Feedback}}},
	})
	if err != nil {
		fmt.Println(err)
	}

	return fetchUser(singleFilter)
}

func getObjID(s string) string {
	print("this is get objid")
	var regex string = `"(.*?)"`
	re, err := regexp.Compile(regex)
	if err != nil {
		fmt.Println(err)
	}
	result := re.FindStringSubmatch(s)
	print("this is result", result[1])

	return result[1]
}

func generateResultLink(rootLink string, objID string) string {
	var sb strings.Builder
	sb.WriteString(rootLink)
	sb.WriteString(objID)
	return sb.String()
}
