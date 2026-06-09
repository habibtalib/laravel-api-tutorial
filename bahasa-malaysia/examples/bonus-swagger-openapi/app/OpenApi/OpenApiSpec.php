<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\OpenApi(
    openapi: '3.0.3',
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ]
)]
#[OA\Info(
    version: '1.0.0',
    title: 'ABC Company Profile API',
    description: 'Training API for building secure and maintainable Laravel APIs.'
)]
#[OA\Server(
    url: 'http://127.0.0.1:8000',
    description: 'Local development server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum token',
    description: 'Use the token returned from POST /api/v1/auth/login.'
)]
#[OA\SecurityScheme(
    securityScheme: 'frontendToken',
    type: 'apiKey',
    in: 'header',
    name: 'X-API-TOKEN',
    description: 'Frontend API token required by the Laravel middleware.'
)]
class OpenApiSpec
{
}
