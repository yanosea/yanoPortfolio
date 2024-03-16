package logic

import (
	"context"
	"encoding/json"

	"github.com/yanosea/yanoPortfolioBack/auth"

	//https://github.com/labstack/gommon
	"github.com/labstack/gommon/log"
	// https://github.com/zmb3/spotify/v2
	"github.com/zmb3/spotify/v2"
)

type NowPlaying struct {
	ImageUrl   string `json:"imageUrl"`
	TrackName  string `json:"trackName"`
	TrackUrl   string `json:"trackUrl"`
	AlbumName  string `json:"albumName"`
	AlbumUrl   string `json:"albumUrl"`
	ArtistName string `json:"artistName"`
	ArtistUrl  string `json:"artistUrl"`
}

type NowplayingResponse struct {
	Body []byte `json:"body"`
}

func Nowplaying() (*NowplayingResponse, error) {
	client, err := auth.Authenticate()
	if err != nil {
		log.Error(err)
		return nil, err
	}

	currentlyPlayingTrack, err := client.PlayerCurrentlyPlaying(context.Background(), spotify.Limit(1))
	if err != nil {
		log.Error(err)
		return nil, err
	}

	if currentlyPlayingTrack.Item == nil {
		return &NowplayingResponse{
			Body: nil,
		}, nil
	}

	nowPlaying := NowPlaying{
		ImageUrl:   currentlyPlayingTrack.Item.Album.Images[0].URL,
		TrackName:  currentlyPlayingTrack.Item.Name,
		TrackUrl:   currentlyPlayingTrack.Item.ExternalURLs["spotify"],
		AlbumName:  currentlyPlayingTrack.Item.Album.Name,
		AlbumUrl:   currentlyPlayingTrack.Item.Album.ExternalURLs["spotify"],
		ArtistName: currentlyPlayingTrack.Item.Artists[0].Name,
		ArtistUrl:  currentlyPlayingTrack.Item.Artists[0].ExternalURLs["spotify"],
	}

	jsonNowPlaying, err := json.Marshal(nowPlaying)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &NowplayingResponse{
		Body: jsonNowPlaying,
	}, nil
}
