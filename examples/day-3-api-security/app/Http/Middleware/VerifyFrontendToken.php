<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyFrontendToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $frontendToken = $request->header('X-API-TOKEN');
        $expectedToken = config('services.frontend.api_token');

        if (! $frontendToken || ! hash_equals((string) $expectedToken, $frontendToken)) {
            return response()->json([
                'message' => 'Unauthorized: Invalid frontend API token.',
            ], 401);
        }

        return $next($request);
    }
}

