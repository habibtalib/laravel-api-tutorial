# Bonus - FilamentPHP Admin Panel For The Laravel API

## Bonus Goal

This bonus tutorial adds a FilamentPHP admin panel to the ABC Company Profile API project.

FilamentPHP is not a replacement for the JSON API. The API remains responsible for mobile apps, frontends, integrations, tokens, throttling, validation, and JSON responses. Filament adds a secure back-office panel so internal admins can manage the same `user_profiles` and `projects` tables without building a custom admin frontend.

## 6-Hour Bonus Class Plan

| Time | Topic | Activity |
| --- | --- | --- |
| 00:00-00:30 | Filament and API architecture | Explain API layer vs admin panel layer |
| 00:30-01:15 | Install FilamentPHP | Install panel builder and create admin user |
| 01:15-02:15 | User profile resource | Build CRUD admin UI for `UserProfile` |
| 02:15-02:30 | Break | Short break |
| 02:30-03:30 | Project resource | Build CRUD admin UI for `Project` |
| 03:30-04:15 | Admin security | Add `FilamentUser`, policies, and access rules |
| 04:15-05:00 | API and panel consistency | Keep model validation, hidden fields, and admin actions aligned |
| 05:00-06:00 | Lab | Manage records in Filament, then verify API output |

## Learning Objectives

- Install FilamentPHP panel builder.
- Create a Filament admin user.
- Build Filament resources for API models.
- Add tables, filters, forms, and actions.
- Protect the panel with `canAccessPanel()`.
- Understand how admin-side changes affect API responses.
- Keep API authorization separate from Filament authorization.

## Architecture

The final app has two interfaces over the same database:

```text
External clients
  -> /api/v1/users
  -> Sanctum, X-API-TOKEN, validation, throttling
  -> JSON responses

Internal admins
  -> /admin
  -> Filament login, policies, forms, tables
  -> Browser-based back-office panel

Both interfaces
  -> UserProfile and Project Eloquent models
  -> user_profiles and projects database tables
```

## Step 1 - Install FilamentPHP

From the Laravel project root:

```bash
composer require filament/filament:"^5.0"
php artisan filament:install --panels
```

On Windows PowerShell, use:

```bash
composer require filament/filament:"~5.0"
php artisan filament:install --panels
```

The install command creates:

```text
app/Providers/Filament/AdminPanelProvider.php
```

If the panel does not load, confirm this provider is registered in:

```text
bootstrap/providers.php
```

## Step 2 - Create A Filament Admin User

Run:

```bash
php artisan make:filament-user
```

For this training, use:

```text
Name: Training Admin
Email: admin@example.com
Password: password
```

Start Laravel:

```bash
php artisan serve
```

Open:

```text
http://127.0.0.1:8000/admin
```

## Step 3 - Update The User Model For Panel Access

In production, do not allow every user into Filament. Add explicit panel access rules.

Example:

```php
<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return str_ends_with($this->email, '@example.com');
    }
}
```

Trainer note:

- `admin@example.com` works for class.
- Production apps should use roles, permissions, or verified admin domains.

## Step 4 - Generate Filament Resources

Run:

```bash
php artisan make:filament-resource UserProfile
php artisan make:filament-resource Project
```

Filament 5 generates resources in a directory structure like:

```text
app/Filament/Resources/UserProfiles/UserProfileResource.php
app/Filament/Resources/UserProfiles/Pages/
app/Filament/Resources/UserProfiles/Schemas/
app/Filament/Resources/UserProfiles/Tables/
```

You can also generate fields automatically from database columns:

```bash
php artisan make:filament-resource UserProfile --generate
```

For training, we use explicit examples so students can understand every field.

## Step 5 - UserProfile Resource

Create or update:

```text
app/Filament/Resources/UserProfiles/UserProfileResource.php
```

```php
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
```

## Step 6 - UserProfile Form

Create or update:

```text
app/Filament/Resources/UserProfiles/Schemas/UserProfileForm.php
```

```php
<?php

namespace App\Filament\Resources\UserProfiles\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UserProfileForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('full_name')
                    ->required()
                    ->maxLength(255),

                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->maxLength(30),

                TextInput::make('id_card_number')
                    ->required()
                    ->maxLength(50)
                    ->unique(ignoreRecord: true),

                Textarea::make('address')
                    ->maxLength(1000)
                    ->columnSpanFull(),

                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->required(),
            ]);
    }
}
```

## Step 7 - UserProfile Table

Create or update:

```text
app/Filament/Resources/UserProfiles/Tables/UserProfilesTable.php
```

```php
<?php

namespace App\Filament\Resources\UserProfiles\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UserProfilesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('phone')
                    ->searchable(),

                TextColumn::make('id_card_number')
                    ->label('ID card')
                    ->searchable()
                    ->toggleable(),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_active')
                    ->label('Active status'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
```

## Step 8 - UserProfile Pages

Create:

```text
app/Filament/Resources/UserProfiles/Pages/ListUserProfiles.php
```

```php
<?php

namespace App\Filament\Resources\UserProfiles\Pages;

use App\Filament\Resources\UserProfiles\UserProfileResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListUserProfiles extends ListRecords
{
    protected static string $resource = UserProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All'),
            'active' => Tab::make('Active')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('is_active', true)),
            'inactive' => Tab::make('Inactive')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('is_active', false)),
        ];
    }
}
```

Create:

```text
app/Filament/Resources/UserProfiles/Pages/CreateUserProfile.php
```

```php
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
```

Create:

```text
app/Filament/Resources/UserProfiles/Pages/EditUserProfile.php
```

```php
<?php

namespace App\Filament\Resources\UserProfiles\Pages;

use App\Filament\Resources\UserProfiles\UserProfileResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditUserProfile extends EditRecord
{
    protected static string $resource = UserProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
```

## Step 9 - Project Model Relationship

Update `app/Models/Project.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_profile_id',
        'name',
        'status',
        'starts_at',
    ];

    protected $casts = [
        'starts_at' => 'date',
    ];

    public function userProfile(): BelongsTo
    {
        return $this->belongsTo(UserProfile::class);
    }
}
```

## Step 10 - Project Resource

Create `ProjectResource`, `ProjectForm`, `ProjectsTable`, and pages using the files in:

```text
examples/bonus-filamentphp-admin-api
```

Important features:

- `Select::make('user_profile_id')->relationship('userProfile', 'full_name')`
- status selection: `planning`, `active`, `completed`
- sortable and searchable table columns
- filter by project status

## Step 11 - Policies For Admin Access

Filament observes Laravel model policies. For training, you can allow the admin user to manage profiles and projects. For production, connect this to real roles and permissions.

Example policy rule:

```php
public function viewAny(User $user): bool
{
    return $user->canAccessPanel(filament()->getCurrentPanel());
}
```

Training shortcut:

```php
return str_ends_with($user->email, '@example.com');
```

## Step 12 - Verify API And Filament Work Together

In Filament:

1. Open `/admin`.
2. Create a user profile.
3. Create a project linked to that user profile.
4. Mark the user profile inactive.

Then call the API:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

You should see the same database records returned through the JSON API.

## Production Security Checklist

- Do not allow every user to access Filament.
- Implement `FilamentUser::canAccessPanel()`.
- Add policies for `UserProfile` and `Project`.
- Use verified admin email domains or roles.
- Use HTTPS.
- Keep Filament behind normal Laravel session authentication.
- Keep API token authentication separate from Filament login.
- Never expose API bearer tokens inside the Filament UI unless required.
- Audit destructive admin actions such as delete.

## Class Lab

Students must:

1. Install Filament.
2. Create an admin user.
3. Add `canAccessPanel()` to `User`.
4. Build `UserProfileResource`.
5. Build `ProjectResource`.
6. Add filters and searchable columns.
7. Add policies.
8. Create records in Filament.
9. Confirm those records appear in the API.

## Final Bonus Assignment

Submit:

- Admin panel working at `/admin`
- `UserProfileResource`
- `ProjectResource`
- `UserProfilePolicy`
- `ProjectPolicy`
- Updated `User` model with `FilamentUser`
- Screenshot or confirmation of user profile CRUD in Filament
- API response showing the same records

## Bonus Marking Rubric

| Area | Marks |
| --- | ---: |
| Filament installed and panel accessible | 15 |
| Admin user and access control work | 15 |
| User profile resource works | 20 |
| Project resource works | 20 |
| Policies are present | 10 |
| Filament-created data appears through API | 15 |
| Security notes are applied | 5 |
| Total | 100 |

## References

- Filament installation: https://filamentphp.com/docs/5.x/introduction/installation
- Filament resources: https://filamentphp.com/docs/5.x/resources/overview
- Filament listing records: https://filamentphp.com/docs/5.x/resources/listing-records
- Filament creating records: https://filamentphp.com/docs/5.x/resources/creating-records
- Filament panel configuration: https://filamentphp.com/docs/5.x/panel-configuration
