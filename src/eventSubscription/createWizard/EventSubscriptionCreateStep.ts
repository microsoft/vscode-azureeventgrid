/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { WebHookEventSubscriptionDestination } from 'azure-arm-eventgrid/lib/models';
import * as vscode from 'vscode';
import { AzureWizardExecuteStep, createAzureClient, IResourceGroupWizardContext, IStorageAccountWizardContext } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { ITopicWizardContext } from '../../topic/createWizard/ITopicWizardContext';
import { localize } from '../../utils/localize';
import { IContainerRegistryWizardContext } from './ContainerRegistryListStep';
import { IEventHubsNamespaceWizardContext } from './EventHubsNamespaceListStep';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";
import { IIoTHubWizardContext } from './IoTHubListStep';
import { TopicType } from './TopicTypeStep';

export class EventSubscriptionCreateStep extends AzureWizardExecuteStep<IEventSubscriptionWizardContext> {
    public async execute(wizardContext: IEventSubscriptionWizardContext): Promise<IEventSubscriptionWizardContext> {
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
                case TopicType.ContainerRegistry:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<IContainerRegistryWizardContext>wizardContext).registry!.id!;
                    break;
                case TopicType.EventHubsNamespace:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<IEventHubsNamespaceWizardContext>wizardContext).eventHubsNamespace!.id!;
                    break;
                case TopicType.IoTHub:
                    // tslint:disable-next-line:no-non-null-assertion
                    topicId = (<IIoTHubWizardContext>wizardContext).iotHub!.id!;
                    break;
                default:
                    throw new Error(localize('unrecognizedTopicType', 'Unrecognized topic type "{0}".', wizardContext.topicType));
            }

            ext.outputChannel.appendLine(localize('creating', 'Creating event subscription "{0}" for topic "{1}"...', wizardContext.newEventSubscriptionName, topicId));

            const client: EventGridManagementClient = createAzureClient(wizardContext, EventGridManagementClient);
            // tslint:disable-next-line:no-non-null-assertion
            wizardContext.eventSubscription = await client.eventSubscriptions.createOrUpdate(topicId, wizardContext.newEventSubscriptionName!, {
                destination: <WebHookEventSubscriptionDestination>{
                    endpointUrl: wizardContext.endpointUrl,
                    endpointType: 'WebHook'
                }
            });

            const message: string = localize('created', 'Successfully created event subscription "{0}".', wizardContext.newEventSubscriptionName);
            ext.outputChannel.appendLine(message);
            vscode.window.showInformationMessage(message);
        }

        return wizardContext;
    }
}
