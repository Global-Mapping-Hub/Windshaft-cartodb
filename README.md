# Windshaft-CartoDB

The [`CARTO Maps API`](https://carto.com/developers/maps-api/) tiler. It extends [`Windshaft`](https://github.com/CartoDB/Windshaft) and exposes a web service with extra functionality:

* Instantiate [`Anonymous Maps`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/03-anonymous-maps.md) through CARTO's map configuration ([`MapConfig`](https://github.com/CartoDB/Windshaft/blob/master/doc/MapConfig-specification.md)).
* Create [`Named Maps`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/04-named-maps.md) based on customizable templates.
* Get map previews through [`Static Maps`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/05-static-maps-API.md) API.
* Render maps with a large amount of data faster using [`Tile Aggregation`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/06-tile-aggregation.md).
* Build advanced maps with enriched data through [`Analyses Extension`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/09-MapConfig-analyses-extension.md).
* Fetch tabular data from analysis nodes with [`Dataviews`](https://github.com/CartoDB/Windshaft-cartodb/blob/master/docs/guides/10-MapConfig-dataviews-extension.md)

## Build

Requirements (see also `engines` in `package.json`):

* [`Node.js ^26.13.1`](https://nodejs.org/) and `npm >= 11`
* [`PostgreSQL >= 10`](https://www.postgresql.org/download/) (tested with PostgreSQL 16)
* [`PostGIS >= 2.4`](https://postgis.net/install/)
* [`CARTO Postgres Extension >= 0.24.1`](https://github.com/CartoDB/cartodb-postgresql)
* [`Redis >= 4`](https://redis.io/download)
* System libraries for Mapnik / canvas native builds:
  * `libmapnik-dev` (or equivalent Mapnik development package)
  * `libcairo2-dev`, `libpango1.0-dev`, `libjpeg-dev`, `libgif-dev`, `libpng-dev`, `libpixman-1-dev`, `libfreetype6-dev`, `libxml2-dev`, `libicu-dev`
  * Boost headers (`libboost-all-dev` or the Mapnik-required Boost packages)
* A C++20-capable toolchain to compile `packages/node-mapnik` against Node 26 headers
* GDAL tools (`gdal-bin`) when millstone needs SRS lookups (the Docker image uses a small shim instead of compiling `node-gdal`)

Optional:

* [`Varnish`](http://www.varnish-cache.org)
* [`Statsd`](https://github.com/statsd/statsd)

### `@carto/mapnik`

Tile rendering uses the vendored binding in [`packages/node-mapnik`](packages/node-mapnik), wired through the `file:packages/node-mapnik` dependency and npm `overrides`. After `npm install`:

1. Run [`scripts/patch-mapnik-v8.sh`](scripts/patch-mapnik-v8.sh) against `node_modules/@carto/mapnik` so the binding matches modern V8.
2. Rebuild `@carto/mapnik` and `canvas` for the current Node ABI (`npm rebuild @carto/mapnik canvas`).

Node 26 headers expect C++20. If your distro's `mapnik-config --cflags` still emits an older `-std=`, override it (for example wrap `mapnik-config` or set `CXXFLAGS=-std=c++20`).

### PostgreSQL client (`pg`)

`package.json` overrides force [`pg` 8.x](https://node-postgres.com/). `cartodb-psql` still expects pieces of the older pg 6 pool API, so a compatibility layer may be required in front of `pg` 8.

### PostGIS setup

A `template_postgis` database is expected. One can be set up with

```shell
$ createdb --owner postgres --template template0 template_postgis
$ psql -d template_postgis -c 'CREATE EXTENSION postgis;'
```

### Install

To fetch and build all node-based dependencies, run:

```shell
$ npm install
```

### Run

Create `./config/environments/<env>.js` (there are `.example` files to start from). See `./lib/server-options.js` for config details.

```shell
$ node app.js <env>
```

Where `<env>` is the name of a configuration file under `./config/environments/`.

### Test

```shell
$ npm test
```

### Coverage

```shell
$ npm run cover
```

Open `./coverage/lcov-report/index.html`.

### Useful `npm` scripts

Run tests inside a Docker image (image and Node version must match the engines above):

```shell
$ DOCKER_IMAGE=<docker-image-tag> NODE_VERSION=<nodejs-version> npm run test:docker
```

Debug shell:

```shell
$ DOCKER_IMAGE=<docker-image-tag> npm run docker:bash
```

## Documentation

You can find an overview, guides, full reference, and support in [`CARTO's developer center`](https://carto.com/developers/maps-api/). The [docs directory](docs) contains different documentation resources, from a higher level to more detailed ones.

## Contributing

* The issue tracker: [`Github`](https://github.com/Global-Mapping-Hub/Windshaft-cartodb/issues).
* We love Pull Requests from everyone, see [contributing to Open Source on GitHub](https://guides.github.com/activities/contributing-to-open-source/#contributing).

## Developing with a custom `Windshaft` version

If you plan or want to use a custom / not released yet version of windshaft (or any other dependency), the best option is to use `npm link`. You can read more about it at `npm-link`: [symlink a package folder](https://docs.npmjs.com/cli/link.html).

```shell
$ cd /path/to/Windshaft
$ npm install
$ npm link
$ cd /path/to/Windshaft-cartodb
$ npm link windshaft
```

## License

This project is licensed under the BSD 3-clause "New" or "Revised" License. See the [LICENSE](LICENSE) file for details.
