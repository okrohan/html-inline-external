

/* eslint-disable no-console */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import htmlInlineExternal from './html-inline-resources.mjs';

const { argv } = yargs(hideBin(process.argv));

const ARGUMENTS = {
  SRC: 'src',
  DEST: 'dest',
  PRETTY: 'pretty',
  TAGS: 'tags',
};
const DEFAULT_TAGS_TO_RESOLVE = 'script,link,img';

const getWarning = (shouldWarn) => (warning) => shouldWarn && console.warn(`[Warning] ${warning}`);
const getLogger = (shouldLog) => (log) => shouldLog && console.log(`[Log] ${log}`);

const validate = () => {
  const warning = getWarning(argv[ARGUMENTS.DEST]);
  const logger = getLogger(argv[ARGUMENTS.DEST]);

  if (!argv[ARGUMENTS.SRC] || typeof argv[ARGUMENTS.SRC] !== 'string') {
    console.error('[Error] Missing --src argument, Please pass path to source file.');
    process.exit(1);
  }

  if (!argv[ARGUMENTS.TAGS]) { logger(`Tags not passed, [${DEFAULT_TAGS_TO_RESOLVE}]  would be processed.`); }

  if (typeof argv[ARGUMENTS.TAGS] === 'boolean') {
    warning(`Invalid tags passed, Fallback : [${DEFAULT_TAGS_TO_RESOLVE}]  would be processed.`);
  }
};

async function main() {
  const {
    src, dest, tags = DEFAULT_TAGS_TO_RESOLVE, pretty,
  } = argv;
  console.log({
    src, dest, pretty, tags: tags.trim().split(','),
  })
  validate();
  try {
    await htmlInlineExternal({
      src, dest, pretty, tags: tags.trim().split(','),
    });
    getLogger(dest)('Completed, Written into '+dest)
  } catch (error) {
    console.error('[Error]: Unexpected Error', error);
  }
}

main();
