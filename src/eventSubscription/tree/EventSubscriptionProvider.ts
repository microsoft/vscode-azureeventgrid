/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { EventSubscription } from 'azure-arm-eventgrid/lib/models';
import { SubscriptionClient } from 'azure-arm-resource';
import { Location } from 'azure-arm-resource/lib/subscription/models';
import { AzureWizard, createAzureClient, createAzureSubscriptionClient, IActionContext, ISubscriptionRoot, parseError, SubscriptionTreeItem } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { EndpointUrlStep } from '../createWizard/EndpointUrlStep';
import { EventSubscriptionCreateStep } from '../createWizard/EventSubscriptionCreateStep';
import { EventSubscriptionNameStep } from '../createWizard/EventSubscriptionNameStep';
import { IEventSubscriptionWizardContext } from '../createWizard/IEventSubscriptionWizardContext';
import { TopicTypeStep } from '../createWizard/TopicTypeStep';
import { EventSubscriptionTreeItem } from './EventSubscriptionTreeItem';

export class EventSubscriptionProvider extends SubscriptionTreeItem {
    public readonly childTypeLabel: string = localize('eventSubscription', 'Event Subscription');

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<EventSubscriptionTreeItem[]> {
        const client: EventGridManagementClient = createAzureClient(this.root, EventGridManagementClient);

        // There is no "listAll" method - we have to list individually by location
        const listByLocationTasks: Promise<EventSubscription[]>[] = (await listLocations(this.root)).map(async (location: Location) => {
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
        return eventSubscriptions.map((es: EventSubscription) => new EventSubscriptionTreeItem(this, es));
    }

    public async createChildImpl(showCreatingNode: (label: string) => void, actionContext?: IActionContext): Promise<EventSubscriptionTreeItem> {
        const wizardContext: IEventSubscriptionWizardContext = Object.assign({}, this.root);

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

        await wizard.prompt(actionContext);
        // tslint:disable-next-line:no-non-null-assertion
        showCreatingNode(wizardContext.newEventSubscriptionName!);
        await wizard.execute(actionContext);
        // tslint:disable-next-line:no-non-null-assertion
        return new EventSubscriptionTreeItem(this, wizardContext.eventSubscription!);
    }
}

async function listLocations(root: ISubscriptionRoot): Promise<Location[]> {
    const client: SubscriptionClient = createAzureSubscriptionClient(root, SubscriptionClient);
    return await client.subscriptions.listLocations(root.subscriptionId);
}
