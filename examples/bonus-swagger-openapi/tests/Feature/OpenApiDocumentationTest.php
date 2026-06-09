<?php

namespace Tests\Feature;

use Tests\TestCase;

class OpenApiDocumentationTest extends TestCase
{
    public function test_openapi_documentation_file_exists(): void
    {
        $path = storage_path('api-docs/api-docs.json');

        $this->assertFileExists($path);

        $json = json_decode(file_get_contents($path), true);

        $this->assertSame('3.0.3', $json['openapi']);
        $this->assertSame('ABC Company Profile API', $json['info']['title']);
        $this->assertArrayHasKey('/api/v1/auth/login', $json['paths']);
        $this->assertArrayHasKey('/api/v1/users', $json['paths']);
        $this->assertArrayHasKey('sanctum', $json['components']['securitySchemes']);
        $this->assertArrayHasKey('frontendToken', $json['components']['securitySchemes']);
    }
}
