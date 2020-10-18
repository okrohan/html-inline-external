import {readFileSync, writeFileSync} from 'fs'
import jsdom from 'jsdom'
import path from 'path';
import imageToBase64 from 'image-to-base64'

const {JSDOM} = jsdom

const DEFAULT_TAGS_TO_RESOLVE = ['script', 'link', 'img']
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
    const file = getFileString(resolvePath(resolveDirPath(src)))
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

const resolveImageToBase64 = async({element}) => {
    const src = element.getAttribute('src')
    if(!src) return
    console.log('----->', resolveDirPath(src))
    const base64String = await imageToBase64(src)
    element.setAttribute ('src',`data:image;base64, ${base64String}`)
    console.log('Done With IMG')
}

const resolveElement = async (element, tagName) => {
    console.log('Resolving Tag', tagName)
    switch(tagName){
        case 'script':
            resolveExternalScript({element})
            break;
        case 'link':
            resolveExternalLink({element})
            break;
        case 'img':
            await resolveImageToBase64({element})
            break
    }
    
}

async function htmlIncludeExternalResources({src='./index.html', dest = './compiled.html', tagsToResolve = DEFAULT_TAGS_TO_RESOLVE} = {}, resolveRemote = false){
    document = (new JSDOM(getFileString(src))).window.document;
    
    srcDir = path.dirname(src)
    await tagsToResolve.forEach(async tagName =>
        await Array.from(document.getElementsByTagName(tagName)).forEach(async(element) => await resolveElement(element, tagName))
    )
    writeFileSync(resolvePath(dest), document.querySelector( 'html' ).outerHTML)
}

await htmlIncludeExternalResources()
console.log('Done!')