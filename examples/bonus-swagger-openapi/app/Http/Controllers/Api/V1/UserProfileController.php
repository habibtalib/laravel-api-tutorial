<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\UserProfile;
use App\Services\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

class UserProfileController extends Controller
{
    public function __construct(
        private readonly UserProfileService $userProfileService
    ) {
    }

    #[OA\Get(
        path: '/api/v1/users',
        operationId: 'listUserProfiles',
        summary: 'List user profiles',
        description: 'Returns a paginated list of ABC Company user profiles.',
        tags: ['User Profiles'],
        security: [
            ['sanctum' => [], 'frontendToken' => []],
        ],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', example: 1)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: 'Aina')),
            new OA\Parameter(name: 'active', in: 'query', required: false, schema: new OA\Schema(type: 'boolean', example: true)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profiles retrieved successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/UserProfileCollectionResponse')
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
            ),
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $active = $request->has('active')
            ? $request->boolean('active')
            : null;

        $profiles = $this->userProfileService->paginate(
            search: $request->query('search'),
            active: $active,
            perPage: 15,
            page: $request->integer('page', 1),
        );

        return UserProfileResource::collection($profiles)
            ->additional([
                'message' => 'User profiles retrieved successfully.',
            ]);
    }

    #[OA\Post(
        path: '/api/v1/users',
        operationId: 'createUserProfile',
        summary: 'Create user profile',
        description: 'Creates a new ABC Company user profile.',
        tags: ['User Profiles'],
        security: [
            ['sanctum' => [], 'frontendToken' => []],
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreUserProfileRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User profile created successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/UserProfileResponse')
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
            ),
        ]
    )]
    public function store(StoreUserProfileRequest $request): JsonResponse
    {
        $profile = $this->userProfileService->create($request->validated());

        return response()->json([
            'message' => 'User profile created successfully.',
            'data' => new UserProfileResource($profile),
        ], 201);
    }

    #[OA\Get(
        path: '/api/v1/users/{userProfile}',
        operationId: 'showUserProfile',
        summary: 'Show user profile',
        description: 'Returns one user profile by ID.',
        tags: ['User Profiles'],
        security: [
            ['sanctum' => [], 'frontendToken' => []],
        ],
        parameters: [
            new OA\Parameter(name: 'userProfile', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile retrieved successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/UserProfileResponse')
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
            ),
            new OA\Response(
                response: 404,
                description: 'Resource not found',
                content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
            ),
        ]
    )]
    public function show(UserProfile $userProfile): JsonResponse
    {
        $userProfile->load('projects');

        return response()->json([
            'message' => 'User profile retrieved successfully.',
            'data' => new UserProfileResource($userProfile),
        ]);
    }

    #[OA\Patch(
        path: '/api/v1/users/{userProfile}',
        operationId: 'updateUserProfile',
        summary: 'Update user profile',
        description: 'Updates one user profile by ID.',
        tags: ['User Profiles'],
        security: [
            ['sanctum' => [], 'frontendToken' => []],
        ],
        parameters: [
            new OA\Parameter(name: 'userProfile', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreUserProfileRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile updated successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/UserProfileResponse')
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
            ),
            new OA\Response(
                response: 404,
                description: 'Resource not found',
                content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
            ),
        ]
    )]
    public function update(UpdateUserProfileRequest $request, UserProfile $userProfile): JsonResponse
    {
        $profile = $this->userProfileService->update($userProfile, $request->validated());

        return response()->json([
            'message' => 'User profile updated successfully.',
            'data' => new UserProfileResource($profile),
        ]);
    }

    #[OA\Delete(
        path: '/api/v1/users/{userProfile}',
        operationId: 'deleteUserProfile',
        summary: 'Delete user profile',
        description: 'Deletes one user profile by ID.',
        tags: ['User Profiles'],
        security: [
            ['sanctum' => [], 'frontendToken' => []],
        ],
        parameters: [
            new OA\Parameter(name: 'userProfile', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 204, description: 'User profile deleted successfully'),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
            ),
            new OA\Response(
                response: 404,
                description: 'Resource not found',
                content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
            ),
        ]
    )]
    public function destroy(UserProfile $userProfile): JsonResponse
    {
        $this->userProfileService->delete($userProfile);

        return response()->json(null, 204);
    }
}
