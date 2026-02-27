<?php
if (!function_exists('phone_number_formatter')) {
    function phone_number_formatter($phone_number)
    {
        $phone_number = preg_replace('/[^0-9]/', '', $phone_number);

        if (strpos($phone_number, '0') === 0) {
            $phone_number = '62' . substr($phone_number, 1);
        }

        if (strpos($phone_number, '62') !== 0) {
            $phone_number = '62' . $phone_number;
        }

        return $phone_number;
    }
}

if (!function_exists('price_formatter')) {
    function price_formatter($price)
    {
        return 'Rp' . number_format($price, 0, ',', '.');
    }
}