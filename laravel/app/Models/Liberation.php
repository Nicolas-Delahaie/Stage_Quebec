<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Liberation extends Model
{
    use HasFactory;
    public $timestamps = false; //Pour que le seeder sache qu'il ne faut pas l initialiser (meme s il n existe pas)
    protected $table = 'liberation';
    protected $fillable = [
        'motif',
    ];

    public function users(){
        return $this->belongsToMany(User::class, "alouer", "utilisateur_id", "liberation_id")
            ->withPivot('tempsAloue', 'annee', 'semestre');
    }
}
