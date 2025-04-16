<?php

namespace App\Models;

use CodeIgniter\Model;

class Authentication extends Model{
    protected $validation, $database;
    public function __construct(){
        $this->validation = \Config\Services::validation();
        $this->database = \Config\Database::connect('gym_db');
    }
    public function validateData($rules, $data){
        if(!$this->validation->setRules($rules)->run((array) $data)){
            $errors = $this->validation->getErrors();
            return $errors;
        }
    }

    public function generateUniqueProfileKeyFromEmail(string $email): string{
        $builder = $this->database->table('users'); // adjust table name if needed

            do {
                $base = $email . microtime(true) . bin2hex(random_bytes(5)); // 64-character secure key
                $exists = $builder->where('profile_key', $base)->countAllResults() > 0;
            } while ($exists);

        return hash('sha256', $base);
    }

    public function register($data): bool{
        $email = $data['email'];
        $builder = $this->database->table('users');

        // Check if email exists
        if ($builder->where('email', $email)->countAllResults() > 0) {
            return false; // Email already exists
        }

        // Insert the data
        return $builder->insert($data);

    }

    public function createOtp($profileKey, $email, $type):bool
    {
        $builder = $this->database->table('one_time_password');
        $data = [
            'email' => $email,
            'profile_key' => $profileKey,
            'otp' => $this->generateUniqueOneTimePassword(),
            'deleted_at' => date('Y-m-d H:i:s', time() + 90),
            'type' => $type,
        ];

        $insertTable = $builder->insert($data);

        if($insertTable) {
        setcookie('otp-timeout', strtotime($data['deleted_at']), [
            'expires' => strtotime($data['deleted_at']),
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);

        setcookie('copy-of-otp-timeout', strtotime($data['deleted_at']), [
            'expires' => strtotime($data['deleted_at']),
            'path' => '/',
            'secure' => true,
            'httponly' => false,
            'samesite' => 'None',
        ]); 

        return true;
    };
        return false;
    }

    public function checkAndRetrieveOrDeleteOtp($profileKey, $email): bool
    {
        $builder = $this->database->table('one_time_password');
        
        $checkIfOtpExists = $builder
            ->where('profile_key', $profileKey)
            ->where('email', $email)
            ->get()
            ->getRow();
        
        # Step 1: Check if OTP exists
        if (!empty($checkIfOtpExists)) {
            
            # RESET builder before making a new query
            $builder = $this->database->table('one_time_password');
            
            #Step 2: Delete All Expired OTP's and check if it's true
            $deleteAllRows = $builder->where('deleted_at <', date('Y-m-d H:i:s') )
            ->where('profile_key', $profileKey)
            ->where('email', $email)
            ->delete();

            if($deleteAllRows) {

                $getUserOtp = $this->database->table('one_time_password')
                ->where('profile_key', $profileKey)
                ->where('email', $email)
                ->get()
                ->getRow();
                
                if(!empty($getUserOtp)){
                    # Step 3: Retrieve OTP created after deleted_at
                    setcookie('otp-timeout', strtotime($getUserOtp->deleted_at), [
                        'expires' => strtotime($getUserOtp->deleted_at),
                        'path' => '/',
                        'secure' => true,
                        'httponly' => true,
                        'samesite' => 'None',
                    ]);

                    setcookie('copy-of-otp-timeout',strtotime($getUserOtp->deleted_at), [
                        'expires' => strtotime($getUserOtp->deleted_at),
                        'path' => '/',
                        'secure' => true,
                        'httponly' => false,
                        'samesite' => 'None',
                    ]); 

        
                    return true;
                }

                return false;

            }

            return false;
           
        }
        

        # If OTP does not exist or deleted_at is empty, return true
        return false;
    }
    
    public function checkEmailandOTP($email, $otp): bool
    {
        $builder = $this->database->table('one_time_password');
        $confirmUserOTP = $builder->where('email', $email)
        ->where('otp', $otp)->get()->getRow();
        
        if(!empty($confirmUserOTP)) return false;

        $deleteTable = $this->database->table('one_time_password')
        ->where('email', $email)
        ->where('otp', $otp)
        ->delete();

        if($deleteTable) 
        {
            return true;
        }

        return false;
    }

    public function changePasswordViaOTP($email, $profile_key, $password):bool
    {
        $builder = $this->database->table('users');
        $user = $builder->where('email', $email)->where('profile_key', $profile_key)->update([
            'password' => $password
        ]);
        if($user) return true;

        return false;
    }

    public function checkPasswordBeforeUpdate($email, $profile_key, $password):bool
    {
        $builder = $this->database->table('users');
        $user = $builder->where('email', $email)->where('profile_key', $profile_key)->get()->getRow();
        $getPassword = $user->password;

        $verification = password_verify($password, $getPassword);

        if($verification) return true;

        return false;
    }


    protected function generateUniqueOneTimePassword(): string
    {
        $otp = mt_rand( 100000, 999999);
        return $otp;
    }

    public function login($email): ?object{
        $builder = $this->database->table('users');
        // Get the first matching user
        $user = $builder->where('email', $email)->get()->getRow();
        return $user; // Will return null if no user is found
    }

    public function retrieveData($key): ?object{
        $builder = $this->database->table('users');

        $user = $builder->where('profile_key', $key)->get()->getRow();
        return $user;
    }

}