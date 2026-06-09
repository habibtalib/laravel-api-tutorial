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

class UserProfileController extends Controller
{
    public function __construct(
        private readonly UserProfileService $userProfileService
    ) {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $profiles = $this->userProfileService->paginate(
            search: $request->query('search'),
            perPage: 15,
            page: $request->integer('page', 1),
        );

        return UserProfileResource::collection($profiles)
            ->additional([
                'message' => 'User profiles retrieved successfully.',
            ]);
    }

    public function store(StoreUserProfileRequest $request): JsonResponse
    {
        $profile = $this->userProfileService->create($request->validated());

        return response()->json([
            'message' => 'User profile created successfully.',
            'data' => new UserProfileResource($profile),
        ], 201);
    }

    public function show(UserProfile $userProfile): JsonResponse
    {
        $userProfile->load('projects');

        return response()->json([
            'message' => 'User profile retrieved successfully.',
            'data' => new UserProfileResource($userProfile),
        ]);
    }

    public function update(UpdateUserProfileRequest $request, UserProfile $userProfile): JsonResponse
    {
        $profile = $this->userProfileService->update($userProfile, $request->validated());

        return response()->json([
            'message' => 'User profile updated successfully.',
            'data' => new UserProfileResource($profile),
        ]);
    }

    public function destroy(UserProfile $userProfile): JsonResponse
    {
        $this->userProfileService->delete($userProfile);

        return response()->json(null, 204);
    }
}
