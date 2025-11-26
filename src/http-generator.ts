import { OpenAPIV3 } from "openapi-types";
import { getBaseUrl, getOperations, OperationInfo } from "./openapi-parser";
import { generateSampleData } from "./data-generator";

/**
 * Generates a .http file from an OpenAPI specification
 * @param spec Parsed OpenAPI specification
 * @returns Content of the .http file
 */
export function generateHttpFile(spec: OpenAPIV3.Document): string {
    const baseUrl = getBaseUrl(spec);
    const operations = getOperations(spec);

    let content = `# Generated from OpenAPI Specification\n`;
    content += `# Title: ${spec.info.title}\n`;
    content += `# Version: ${spec.info.version}\n`;
    if (spec.info.description) {
        content += `# Description: ${spec.info.description}\n`;
    }
    content += `\n`;
    content += `@baseUrl = ${baseUrl}\n`;
    content += `\n`;
    content += `###\n\n`;

    for (const op of operations) {
        content += generateHttpRequest(op, baseUrl);
        content += `\n###\n\n`;
    }

    return content;
}

/**
 * Generates a single HTTP request from an operation
 */
function generateHttpRequest(op: OperationInfo, baseUrl: string): string {
    let request = "";

    // Add comment with operation details
    if (op.operation.summary) {
        request += `# ${op.operation.summary}\n`;
    }
    if (op.operation.description) {
        request += `# ${op.operation.description}\n`;
    }
    if (op.operation.operationId) {
        request += `# Operation ID: ${op.operation.operationId}\n`;
    }
    request += `\n`;

    // Build the URL
    let url = `{{baseUrl}}${op.path}`;
    const pathParams: { [key: string]: any } = {};
    const queryParams: string[] = [];
    const headerParams: { [key: string]: any } = {};

    // Process parameters
    if (op.parameters) {
        for (const param of op.parameters) {
            const sampleValue = generateSampleData(param.schema);

            if (param.in === "path") {
                pathParams[param.name] = sampleValue;
            } else if (param.in === "query") {
                queryParams.push(
                    `${param.name}=${encodeURIComponent(String(sampleValue))}`
                );
            } else if (param.in === "header") {
                headerParams[param.name] = sampleValue;
            }
        }
    }

    // Replace path parameters
    for (const [name, value] of Object.entries(pathParams)) {
        url = url.replace(`{${name}}`, String(value));
    }

    // Add query parameters
    if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
    }

    // Write request line
    request += `${op.method} ${url}\n`;

    // Add headers
    if (Object.keys(headerParams).length > 0) {
        for (const [name, value] of Object.entries(headerParams)) {
            request += `${name}: ${value}\n`;
        }
    }

    // Add Content-Type and body if request body exists
    if (op.requestBody) {
        const contentTypes = Object.keys(op.requestBody.content || {});

        if (contentTypes.length > 0) {
            const contentType = contentTypes[0]; // Use first content type
            const mediaType = op.requestBody.content![contentType];

            request += `Content-Type: ${contentType}\n`;
            request += `\n`;

            if (mediaType.schema) {
                const bodyData = generateSampleData(mediaType.schema);

                if (contentType.includes("json")) {
                    request += JSON.stringify(bodyData, null, 2);
                } else if (contentType.includes("form")) {
                    // Handle form data
                    if (typeof bodyData === "object" && bodyData !== null) {
                        const formParams = Object.entries(bodyData)
                            .map(
                                ([key, value]) =>
                                    `${key}=${encodeURIComponent(
                                        String(value)
                                    )}`
                            )
                            .join("&");
                        request += formParams;
                    }
                } else {
                    // For other content types, stringify the data
                    request += JSON.stringify(bodyData);
                }
            }
        }
    }

    return request;
}
