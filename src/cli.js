#!/usr/bin/env node
/* eslint-disable no-console */
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const clipboardy = require('clipboardy');
const { writeFileSync } = require('fs');
const path = require('path');
const htmlInlineExternal = require('./html-inline-external.js');

const { argv } = yargs(hideBin(process.argv));

const ARGUMENTS = {
  SRC: 'src',
  DEST: 'dest',
  PRETTY: 'pretty',
  MINIFY: 'minify',
  TAGS: 'tags',
  COPY: 'copy',
};
const DEFAULT_TAGS_TO_RESOLVE = 'script,link,img';

const getWarning = (shouldWarn) => (warning) => shouldWarn && console.warn(`[Warning] ${warning}`);

const writeToFile = (dest = 'compiled.html', text) => {
  console.log(`[Log] Wrote to file ${dest}`);
  writeFileSync(path.resolve(process.cwd(), dest.trim()), text);
};

const validate = () => {
  const warning = getWarning(argv[ARGUMENTS.DEST]);

  if (!argv[ARGUMENTS.SRC] || typeof argv[ARGUMENTS.SRC] !== 'string') {
    console.error('[Error] Missing --src argument, Please pass path to source file.');
    process.exit(1);
  }
  if (typeof argv[ARGUMENTS.TAGS] === 'boolean') {
    warning(`Invalid tags passed, Fallback : [${DEFAULT_TAGS_TO_RESOLVE}]  would be processed.`);
  }
};

async function main() {
  const {
    src, dest, tags, pretty, copy, minify,
  } = argv;
  validate();
  try {
    const resolvedDOM = await htmlInlineExternal({
      src, dest, pretty, tags: tags && tags.trim().split(','), copy, minify,
    });
    if (copy) {
      try {
        clipboardy.writeSync(resolvedDOM);
        console.log('[Log]: Copied to clipboard.');
      } catch (e) {
        console.warn('[Error]: Failed to write into clipboard.');
        writeToFile(dest, resolvedDOM);
      }
    } else if (dest) writeToFile(dest, resolvedDOM);
    else console.log(resolvedDOM);
  } catch (error) {
    console.error('[Error]: Unexpected Error', error);
  }
}

main();
