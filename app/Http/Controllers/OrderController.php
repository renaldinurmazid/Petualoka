<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $vendorId = $user->vendorProfile->id;
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $orders = Order::whereHas('items', function ($query) use ($vendorId) {
            $query->where('vendor_id', $vendorId);
        })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->with([
                'user',
                'items' => function ($query) use ($vendorId) {
                    $query->where('vendor_id', $vendorId);
                }
            ])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('order/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $vendorId = $user->vendorProfile->id;

        $order = Order::where('id', $id)
            ->whereHas('items', function ($query) use ($vendorId) {
                $query->where('vendor_id', $vendorId);
            })
            ->with([
                'user',
                'paymentMethode',
                'voucher',
                'items' => function ($query) use ($vendorId) {
                    $query->where('vendor_id', $vendorId)->with('product');
                }
            ])
            ->firstOrFail();

        return Inertia::render('order/show', [
            'order' => $order
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,completed,cancelled,expired'
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $vendorId = $user->vendorProfile->id;

        $order = Order::where('id', $id)
            ->whereHas('items', function ($query) use ($vendorId) {
                $query->where('vendor_id', $vendorId);
            })
            ->firstOrFail();

        $order->update([
            'status' => $request->status,
            'completed_at' => $request->status === 'completed' ? now() : $order->completed_at,
            'paid_at' => $request->status === 'paid' ? now() : $order->paid_at,
        ]);

        return back()->with('success', 'Order status updated successfully');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return $this->show($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // For now, we use updateStatus for status changes. 
        // We can redirect to updateStatus if needed or implement more logic here.
        return $this->updateStatus($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $vendorId = $user->vendorProfile->id;

        $order = Order::where('id', $id)
            ->whereHas('items', function ($query) use ($vendorId) {
                $query->where('vendor_id', $vendorId);
            })
            ->firstOrFail();

        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully');
    }
}
