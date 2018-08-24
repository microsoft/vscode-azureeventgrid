/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { AzureWizardExecuteStep } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { azureUtils } from '../../utils/azureUtils';
import { localize } from '../../utils/localize';
import { ITopicWizardContext } from './ITopicWizardContext';

export class TopicCreateStep<T extends ITopicWizardContext> extends AzureWizardExecuteStep<T> {
    public async execute(wizardContext: T): Promise<T> {
        if (!wizardContext.topic) {
            ext.outputChannel.appendLine(localize('creating', 'Creating topic "{0}"...', wizardContext.newTopicName));
            const client: EventGridManagementClient = azureUtils.getEventGridManagementClient(wizardContext);
            // tslint:disable-next-line:no-non-null-assertion
            wizardContext.topic = await client.topics.createOrUpdate(wizardContext.resourceGroup!.name!, wizardContext.newTopicName!, { location: wizardContext.location!.name! });
            ext.outputChannel.appendLine(localize('created', 'Successfully created topic "{0}".', wizardContext.newTopicName));
        }

        return wizardContext;
    }
}
