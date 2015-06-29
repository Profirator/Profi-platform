Router.map ->
  @route "home",
    path: "/"
    layoutTemplate: "homeLayout"

  @route "apiBackends",
    path: "/apibackends"
    layoutTemplate: "masterLayout"

  @route "catalogue",
    path: "/catalogue"
    layoutTemplate: "masterLayout"

  @route "dashboard",
    path: "/dashboard"
    layoutTemplate: "masterLayout"
