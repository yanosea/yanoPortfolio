package logic

import (
	"context"
	"encoding/json"
	"time"

	"github.com/yanosea/yanoPortfolioBack/auth"

	//https://github.com/labstack/gommon
	"github.com/labstack/gommon/log"
	// https://github.com/zmb3/spotify/v2
	"github.com/zmb3/spotify/v2"
)

type LastPlayed struct {
	ImageUrl   string `json:"imageUrl"`
	PlayedAt   string `json:"playedAt"`
	TrackName  string `json:"trackName"`
	TrackUrl   string `json:"trackUrl"`
	AlbumName  string `json:"albumName"`
	AlbumUrl   string `json:"albumUrl"`
	ArtistName string `json:"artistName"`
	ArtistUrl  string `json:"artistUrl"`
}

type LastPlayedResponse struct {
	Body []byte `json:"body"`
}

func Lastplayed() (*LastPlayedResponse, error) {
	client, err := auth.Authenticate()
	if err != nil {
		log.Error(err)
		return nil, err
	}

	lastPlayedTracks, err := client.PlayerRecentlyPlayedOpt(context.Background(), &spotify.RecentlyPlayedOptions{Limit: 1})
	if err != nil {
		log.Error(err)
		return nil, err
	}

	if len(lastPlayedTracks) == 0 {
		return &LastPlayedResponse{
			Body: nil,
		}, nil
	}

	lastPlayed := LastPlayed{
		ImageUrl:   lastPlayedTracks[0].Track.Album.Images[0].URL,
		PlayedAt:   utcTimeToJST(lastPlayedTracks[0].PlayedAt).Format("2006-01-02 15:04:05"),
		TrackName:  lastPlayedTracks[0].Track.Name,
		TrackUrl:   lastPlayedTracks[0].Track.ExternalURLs["spotify"],
		AlbumName:  lastPlayedTracks[0].Track.Album.Name,
		AlbumUrl:   lastPlayedTracks[0].Track.Album.ExternalURLs["spotify"],
		ArtistName: lastPlayedTracks[0].Track.Artists[0].Name,
		ArtistUrl:  lastPlayedTracks[0].Track.Artists[0].ExternalURLs["spotify"],
	}

	jsonLastPlayed, err := json.Marshal(lastPlayed)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	return &LastPlayedResponse{
		Body: jsonLastPlayed,
	}, nil
}

func utcTimeToJST(t time.Time) time.Time {
	return t.Add(9 * time.Hour)
}
