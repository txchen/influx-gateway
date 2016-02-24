#!/usr/bin/env node
/* eslint-disable */

// entry point, do not use ES6 syntax here in this file, so that 'node' can launch this.
require('babel/register')({
  stage: 1,
  ignore: /influx-gateway\/node_modules/
})
var defaultConfig = require('./defaultConfig.es6')
var pjson = require('./package.json')
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
  program.version(pjson.version)
    .option('-c, --config [config]', 'config file location')
  program.command('genconfig')
    .description('print config tempalte')
    .action(function() {
      console.log(JSON.stringify(defaultConfig, null, 2))
      process.exit(0)
    })
  program.parse(process.argv)

  var config = defaultConfig
  if (program.config) {
    extend(config, getConfig(program.config))
  }

  var server = require('./lib/app')(config)
  server.listen(config.port, config.host, function() {
    console.log('influx-gateway listening on http://' + config.host + ':' + config.port)
  })
}

main()
