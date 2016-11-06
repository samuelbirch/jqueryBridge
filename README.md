# jQuery Bridge

A bridge that will let you use jquery style syntax and plugins with micro frameworks.

## Basic Usage

```
var dom = require('bonzo');
var qwery = require('qwery');
var bean = require('bean');
var reqwest = require('reqwest');
var morpheus = require('morpheus');

window.$ = require('bridge');

$.init.dom(dom);
$.init.query(qwery);
$.init.event(bean);
$.init.ajax(reqwest);
$.init.fx(morpheus);
```

## Use jquery plugins

```
require('jquery-match-height');
$.proto({'matchHeight': $.fn.matchHeight})
```