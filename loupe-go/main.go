package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

type TextDocumentChangeEvent struct {
	ContentChanges []struct {
		Range []struct {
			Character int64 `json:"character"`
			Line      int64 `json:"line"`
		} `json:"range"`
		RangeLength int64  `json:"rangeLength"`
		RangeOffset int64  `json:"rangeOffset"`
		Text        string `json:"text"`
	} `json:"contentChanges"`
	Document struct {
		Eol        int64  `json:"eol"`
		FileName   string `json:"fileName"`
		IsClosed   bool   `json:"isClosed"`
		IsDirty    bool   `json:"isDirty"`
		IsUntitled bool   `json:"isUntitled"`
		LanguageID string `json:"languageId"`
		LineCount  int64  `json:"lineCount"`
		URI        struct {
			Mid      int64  `json:"$mid"`
			External string `json:"external"`
			FsPath   string `json:"fsPath"`
			Path     string `json:"path"`
			Scheme   string `json:"scheme"`
		} `json:"uri"`
		Version int64 `json:"version"`
	} `json:"document"`
}

func main() {
	dec := json.NewDecoder(os.Stdin)
	for {
		var e TextDocumentChangeEvent
		if err := dec.Decode(&e); err == io.EOF {
			break
		} else if err != nil {
			log.Fatal(err.Error() + "\n")
		}
		if len(e.ContentChanges) > 0 {
			fmt.Printf("%s: %s\n", e.Document.FileName, e.ContentChanges[0].Text)
		}
	}
}
