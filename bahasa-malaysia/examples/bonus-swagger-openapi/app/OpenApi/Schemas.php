<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Project',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Mobile App API'),
        new OA\Property(property: 'status', type: 'string', example: 'active'),
        new OA\Property(property: 'starts_at', type: 'string', format: 'date', nullable: true, example: '2026-06-07'),
    ]
)]
#[OA\Schema(
    schema: 'UserProfile',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'full_name', type: 'string', example: 'Aina Rahman'),
        new OA\Property(property: 'phone', type: 'string', example: '+60123456789'),
        new OA\Property(property: 'id_card_number', type: 'string', example: '900101-14-1234'),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: 'Kuala Lumpur'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(
            property: 'projects',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/Project')
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'StoreUserProfileRequest',
    required: ['full_name', 'phone', 'id_card_number'],
    type: 'object',
    properties: [
        new OA\Property(property: 'full_name', type: 'string', example: 'Aina Rahman'),
        new OA\Property(property: 'phone', type: 'string', example: '+60123456789'),
        new OA\Property(property: 'id_card_number', type: 'string', example: '900101-14-1234'),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: 'Kuala Lumpur'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ]
)]
#[OA\Schema(
    schema: 'UserProfileResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'User profile retrieved successfully.'),
        new OA\Property(property: 'data', ref: '#/components/schemas/UserProfile'),
    ]
)]
#[OA\Schema(
    schema: 'UserProfileCollectionResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'User profiles retrieved successfully.'),
        new OA\Property(
            property: 'data',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/UserProfile')
        ),
    ]
)]
#[OA\Schema(
    schema: 'LoginResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Login successful.'),
        new OA\Property(
            property: 'data',
            type: 'object',
            properties: [
                new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                new OA\Property(property: 'access_token', type: 'string', example: '1|example-token-value'),
            ]
        ),
    ]
)]
#[OA\Schema(
    schema: 'ValidationError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The given data was invalid.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            example: [
                'full_name' => ['The full name field is required.'],
            ]
        ),
    ]
)]
#[OA\Schema(
    schema: 'UnauthorizedError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
    ]
)]
#[OA\Schema(
    schema: 'NotFoundError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Resource not found.'),
    ]
)]
class Schemas
{
}
