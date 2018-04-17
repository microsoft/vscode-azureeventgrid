/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizard, AzureWizardPromptStep, IAzureQuickPickItem, IAzureUserInput, ResourceGroupListStep, StorageAccountKind, StorageAccountListStep, StorageAccountPerformance, StorageAccountReplication } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";
import { TopicListStep } from './TopicListStep';

export enum TopicType {
    StorageAccount = 'Storage Accounts',
    Subscription = 'Azure Subscriptions',
    ResourceGroup = 'Resource Groups',
    EventGridTopic = 'Event Grid Topics'
}

export class TopicTypeStep extends AzureWizardPromptStep<IEventSubscriptionWizardContext> {
    public async prompt(wizardContext: IEventSubscriptionWizardContext, ui: IAzureUserInput): Promise<IEventSubscriptionWizardContext> {
        if (wizardContext.topicType === undefined) {
            const picks: IAzureQuickPickItem<TopicType>[] = Object.keys(TopicType).map((key: string) => {
                return {
                    label: TopicType[key],
                    description: '',
                    data: TopicType[key]
                };
            });

            wizardContext.topicType = (await ui.showQuickPick(picks, { placeHolder: localize('selectType', 'Select a topic type') })).data;

            switch (wizardContext.topicType) {
                case TopicType.StorageAccount:
                    this.subWizard = new AzureWizard(
                        [
                            new StorageAccountListStep(StorageAccountKind.StorageV2, StorageAccountPerformance.Standard, StorageAccountReplication.LRS)
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
                default:
                    throw new Error(localize('unrecognizedTopicType', 'Unrecognized topic type "{0}".', wizardContext.topicType));
            }
        }

        return wizardContext;
    }
}
