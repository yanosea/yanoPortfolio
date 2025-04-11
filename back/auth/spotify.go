package auth

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"os"

	"golang.org/x/oauth2"

	//https://github.com/labstack/gommon
	"github.com/labstack/gommon/log"
	// https://github.com/thanhpk/randstr"
	"github.com/thanhpk/randstr"
	// https://github.com/zmb3/spotify/v2
	"github.com/zmb3/spotify/v2"
	// https://github.com/zmb3/spotify/v2/auth
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

func Authenticate() (*spotify.Client, error) {
	port, err := getPortFromUri(os.Getenv("SPOTIFY_REDIRECT_URI"))
	if err != nil {
		log.Error(err)
		return nil, err
	}

	var (
		client  *spotify.Client
		state   = randstr.Hex(11)
		channel = make(chan *spotify.Client)
	)

	authenticator := spotifyauth.New(
		spotifyauth.WithScopes(
			spotifyauth.ScopeUserFollowRead,
			spotifyauth.ScopeUserFollowModify,
			spotifyauth.ScopeUserLibraryRead,
			spotifyauth.ScopeUserLibraryModify,
		),
		spotifyauth.WithClientID(os.Getenv("SPOTIFY_ID")),
		spotifyauth.WithClientSecret(os.Getenv("SPOTIFY_SECRET")),
		spotifyauth.WithRedirectURL(os.Getenv("SPOTIFY_REDIRECT_URI")),
	)

	if os.Getenv("SPOTIFY_REFRESH_TOKEN") != "" {
		return refresh(authenticator, os.Getenv("SPOTIFY_REFRESH_TOKEN"))
	}

	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		tok, err := authenticator.Token(r.Context(), state, r)

		if err != nil {
			log.Error(err)
			http.Error(w, "failed to get token", http.StatusInternalServerError)
			return
		}

		if st := r.FormValue("state"); st != state {
			http.NotFound(w, r)
			return
		}

		client := spotify.New(authenticator.Client(r.Context(), tok))

		channel <- client
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {})
	go func() {
		err := http.ListenAndServe(":"+port, nil)
		if err != nil && err != http.ErrServerClosed {
			log.Error(err)
		}
	}()
	client = <-channel

	return client, nil
}

func refresh(authenticator *spotifyauth.Authenticator, refreshToken string) (*spotify.Client, error) {
	tok := &oauth2.Token{
		TokenType:    "bearer",
		RefreshToken: refreshToken,
	}

	client := spotify.New(authenticator.Client(context.Background(), tok))
	if client == nil {
		return nil, errors.New("failed to create client")
	}

	return client, nil
}

func getPortFromUri(uri string) (string, error) {
	u, _ := url.Parse(uri)
	return u.Port(), nil
}
