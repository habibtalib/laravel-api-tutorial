<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class UserProfileController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $page = request()->integer('page', 1);
        $search = trim((string) request()->query('search', ''));
        $cacheKey = "user_profiles.index.page.{$page}.search.".md5($search);

        $profiles = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($search) {
            return UserProfile::query()
                ->with('projects')
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query->where('full_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('id_card_number', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->paginate(15);
        });

        return UserProfileResource::collection($profiles)
            ->additional([
                'message' => 'User profiles retrieved successfully.',
            ]);
    }

    public function store(StoreUserProfileRequest $request): JsonResponse
    {
        $profile = UserProfile::create($request->validated());
        Cache::flush();

        return response()->json([
            'message' => 'User profile created successfully.',
            'data' => new UserProfileResource($profile),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $profile = UserProfile::query()
            ->with('projects')
            ->findOrFail($id);

        return response()->json([
            'message' => 'User profile retrieved successfully.',
            'data' => new UserProfileResource($profile),
        ]);
    }

    public function update(UpdateUserProfileRequest $request, string $id): JsonResponse
    {
        $profile = UserProfile::findOrFail($id);
        $profile->update($request->validated());
        Cache::flush();

        return response()->json([
            'message' => 'User profile updated successfully.',
            'data' => new UserProfileResource($profile),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $profile = UserProfile::findOrFail($id);
        $profile->delete();
        Cache::flush();

        return response()->json(null, 204);
    }
}
