<?php



namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $this->sendOtp($user->email, 'registration');

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'Registration successful. Please verify your email with the OTP sent.',
                'user' => $user
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid login credentials'
                ], 401);
            }

            $user = User::where('email', $request->email)->firstOrFail();

            if (!$user->email_verified_at) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please verify your email first.'
                ], 403);
            }

            // Generate token if Sanctum is installed
            $token = method_exists($user, 'createToken')
                ? $user->createToken('auth_token')->plainTextToken
                : 'session_based_or_manual_token';

            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $this->sendOtp($request->email, 'forgot_password');
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'OTP sent for password reset.'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send OTP.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'type' => 'required|in:registration,forgot_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $this->sendOtp($request->email, $request->type);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'OTP resent successfully.'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to resend OTP.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string',
            'type' => 'required|in:registration,forgot_password',
            'password' => 'required_if:type,forgot_password|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $otpRecord = Otp::where('email', $request->email)
                ->where('otp', $request->otp)
                ->where('type', $request->type)
                ->where('expires_at', '>', Carbon::now())
                ->lockForUpdate()
                ->first();

            if (!$otpRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid or expired OTP'
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if ($request->type === 'registration') {
                $user->email_verified_at = Carbon::now();
                $user->save();
                $message = 'Email verified successfully. You can now login.';
            } else {
                $user->password = Hash::make($request->password);
                $user->save();
                $message = 'Password reset successfully.';
            }

            $otpRecord->delete();

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => $message
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Verification failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function sendOtp($email, $type)
    {
        // Delete existing OTPs for this email and type
        Otp::where('email', $email)->where('type', $type)->delete();

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Otp::create([
            'email' => $email,
            'otp' => $otpCode,
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new OtpMail($otpCode));
    }
}
