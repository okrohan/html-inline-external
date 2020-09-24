const { JSDOM }  = require('jsdom')
const {readFileSync, writeFileSync} = require('fs')
const path = require('path');

const DEFAULT_TAGS_TO_RESOLVE = ['script']

const resolvePath = (src) => path.resolve(process.cwd(), src.trim())

const getFileString = (src) => readFileSync(resolvePath(src)).toString()

const resolveElement = (element, tagName, sourceDir , resolveRemote = false) => {
    const src = element.getAttribute('src')
    if(!src)
        return
    if(!resolveRemote && src.startsWith('http'))
        return
    const file = getFileString(sourceDir + '/'+src)
    console.log('Updating', src)
    element.innerHTML = file
    element.removeAttribute('src')
}

function htmlIncludeExternalResources({src='./test/index.html', dest = './test/compiled.html', tagsToResolve = DEFAULT_TAGS_TO_RESOLVE} = {}, resolveRemote = false){
    const { document } = (new JSDOM(getFileString(src))).window;
    tagsToResolve.forEach(tagName =>
        Array.from(document.getElementsByTagName(tagName)).forEach((element) => resolveElement(element, tagName, path.dirname(src)))
    )
    writeFileSync(resolvePath(dest), document.querySelector( 'html' ).outerHTML)
}

htmlIncludeExternalResources()