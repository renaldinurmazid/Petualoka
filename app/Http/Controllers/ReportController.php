<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
     
        $period = $request->input('period', 'all');
        $status = $request->input('status', 'all');

      
        $query = Order::query();

        if ($period !== 'all') {
            match ($period) {
                'today' => $query->whereDate('created_at', Carbon::today()),
                'yesterday' => $query->whereDate('created_at', Carbon::yesterday()),
                'this-month' => $query->whereMonth('created_at', Carbon::now()->month)
                                     ->whereYear('created_at', Carbon::now()->year),
                'last-month' => $query->whereMonth('created_at', Carbon::now()->subMonth()->month)
                                     ->whereYear('created_at', Carbon::now()->subMonth()->year),
                'this-year' => $query->whereYear('created_at', Carbon::now()->year),
                default => null,
            };
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

      
        $statsQuery = clone $query;
        
        $stats = [
            'total_revenue' => (float) (clone $statsQuery)->where('status', 'completed')->sum('grand_total'),
            'total_orders' => (clone $statsQuery)->count(),
            'new_customers' => DB::table('users')->where('created_at', '>=', now()->subMonth())->count(),
            'avg_order_value' => (float) (clone $statsQuery)->where('status', 'completed')->avg('grand_total') ?? 0,
        ];

       
        $salesData = Order::select(
                DB::raw("DATE_FORMAT(created_at, '%b') as name"),
                DB::raw("SUM(grand_total) as revenue"),
                DB::raw("COUNT(id) as orders")
            )
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('name', DB::raw("MONTH(created_at)"))
            ->orderBy(DB::raw("MONTH(created_at)"), 'asc')
            ->get();

       
        $colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
        $topProducts = OrderItem::select('product_name as name', DB::raw('SUM(quantity) as sales'))
            ->whereHas('order', function($q) use ($period) {
                $q->where('status', 'completed');
                if ($period !== 'all') {
                    match ($period) {
                        'today' => $q->whereDate('created_at', Carbon::today()),
                        'yesterday' => $q->whereDate('created_at', Carbon::yesterday()),
                        'this-month' => $q->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year),
                        'this-year' => $q->whereYear('created_at', Carbon::now()->year),
                        default => null,
                    };
                }
            })
            ->groupBy('product_name')
            ->orderBy('sales', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item, $index) use ($colors) {
                $item->color = $colors[$index] ?? '#3b82f6'; 
                return $item;
            });

     
        $recentTransactions = $query->with('user:id,name')
            ->latest()
            ->limit(10) 
            ->get()
            ->map(fn($order) => [
                'id' => $order->order_number ?? $order->id,
                'date' => $order->created_at->format('d M Y'),
                'customer' => $order->user->name ?? 'Guest',
                'amount' => (float) $order->grand_total,
                'status' => $this->formatStatus($order->status),
            ]);

        return Inertia::render('reports/index', [
            'recentTransactions' => $recentTransactions,
            'stats' => $stats,
            'salesData' => $salesData, 
            'topProducts' => $topProducts, 
            'filters' => [
                'period' => $period,
                'status' => $status 
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $period = $request->query('period', 'all');
        $status = $request->query('status', 'all');

        $query = Order::query();

        if ($period !== 'all') {
            match ($period) {
                'today' => $query->whereDate('created_at', Carbon::today()),
                'yesterday' => $query->whereDate('created_at', Carbon::yesterday()),
                'this-month' => $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year),
                'last-month' => $query->whereMonth('created_at', Carbon::now()->subMonth()->month)->whereYear('created_at', Carbon::now()->subMonth()->year),
                'this-year' => $query->whereYear('created_at', Carbon::now()->year),
                default => null,
            };
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $transactions = $query->with('user')->latest()->get();
        
        $totalRevenue = $transactions->where('status', 'completed')->sum('grand_total');

        $stats = [
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $transactions->count(),
            'period' => strtoupper(str_replace('-', ' ', $period)),
            'date' => now()->format('d F Y H:i')
        ];

        $pdf = Pdf::loadView('pdf.report', compact('transactions', 'stats'));
        
       
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-transaksi-' . $period . '.pdf');
    }

    private function formatStatus($status)
    {
        return match($status) {
            'pending' => 'Processing',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => ucfirst($status),
        };
    }
}