App\Models\User::create([
    'name' => 'Training Admin',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
]);
