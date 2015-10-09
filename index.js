#!/usr/bin/env node
/* eslint-disable */

// entry point, do not use ES6 syntax here in this file, so that 'node' can launch this.
require('babel/register')({
  stage: 1
})
var defaultConfig = require('./defaultConfig.es6')
var program = require('commander')
var extend = require('extend')
var fs = require('fs')

function getConfig(configFile) {
  try {
    var configContent = fs.readFileSync(configFile).toString()
    return JSON.parse(configContent)
  } catch (e) {
    console.error("Failed to parse " + configFile + " Error:" + e.message)
    process.exit(2)
  }
}

function main() {
  program.version('0.0.1')
    .option('-c, --config [config]', 'config file location')
  program.parse(process.argv)

  var config = defaultConfig
  if (program.config) {
    var cfg = getConfig(program.config)
    extend(config, cfg)
  }

  var port = config.port || 6789
  var host = config.host || 'localhost'

  var server = require('./lib/app')(config)
  server.listen(port, host, function () {
    console.log('influx-gateway listening on http://' + host + ':' + port)
  })
}

main()
