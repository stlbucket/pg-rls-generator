pg-fn-bucket
============

a bucket of functions for pg

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pg-fn-bucket.svg)](https://npmjs.org/package/pg-fn-bucket)
[![Downloads/week](https://img.shields.io/npm/dw/pg-fn-bucket.svg)](https://npmjs.org/package/pg-fn-bucket)
[![License](https://img.shields.io/npm/l/pg-fn-bucket.svg)](https://github.com/stlbucket/pg-fn-bucket/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g pg-fn-bucket
$ pg-fn-bucket COMMAND
running command...
$ pg-fn-bucket (-v|--version|version)
pg-fn-bucket/0.0.0 darwin-x64 node-v12.16.2
$ pg-fn-bucket --help [COMMAND]
USAGE
  $ pg-fn-bucket COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pg-fn-bucket generate [FILE]`](#pg-fn-bucket-generate-file)
* [`pg-fn-bucket hello [FILE]`](#pg-fn-bucket-hello-file)
* [`pg-fn-bucket help [COMMAND]`](#pg-fn-bucket-help-command)
* [`pg-fn-bucket init`](#pg-fn-bucket-init)
* [`pg-fn-bucket release [FILE]`](#pg-fn-bucket-release-file)

## `pg-fn-bucket generate [FILE]`

generate all policy scripts

```
USAGE
  $ pg-fn-bucket generate [FILE]

OPTIONS
  -g, --help  show CLI help
```

_See code: [src/commands/generate.ts](https://github.com/stlbucket/pg-fn-bucket/blob/v0.0.0/src/commands/generate.ts)_

## `pg-fn-bucket hello [FILE]`

describe the command here

```
USAGE
  $ pg-fn-bucket hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ pg-fn-bucket hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/stlbucket/pg-fn-bucket/blob/v0.0.0/src/commands/hello.ts)_

## `pg-fn-bucket help [COMMAND]`

display help for pg-fn-bucket

```
USAGE
  $ pg-fn-bucket help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `pg-fn-bucket init`

initialize config and output directories

```
USAGE
  $ pg-fn-bucket init

OPTIONS
  -c, --connectionString=connectionString  (required) postgres connection string

  -f, --force                              will reset the current-draft to the previous version or to default if this is
                                           a new project

  -h, --help                               show CLI help

  -x, --forceAll                           will reset the entire project
```

_See code: [src/commands/init.ts](https://github.com/stlbucket/pg-fn-bucket/blob/v0.0.0/src/commands/init.ts)_

## `pg-fn-bucket release [FILE]`

copy current-draft dir to a new release dir

```
USAGE
  $ pg-fn-bucket release [FILE]
```

_See code: [src/commands/release.ts](https://github.com/stlbucket/pg-fn-bucket/blob/v0.0.0/src/commands/release.ts)_
<!-- commandsstop -->
