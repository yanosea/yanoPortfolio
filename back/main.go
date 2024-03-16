package main

import (
	"os"

	"github.com/yanosea/yanoPortfolioBack/router"

	// https://github.com/labstack/echo
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	router.Bind(e)
	port := os.Getenv("BACK_PORT")
	if port == "" {
		port = "1323"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
