<?php

/**
 * @todo Mettre les ondelete et onedit sur les foreign key +
 * @todo Gerer l'ordre de suppression dans le down() pour que les tables soient bien supprimees
 */
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ------- CREATION TABLES --------
        Schema::table("users", function (Blueprint $table) {
            // Modification de users
            $table->unsignedBigInteger("type_utilisateur_id")->before("email_verified_at");
        });
        Schema::create("type_utilisateur", function (Blueprint $table) {
            $table->id();
            $table->string("nom", 255)->unique();
        });
        Schema::create("cours", function(Blueprint $table){
            $table->id();
            $table->string("nom", 255)->unique();
        });
        Schema::create("liberation", function(Blueprint $table){
            $table->id();
            $table->string("motif", 255)->unique();
        });
        Schema::create("departement", function (Blueprint $table) {
            $table->id();
            $table->string("nom", 255)->unique();
            $table->smallInteger("nbEleves");
            $table->unsignedBigInteger("coordonnateur_id");
        });
        Schema::create("scenario", function (Blueprint $table) {
            $table->id();
            $table->boolean("aEteValide")->default(false);
            $table->unsignedSmallInteger("annee");
            $table->timestamps();
            $table->unsignedBigInteger("proprietaire_id");
            $table->unsignedBigInteger("departement_id");
        });        
        Schema::create("rdv", function(Blueprint $table){
            $table->id();
            $table->time("horaire");
            $table->date("jour");
            $table->timestamps();
            $table->unsignedBigInteger("scenario_id");
        });
        Schema::create("modification", function(Blueprint $table){
            $table->id();
            $table->date("date_modif");
            $table->unsignedBigInteger("utilisateur_id");
            $table->unsignedBigInteger("scenario_id");
        });
        Schema::create("proposer", function (Blueprint $table){
            $table->id();
            $table->unsignedBigInteger("cours_id");
            $table->unsignedBigInteger("departement_id");
            $table->unique(["cours_id", "departement_id"]);
            $table->unsignedTinyInteger("ponderation");
            $table->unsignedTinyInteger("tailleGroupes")->default(0);
            $table->unsignedSmallInteger("nbGroupes")->default(0);
        });
        Schema::create("enseigner", function(Blueprint $table){
            $table->id();
            $table->unsignedBigInteger("cours_id");
            $table->unsignedBigInteger("professeur_id");
            $table->unsignedBigInteger("scenario_id");
            $table->unique(["cours_id", "professeur_id", "scenario_id"]);
        });
        Schema::create("alouer", function(Blueprint $table){
            $table->id();
            $table->unsignedBigInteger("utilisateur_id");
            $table->unsignedBigInteger("liberation_id");
            $table->unsignedSmallInteger("annee")->nullable();
            $table->unsignedTinyInteger("semestre")->nullable();
            $table->unique(["utilisateur_id", "liberation_id", "annee", "semestre"]);
            $table->unsignedDecimal("tempsAloue", 5, 5);
            $table->timestamps();
        });
    

        // AJOUT REFERENCES
        Schema::table("users", function (Blueprint $table) {
            // Modification de users
            $table->foreign("type_utilisateur_id")->references("id")->on("type_utilisateur");
                // ->onDelete("set null")
                // ->onUpdate("cascade");
        });
        Schema::table("departement", function (Blueprint $table) {
            $table->foreign("coordonnateur_id")->references("id")->on("users");
                // ->onDelete("SET NULL")
                // ->onUpdate("CASCADE");
        });
        Schema::table("scenario", function (Blueprint $table) {
            $table->foreign("proprietaire_id")->references("id")->on("users");
                // ->onDelete("SET NULL")
                // ->onUpdate("CASCADE");
            $table->foreign("departement_id")->references("id")->on("departement");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
        });        
        Schema::table("rdv", function(Blueprint $table){
            $table->foreign("scenario_id")->references("id")->on("scenario");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
        });
        Schema::table("modification", function(Blueprint $table){
            $table->foreign("utilisateur_id")->references("id")->on("users");
                // ->onDelete("SET NULL")
                // ->onUpdate("CASCADE");
            $table->foreign("scenario_id")->references("id")->on("scenario");
                // ->onDelete("SET NULL")
                // ->onUpdate("CASCADE");
        });
        Schema::table("proposer", function (Blueprint $table){
            $table->foreign("cours_id")->references("id")->on("cours");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
            $table->foreign("departement_id")->references("id")->on("departement");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
        });
        Schema::table("enseigner", function(Blueprint $table){
            $table->foreign("cours_id")->references("id")->on("cours");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
            $table->foreign("professeur_id")->references("id")->on("users");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
            $table->foreign("scenario_id")->references("id")->on("scenario");
        });
        Schema::table("alouer", function(Blueprint $table){
            $table->foreign("utilisateur_id")->references("id")->on("users");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
            $table->foreign("liberation_id")->references("id")->on("liberation");
                // ->onDelete("CASCADE")
                // ->onUpdate("CASCADE");
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // DESACTIVATION REFERENCES
        Schema::disableForeignKeyConstraints();
         

        // SUPPRESSION TABLES CREES
        $nomsTables = array("rdv", "proposer", "enseigner", "modification", "alouer","cours", "liberation", "organiser", "type_utilisateur","departement","scenario");
        foreach($nomsTables as $nomTable){Schema::dropIfExists($nomTable);}
        
        
        // SUPPRESSION MODIFICATIONS
        if (Schema::hasColumn("users", "contraintes")){
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('contraintes'); 
            });
        }
        if (Schema::hasColumn("users", "type_utilisateur_id")){
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['type_utilisateur_id']);
                $table->dropColumn('type_utilisateur_id');
            });
        }
    }
};