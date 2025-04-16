<?php

namespace App\Models;

use CodeIgniter\Model;

class AdminAuthentication extends Model{
    protected $validation, $database;
    public function __construct(){
        $this->validation = \Config\Services::validation();
        $this->database = \Config\Database::connect('gym_db');
    }

    public function checkUserEmail($email):bool
    {
        $builder = $this->database->table('users');
        $checkAdminCredentials = $builder->where('email', $email)->get()->getRow();
        if(!empty($checkAdminCredentials) && $checkAdminCredentials->type == 'admin') {
            
            $key = $checkAdminCredentials->profile_key;
            $builder = $this->database->table('one_time_password');
            $userdata = [
                'email' => $email,
                'profile_key' => $key,
                'otp' => $this->generateUniqueOneTimePassword(),
                'deleted_at' => date('Y-m-d H:i:s', time() + 350),
                'type' => $checkAdminCredentials->type
            ];

            if($builder->insert($userdata)) return true;

            return false;
        };
        return false;
    }
    public function verifyUserEmailandOtp($email, $otp): bool
    {
        // Step 1: Validate OTP for the email and type
        $checkOTPValidity = $this->database->table('one_time_password')
            ->where('email', $email)
            ->where('otp', $otp)
            ->where('type', 'admin')
            ->get()
            ->getRow();
    
        if (!empty($checkOTPValidity) && isset($checkOTPValidity->profile_key)) {
            // Step 2: Fetch the corresponding user
            $userRow = $this->database->table('users')
                ->where('profile_key', $checkOTPValidity->profile_key)
                ->where('email', $email)
                ->where('type', 'admin')
                ->get()
                ->getRow();
    
            if (!empty($userRow) && isset($userRow->profile_key)) {
                // Step 3: Set secure cookie
                setcookie('temp_profile_key', $userRow->profile_key, [
                    'expires' => time() + 3600,
                    'path' => '/',
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'None', // Use 'Lax' or 'Strict' if not cross-site
                ]);
    
                return true;
            }
        }
    
        return false;
    }
    
    public function retrieveUserKey($email, $key): bool
    {
        $userRow = $this->database->table('users')
            ->where('email', $email)
            ->where('profile_key', $key)
            ->get()
            ->getRow();
    
        if (!$userRow || empty($userRow->profile_key)) {
            return false;
        }
    
        // Set secure cookie with verified key
        setcookie('profile_key', $userRow->profile_key, [
            'expires' => time() + 3600,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);
    
        // Invalidate temporary key from OTP table
        $deleted = $this->database->table('one_time_password')
            ->where('email', $email)
            ->where('profile_key', $key)
            ->delete();
    
        return (bool) $deleted;
    }
    
    public function finalVerificationForAdminLogin($email, $password, $otp, $cookie): bool
    {

        $userBuilder = $this->database->table('users')
        ->where('email', $email)
        ->where('profile_key', $cookie)
        ->where('type', 'admin')
        ->get()->getRow();
        
        $verification = password_verify($password, $userBuilder->password);
        
        if($verification && !empty($userBuilder)) {

            $this->database->table('one_time_password')
            ->where('deleted_at <', date('Y-m-d H:i:s') )
            ->where('type', 'admin')
            ->delete();

            $this->database->table('one_time_password')
            ->where('email', $email)
            ->where('profile_key', $cookie)
            ->where('otp', $otp)
            ->delete();

            return true;
        }

        return false;

    }

    protected function generateUniqueOneTimePassword(): string
    {
        $otp = mt_rand( 100000, 999999);
        return $otp;
    }



}