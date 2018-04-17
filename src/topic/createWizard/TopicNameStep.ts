/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureNameStep, IAzureUserInput, ResourceGroupListStep, resourceGroupNamingRules } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { ITopicWizardContext } from './ITopicWizardContext';

export class TopicNameStep<T extends ITopicWizardContext> extends AzureNameStep<T> {
    public async prompt(wizardContext: T, ui: IAzureUserInput): Promise<T> {
        if (!wizardContext.newTopicName) {
            const suggestedName: string | undefined = wizardContext.relatedNameTask ? await wizardContext.relatedNameTask : undefined;
            wizardContext.newTopicName = (await ui.showInputBox({
                value: suggestedName,
                placeHolder: localize('namePlaceholder', 'Topic name'),
                prompt: localize('namePrompt', 'Provide a topic name.'),
                validateInput: this.validateName
            })).trim();

            if (!wizardContext.relatedNameTask) {
                wizardContext.relatedNameTask = this.generateRelatedName(wizardContext, wizardContext.newTopicName, resourceGroupNamingRules);
            }
        }

        return wizardContext;
    }

    protected async isRelatedNameAvailable(wizardContext: T, name: string): Promise<boolean> {
        return await ResourceGroupListStep.isNameAvailable(wizardContext, name);
    }

    private async validateName(name: string | undefined): Promise<string | undefined> {
        name = name ? name.trim() : '';

        const min: number = 3;
        const max: number = 50;
        if (name.length < min || name.length > max) {
            return localize('invalidLength', 'The name must be between {0} and {1} characters.', min, max);
        } else if (name.match(/[^a-zA-Z0-9\-]/) !== null) {
            return localize('invalidChars', "The name can only contain letters, numbers, and hyphens.");
        } else {
            return undefined;
        }
    }
}
