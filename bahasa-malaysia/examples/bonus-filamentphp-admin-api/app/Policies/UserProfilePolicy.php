<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserProfile;

class UserProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function view(User $user, UserProfile $userProfile): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function create(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function update(User $user, UserProfile $userProfile): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function delete(User $user, UserProfile $userProfile): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function deleteAny(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }
}
