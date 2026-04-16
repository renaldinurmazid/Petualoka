<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    public function index(Request $request)
    {
        try {
            $addresses = UserAddress::where('user_id', $request->user()->id)
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Addresses retrieved successfully',
                'data' => $addresses
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve addresses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'nullable|string|max:255',
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'province_id' => 'nullable|string',
            'province_name' => 'required|string',
            'city_id' => 'nullable|string',
            'city_name' => 'required|string',
            'district_id' => 'nullable|string',
            'district_name' => 'required|string',
            'subdistrict_id' => 'nullable|string',
            'subdistrict_name' => 'required|string',
            'postal_code' => 'required|string|max:10',
            'full_address' => 'required|string',
            'notes' => 'nullable|string',
            'is_default' => 'nullable|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $userId = $request->user()->id;

            // If this is the first address, or if it's set as default
            $isDefault = $request->input('is_default', false);
            $count = UserAddress::where('user_id', $userId)->count();

            if ($count === 0) {
                $isDefault = true;
            }

            if ($isDefault) {
                UserAddress::where('user_id', $userId)->update(['is_default' => false]);
            }

            $address = UserAddress::create([
                'user_id' => $userId,
                'label' => $request->label,
                'recipient_name' => $request->recipient_name,
                'phone_number' => $request->phone_number,
                'province_id' => $request->province_id,
                'province_name' => $request->province_name,
                'city_id' => $request->city_id,
                'city_name' => $request->city_name,
                'district_id' => $request->district_id,
                'district_name' => $request->district_name,
                'subdistrict_id' => $request->subdistrict_id,
                'subdistrict_name' => $request->subdistrict_name,
                'postal_code' => $request->postal_code,
                'full_address' => $request->full_address,
                'notes' => $request->notes,
                'is_default' => $isDefault,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Address created successfully',
                'data' => $address
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $address = UserAddress::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'message' => 'Address retrieved successfully',
                'data' => $address
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Address not found',
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'sometimes|string|max:255',
            'recipient_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20',
            'province_id' => 'sometimes|nullable|string',
            'province_name' => 'sometimes|string',
            'city_id' => 'sometimes|nullable|string',
            'city_name' => 'sometimes|string',
            'district_id' => 'sometimes|nullable|string',
            'district_name' => 'sometimes|string',
            'subdistrict_id' => 'sometimes|nullable|string',
            'subdistrict_name' => 'sometimes|string',
            'postal_code' => 'sometimes|string|max:10',
            'full_address' => 'sometimes|string',
            'notes' => 'sometimes|nullable|string',
            'is_default' => 'sometimes|boolean',
            'latitude' => 'sometimes|nullable|numeric',
            'longitude' => 'sometimes|nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $address = UserAddress::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            if ($request->has('is_default') && $request->is_default) {
                UserAddress::where('user_id', $request->user()->id)
                    ->where('id', '!=', $id)
                    ->update(['is_default' => false]);
            }

            $address->update($request->all());

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Address updated successfully',
                'data' => $address
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $address = UserAddress::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            $wasDefault = $address->is_default;
            $address->delete();

            // If we deleted the default address, make the newest one default
            if ($wasDefault) {
                $newDefault = UserAddress::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                if ($newDefault) {
                    $newDefault->update(['is_default' => true]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Address deleted successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete address or address not found',
            ], 404);
        }
    }

    public function setDefault(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $address = UserAddress::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            UserAddress::where('user_id', $request->user()->id)
                ->update(['is_default' => false]);

            $address->update(['is_default' => true]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Default address updated successfully',
                'data' => $address
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to set default address',
            ], 404);
        }
    }
}
