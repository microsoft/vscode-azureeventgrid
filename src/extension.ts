/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { AzureUserInput, callWithTelemetryAndErrorHandling, createTelemetryReporter, IActionContext, registerCommand, registerUIExtensionVariables } from 'vscode-azureextensionui';
import { registerEventSubscriptionCommands } from './eventSubscription/registerEventSubscriptionCommands';
import { ext } from './extensionVariables';
import { registerTopicCommands } from './topic/registerTopicCommands';

export function activate(context: vscode.ExtensionContext): void {
    registerUIExtensionVariables(ext);
    ext.context = context;
    ext.reporter = createTelemetryReporter(context);
    ext.outputChannel = vscode.window.createOutputChannel('Azure Event Grid');
    context.subscriptions.push(ext.outputChannel);

    // tslint:disable-next-line:no-floating-promises
    callWithTelemetryAndErrorHandling('azureEventGrid.activate', async function (this: IActionContext): Promise<void> {
        this.properties.isActivationEvent = 'true';
        ext.ui = new AzureUserInput(context.globalState);

        registerTopicCommands();
        registerEventSubscriptionCommands();

        registerCommand('azureEventGrid.selectSubscriptions', async () => await vscode.commands.executeCommand('azure-account.selectSubscriptions'));
    });
}

// tslint:disable-next-line:no-empty
export function deactivate(): void {
}
