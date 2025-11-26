import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3 } from "openapi-types";

/**
 * Validates if a file is a valid OpenAPI specification and parses it
 * @param filePath Path to the file to validate
 * @returns Parsed OpenAPI spec or null if not valid
 */
export async function validateAndParseOpenAPI(
    filePath: string
): Promise<OpenAPIV3.Document | null> {
    try {
        const api = await SwaggerParser.validate(filePath);

        // Check if it's OpenAPI 3.x (we'll support this version)
        if ("openapi" in api && api.openapi.startsWith("3")) {
            return api as OpenAPIV3.Document;
        }

        // Check if it's Swagger 2.0 (we can also support this)
        if ("swagger" in api && api.swagger === "2.0") {
            // Convert to OpenAPI 3 using swagger-parser's bundle method
            const bundled = await SwaggerParser.bundle(filePath);
            return bundled as OpenAPIV3.Document;
        }

        return null;
    } catch (error) {
        // File is not a valid OpenAPI spec
        console.error("OpenAPI validation error:", error);
        return null;
    }
}

/**
 * Extracts the base URL from the OpenAPI spec
 * @param spec OpenAPI specification
 * @returns Base URL or empty string
 */
export function getBaseUrl(spec: OpenAPIV3.Document): string {
    if (spec.servers && spec.servers.length > 0) {
        return spec.servers[0].url;
    }
    return "http://localhost";
}

/**
 * Gets all operation objects from the OpenAPI spec
 * @param spec OpenAPI specification
 * @returns Array of operations with their details
 */
export interface OperationInfo {
    path: string;
    method: string;
    operation: OpenAPIV3.OperationObject;
    parameters?: OpenAPIV3.ParameterObject[];
    requestBody?: OpenAPIV3.RequestBodyObject;
}

export function getOperations(spec: OpenAPIV3.Document): OperationInfo[] {
    const operations: OperationInfo[] = [];

    if (!spec.paths) {
        return operations;
    }

    for (const [path, pathItem] of Object.entries(spec.paths)) {
        if (!pathItem) continue;

        const methods = [
            "get",
            "post",
            "put",
            "patch",
            "delete",
            "options",
            "head",
            "trace",
        ] as const;

        for (const method of methods) {
            const operation = pathItem[method] as
                | OpenAPIV3.OperationObject
                | undefined;

            if (operation) {
                const parameters = resolveParameters(pathItem, operation);
                const requestBody = resolveRequestBody(operation);

                operations.push({
                    path,
                    method: method.toUpperCase(),
                    operation,
                    parameters,
                    requestBody,
                });
            }
        }
    }

    return operations;
}

/**
 * Resolves parameters from both path item and operation level
 */
function resolveParameters(
    pathItem: OpenAPIV3.PathItemObject,
    operation: OpenAPIV3.OperationObject
): OpenAPIV3.ParameterObject[] {
    const params: OpenAPIV3.ParameterObject[] = [];

    // Path-level parameters
    if (pathItem.parameters) {
        for (const param of pathItem.parameters) {
            if ("$ref" in param) {
                // We skip references for simplicity, but in production you'd resolve them
                continue;
            }
            params.push(param);
        }
    }

    // Operation-level parameters
    if (operation.parameters) {
        for (const param of operation.parameters) {
            if ("$ref" in param) {
                continue;
            }
            params.push(param);
        }
    }

    return params;
}

/**
 * Resolves request body from operation
 */
function resolveRequestBody(
    operation: OpenAPIV3.OperationObject
): OpenAPIV3.RequestBodyObject | undefined {
    if (!operation.requestBody) {
        return undefined;
    }

    if ("$ref" in operation.requestBody) {
        // Skip references for simplicity
        return undefined;
    }

    return operation.requestBody;
}
