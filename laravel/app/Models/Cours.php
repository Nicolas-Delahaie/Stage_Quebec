<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\User;

class Cours extends Model
{
    use HasFactory;
    public $timestamps = false; //Pour que le seeder sache qu'il ne faut pas l initialiser (meme s il n existe pas)
    protected $table = 'cours';
    protected $fillable = [
        'nom',
    ];

    public function departements(){
        return $this->belongsToMany(Departement::class, 'cours_propose', 'departement_id', 'cours_id')
            ->withPivot("ponderation", "tailleGroupes", "nbGroupes");
    }
}