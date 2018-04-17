/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { WebHookEventSubscriptionDestination } from 'azure-arm-eventgrid/lib/models';
import { OutputChannel } from 'vscode';
import { AzureWizardExecuteStep, IResourceGroupWizardContext, IStorageAccountWizardContext } from 'vscode-azureextensionui';
import { ITopicWizardContext } from '../../topic/createWizard/ITopicWizardContext';
import { localize } from '../../utils/localize';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";
import { TopicType } from './TopicTypeStep';

export class EventSubscriptionCreateStep extends AzureWizardExecuteStep<IEventSubscriptionWizardContext> {
    public async execute(wizardContext: IEventSubscriptionWizardContext, outputChannel: OutputChannel): Promise<IEventSubscriptionWizardContext> {
        if (!wizardContext.eventSubscription) {
            let topicId: string;
            switch (wizardContext.topicType) {
                case TopicType.StorageAccount:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<IStorageAccountWizardContext>wizardContext).storageAccount!.id!;
                    break;
                case TopicType.Subscription:
                    topicId = `/subscriptions/${wizardContext.subscriptionId}`;
                    break;
                case TopicType.ResourceGroup:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<IResourceGroupWizardContext>wizardContext).resourceGroup!.id!;
                    break;
                case TopicType.EventGridTopic:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<ITopicWizardContext>wizardContext).topic!.id!;
                    break;
                default:
                    throw new Error(localize('unrecognizedTopicType', 'Unrecognized topic type "{0}".', wizardContext.topicType));
            }

            outputChannel.appendLine(localize('creating', 'Creating event subscription "{0}" for topic "{1}"...', wizardContext.newEventSubscriptionName, topicId));

            const client: EventGridManagementClient = new EventGridManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
            // tslint:disable-next-line:no-non-null-assertion
            wizardContext.eventSubscription = await client.eventSubscriptions.createOrUpdate(topicId, wizardContext.newEventSubscriptionName!, {
                destination: <WebHookEventSubscriptionDestination>{
                    endpointUrl: wizardContext.endpointUrl,
                    endpointType: 'WebHook'
                }
            });

            outputChannel.appendLine(localize('created', 'Successfully created event subscription "{0}".', wizardContext.newEventSubscriptionName));
        }

        return wizardContext;
    }
}
