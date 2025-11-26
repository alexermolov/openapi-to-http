import { OpenAPIV3 } from "openapi-types";
import jsf from "json-schema-faker";

// Configure json-schema-faker
jsf.option({
    useDefaultValue: true,
    useExamplesValue: true,
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    alwaysFakeOptionals: true,
    optionalsProbability: 0.8,
    fixedProbabilities: true,
    ignoreMissingRefs: true,
    maxItems: 5,
    maxLength: 50,
});

/**
 * Generates sample data based on OpenAPI schema
 * @param schema OpenAPI schema object or reference
 * @returns Sample data matching the schema
 */
export function generateSampleData(schema: any): any {
    if (!schema) {
        return null;
    }

    // Handle references (simplified - in production, resolve them properly)
    if (schema.$ref) {
        return generateSampleFromRef(schema.$ref);
    }

    // If schema has example, use it
    if (schema.example !== undefined) {
        return schema.example;
    }

    // If schema has examples array (OpenAPI 3.1), use first one
    if (
        schema.examples &&
        Array.isArray(schema.examples) &&
        schema.examples.length > 0
    ) {
        return schema.examples[0];
    }

    // Use json-schema-faker to generate data
    try {
        return jsf.generate(schema);
    } catch (error) {
        // Fallback to simple generation
        return generateSimpleSample(schema);
    }
}

/**
 * Generates a simple sample from a reference
 */
function generateSampleFromRef(ref: string): any {
    // Extract the component name from the reference
    const parts = ref.split("/");
    const componentName = parts[parts.length - 1];

    return {
        // Return a placeholder object
        id: 1,
        name: componentName,
    };
}

/**
 * Simple fallback generator when json-schema-faker fails
 */
function generateSimpleSample(schema: any): any {
    if (!schema.type) {
        return null;
    }

    switch (schema.type) {
        case "string":
            return generateString(schema);

        case "number":
        case "integer":
            return generateNumber(schema);

        case "boolean":
            return true;

        case "array":
            return generateArray(schema);

        case "object":
            return generateObject(schema);

        default:
            return null;
    }
}

/**
 * Generates a sample string based on format and constraints
 */
function generateString(schema: any): string {
    // Check for enum
    if (schema.enum && schema.enum.length > 0) {
        return schema.enum[0];
    }

    // Check for format
    if (schema.format) {
        switch (schema.format) {
            case "date":
                return new Date().toISOString().split("T")[0];
            case "date-time":
                return new Date().toISOString();
            case "email":
                return "user@example.com";
            case "uri":
            case "url":
                return "https://example.com";
            case "uuid":
                return "123e4567-e89b-12d3-a456-426614174000";
            case "ipv4":
                return "192.168.1.1";
            case "ipv6":
                return "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
            default:
                break;
        }
    }

    // Check for pattern (simplified)
    if (schema.pattern) {
        return "string-matching-pattern";
    }

    // Generate string based on length constraints
    const minLength = schema.minLength || 3;
    const maxLength = schema.maxLength || 10;
    const length = Math.min(maxLength, Math.max(minLength, 5));

    return "example".padEnd(length, "x").substring(0, length);
}

/**
 * Generates a sample number based on constraints
 */
function generateNumber(schema: any): number {
    // Check for enum
    if (schema.enum && schema.enum.length > 0) {
        return schema.enum[0];
    }

    const minimum = schema.minimum ?? schema.exclusiveMinimum ?? 0;
    const maximum = schema.maximum ?? schema.exclusiveMaximum ?? 100;

    let value = minimum + (maximum - minimum) / 2;

    // Handle exclusive bounds
    if (
        schema.exclusiveMinimum !== undefined &&
        value <= schema.exclusiveMinimum
    ) {
        value = schema.exclusiveMinimum + 1;
    }
    if (
        schema.exclusiveMaximum !== undefined &&
        value >= schema.exclusiveMaximum
    ) {
        value = schema.exclusiveMaximum - 1;
    }

    // Handle multipleOf
    if (schema.multipleOf) {
        value = Math.round(value / schema.multipleOf) * schema.multipleOf;
    }

    // Ensure integer type
    if (schema.type === "integer") {
        value = Math.round(value);
    }

    return value;
}

/**
 * Generates a sample array
 */
function generateArray(schema: any): any[] {
    const minItems = schema.minItems || 1;
    const maxItems = schema.maxItems || 3;
    const itemCount = Math.min(maxItems, Math.max(minItems, 2));

    const items: any[] = [];

    if (schema.items) {
        for (let i = 0; i < itemCount; i++) {
            items.push(generateSampleData(schema.items));
        }
    }

    return items;
}

/**
 * Generates a sample object
 */
function generateObject(schema: any): any {
    const obj: any = {};

    if (schema.properties) {
        const required = schema.required || [];

        for (const [propName, propSchema] of Object.entries(
            schema.properties
        )) {
            // Generate required properties and some optional ones
            if (required.includes(propName) || Math.random() > 0.3) {
                obj[propName] = generateSampleData(propSchema);
            }
        }
    }

    // Handle additionalProperties
    if (schema.additionalProperties === true) {
        obj.additionalProperty = "value";
    } else if (typeof schema.additionalProperties === "object") {
        obj.additionalProperty = generateSampleData(
            schema.additionalProperties
        );
    }

    return obj;
}
