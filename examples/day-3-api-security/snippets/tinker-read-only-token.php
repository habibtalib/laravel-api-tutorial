$user = App\Models\User::where('email', 'admin@example.com')->first();

$token = $user->createToken(
    'read-only-training-token',
    ['profiles:read'],
    now()->addMinutes(60)
)->plainTextToken;

$token;
