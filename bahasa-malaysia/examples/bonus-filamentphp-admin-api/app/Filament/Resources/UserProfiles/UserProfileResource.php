<?php

namespace App\Filament\Resources\UserProfiles;

use App\Filament\Resources\UserProfiles\Pages\CreateUserProfile;
use App\Filament\Resources\UserProfiles\Pages\EditUserProfile;
use App\Filament\Resources\UserProfiles\Pages\ListUserProfiles;
use App\Filament\Resources\UserProfiles\Schemas\UserProfileForm;
use App\Filament\Resources\UserProfiles\Tables\UserProfilesTable;
use App\Models\UserProfile;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class UserProfileResource extends Resource
{
    protected static ?string $model = UserProfile::class;

    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-user-group';

    protected static string | UnitEnum | null $navigationGroup = 'API Management';

    protected static ?string $recordTitleAttribute = 'full_name';

    public static function form(Schema $schema): Schema
    {
        return UserProfileForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UserProfilesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUserProfiles::route('/'),
            'create' => CreateUserProfile::route('/create'),
            'edit' => EditUserProfile::route('/{record}/edit'),
        ];
    }
}
