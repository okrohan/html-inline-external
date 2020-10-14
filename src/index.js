const { JSDOM }  = require('jsdom')
const {readFileSync, writeFileSync} = require('fs')
const path = require('path');

const DEFAULT_TAGS_TO_RESOLVE = ['script', 'link']
let srcDir = ''
let document

const resolvePath = (src) => {
    return path.resolve(process.cwd(), src.trim())
}
const resolveDirPath = (src) => (srcDir + '/' + src)

const getFileString = (src) => {
    return readFileSync(resolvePath(src)).toString()
}


const resolveExternalScript = ({element}) => {
    if(!element.getAttribute('src')) return
    const src = element.getAttribute('src')
    const file = getFileString(resolveDirPath(src))
    console.log('Updating', src)
    element.innerHTML = file
    element.removeAttribute('src')
}

const resolveExternalLink = ({element}) => {
    const rel = element.getAttribute('rel')
    const href = element.getAttribute('href')
    const parentElement = element.parentElement

    if(!rel || !href) return

    switch(rel) {
        case 'stylesheet':
            console.log('Updating', href)
            const file = getFileString(resolveDirPath(href))
            const style = document.createElement('style')
            style.innerHTML = file
            parentElement.appendChild(style)
            break;

    }
}
const resolveElement = (element, tagName) => {
    console.log('Resolving Tag', tagName)
    switch(tagName){
        case 'script':
            resolveExternalScript({element})
            break;
        case 'link':
            resolveExternalLink({element})
            break;
    }
    
}

function htmlIncludeExternalResources({src='./index.html', dest = './compiled.html', tagsToResolve = DEFAULT_TAGS_TO_RESOLVE} = {}, resolveRemote = false){
    document = (new JSDOM(getFileString(src))).window.document;
    
    srcDir = path.dirname(src)
    tagsToResolve.forEach(tagName =>
        Array.from(document.getElementsByTagName(tagName)).forEach((element) => resolveElement(element, tagName))
    )
    writeFileSync(resolvePath(dest), document.querySelector( 'html' ).outerHTML)
}

htmlIncludeExternalResources()