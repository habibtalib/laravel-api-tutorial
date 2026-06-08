<?php

use App\Http\Controllers\Api\V1\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Day 2 is intentionally public. Sanctum and frontend token middleware are added on Day 3.
    Route::apiResource('users', UserProfileController::class);
});
