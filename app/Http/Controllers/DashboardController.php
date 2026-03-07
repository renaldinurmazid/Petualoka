<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $vendor = auth()->user()->vendorProfile;

        if (!$vendor) {
            return redirect()->route('vendor-profile.index');
        }

        return Inertia::render('dashboard', [
            'vendor'       => $this->getVendorInfo($vendor),
            'topProducts'  => $this->getTopProducts($vendor),
            'recentOrders' => $this->getRecentOrders($vendor),
            'stats'        => $this->getStats($vendor),
            'revenueChart' => $this->getRevenueChart($vendor),
        ]);
    }

    // ── Vendor Info ────────────────────────────────────────────────────────
    private function getVendorInfo($vendor): array
    {
        return [
            'name'        => $vendor->name,
            'is_verified' => (bool) $vendor->is_verified,
            'logo'        => $vendor->getRawOriginal('logo')
                ? asset('storage/' . $vendor->getRawOriginal('logo'))
                : null,
            'city'        => $vendor->city,
            'state'       => $vendor->state,
            'created_at'  => $vendor->created_at->format('Y'),
        ];
    }

    // ── Top Products ───────────────────────────────────────────────────────
    private function getTopProducts($vendor): array
    {
        // Cache 10 menit — data ini jarang berubah drastis
        return Cache::remember("dashboard.top_products.{$vendor->id}", 600, function () use ($vendor) {
            $topProducts = OrderItem::query()
                ->where('vendor_id', $vendor->id)
                ->selectRaw('product_id, product_name, SUM(quantity) as total_sold, SUM(subtotal) as total_revenue')
                ->groupBy('product_id', 'product_name')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

            $maxSold = $topProducts->max('total_sold') ?: 1;
            $colors  = ['#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#06b6d4'];

            return $topProducts->map(fn ($item, $i) => [
                'name'          => $item->product_name,
                'sold'          => (int) $item->total_sold,
                'revenue'       => (float) $item->total_revenue,    // raw number — frontend yang format
                'revenueLabel'  => 'Rp ' . number_format($item->total_revenue, 0, ',', '.'),
                'percent'       => round(($item->total_sold / $maxSold) * 100),
                'color'         => $colors[$i % count($colors)],
            ])->toArray();
        });
    }

    // ── Recent Orders ──────────────────────────────────────────────────────
    private function getRecentOrders($vendor): array
    {
        return Order::query()
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'items' => fn ($q) => $q
                    ->where('vendor_id', $vendor->id)
                    ->select('order_id', 'product_name'),
            ])
            ->select('id', 'order_number', 'grand_total', 'status', 'created_at')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'id'          => $order->order_number,
                'product'     => $order->items->count() > 1
                    ? $order->items->first()->product_name . ' +' . ($order->items->count() - 1) . ' lainnya'
                    : ($order->items->first()?->product_name ?? '-'),
                'date'        => $order->created_at->translatedFormat('d M Y'),
                'amount'      => (float) $order->grand_total,          // raw — frontend format
                'amountLabel' => 'Rp ' . number_format($order->grand_total, 0, ',', '.'),
                'status'      => $order->status,
            ])
            ->toArray();
    }

    // ── Stats ──────────────────────────────────────────────────────────────
    // Semua aggregasi dijadikan SATU query per tabel menggunakan conditional SUM
    private function getStats($vendor): array
    {
        return Cache::remember("dashboard.stats.{$vendor->id}", 300, function () use ($vendor) {
            $now          = now();
            $thisMonthStart = $now->copy()->startOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth();

            // ── 1. Revenue (completed orders) — dua bulan sekaligus ─────
            $revenueRow = OrderItem::query()
                ->where('vendor_id', $vendor->id)
                ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
                ->selectRaw("
                    SUM(CASE WHEN order_items.created_at >= ? AND order_items.created_at <= ? THEN subtotal ELSE 0 END) as this_month,
                    SUM(CASE WHEN order_items.created_at >= ? AND order_items.created_at <= ? THEN subtotal ELSE 0 END) as last_month
                ", [$thisMonthStart, $now, $lastMonthStart, $lastMonthEnd])
                ->first();

            $revenueThis = (float) ($revenueRow->this_month ?? 0);
            $revenueLast = (float) ($revenueRow->last_month ?? 0);
            $revenueChange = $revenueLast > 0
                ? round((($revenueThis - $revenueLast) / $revenueLast) * 100)
                : ($revenueThis > 0 ? 100 : 0);

            // ── 2. Orders — semua status, dua bulan sekaligus ───────────
            $ordersRow = Order::query()
                ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
                ->selectRaw("
                    SUM(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 ELSE 0 END) as this_month,
                    SUM(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 ELSE 0 END) as last_month,
                    SUM(CASE WHEN status IN ('pending','processing') THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'cancelled' AND created_at >= ? AND created_at <= ? THEN 1 ELSE 0 END) as cancelled_this_month
                ", [$thisMonthStart, $now, $lastMonthStart, $lastMonthEnd, $thisMonthStart, $now])
                ->first();

            $ordersThis    = (int) ($ordersRow->this_month ?? 0);
            $ordersLast    = (int) ($ordersRow->last_month ?? 0);
            $ordersChange  = $ordersLast > 0
                ? round((($ordersThis - $ordersLast) / $ordersLast) * 100)
                : ($ordersThis > 0 ? 100 : 0);

            // ── 3. Product count & active vouchers ──────────────────────
            [$totalProducts, $activeVouchers] = [
                Product::where('vendor_id', $vendor->id)->count(),
                Voucher::where('vendor_id', $vendor->id)
                    ->where('is_active', true)
                    ->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', $now))
                    ->count(),
            ];

            return [
                'revenue'          => $revenueThis,
                'revenueLabel'     => 'Rp ' . number_format($revenueThis, 0, ',', '.'),
                'revenueChange'    => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '%',
                'revenuePositive'  => $revenueChange >= 0,

                'totalOrders'      => $ordersThis,
                'ordersChange'     => ($ordersChange >= 0 ? '+' : '') . $ordersChange . '%',
                'ordersPositive'   => $ordersChange >= 0,

                'totalProducts'    => $totalProducts,
                'activeVouchers'   => $activeVouchers,
                'pendingOrders'    => (int) ($ordersRow->pending_count ?? 0),
                'cancelledOrders'  => (int) ($ordersRow->cancelled_this_month ?? 0),
            ];
        });
    }

    // ── Revenue Chart ──────────────────────────────────────────────────────
    private function getRevenueChart($vendor): array
    {
        return Cache::remember("dashboard.revenue_chart.{$vendor->id}", 600, function () use ($vendor) {
            $year = now()->year;

            // Satu query untuk semua bulan
            $revenues = OrderItem::query()
                ->where('order_items.vendor_id', $vendor->id)      // explicit tabel
                ->whereHas('order', fn ($q) => $q
                    ->where('status', 'completed')
                    ->whereYear('orders.created_at', $year)
                )
                ->selectRaw('MONTH(order_items.created_at) as month, SUM(order_items.subtotal) as total')
                ->groupBy(DB::raw('MONTH(order_items.created_at)'))
                ->pluck('total', 'month');

            return collect(range(1, 12))->map(fn ($m) => [
                'month' => Carbon::create($year, $m)->translatedFormat('M'),
                'value' => (float) ($revenues->get($m) ?? 0),
            ])->values()->toArray();
        });
    }
}