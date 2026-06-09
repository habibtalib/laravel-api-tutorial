$token = Laravel\Sanctum\PersonalAccessToken::latest('id')->first();

$token->forceFill([
    'expires_at' => now()->subYears(10),
])->save();
