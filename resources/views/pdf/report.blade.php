<!DOCTYPE html>
<html>
<head>
    <title>Laporan Transaksi</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-container { margin-bottom: 20px; width: 100%; }
        .stats-box { border: 1px solid #ddd; padding: 10px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN PENJUALAN PETUALOKA</h2>
        <p>Periode: {{ ucfirst(str_replace('-', ' ', $stats['period'])) }} | Dicetak pada: {{ $stats['date'] }}</p>
    </div>

    <table class="stats-container">
        <tr>
            <td class="stats-box">
                <strong>Total Pendapatan</strong><br>
                Rp {{ number_format($stats['total_revenue'], 0, ',', '.') }}
            </td>
            <td class="stats-box">
                <strong>Total Pesanan</strong><br>
                {{ $stats['total_orders'] }}
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>No. Order</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
    @forelse($transactions as $tx)
    <tr>
        <td>{{ $tx->order_number ?? $tx->id }}</td>
        <td>{{ date('d/m/Y', strtotime($tx->created_at)) }}</td>
        <td>{{ $tx->user->name ?? 'User Tidak Ditemukan' }}</td>
        <td>{{ ucfirst($tx->status) }}</td>
        <td class="text-right">Rp {{ number_format((float)$tx->grand_total, 0, ',', '.') }}</td>
    </tr>
    @empty
    <tr>
        <td colspan="5" style="text-align: center;">Tidak ada data ditemukan untuk filter ini</td>
    </tr>
    @endforelse
</tbody>
    </table>
</body>
</html>