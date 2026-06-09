<?php

namespace App\Filament\Resources\UserProfiles\Pages;

use App\Filament\Resources\UserProfiles\UserProfileResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUserProfile extends CreateRecord
{
    protected static string $resource = UserProfileResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
