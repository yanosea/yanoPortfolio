package api

import (
	"net/http"

	"github.com/yanosea/yanoPortfolioBack/logic"

	//https://github.com/labstack/echo
	"github.com/labstack/echo/v4"
	//https://github.com/labstack/gommon
	"github.com/labstack/gommon/log"
)

func BindLastPlayedHandler(g *echo.Group) {
	g.GET("/lastplayed", getLastPlayed)
}

func getLastPlayed(c echo.Context) error {
	resp, err := logic.Lastplayed()
	if err != nil {
		log.Error(err)
		return c.NoContent(http.StatusBadRequest)
	}
	if resp.Body == nil {
		return c.NoContent(http.StatusNoContent)
	}

	return c.JSONBlob(http.StatusOK, resp.Body)
}
