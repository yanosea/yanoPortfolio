package router

import (
	"github.com/yanosea/yanoPortfolioBack/handler/api"

	// https://github.com/labstack/echo
	"github.com/labstack/echo/v4"
)

func Bind(e *echo.Echo) {
	apiGroup := e.Group("api")
	api.BindNowPlayingHandler(apiGroup)
	api.BindLastPlayedHandler(apiGroup)
}
