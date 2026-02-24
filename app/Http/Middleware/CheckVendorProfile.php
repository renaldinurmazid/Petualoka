<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVendorProfile
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('mitra')) {
            $isVerified = $user->vendorProfile && $user->vendorProfile->is_verified;

            if (!$isVerified) {
                if ($request->routeIs('vendor.setup') || $request->routeIs('vendor.store') || $request->routeIs('vendor-profile.update')) {
                    return $next($request);
                }


                return $request->expectsJson()
                    ? response()->json(['message' => 'Your vendor profile is pending verification.'], 403)
                    : redirect()->route('vendor.setup');
            } else {
                // If verified but trying to access setup routes, redirect to dashboard
                if ($request->routeIs('vendor.setup') || $request->routeIs('vendor.store')) {
                    return redirect()->route('dashboard');
                }
            }
        }

        return $next($request);
    }
}
