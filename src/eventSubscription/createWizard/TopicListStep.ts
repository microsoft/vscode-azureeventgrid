/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { Topic } from 'azure-arm-eventgrid/lib/models';
import { AzureWizard, AzureWizardPromptStep, IAzureQuickPickItem, IAzureQuickPickOptions, IAzureUserInput, LocationListStep, ResourceGroupListStep } from 'vscode-azureextensionui';
import { ITopicWizardContext } from '../../topic/createWizard/ITopicWizardContext';
import { TopicCreateStep } from '../../topic/createWizard/TopicCreateStep';
import { TopicNameStep } from '../../topic/createWizard/TopicNameStep';
import { localize } from '../../utils/localize';

export class TopicListStep<T extends ITopicWizardContext> extends AzureWizardPromptStep<T> {
    public async prompt(wizardContext: T, ui: IAzureUserInput): Promise<T> {
        if (!wizardContext.topic) {
            const client: EventGridManagementClient = new EventGridManagementClient(wizardContext.credentials, wizardContext.subscriptionId);

            const quickPickOptions: IAzureQuickPickOptions = { placeHolder: localize('topicPlaceHolder', 'Select a topic'), id: `TopicListStep/${wizardContext.subscriptionId}` };
            wizardContext.topic = (await ui.showQuickPick(this.getQuickPicks(client.topics.listBySubscription()), quickPickOptions)).data;

            if (!wizardContext.topic) {
                this.subWizard = new AzureWizard(
                    [
                        new TopicNameStep(),
                        new ResourceGroupListStep(),
                        new LocationListStep()
                    ],
                    [
                        new TopicCreateStep()
                    ],
                    wizardContext
                );
            }
        }

        return wizardContext;
    }

    private async getQuickPicks(topicsTask: Promise<Topic[]>): Promise<IAzureQuickPickItem<Topic | undefined>[]> {
        const picks: IAzureQuickPickItem<Topic | undefined>[] = [{
            label: localize('newTopic', '$(plus) Create new topic'),
            description: '',
            data: undefined
        }];

        const topics: Topic[] = await topicsTask;
        return picks.concat(topics.map((t: Topic) => {
            return {
                id: t.id,
                // tslint:disable-next-line:no-non-null-assertion
                label: t.name!,
                description: '',
                data: t
            };
        }));
    }
}
