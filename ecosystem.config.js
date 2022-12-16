module.exports = {
  apps : [{
    name   : "dashboard",
    script : "./app.js",
    watch : ['./'],
    ignore_watch: ['./storage']
  }]
}
