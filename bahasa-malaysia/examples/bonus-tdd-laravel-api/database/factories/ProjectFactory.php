<?php

namespace Database\Factories;

use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_profile_id' => UserProfile::factory(),
            'name' => fake()->words(3, true),
            'status' => fake()->randomElement(['planning', 'active', 'completed']),
            'starts_at' => fake()->date(),
        ];
    }
}
