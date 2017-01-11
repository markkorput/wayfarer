# Wayfarer

[![Travis build status](http://img.shields.io/travis/markkorput/wayfarer.svg?style=flat)](https://travis-ci.org/markkorput/wayfarer)
[![Code Climate](https://codeclimate.com/github/markkorput/wayfarer/badges/gpa.svg)](https://codeclimate.com/github/markkorput/wayfarer)
[![Test Coverage](https://codeclimate.com/github/markkorput/wayfarer/badges/coverage.svg)](https://codeclimate.com/github/markkorput/wayfarer)
[![Dependency Status](https://david-dm.org/markkorput/wayfarer.svg)](https://david-dm.org/markkorput/wayfarer)
[![devDependency Status](https://david-dm.org/markkorput/wayfarer/dev-status.svg)](https://david-dm.org/markkorput/wayfarer#info=devDependencies)
[![generator-api](https://img.shields.io/badge/built%20with-generator--api-green.svg)](https://github.com/ndelvalle/generator-api)

Backend API for Wayfarer project

## dependencies

node 6.3.x or later and mongodb

## developing

run mongodd on a separated terminal instance:

```
mongod
```

run the app:

```bash
npm run dev
```

the app runs on `localhost:8080`

## production

_you'll likely be consuming mongodb as a service, so make sure you set the env var to connect to it._

```bash
npm start
```





--------------------------------------------------------------------------------
