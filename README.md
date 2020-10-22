# html-include-external-resources
Simple utility to inline external HTML resources from `<script> <links />  <img />` into single HTML file.

### Usage
``` npx html-inline-external --src ./index.html >> ./compiled.html```


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

### Examples : 
#### Write output to file:
Uses node fs and writes the output into the given file path

``` > npx html-inline-external --src ./index.html --dest ./compiled.html ```
``` > [Log] Wrote to file compiled.html. ```

#### Copy processed output to clipboard:
Copies the processed output to clipboard, Could be accessed by simply hitting `Ctrl/Cmd + V`

``` > npx html-inline-external --src ./index.html --copy ```
``` > [Log]: Copied to clipboard. ```

#### Prettify processed output:
Prettifies the processed output

``` > npx html-inline-external --src ./index.html --pretty --dest ./compiled.html ```
``` > [Log] Wrote to file compiled.html ```

#### Minfy processed output:
Minifies the processed output to remove whitespaces

``` > npx html-inline-external --src ./index.html --minify --dest ./compiled.html ```
``` > [Log] Wrote to file compiled.html ```

---
