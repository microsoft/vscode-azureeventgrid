/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable:no-console
// tslint:disable:no-implicit-dependencies (this allows the use of dev dependencies)

// Grandfathered in
// tslint:disable:typedef
// tslint:disable:no-unsafe-any

import * as cp from 'child_process';
import * as gulp from 'gulp';
import * as path from 'path';
import { gulp_installAzureAccount } from 'vscode-azureextensiondev';

function test() {
    const env = process.env;
    env.DEBUGTELEMETRY = '1';
    env.MOCHA_timeout = String(10 * 1000);
    env.MOCHA_reporter = 'mocha-junit-reporter';
    env.MOCHA_FILE = path.join(__dirname, 'test-results.xml');
    return cp.spawn('node', ['./node_modules/vscode/bin/test'], { stdio: 'inherit', env });
}

exports.test = gulp.series(gulp_installAzureAccount, test);
