<?php

namespace App\Models;

use CodeIgniter\Model;

class AccountManager extends Model{
    protected $database;
    public function __construct(){
        $this->database = \Config\Database::connect('gym_db');
    }
    public function deleteAccount($key, $password): bool
    {
        $builder = $this->database->table('users');
        $user = $builder->where('profile_key', $key)->get()->getRow();
    
        if (!$user) {
            return false;
        }
    
        if (!password_verify($password, $user->password)) {
            return false;
        }
    
        return $this->finalAccountDeletion($key);
    }
    
    protected function finalAccountDeletion($key): bool
    {
        $builder = $this->database->table('users');
        $builder->where('profile_key', $key)->delete();
        
        return $builder->db()->affectedRows() > 0;
    }
    
}