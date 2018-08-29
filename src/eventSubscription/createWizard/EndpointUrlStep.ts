/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';
import { IEndpointUrlWizardContext } from './IEndpointUrlWizardContext';

export class EndpointUrlStep<T extends IEndpointUrlWizardContext> extends AzureWizardPromptStep<T> {
    public async prompt(wizardContext: T): Promise<T> {
        if (!wizardContext.endpointUrl) {
            wizardContext.endpointUrl = (await ext.ui.showInputBox({
                placeHolder: localize('urlPlaceholder', 'Subscriber Endpoint'),
                prompt: localize('urlPrompt', 'Provide a subscriber endpoint.'),
                validateInput: this.validateInput
            })).trim();
        }

        return wizardContext;
    }

    private validateInput(value: string | undefined): string | undefined {
        if (!value) {
            return localize('noEmpty', 'Subscriber endpoint cannot be empty.');
        } else {
            return undefined;
        }
    }
}
