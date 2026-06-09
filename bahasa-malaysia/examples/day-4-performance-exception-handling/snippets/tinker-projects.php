$profile = App\Models\UserProfile::first();

$profile->projects()->create([
    'name' => 'Mobile App API',
    'status' => 'active',
    'starts_at' => now(),
]);

$profile->projects()->create([
    'name' => 'Internal Dashboard API',
    'status' => 'planning',
    'starts_at' => now()->addMonth(),
]);

