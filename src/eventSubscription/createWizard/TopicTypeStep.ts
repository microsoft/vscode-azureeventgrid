/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizard, AzureWizardPromptStep, IAzureQuickPickItem, ResourceGroupListStep, StorageAccountKind, StorageAccountListStep, StorageAccountPerformance, StorageAccountReplication } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';
import { ContainerRegistryListStep } from './ContainerRegistryListStep';
import { EventHubsNamespaceListStep } from './EventHubsNamespaceListStep';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";
import { IoTHubListStep } from './IoTHubListStep';
import { TopicListStep } from './TopicListStep';

export enum TopicType {
    Subscription = 'Azure Subscriptions',
    ContainerRegistry = 'Container Registries',
    EventGridTopic = 'Event Grid Topics',
    EventHubsNamespace = 'Event Hubs Namespaces',
    IoTHub = 'IoT Hubs',
    ResourceGroup = 'Resource Groups',
    StorageAccount = 'Storage Accounts'
}

export class TopicTypeStep extends AzureWizardPromptStep<IEventSubscriptionWizardContext> {
    public async prompt(wizardContext: IEventSubscriptionWizardContext): Promise<IEventSubscriptionWizardContext> {
        if (wizardContext.topicType === undefined) {
            const picks: IAzureQuickPickItem<TopicType>[] = Object.keys(TopicType).map((key: string) => {
                return {
                    label: TopicType[key],
                    description: '',
                    data: TopicType[key]
                };
            });

            wizardContext.topicType = (await ext.ui.showQuickPick(picks, { placeHolder: localize('selectType', 'Select a topic type') })).data;

            switch (wizardContext.topicType) {
                case TopicType.StorageAccount:
                    this.subWizard = new AzureWizard(
                        [
                            new StorageAccountListStep(
                                {
                                    kind: StorageAccountKind.StorageV2,
                                    performance: StorageAccountPerformance.Standard,
                                    replication: StorageAccountReplication.LRS
                                },
                                {
                                    kind: [
                                        StorageAccountKind.Storage
                                    ],
                                    learnMoreLink: 'https://aka.ms/H257ds'
                                }
                            )
                        ],
                        [],
                        wizardContext
                    );
                    break;
                case TopicType.Subscription:
                    // no subWizard necessary
                    break;
                case TopicType.ResourceGroup:
                    this.subWizard = new AzureWizard(
                        [
                            new ResourceGroupListStep()
                        ],
                        [],
                        wizardContext
                    );
                    break;
                case TopicType.EventGridTopic:
                    this.subWizard = new AzureWizard(
                        [
                            new TopicListStep()
                        ],
                        [],
                        wizardContext
                    );
                    break;
                case TopicType.ContainerRegistry:
                    this.subWizard = new AzureWizard(
                        [
                            new ContainerRegistryListStep()
                        ],
                        [],
                        wizardContext
                    );
                    break;
                case TopicType.EventHubsNamespace:
                    this.subWizard = new AzureWizard(
                        [
                            new EventHubsNamespaceListStep()
                        ],
                        [],
                        wizardContext
                    );
                    break;
                case TopicType.IoTHub:
                    this.subWizard = new AzureWizard(
                        [
                            new IoTHubListStep()
                        ],
                        [],
                        wizardContext
                    );
                    break;
                default:
                    throw new RangeError(localize('unrecognizedTopicType', 'Unrecognized topic type "{0}".', wizardContext.topicType));
            }
        }

        return wizardContext;
    }
}
