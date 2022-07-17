package tweet

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
)

type RequestBody struct {
	StatusID string `json:"status_id"`
}

type TwitterAPIResponse struct {
	Data []struct {
		Text          string `json:"text"`
		AuthorID      string `json:"author_id"`
		ID            string `json:"id"`
		PublicMetrics struct {
			RetweetCount int `json:"retweet_count"`
			ReplyCount   int `json:"reply_count"`
			LikeCount    int `json:"like_count"`
			QuoteCount   int `json:"quote_count"`
		} `json:"public_metrics"`
		PossiblySensitive bool   `json:"possibly_sensitive"`
		CreatedAt         string `json:"created_at"`
	} `json:"data"`

	Includes struct {
		Users []struct {
			UserName        string `json:"username"`
			ID              string `json:"id"`
			Verified        bool   `json:"verified"`
			Name            string `json:"name"`
			ProfileImageUrl string `json:"profile_image_url"`
		} `json:"users"`
	} `json:"includes"`
}

type ErrorResponse struct {
	Message string `json:"errorMessage"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	var body RequestBody

	if r.Method == http.MethodPut {
		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil { // Can't unmarshal body to RequestBody struct
			w.WriteHeader(http.StatusBadRequest)
			res := ErrorResponse{Message: err.Error()}

			json.NewEncoder(w).Encode(&res)
			return
		}
		twitterApiEndpoint, _ := url.Parse("https://api.twitter.com/2/tweets")
		twitterApiEndpoint.RawQuery = url.Values{
			"ids":          {body.StatusID},
			"expansions":   {"author_id"},
			"tweet.fields": {"created_at", "public_metrics", "possibly_sensitive", "in_reply_to_user_id", "geo", "entities"},
			"user.fields":  {"profile_image_url", "verified"},
		}.Encode()

		client := &http.Client{}

		twitterReq, _ := http.NewRequest("GET", twitterApiEndpoint.String(), nil)
		twitterReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", os.Getenv("TWITTER_API_TOKEN")))

		resp, err := client.Do(twitterReq)

		rawBody, _ := ioutil.ReadAll(resp.Body)

		var twitterRes TwitterAPIResponse

		err = json.NewDecoder(resp.Body).Decode(&twitterRes)
		if err != nil { // Can't unmarshal Twitter API response body to TwitterAPIResponse struct
			w.WriteHeader(http.StatusBadRequest)
			res := ErrorResponse{Message: err.Error()}

			json.NewEncoder(w).Encode(&res)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write(rawBody)

		go PutImageInRedis()

	} else {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
	}
}

func PutImageInRedis() {

}
