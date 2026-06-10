<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->middleware(['frontend.token', 'throttle:60,1'])
    ->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('auth.login');

        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout'])
                ->name('auth.logout');

            Route::apiResource('users', UserProfileController::class)
                ->parameters([
                    'users' => 'userProfile',
                ])
                ->middlewareFor(['index', 'show'], 'abilities:profiles:read')
                ->middlewareFor('store', 'abilities:profiles:create')
                ->middlewareFor('update', 'abilities:profiles:update')
                ->middlewareFor('destroy', 'abilities:profiles:delete');
        });
    });
