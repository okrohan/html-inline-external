import { readFileSync, writeFileSync } from 'fs';
import jsdom from 'jsdom';
import path from 'path';
import clipboardy from 'clipboardy';
import htmlMinifier from 'html-minifier';
import prettify from 'pretty';

let srcDir = '';
let document;
const { JSDOM } = jsdom;

const resolvePath = (src) => path.resolve(process.cwd(), src.trim());

const resolveDirPath = (src) => (`${srcDir}/${src}`);

const getFileSync = (src) => readFileSync(resolvePath(src));

const getFileString = (src) => getFileSync(src).toString();

const writeToFile = (dest, text) => {
  console.log(`[Log] Wrote to file ${dest}`);
  writeFileSync(dest, text);
};

const base64Map = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/jpeg',
};

const resolveImageToBase64 = async ({ element, srcAttributeName = 'src' }) => {
  const src = element.getAttribute(srcAttributeName);
  if (!src || src.startsWith('http')) return;
  const base64String = getFileSync(resolveDirPath(src)).toString('base64');
  element.setAttribute(srcAttributeName, `data:${base64Map[path.extname(src).slice(1)] || 'image'};base64, ${base64String}`);
};

const resolveExternalScript = ({ element }) => {
  if (!element.getAttribute('src')) return;
  const src = element.getAttribute('src');
  const file = getFileString(resolvePath(resolveDirPath(src)));
  // eslint-disable-next-line
  element.innerHTML = file;
  element.removeAttribute('src');
};

const resolveExternalIcon = async ({ element }) => {
  if (!element.getAttribute('href')) return;
  resolveImageToBase64({ element, srcAttributeName: 'href' });
};

const resolveExternalStyleSheet = ({ element }) => {
  const href = element.getAttribute('href');
  const { parentElement } = element;

  if (!href) return;
  const file = getFileString(resolveDirPath(href));
  const style = document.createElement('style');
  style.innerHTML = file;
  parentElement.appendChild(style);
};

const resolveElement = (element, tagName) => {
  switch (tagName) {
    case 'script':
      resolveExternalScript({ element });
      break;
    case 'link':
      if (element.getAttribute('rel') === 'stylesheet') resolveExternalStyleSheet({ element });
      else if (element.getAttribute('rel') === 'icon') resolveExternalIcon({ element });
      break;
    case 'img':
      resolveImageToBase64({ element });
      break;
    default:
  }
};

const htmlInlineExternal = ({
  src, dest, tags, copy = false, pretty = false, minify = false,
} = {}) => {
  const dom = new JSDOM(getFileString(src));
  document = dom.window.document;
  srcDir = path.dirname(src);

  tags.forEach(async (tag) => {
    const tagName = tag.trim();
    const arr = Array.from(document.getElementsByTagName(tagName));
    arr.forEach(async (element) => resolveElement(element, tagName));
  });

  let resolvedDOM = dom.serialize();
  if (pretty) resolvedDOM = prettify(resolvedDOM);
  else if (minify) {
    resolvedDOM = htmlMinifier.minify(resolvedDOM,
      { collapseWhitespace: true, minifyCSS: true, minifyJS: true });
  }

  if (copy) {
    try {
      clipboardy.writeSync(resolvedDOM);
      console.log('[Log]: Copied to clipboard.');
    } catch (e) {
      console.warn('[Error]: Failed to write into clipboard.');
      writeToFile(resolvePath('compiled.html'), resolvedDOM);
    }
  } else if (dest) writeToFile(resolvePath(dest), resolvedDOM);
  else console.log(resolvedDOM);
};

export default htmlInlineExternal;
