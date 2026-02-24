<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';
}
