/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { Position, TextDocument, TextEditor, TextEditorEdit, Uri, ViewColumn, window, workspace } from "vscode";
import { localize } from './localize';

export namespace fsUtils {
    export async function getUniqueFileName(folderPath: string, prefix: string, suffix?: string): Promise<string> {
        let count: number = 0;
        const maxCount: number = 1024;

        while (count < maxCount) {
            const fullFileName: string = `${prefix}${count === 0 ? '' : `-${count}`}${suffix}`;

            const fullPath: string = path.join(folderPath, fullFileName);

            const pathExists: boolean = await fse.pathExists(fullPath);
            const editorExists: boolean = workspace.textDocuments.some((doc: TextDocument) => isPathEqual(doc.uri.fsPath, fullPath));
            if (!pathExists && !editorExists) {
                return fullFileName;
            }

            count += 1;
        }

        throw new Error(localize('failedUnique', 'Failed to find unique name for new file.'));
    }

    export function isPathEqual(fsPath1: string, fsPath2: string): boolean {
        return path.relative(fsPath1, fsPath2) === '';
    }

    export async function showNewFile(data: string, fileNamePrefix: string, fileNameSuffix: string, viewColumn?: number): Promise<void> {
        const folderPath: string = workspace.rootPath || os.homedir();
        const fileName: string = await getUniqueFileName(folderPath, fileNamePrefix, fileNameSuffix);
        const uri: Uri = Uri.file(path.join(folderPath, fileName)).with({ scheme: 'untitled' });
        const doc: TextDocument = await workspace.openTextDocument(uri);
        const editor: TextEditor = await window.showTextDocument(doc, viewColumn !== undefined && viewColumn > 3 ? ViewColumn.One : viewColumn);
        await editor.edit((builder: TextEditorEdit) => {
            builder.insert(new Position(0, 0), data);
        });
    }
}
