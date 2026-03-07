<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    // ── Konstanta status yang valid ────────────────────────────────────────
    private const VALID_PERIODS = ['today', 'yesterday', 'this-month', 'last-month', 'this-year'];
    private const VALID_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'expired'];

    // ── Entry point ────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $vendor = auth()->user()->vendorProfile;

        if (!$vendor) {
            return redirect()->route('vendor-profile.index');
        }

        $period = in_array($request->input('period'), self::VALID_PERIODS)
            ? $request->input('period')
            : 'all';

        $status = in_array($request->input('status'), self::VALID_STATUSES)
            ? $request->input('status')
            : 'all';

        return Inertia::render('reports/index', [
            'stats'              => $this->getStats($vendor, $period, $status),
            'salesData'          => $this->getSalesData($vendor, $period),
            'topProducts'        => $this->getTopProducts($vendor, $period),
            'recentTransactions' => $this->getRecentTransactions($vendor, $period, $status),
            'filters'            => compact('period', 'status'),
        ]);
    }

    // ── Stats ──────────────────────────────────────────────────────────────
    private function getStats($vendor, string $period, string $status): array
    {
        // Base: semua order milik vendor ini sesuai filter
        $baseQuery = Order::query()
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id));

        $this->applyPeriod($baseQuery, $period);

        if ($status !== 'all') {
            $baseQuery->where('status', $status);
        }

        // Revenue & avg hanya dari completed
        $revenueQuery = (clone $baseQuery)->where('status', 'completed');

        $totalRevenue   = (float) $revenueQuery->sum('grand_total');
        $totalOrders    = (clone $baseQuery)->count();
        $avgOrderValue  = (float) ($revenueQuery->avg('grand_total') ?? 0);

        // Pelanggan unik yang pernah order ke vendor ini (sesuai filter periode)
        $uniqueCustomers = Order::query()
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->tap(fn ($q) => $this->applyPeriod($q, $period))
            ->distinct('user_id')
            ->count('user_id');

        return [
            'total_revenue'    => $totalRevenue,
            'total_orders'     => $totalOrders,
            'unique_customers' => $uniqueCustomers,
            'avg_order_value'  => $avgOrderValue,
        ];
    }

    // ── Sales Chart (mengikuti filter period) ─────────────────────────────
    private function getSalesData($vendor, string $period): array
    {
        // Tentukan granularitas berdasarkan period.
        // GROUP BY harus mencakup SEMUA ekspresi non-agregat di SELECT
        // agar kompatibel dengan MySQL only_full_group_by mode.
        [$dateFormat, $groupBy, $orderBy] = match ($period) {
            'today',
            'yesterday'  => [
                "DATE_FORMAT(orders.created_at, '%H:00')",
                "DATE_FORMAT(orders.created_at, '%H:00'), HOUR(orders.created_at)",
                "HOUR(orders.created_at)",
            ],
            'this-month',
            'last-month' => [
                "DATE_FORMAT(orders.created_at, '%d %b')",
                "DATE_FORMAT(orders.created_at, '%d %b'), DAY(orders.created_at)",
                "DAY(orders.created_at)",
            ],
            'this-year'  => [
                "DATE_FORMAT(orders.created_at, '%b')",
                "DATE_FORMAT(orders.created_at, '%b'), MONTH(orders.created_at)",
                "MONTH(orders.created_at)",
            ],
            default      => [
                "DATE_FORMAT(orders.created_at, '%b %Y')",
                "DATE_FORMAT(orders.created_at, '%b %Y'), YEAR(orders.created_at), MONTH(orders.created_at)",
                "YEAR(orders.created_at), MONTH(orders.created_at)",
            ],
        };

        $rows = OrderItem::query()
            ->where('order_items.vendor_id', $vendor->id)
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'completed')
            ->tap(fn ($q) => $this->applyPeriodToJoined($q, $period))
            ->selectRaw("
                {$dateFormat} as name,
                SUM(order_items.subtotal) as revenue,
                COUNT(DISTINCT orders.id) as orders
            ")
            ->groupByRaw($groupBy)
            ->orderByRaw($orderBy)
            ->get();

        return $rows->map(fn ($row) => [
            'name'    => $row->name,
            'revenue' => (float) $row->revenue,
            'orders'  => (int) $row->orders,
        ])->toArray();
    }

    // ── Top Products ───────────────────────────────────────────────────────
    private function getTopProducts($vendor, string $period): array
    {
        $colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

        $rows = OrderItem::query()
            ->where('order_items.vendor_id', $vendor->id)
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'completed')
            ->tap(fn ($q) => $this->applyPeriodToJoined($q, $period))
            ->selectRaw('order_items.product_name as name, SUM(order_items.quantity) as sales, SUM(order_items.subtotal) as revenue')
            ->groupBy('order_items.product_name')
            ->orderByDesc('sales')
            ->limit(5)
            ->get();

        return $rows->map(fn ($row, $i) => [
            'name'    => $row->name,
            'sales'   => (int) $row->sales,
            'revenue' => (float) $row->revenue,
            'color'   => $colors[$i] ?? '#3b82f6',
        ])->toArray();
    }

    // ── Recent Transactions ────────────────────────────────────────────────
    private function getRecentTransactions($vendor, string $period, string $status): array
    {
        $query = Order::query()
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'user:id,name',
                'items' => fn ($q) => $q
                    ->where('vendor_id', $vendor->id)
                    ->select('order_id', 'product_name'),
            ])
            ->select('id', 'order_number', 'user_id', 'grand_total', 'status', 'created_at');

        $this->applyPeriod($query, $period);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return $query
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($order) => [
                'id'       => $order->order_number,
                'date'     => $order->created_at->translatedFormat('d M Y, H:i'),
                'customer' => $order->user?->name ?? 'Guest',
                'product'  => $order->items->count() > 1
                    ? $order->items->first()->product_name . ' +' . ($order->items->count() - 1) . ' lainnya'
                    : ($order->items->first()?->product_name ?? '-'),
                'amount'   => (float) $order->grand_total,
                'status'   => $order->status,   // raw — frontend yang handle label & warna
            ])
            ->toArray();
    }

    // ── Export PDF ─────────────────────────────────────────────────────────
    public function exportPdf(Request $request)
    {
        $vendor = auth()->user()->vendorProfile;

        if (!$vendor) {
            abort(403);
        }

        $period = in_array($request->query('period'), self::VALID_PERIODS)
            ? $request->query('period')
            : 'all';

        $status = in_array($request->query('status'), self::VALID_STATUSES)
            ? $request->query('status')
            : 'all';

        $query = Order::query()
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'user:id,name',
                'items' => fn ($q) => $q->where('vendor_id', $vendor->id)->select('order_id', 'product_name', 'quantity', 'subtotal'),
            ]);

        $this->applyPeriod($query, $period);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $transactions = $query->orderByDesc('created_at')->get();

        $stats = [
            'vendor_name'   => $vendor->name,
            'total_revenue' => (float) $transactions->where('status', 'completed')->sum('grand_total'),
            'total_orders'  => $transactions->count(),
            'period'        => strtoupper(str_replace('-', ' ', $period)),
            'date'          => now()->translatedFormat('d F Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.report', compact('transactions', 'stats', 'vendor'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-' . $vendor->name . '-' . $period . '.pdf');
    }

    // ── Helpers: apply period filter ──────────────────────────────────────

    /**
     * Untuk query yang menggunakan model Order langsung (tanpa join).
     */
    private function applyPeriod($query, string $period): void
    {
        match ($period) {
            'today'      => $query->whereDate('created_at', Carbon::today()),
            'yesterday'  => $query->whereDate('created_at', Carbon::yesterday()),
            'this-month' => $query->whereMonth('created_at', now()->month)
                                  ->whereYear('created_at', now()->year),
            'last-month' => $query->whereMonth('created_at', now()->subMonth()->month)
                                  ->whereYear('created_at', now()->subMonth()->year),
            'this-year'  => $query->whereYear('created_at', now()->year),
            default      => null,
        };
    }

    /**
     * Untuk query yang sudah JOIN dengan tabel orders (kolom harus prefixed).
     */
    private function applyPeriodToJoined($query, string $period): void
    {
        match ($period) {
            'today'      => $query->whereDate('orders.created_at', Carbon::today()),
            'yesterday'  => $query->whereDate('orders.created_at', Carbon::yesterday()),
            'this-month' => $query->whereMonth('orders.created_at', now()->month)
                                  ->whereYear('orders.created_at', now()->year),
            'last-month' => $query->whereMonth('orders.created_at', now()->subMonth()->month)
                                  ->whereYear('orders.created_at', now()->subMonth()->year),
            'this-year'  => $query->whereYear('orders.created_at', now()->year),
            default      => null,
        };
    }
}