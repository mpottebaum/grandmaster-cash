package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var tmp *template.Template

func loadTemplate() {
	t, err := template.ParseFiles("index.html")
	if err != nil {
		panic(err)
	}
	tmp = t
}

func rootHandler(writer http.ResponseWriter, request *http.Request) {
	tmp.Execute(writer, nil)
}

func main() {
	loadTemplate()
	http.HandleFunc("/", rootHandler)

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("we up on port 3stax")
}
