# OpenAPI to HTTP

VS Code extension that generates `.http` files from OpenAPI specifications for easy API testing.

## 🎯 Features

- ✅ **OpenAPI 3.x & Swagger 2.0 support** - Parse both JSON and YAML formats
- ✅ **Smart data generation** - Automatically generates sample data based on schema types and validations
- ✅ **Complete coverage** - Generates requests for all endpoints with all HTTP methods
- ✅ **Type-aware** - Respects minLength, maxLength, minimum, maximum, enum, pattern, and more
- ✅ **Context menu integration** - Right-click to generate directly from your OpenAPI file
- ✅ **Format support** - Handles date, email, uuid, uri, and other special formats
- ✅ **Easy testing** - Use with REST Client extension to test your APIs immediately

## 📦 Installation

### From Source

```bash
git clone <repository-url>
cd openapi-to-http
npm install
npm run compile
```

Press `F5` to run in Extension Development Host.

### From VSIX (future)

1. Download the `.vsix` file
2. In VS Code: Extensions → ⋯ → Install from VSIX

## 🚀 Usage

1. Open an OpenAPI specification file (JSON or YAML format)
2. Right-click in the editor
3. Select **"Generate .http"** from the context menu
4. Enter the desired filename for the `.http` file (e.g., `api-tests.http`)
5. The file will be created in the same directory as your OpenAPI spec
6. Use REST Client extension to send requests

## 📝 Example

### Input: OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /users:
    post:
      summary: Create a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, email]
              properties:
                username:
                  type: string
                  minLength: 3
                  maxLength: 20
                email:
                  type: string
                  format: email
                age:
                  type: integer
                  minimum: 18
```

### Output: Generated .http File

```http
# Generated from OpenAPI Specification
# Title: Sample API
# Version: 1.0.0

@baseUrl = https://api.example.com/v1

###

# Create a user
# Operation ID: createUser

POST {{baseUrl}}/users
Content-Type: application/json

{
  "username": "example",
  "email": "user@example.com",
  "age": 25
}

###
```

## 🏗️ Project Structure

```
openapi-to-http/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── openapi-parser.ts     # OpenAPI file parser and validator
│   ├── http-generator.ts     # .http file generator
│   └── data-generator.ts     # Sample data generator
├── examples/
│   ├── sample-api.yaml       # Pet Store API example
│   └── ecommerce-api.json    # E-commerce API example
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── USAGE.md                  # Detailed usage guide (Russian)
├── TESTING.md                # Testing guide (Russian)
└── README.md                 # This file
```

## 🛠️ Technologies

- **[@apidevtools/swagger-parser](https://github.com/APIDevTools/swagger-parser)** - OpenAPI/Swagger parsing and validation
- **[json-schema-faker](https://github.com/json-schema-faker/json-schema-faker)** - Smart sample data generation
- **[openapi-types](https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types)** - TypeScript type definitions

## 🎨 Data Generation Features

The extension intelligently generates sample data based on:

### Types
- `string` → generates appropriate text
- `number`/`integer` → generates valid numbers
- `boolean` → generates true/false
- `array` → generates array with correct item types
- `object` → generates nested objects

### Formats
- `date` → `2025-11-26`
- `date-time` → `2025-11-26T10:30:00.000Z`
- `email` → `user@example.com`
- `uri`/`url` → `https://example.com`
- `uuid` → `123e4567-e89b-12d3-a456-426614174000`
- `ipv4` → `192.168.1.1`
- `ipv6` → `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

### Validations
- `minLength`/`maxLength` → string length constraints
- `minimum`/`maximum` → number range constraints
- `minItems`/`maxItems` → array size constraints
- `multipleOf` → number divisibility
- `pattern` → regex patterns (simplified)
- `enum` → uses first enum value
- `required` → ensures required fields are present

## 📚 Documentation

- [USAGE.md](./USAGE.md) - Подробное руководство на русском языке
- [TESTING.md](./TESTING.md) - Инструкции по тестированию
- [CHANGELOG.md](./CHANGELOG.md) - История изменений

## 🧪 Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions.

Quick test:

1. Press `F5` to launch Extension Development Host
2. Open `examples/sample-api.yaml`
3. Right-click → Generate .http
4. Check the generated file

## 🔧 Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Lint
npm run lint

# Debug
Press F5 in VS Code
```

## 📋 Requirements

- VS Code 1.80.0 or higher
- Recommended: [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for testing generated files

## 🚧 Known Limitations

- Component references (`$ref`) are handled in a simplified manner
- Authentication schemas are not yet included in generated requests
- Some complex JSON Schema constructs may generate simplified examples

## 🔮 Future Enhancements

- [ ] Full `$ref` resolution with component support
- [ ] Authentication header generation (Bearer, API Key, OAuth)
- [ ] Configuration options for data generation
- [ ] Environment variables support
- [ ] Test assertions and expected responses
- [ ] Batch file generation (one file per tag/path)
- [ ] Custom templates support

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

Created with ❤️ for the VS Code community
