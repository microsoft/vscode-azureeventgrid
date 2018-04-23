/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { OutputChannel } from 'vscode';
import { AzureWizardExecuteStep } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { ITopicWizardContext } from './ITopicWizardContext';

export class TopicCreateStep<T extends ITopicWizardContext> extends AzureWizardExecuteStep<T> {
    public async execute(wizardContext: T, outputChannel: OutputChannel): Promise<T> {
        if (!wizardContext.topic) {
            outputChannel.appendLine(localize('creating', 'Creating topic "{0}"...', wizardContext.newTopicName));
            const client: EventGridManagementClient = new EventGridManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
            // tslint:disable-next-line:no-non-null-assertion
            wizardContext.topic = await client.topics.createOrUpdate(wizardContext.resourceGroup!.name!, wizardContext.newTopicName!, { location: wizardContext.location!.name! });
            outputChannel.appendLine(localize('created', 'Successfully created topic "{0}".', wizardContext.newTopicName));
        }

        return wizardContext;
    }
}
