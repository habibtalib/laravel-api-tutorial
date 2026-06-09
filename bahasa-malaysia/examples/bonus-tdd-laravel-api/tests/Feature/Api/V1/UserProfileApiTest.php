<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.frontend.api_token' => 'testing-frontend-token',
        ]);
    }

    private function frontendHeaders(): array
    {
        return [
            'X-API-TOKEN' => 'testing-frontend-token',
        ];
    }

    private function authenticate(): User
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        return $user;
    }

    public function test_frontend_token_is_required(): void
    {
        $this->authenticate();

        $response = $this->getJson('/api/v1/users');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthorized: Invalid frontend API token.',
            ]);
    }

    public function test_profiles_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/users', $this->frontendHeaders());

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_profile(): void
    {
        $this->authenticate();

        $payload = [
            'full_name' => 'Aina Rahman',
            'phone' => '+60123456789',
            'id_card_number' => '900101-14-1234',
            'address' => 'Kuala Lumpur',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/users', $payload, $this->frontendHeaders());

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'User profile created successfully.')
            ->assertJsonPath('data.full_name', 'Aina Rahman');

        $this->assertDatabaseHas('user_profiles', [
            'full_name' => 'Aina Rahman',
            'id_card_number' => '900101-14-1234',
        ]);
    }

    public function test_create_profile_requires_required_fields(): void
    {
        $this->authenticate();

        $response = $this->postJson('/api/v1/users', [], $this->frontendHeaders());

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'full_name',
                'phone',
                'id_card_number',
            ]);
    }

    public function test_authenticated_user_can_list_profiles(): void
    {
        $this->authenticate();

        UserProfile::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/users', $this->frontendHeaders());

        $response
            ->assertOk()
            ->assertJsonPath('message', 'User profiles retrieved successfully.')
            ->assertJsonCount(3, 'data');
    }

    public function test_authenticated_user_can_show_profile(): void
    {
        $this->authenticate();

        $profile = UserProfile::factory()->create([
            'full_name' => 'Daniel Tan',
        ]);

        $response = $this->getJson("/api/v1/users/{$profile->id}", $this->frontendHeaders());

        $response
            ->assertOk()
            ->assertJsonPath('message', 'User profile retrieved successfully.')
            ->assertJsonPath('data.full_name', 'Daniel Tan');
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $this->authenticate();

        $profile = UserProfile::factory()->create([
            'phone' => '+60111111111',
        ]);

        $response = $this->patchJson(
            "/api/v1/users/{$profile->id}",
            ['phone' => '+60222222222'],
            $this->frontendHeaders()
        );

        $response
            ->assertOk()
            ->assertJsonPath('message', 'User profile updated successfully.')
            ->assertJsonPath('data.phone', '+60222222222');

        $this->assertDatabaseHas('user_profiles', [
            'id' => $profile->id,
            'phone' => '+60222222222',
        ]);
    }

    public function test_authenticated_user_can_delete_profile(): void
    {
        $this->authenticate();

        $profile = UserProfile::factory()->create();

        $response = $this->deleteJson("/api/v1/users/{$profile->id}", [], $this->frontendHeaders());

        $response->assertNoContent();

        $this->assertDatabaseMissing('user_profiles', [
            'id' => $profile->id,
        ]);
    }

    public function test_missing_profile_returns_json_404(): void
    {
        $this->authenticate();

        $response = $this->getJson('/api/v1/users/999999', $this->frontendHeaders());

        $response
            ->assertNotFound()
            ->assertJson([
                'message' => 'Resource not found.',
            ]);
    }

    public function test_duplicate_id_card_number_is_rejected(): void
    {
        $this->authenticate();

        UserProfile::factory()->create([
            'id_card_number' => '900101-14-1234',
        ]);

        $response = $this->postJson('/api/v1/users', [
            'full_name' => 'Duplicate User',
            'phone' => '+60123456789',
            'id_card_number' => '900101-14-1234',
        ], $this->frontendHeaders());

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['id_card_number']);
    }

    public function test_user_profiles_can_be_filtered_by_active_status(): void
    {
        $this->authenticate();

        UserProfile::factory()->create([
            'full_name' => 'Active User',
            'is_active' => true,
        ]);

        UserProfile::factory()->inactive()->create([
            'full_name' => 'Inactive User',
        ]);

        $response = $this->getJson('/api/v1/users?active=1', $this->frontendHeaders());

        $response
            ->assertOk()
            ->assertJsonFragment([
                'full_name' => 'Active User',
            ])
            ->assertJsonMissing([
                'full_name' => 'Inactive User',
            ]);
    }
}
