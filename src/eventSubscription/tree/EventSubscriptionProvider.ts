/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { EventSubscription } from 'azure-arm-eventgrid/lib/models';
import { SubscriptionClient } from 'azure-arm-resource';
import { Location } from 'azure-arm-resource/lib/subscription/models';
import { AzureWizard, IActionContext, IAzureNode, IAzureTreeItem, IChildProvider, parseError } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';
import { EndpointUrlStep } from '../createWizard/EndpointUrlStep';
import { EventSubscriptionCreateStep } from '../createWizard/EventSubscriptionCreateStep';
import { EventSubscriptionNameStep } from '../createWizard/EventSubscriptionNameStep';
import { IEventSubscriptionWizardContext } from '../createWizard/IEventSubscriptionWizardContext';
import { TopicTypeStep } from '../createWizard/TopicTypeStep';
import { EventSubscriptionTreeItem } from './EventSubscriptionTreeItem';

export class EventSubscriptionProvider implements IChildProvider {
    public readonly childTypeLabel: string = localize('eventSubscription', 'Event Subscription');

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(node: IAzureNode): Promise<IAzureTreeItem[]> {
        const client: EventGridManagementClient = new EventGridManagementClient(node.credentials, node.subscriptionId);

        // There is no "listAll" method - we have to list individually by location
        const listByLocationTasks: Promise<EventSubscription[]>[] = (await listLocations(node)).map(async (location: Location) => {
            try {
                // tslint:disable-next-line:no-non-null-assertion
                return await client.eventSubscriptions.listRegionalBySubscription(location.name!);
            } catch (error) {
                // Ignore errors for regions where EventGrid is not supported
                if (parseError(error).errorType === 'NoRegisteredProviderFound') {
                    return [];
                } else {
                    throw error;
                }
            }
        });
        const eventSubscriptions: EventSubscription[] = (<EventSubscription[]>[]).concat(...(await Promise.all([client.eventSubscriptions.listGlobalBySubscription()].concat(...listByLocationTasks))));
        return eventSubscriptions.map((es: EventSubscription) => new EventSubscriptionTreeItem(es));
    }

    public async createChild(node: IAzureNode, showCreatingNode: (label: string) => void, actionContext?: IActionContext): Promise<IAzureTreeItem> {
        const wizardContext: IEventSubscriptionWizardContext = {
            credentials: node.credentials,
            subscriptionId: node.subscriptionId,
            subscriptionDisplayName: node.subscriptionDisplayName
        };

        const wizard: AzureWizard<IEventSubscriptionWizardContext> = new AzureWizard(
            [
                new EventSubscriptionNameStep(),
                new TopicTypeStep(),
                new EndpointUrlStep()
            ],
            [
                new EventSubscriptionCreateStep()
            ],
            wizardContext
        );

        // https://github.com/Microsoft/vscode-azuretools/issues/120
        // tslint:disable-next-line:strict-boolean-expressions
        actionContext = actionContext || <IActionContext>{ properties: {}, measurements: {} };

        await wizard.prompt(actionContext, ext.ui);
        // tslint:disable-next-line:no-non-null-assertion
        showCreatingNode(wizardContext.newEventSubscriptionName!);
        await wizard.execute(actionContext, ext.outputChannel);
        // tslint:disable-next-line:no-non-null-assertion
        return new EventSubscriptionTreeItem(wizardContext.eventSubscription!);
    }
}

async function listLocations(node: IAzureNode): Promise<Location[]> {
    const client: SubscriptionClient = new SubscriptionClient(node.credentials);
    return await client.subscriptions.listLocations(node.subscriptionId);
}
