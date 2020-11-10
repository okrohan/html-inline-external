# html-include-external-resources
Simple utility to inline external HTML resources from `<script> <links />  <img />` into single HTML file.

![npm](https://img.shields.io/npm/dt/html-inline-external?style=flat-square) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

### Features
- Full Control over output configuration, Print to console 💻, Write to file 📁 or simply Copy to clipboard 📋 .
- Converts and inlines <img /> 🖼 source into base64 string🤓.
- Configurable html tags to be processed 🛠.
- Node API

| Contents |
| --- |
| [CLI Usage](https://github.com/oknagisa/html-inline-external/blob/master/README.md#cli-usage) |
| [Node API Usage](https://github.com/oknagisa/html-inline-external/blob/master/README.md#node-api-usage) |
| [Recipies](https://github.com/oknagisa/html-inline-external/blob/master/README.md#recipies) |


---

### CLI Usage
``` 
npx html-inline-external --src index.html >> output.html 
```


### Input:
**index.html**
```
<html>
    <head>
        <script type="text/javascript" src="./index.js"></script>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        Hello World
    </body>
</html>

```

**index.js**
```
alert("This is an alert!")
```

**styles.css**
```
body {
    background-color: black;
    color: white;
}
```

### Output:
```> npx html-inline-external --src ./index.html >> output.html ```

**output.html**
```
<html>
  <head>
    <script type="text/javascript">
      alert("This is an alert!")
    </script>
    <link rel="stylesheet" href="styles.css">
    <style>
      body {
        background-color: black;
        color: white;
      }
    </style>
  </head>
  <body>
    Hello World
  </body>
</html>
```
---

### Options : 
| Option | Default | Desscription |
| --- | --- | --- |
| src | N/A | Path to the source file |
| dest | N/A | Path to the destination file |
| tags | `script, link, img` | List HTML Tags to be processed in csv format |
| copy | false | Copies the process output to clipboard |
| pretty | false | Prettify output |
| minify | false | Minify output |

---

### Node API Usage
- Install html-inline-external using your package manager
```
npm install html-inline-external --save 
```
OR
```
yarn add html-inline-external
```

- Use it in your NodeJS file
```
htmlInlineExternal({options})
```
- Example
```
const htmlInlineExternal = require('html-inline-external')

htmlInlineExternal({src: './test/index.html'}).then(output => console.log(output))

```


### API Options : 
| Option | Default | Desscription |
| --- | --- | --- |
| src | N/A | Path to the source file |
| tags | `script, link, img` | List HTML Tags to be processed in csv format |
| pretty | false | Prettify output |
| minify | false | Minify output |


---

### Recipies
#### Write output to file:
Uses node fs and writes the output into the given file path

``` 
> npx html-inline-external --src ./index.html --dest ./output.html 
```
```
> [Log] Wrote to file output.html. 
```

#### Copy processed output to clipboard:
Copies the processed output to clipboard, Could be accessed by simply hitting `Ctrl/Cmd + V`

``` 
> npx html-inline-external --src ./index.html --copy 
```
``` 
> [Log]: Copied to clipboard. 
```

#### Prettify processed output:
Prettifies the processed output

``` 
> npx html-inline-external --src ./index.html --pretty --dest ./output.html 
```
```
> [Log] Wrote to file output.html 
```

#### Minfy processed output:
Minifies the processed output to remove whitespaces

```
> npx html-inline-external --src ./index.html --minify --dest ./output.html 
```
```
> [Log] Wrote to file output.html 
```
