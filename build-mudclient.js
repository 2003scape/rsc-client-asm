#!/usr/bin/env node

const fs = require('fs');

const MUDCLIENT_TPL = fs.readFileSync(
    `${__dirname}/src/mudclient.tpl.ts`,
    'utf8'
);
const uiFiles = fs.readdirSync(`${__dirname}/src/ui`);

const uiCodeLines = [];

for (const uiFile of uiFiles) {
    if (uiFile === 'colours.ts') {
        continue;
    }

    const uiCode = fs
        .readFileSync(`${__dirname}/src/ui/${uiFile}`, 'utf8')
        .split('\n')
        .map((line) => {
            return `    ${line}`.trimEnd();
        });

    uiCodeLines.push(...uiCode);
}

console.log(
    MUDCLIENT_TPL.replace('    /* $_uiComponents */', uiCodeLines.join('\n'))
);
