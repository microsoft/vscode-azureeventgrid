/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import IotHubClient = require('azure-arm-iothub');
import { IotHubDescription } from 'azure-arm-iothub/lib/models';
import { AzureWizardPromptStep, IAzureQuickPickItem, IAzureQuickPickOptions, IAzureUserInput, ISubscriptionWizardContext } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';

export interface IIoTHubWizardContext extends ISubscriptionWizardContext {
    iotHub?: IotHubDescription;
}

export class IoTHubListStep<T extends IIoTHubWizardContext> extends AzureWizardPromptStep<T> {
    public async prompt(wizardContext: T, ui: IAzureUserInput): Promise<T> {
        if (!wizardContext.iotHub) {
            const quickPickOptions: IAzureQuickPickOptions = { placeHolder: localize('listPlaceHolder', 'Select an IoT Hub'), id: `IoTHubListStep/${wizardContext.subscriptionId}` };
            wizardContext.iotHub = (await ui.showQuickPick(this.getQuickPicks(wizardContext), quickPickOptions)).data;
        }

        return wizardContext;
    }

    private async getQuickPicks(wizardContext: T): Promise<IAzureQuickPickItem<IotHubDescription>[]> {
        const client: IotHubClient = new IotHubClient(wizardContext.credentials, wizardContext.subscriptionId);
        const hubs: IotHubDescription[] = await client.iotHubResource.listBySubscription();
        return hubs.map((h: IotHubDescription) => {
            return {
                id: h.id,
                // tslint:disable-next-line:no-non-null-assertion
                label: h.name!,
                description: '',
                data: h
            };
        });
    }
}
