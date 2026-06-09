<?php

return [
    'frontend' => [
        'api_token' => env('FRONTEND_API_TOKEN'),
    ],

    'auth' => [
        'token_expiry_minutes' => env('AUTH_TOKEN_EXPIRY_MINUTES', 60),
    ],
];
