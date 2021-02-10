package main

import (
	"errors"
	"fmt"
)

func main() {
	fmt.Println("hello")
	fmt.Println(errors.New("hello").Error())
}

type Foo struct {
	thing int
	thang string
}
