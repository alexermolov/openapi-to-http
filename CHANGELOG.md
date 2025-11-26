# Changelog

## [0.0.1] - 2025-11-26

### Added
- Initial release
- OpenAPI 3.x and Swagger 2.0 support
- Context menu command "Generate .http" for JSON and YAML files
- Automatic validation of OpenAPI specifications
- Generation of .http files with all API endpoints
- Smart sample data generation based on:
  - Schema types (string, number, integer, boolean, array, object)
  - Format validations (date, email, uuid, uri, etc.)
  - Constraints (minLength, maxLength, minimum, maximum, etc.)
  - Enumerations
  - Required fields
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
- Path, query, and header parameter handling
- Request body generation for various content types
- Progress indicators during generation
- Error handling with user-friendly messages

### Dependencies
- @apidevtools/swagger-parser: OpenAPI file parsing and validation
- json-schema-faker: Sample data generation
- openapi-types: TypeScript type definitions

### Project Structure
- Modular architecture with separate files for:
  - Extension activation (extension.ts)
  - OpenAPI parsing (openapi-parser.ts)
  - HTTP file generation (http-generator.ts)
  - Sample data generation (data-generator.ts)
