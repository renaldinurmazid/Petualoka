<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Keamanan</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; color: #333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #007bff;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px;">Petualoka</h1>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">Verifikasi Kode OTP Anda</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #666;">
                    Halo, <br>
                    Kami menerima permintaan untuk masuk ke akun Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan. 
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 15px 30px; background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 10px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff;">{{ $otp }}</span>
                    </div>
                    <p style="font-size: 14px; color: #999; margin-top: 15px;">
                        Kode ini akan kadaluwarsa dalam <strong>5 menit</strong>.
                    </p>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                    Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini atau hubungi pusat bantuan kami. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 20px 30px; background-color: #fbfbfb; border-top: 1px solid #eeeeee; text-align: center;">
                <p style="font-size: 12px; color: #aaa; margin: 0;">
                    &copy; 2026 Petualoka. Seluruh hak cipta dilindungi.<br>
                    Jakarta, Indonesia.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>