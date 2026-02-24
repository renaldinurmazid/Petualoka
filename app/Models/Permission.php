<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';
}
