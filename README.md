# influx-gateway

[![Build Status](https://travis-ci.org/txchen/influx-gateway.svg)](https://travis-ci.org/txchen/influx-gateway)
[![NPM version](http://img.shields.io/npm/v/influx-gateway.svg?style=flat-square)](https://www.npmjs.com/package/influx-gateway)
[![Code Climate](https://codeclimate.com/github/txchen/influx-gateway/badges/gpa.svg)](https://codeclimate.com/github/txchen/eslint-plugin-riot)

InfluxDB had a json protocol but it will be deprecated, this service helps you to write json into influxDB.

## How to deploy

Firstly, install:

```bash
$ npm install influx-gateway -g
```

Then command `igw` or `influx-gateway` will be available.

Now we need a configuration file for influx-gateway, you can see the example by running:

```bash
$ igw genconfig
```

Create a config file, and then we can run the server:

```bash
$ igw -c [configfile]
```

## Configuration

Config is quite straight forward. The only tricky part is: if your influxdb requires authentication, you should include the username and password in the `influx_url`.

## Authentication

Influx-gateway does not provide authentication, you can put a proxy in front of igw. For example, an nginx instance with basic auth check enabled.

## API

* GET /ping

Ping will check the influxdb connectivity.

* POST /event

This API would transform json input into influx db's line protocol message. See [Here](https://influxdb.com/docs/v0.9/write_protocols/line.html) for more information about line-protocol.

Example payload:

```json
{
  "_name": "cpu",
  "__f1": 1,
  "tag1": "v1",
  "tag2": "v2"
}
```

`_name` must be specified as the measurement name, type must be string, regex: `/^[a-zA-Z0-9][\w-\.\/]*$/`

Field name starts with `__[a-zA-Z0-9]`, and remaining part use the same rule as measurement name.

Field value can be number, boolean or string.

Fields are optional, if no fields in the payload, igw will add `count=1i` automatically.

Tag name and tag value also should follow the measurement name regex.

Tags are also optional.

* POST /query

This API accepts influxdb query and returns json result. Query must start with `SELECT`.

Example payload:

```json
{
  "q": "SELECT value FROM cpu_load_short WHERE region='us-west'",
}
```

Example result:

```json
{
  "latency": 230,
  "series": [
    {
      "name": "cpu_load_short",
      "columns": [
        "time",
        "value"
      ],
      "values": [
        [
          "2015-01-29T21:55:43.702900257Z",
          0.55
        ],
        [
          "2015-01-29T21:55:43.702900257Z",
          23422
        ],
        [
          "2015-06-11T20:46:02Z",
          0.64
        ]
      ]
    }
  ]
}
```

## Changelog

**2016-02-24** `0.1.5`
Add query latency in response.

**2016-02-23** `0.1.4`
Add query api.

**2015-10-13** `0.1.3`
Upgrade dependencies.

**2015-10-11** `0.1.2`
1st working version.
