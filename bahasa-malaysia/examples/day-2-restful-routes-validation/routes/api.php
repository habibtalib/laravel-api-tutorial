<?php

use App\Http\Controllers\Api\V1\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Hari 2 sengaja public. Sanctum dan frontend token middleware ditambah pada Hari 3.
    Route::apiResource('users', UserProfileController::class);
});
