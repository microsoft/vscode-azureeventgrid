/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { AzureActionHandler, AzureUserInput, callWithTelemetryAndErrorHandling, IActionContext } from 'vscode-azureextensionui';
import TelemetryReporter from 'vscode-extension-telemetry';
import { registerEventSubscriptionCommands } from './eventSubscription/registerEventSubscriptionCommands';
import { ext } from './extensionVariables';
import { registerTopicCommands } from './topic/registerTopicCommands';

export function activate(context: vscode.ExtensionContext): void {
    ext.context = context;

    try {
        // tslint:disable-next-line:non-literal-require no-unsafe-any
        const packageInfo: IPackageInfo = require(context.asAbsolutePath('./package.json'));
        ext.reporter = new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    } catch (error) {
        // swallow exceptions so that telemetry doesn't affect user
    }

    ext.outputChannel = vscode.window.createOutputChannel('Azure Event Grid');
    context.subscriptions.push(ext.outputChannel);

    // tslint:disable-next-line:no-floating-promises
    callWithTelemetryAndErrorHandling('azureEventGrid.activate', ext.reporter, ext.outputChannel, async function (this: IActionContext): Promise<void> {
        this.properties.isActivationEvent = 'true';
        ext.ui = new AzureUserInput(context.globalState);
        ext.actionHandler = new AzureActionHandler(context, ext.outputChannel, ext.reporter);

        registerTopicCommands();
        registerEventSubscriptionCommands();

        ext.actionHandler.registerCommand('azureEventGrid.selectSubscriptions', async () => await vscode.commands.executeCommand('azure-account.selectSubscriptions'));
    });
}

// tslint:disable-next-line:no-empty
export function deactivate(): void {
}

interface IPackageInfo {
    name: string;
    version: string;
    aiKey: string;
}
