<?php

namespace App\Services;

use App\Models\UserProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class UserProfileService
{
    public function paginate(?string $search = null, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $safeSearch = $search ?? '';
        $cacheKey = "user_profiles.index.page.{$page}.per_page.{$perPage}.search.".md5($safeSearch);

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($safeSearch, $perPage, $page) {
            return UserProfile::query()
                ->with('projects')
                ->when($safeSearch !== '', function ($query) use ($safeSearch) {
                    $query->where('full_name', 'like', "%{$safeSearch}%")
                        ->orWhere('phone', 'like', "%{$safeSearch}%")
                        ->orWhere('id_card_number', 'like', "%{$safeSearch}%");
                })
                ->latest()
                ->paginate($perPage, ['*'], 'page', $page);
        });
    }

    public function create(array $data): UserProfile
    {
        $profile = UserProfile::create($data);
        $this->clearListCache();

        return $profile;
    }

    public function update(UserProfile $profile, array $data): UserProfile
    {
        $profile->update($data);
        $this->clearListCache();

        return $profile->refresh();
    }

    public function delete(UserProfile $profile): void
    {
        $profile->delete();
        $this->clearListCache();
    }

    private function clearListCache(): void
    {
        Cache::flush();
    }
}
