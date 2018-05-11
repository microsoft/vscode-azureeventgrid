/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventHubManagementClient } from 'azure-arm-eventhub';
import { EHNamespace, Eventhub } from 'azure-arm-eventhub/lib/models';
import { AzureWizardPromptStep, IAzureQuickPickItem, IAzureQuickPickOptions, IAzureUserInput, ISubscriptionWizardContext } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';

export interface IEventHubsNamespaceWizardContext extends ISubscriptionWizardContext {
    eventHubsNamespace?: EHNamespace;
}

export class EventHubsNamespaceListStep<T extends IEventHubsNamespaceWizardContext> extends AzureWizardPromptStep<T> {
    public async prompt(wizardContext: T, ui: IAzureUserInput): Promise<T> {
        if (!wizardContext.eventHubsNamespace) {
            const quickPickOptions: IAzureQuickPickOptions = { placeHolder: localize('listPlaceHolder', 'Select an Event Hubs Namespace'), id: `EventHubsNamespaceListStep/${wizardContext.subscriptionId}` };
            wizardContext.eventHubsNamespace = (await ui.showQuickPick(this.getQuickPicks(wizardContext), quickPickOptions)).data;
        }

        return wizardContext;
    }

    private async getQuickPicks(wizardContext: T): Promise<IAzureQuickPickItem<Eventhub>[]> {
        const client: EventHubManagementClient = new EventHubManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
        const namespaces: EHNamespace[] = await client.namespaces.list();
        return namespaces.map((n: EHNamespace) => {
            return {
                id: n.id,
                // tslint:disable-next-line:no-non-null-assertion
                label: n.name!,
                description: '',
                data: n
            };
        });
    }
}
