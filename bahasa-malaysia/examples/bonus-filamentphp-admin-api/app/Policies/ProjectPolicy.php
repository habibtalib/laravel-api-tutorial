<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function view(User $user, Project $project): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function create(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function update(User $user, Project $project): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function delete(User $user, Project $project): bool
    {
        return str_ends_with($user->email, '@example.com');
    }

    public function deleteAny(User $user): bool
    {
        return str_ends_with($user->email, '@example.com');
    }
}
