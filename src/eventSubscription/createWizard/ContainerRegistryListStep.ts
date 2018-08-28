/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ContainerRegistryManagementClient } from 'azure-arm-containerregistry';
import { Registry } from 'azure-arm-containerregistry/lib/models';
import { AzureWizardPromptStep, createAzureClient, IAzureQuickPickItem, IAzureQuickPickOptions, ISubscriptionWizardContext } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';

export interface IContainerRegistryWizardContext extends ISubscriptionWizardContext {
    registry?: Registry;
}

export class ContainerRegistryListStep<T extends IContainerRegistryWizardContext> extends AzureWizardPromptStep<T> {
    public async prompt(wizardContext: T): Promise<T> {
        if (!wizardContext.registry) {
            const quickPickOptions: IAzureQuickPickOptions = { placeHolder: localize('listPlaceHolder', 'Select a registry'), id: `ContainerRegistryListStep/${wizardContext.subscriptionId}` };
            wizardContext.registry = (await ext.ui.showQuickPick(this.getQuickPicks(wizardContext), quickPickOptions)).data;
        }

        return wizardContext;
    }

    private async getQuickPicks(wizardContext: T): Promise<IAzureQuickPickItem<Registry>[]> {
        const client: ContainerRegistryManagementClient = createAzureClient(wizardContext, ContainerRegistryManagementClient);
        const registries: Registry[] = await client.registries.list();
        return registries.map((r: Registry) => {
            return {
                id: r.id,
                // tslint:disable-next-line:no-non-null-assertion
                label: r.name!,
                description: '',
                data: r
            };
        });
    }
}
