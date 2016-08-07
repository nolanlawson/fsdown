# fsdown [![Build Status](https://travis-ci.org/nolanlawson/fsdown.svg)](https://travis-ci.org/nolanlawson/fsdown)

Implementation of [leveldown](https://github.com/Level/leveldown) that only has `fs` as a dependency for on-disk storage. Essentially
it uses in-memory JSON objects as the backing store, which are then periodically written to disk.

The intended use case is for very very simple database operations that are not designed for a production environment. Instead the idea
is that `fsdown` should be as simple as possible to install and use, while offering reasonably good durability. In particular,
it doesn't require any native modules, so `npm install fsdown` should be fast and reliable.
Think of it as a compromise between [memdown](https://github.com/level/memdown) and [leveldown](https://github.com/Level/leveldown).

**Note: not intended for production use.** This module contains race conditions which mean that it can
lose data if the process is shut down while a database operation is in progress. Furthermore it has synchronous `fs`
operations, so the performance is not great. Use [leveldown](https://github.com/Level/leveldown) instead if you need something bulletproof.

This project is intended for use with the [level eco-system](https://github.com/level/).

## Install

```
npm install fsdown
```

## Usage

You use this as you would any other "\*DOWN" implementation. Refer to [the leveldown docs](https://github.com/Level/leveldown) for details.

There is an additional configuration offered, which is `directory`. `directory` allows you to specify a directory to write the JSON files to, else
`.fsdown` is used.

```js
var levelup = require('levelup');
var fsdown = require('fsdown');
fsdown.directory = 'my_custom_directory'; // else '.fsdown'
var db = levelup('my_db', {db: fsdown}); // will write to my_custom_directory/my_db.json
```

## Tests

    npm test

This will run tests in Node.

##  Contributors

* [Anton Whalley](https://github.com/no9)
* [Adam Shih](https://github.com/adamshih)
* [Nolan Lawson](https://github.com/nolanlawson)
* [Many more!](https://github.com/nolanlawson/fsdown/graphs/contributors)
