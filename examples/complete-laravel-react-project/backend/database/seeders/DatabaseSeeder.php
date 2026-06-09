<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Training Admin',
                'password' => Hash::make('password'),
            ],
        );

        $profiles = [
            [
                'full_name' => 'Aina Rahman',
                'phone' => '+60123334444',
                'id_card_number' => '900101-14-1111',
                'address' => 'Shah Alam',
                'is_active' => true,
                'projects' => [
                    ['name' => 'Customer Portal API', 'status' => 'active', 'starts_at' => '2026-01-15'],
                    ['name' => 'Mobile App Backend', 'status' => 'planning', 'starts_at' => '2026-03-01'],
                ],
            ],
            [
                'full_name' => 'Daniel Tan',
                'phone' => '+60124445555',
                'id_card_number' => '880808-10-2222',
                'address' => 'Petaling Jaya',
                'is_active' => true,
                'projects' => [
                    ['name' => 'Inventory Integration', 'status' => 'active', 'starts_at' => '2026-02-10'],
                ],
            ],
            [
                'full_name' => 'Mei Ling',
                'phone' => '+60135556666',
                'id_card_number' => '930303-08-3333',
                'address' => 'Bangsar',
                'is_active' => true,
                'projects' => [
                    ['name' => 'Reporting Dashboard', 'status' => 'active', 'starts_at' => '2026-04-05'],
                    ['name' => 'API Documentation Cleanup', 'status' => 'completed', 'starts_at' => '2025-11-20'],
                ],
            ],
            [
                'full_name' => 'Kugan Raj',
                'phone' => '+60146667777',
                'id_card_number' => '910707-05-4444',
                'address' => 'Cyberjaya',
                'is_active' => false,
                'projects' => [
                    ['name' => 'Legacy Migration', 'status' => 'paused', 'starts_at' => '2025-09-18'],
                ],
            ],
            [
                'full_name' => 'Nur Iman',
                'phone' => '+60157778888',
                'id_card_number' => '950505-06-5555',
                'address' => 'Kuala Lumpur',
                'is_active' => true,
                'projects' => [
                    ['name' => 'Partner API Rollout', 'status' => 'planning', 'starts_at' => '2026-05-12'],
                ],
            ],
        ];

        foreach ($profiles as $profileData) {
            $projects = $profileData['projects'];
            unset($profileData['projects']);

            $profile = UserProfile::updateOrCreate(
                ['id_card_number' => $profileData['id_card_number']],
                $profileData,
            );

            $profile->projects()->delete();
            $profile->projects()->createMany($projects);
        }
    }
}
