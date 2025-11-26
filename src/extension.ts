import * as vscode from "vscode";
import { validateAndParseOpenAPI } from "./openapi-parser";
import { generateHttpFile } from "./http-generator";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
    console.log("OpenAPI to HTTP extension is now active");

    const disposable = vscode.commands.registerCommand(
        "openapi-to-http.generateHttp",
        async () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage("No active editor found");
                return;
            }

            const document = editor.document;
            const filePath = document.uri.fsPath;

            try {
                // Show progress indicator
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Generating .http file",
                        cancellable: false,
                    },
                    async (progress) => {
                        progress.report({
                            increment: 0,
                            message: "Validating OpenAPI specification...",
                        });

                        // Validate and parse OpenAPI file
                        const openApiSpec = await validateAndParseOpenAPI(
                            filePath
                        );

                        if (!openApiSpec) {
                            vscode.window.showErrorMessage(
                                "The file is not a valid OpenAPI specification"
                            );
                            return;
                        }

                        progress.report({
                            increment: 30,
                            message: "OpenAPI file validated",
                        });

                        // Ask user for output filename
                        const fileName = await vscode.window.showInputBox({
                            prompt: "Enter the name for the .http file",
                            placeHolder: "api-requests.http",
                            value: "api-requests.http",
                            validateInput: (value: string) => {
                                if (!value) {
                                    return "Filename cannot be empty";
                                }
                                if (!value.endsWith(".http")) {
                                    return "Filename must end with .http";
                                }
                                return null;
                            },
                        });

                        if (!fileName) {
                            return; // User cancelled
                        }

                        progress.report({
                            increment: 50,
                            message: "Generating HTTP requests...",
                        });

                        // Generate .http file content
                        const httpContent = generateHttpFile(openApiSpec);

                        // Save file in the same directory as the OpenAPI spec
                        const outputDir = path.dirname(filePath);
                        const outputPath = path.join(outputDir, fileName);

                        fs.writeFileSync(outputPath, httpContent, "utf8");

                        progress.report({ increment: 100, message: "Done!" });

                        // Open the generated file
                        const doc = await vscode.workspace.openTextDocument(
                            outputPath
                        );
                        await vscode.window.showTextDocument(doc);

                        vscode.window.showInformationMessage(
                            `HTTP file generated: ${fileName}`
                        );
                    }
                );
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                vscode.window.showErrorMessage(`Error: ${errorMessage}`);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
