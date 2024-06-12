package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var tmp *template.Template
var PORT_STR = ":3000"

func loadTemplate() {
	t, err := template.ParseFiles("dist/index.html")
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
	http.Handle(
		"/assets/",
		http.StripPrefix(
			"/assets/",
			http.FileServer(http.Dir("./assets/")),
		),
	)
	http.Handle(
		"/juicy/",
		http.StripPrefix(
			"/juicy/",
			http.FileServer(http.Dir("./dist/juicy/")),
		),
	)
	http.HandleFunc("/", rootHandler)

	fmt.Printf("we up on port 3stax (%s)\n\n", PORT_STR)
	err := http.ListenAndServe(PORT_STR, nil)
	if err != nil {
		log.Fatal(err)
		fmt.Printf("err errywerr bruh: %s", err.Error())
	}
}
