# SVG Preview plugin for FilePond

This **Fetch SVG Preview** plugin will kick in automatically when the uploaded file has an SVG extension and incorrect Content-Type e.g. *application/octet-stream*.


## Quick Start

Install using yarn or npm:

```bash
yarn add filepond-plugin-fetch-svg-preview
```
```bash
npm install filepond-plugin-fetch-svg-preview
```

Then import in your project:

```js
import * as FilePond from 'filepond';
import FilePondPluginFetchSVGPreview from 'filepond-plugin-fetch-svg-preview';
```

Register the plugin:
```js
FilePond.registerPlugin(FilePondPluginFetchSVGPreview);
```
Create a new FilePond instance as normal.
```js
const pond = FilePond.create({
    name: 'filepond'
});

// Add it to the DOM
document.body.appendChild(pond.element);
```
 The preview will become active when uploading an SVG file.

## Filepond options
| props name | description |
| -------------------- | ----------- |
| allowFetchSVGPreview | boolean |


## Default styles
Be sure to include this lib's styles, by importing the minified css.
```js
import 'filepond-plugin-fetch-svg-preview/dist/filepond-plugin-fetch-svg-preview.min.css';
```

## Demo
```
python -m SimpleHTTPServer 8000
```
localhost:8000