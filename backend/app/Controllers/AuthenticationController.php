<?php

namespace App\Controllers;
use App\Models\Authentication;
class AuthenticationController extends BaseController
{
    protected $Authentication;
    public function __construct(){
       
        $this->Authentication = new Authentication();
    }

    public function login():object
    {
  
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $password = $data->password;  // No need to sanitize password, just use it directly.
        
        $retrieveUser = $this->Authentication->login($email);
        
        // Check if user exists
        if ($retrieveUser) {
            
            //Check if already Logged in
            if($this->request->getCookie('profile_key') === $retrieveUser->profile_key) return $this->response->setStatusCode(200)->setJSON(['profile_key' => $this->request->getCookie('profile_key')]);
        
            // Verify the password
            if (password_verify($password, $retrieveUser->password)) {

                setcookie('profile_key', $retrieveUser->profile_key, [
                    'expires' => time() + 3600,
                    'path' => '/',
                    'secure' => true,        // required because SameSite=None
                    'httponly' => true,       // protect from JavaScript
                    'samesite' => 'None',     // allow cross-origin
                ]);

                // Password matches
                return $this->response->setJSON([
                    'profile_key' => $retrieveUser->profile_key,
                    'status' => 200,
                    'message' => 'Login successful'
                ]);
            } else {
                // Incorrect password
                return $this->response->setStatusCode(400)->setJSON([
                    'error' => 'Wrong username or password. Please try again.'
                ]);
            }
        } else {
            // User not found
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'User not found. Please try again.'
            ]);
        }
        

    }

    public function createotp():object
    {
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);

        $retrieveUser = $this->Authentication->login($email);

        if(!$retrieveUser) return $this->response->setStatusCode(400)->setJSON(['error' => 'User not found. Please try again.']);
        $profileKey = $retrieveUser->profile_key;

        if ($this->Authentication->checkAndRetrieveOrDeleteOtp($email, $profileKey)) {
            return $this->response->setStatusCode(200)->setJSON(['message' => 'One Time Password is Retrieved.']);
        }

        $createOneTimePassword = $this->Authentication->createOtp($email, $profileKey, $retrieveUser->type);

        if($createOneTimePassword) return $this->response->setStatusCode(200)->setJSON(['mesage' => 'One Time Password Created']);
        
        return $this->response->setStatusCode(400)->setJSON(['error' => 'Database Error. Please try again.']);


    }

    public function verifyOtp(): object
    {
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $otp = $data->otp; // Assuming OTP is passed directly
        
        $checkEmailandOtp = $this->Authentication->checkEmailandOTP($email, $otp);

        if($checkEmailandOtp){
            $retrieveUser = $this->Authentication->login($email);
            $profileKey = $retrieveUser->profile_key;
            return $this->response->setStatusCode(200)->setJSON(['message' => 'OTP is correct and already deleted', 'profile_key' => $profileKey]);
        }

        return $this->response->setStatusCode(code: 200)->setJSON(['error' => 'OTP is incorrect. Please try again']);
       
    }

    public function changePasswordViaOTP(): object
    {
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $profile_key = filter_var($data->profile_key, FILTER_SANITIZE_STRING);
        $newPassword = filter_var($data->newPassword, FILTER_SANITIZE_STRING);
        $confirmPassword = filter_var($data->confirmPassword, FILTER_SANITIZE_STRING);

        if((string) $newPassword != (string) $confirmPassword) return $this->response->setStatusCode(400)->setJSON(['error' => 'Password does not match. Please try again.']);

        if($this->Authentication->checkPasswordBeforeUpdate($email, $profile_key, $newPassword)) return $this->response->setStatusCode(400)->setJSON(['error' => 'You use your old password. Please try again.']);

        if($this->Authentication->changePasswordViaOTP($email, $profile_key, password_hash($newPassword, PASSWORD_DEFAULT))) return $this->response->setStatusCode(200)->setJSON(['message' => 'Change Password Successfully.']);

        return $this->response->setStatusCode(400)->setJSON(['error' => 'Database Error']);

    }
    

    public function retrieveSession(): object
    {
        if($this->request->getCookie('profile_key')) 
        return $this->response->setStatusCode(200)->
        setJSON(['profile_key' => $this->request->getCookie('profile_key')]);

        return $this->response->setStatusCode(400)->
        setJSON(['error' => 'No cookie find']);
        
    }

    public function register(): object
    {
        $getResponse = $this->request->getJSON();
        
        $rules = [
            'email' => 'required|valid_email',
            'firstName' => 'required|min_length[2]|max_length[50]',
            'lastName' => 'required|min_length[2]|max_length[50]',
            'password' => 'required|min_length[2]|max_length[50]',
            'confirmpassword' => 'required|min_length[2]|max_length[50]',
        ];

        //Validates Data
        $this->Authentication->validateData($rules, $getResponse);

        //Check if Password Match
        if((string)filter_var($getResponse->confirmpassword, FILTER_SANITIZE_STRING) !== 
        (string)filter_var($getResponse->password, FILTER_SANITIZE_STRING)) 
        {return $this->response->setStatusCode(400)->setJSON([
            'error' => 'Passwords do not match.'
        ]);}

        $data = [
            'email' => filter_var($getResponse->email, FILTER_SANITIZE_EMAIL),
            'firstname' => filter_var($getResponse->firstname, FILTER_SANITIZE_STRING),
            'lastname' => filter_var($getResponse->lastname, FILTER_SANITIZE_STRING),
            'password' => password_hash(filter_var($getResponse->password, FILTER_SANITIZE_STRING), PASSWORD_DEFAULT),
            'profile_key' => $this->Authentication->generateUniqueProfileKeyFromEmail(filter_var($getResponse->email, FILTER_SANITIZE_EMAIL)),
            'type' => 'member'
        ];
        
        if ($this->Authentication->register($data)) {
            return $this->response->setJSON(['status' => 200, 'data' => $data]);
        } else {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Email is already taken or database error.']);
        }
    }
    public function logintimeout(): object
    {
        $data = $this->request->getJSON();
        $checkTimeoutStatus = $this->request->getCookie('Timeout');
    
        if ($checkTimeoutStatus) {
            $cookieData = json_decode($checkTimeoutStatus, true);
    
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Request Timeout',
                'data' => $cookieData['expires'] ?? null,
            ]);
        }
    
        $expiresAt = time() + 60; // expires after 60 seconds
    
        $cookieValue = json_encode(['expires' => $expiresAt]);
    
        setcookie('Timeout', $cookieValue, [
            'expires' => $expiresAt,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);
    
        return $this->response->setStatusCode(200)->setJSON([
            'error' => null,
            'data' => $expiresAt,
            'attempts' => $data
        ]);
    }

    public function forgotPasswordTimeout(): object
    {
        $data = $this->request->getJSON();
        $checkTimeoutStatus = $this->request->getCookie('ForgotPasswordTimeout');

        if ($checkTimeoutStatus) {
            $cookieData = json_decode($checkTimeoutStatus, true);

            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Request Timeout',
                'data' => $cookieData['expires'] ?? null,
            ]);
        }

        $expiresAt = time() + 60; // expires after 60 seconds (adjust if needed)

        $cookieValue = json_encode(['expires' => $expiresAt]);

        setcookie('ForgotPasswordTimeout', $cookieValue, [
            'expires' => $expiresAt,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None',
        ]);

        return $this->response->setStatusCode(200)->setJSON([
            'error' => null,
            'data' => $expiresAt,
            'attempts' => $data
        ]);
    }

    public function registerTimeout(): object
{
    $data = $this->request->getJSON();
    $checkTimeoutStatus = $this->request->getCookie('RegisterTimeout');

    if ($checkTimeoutStatus) {
        $cookieData = json_decode($checkTimeoutStatus, true);

        return $this->response->setStatusCode(400)->setJSON([
            'error' => 'Request Timeout',
            'data' => $cookieData['expires'] ?? null,
        ]);
    }

    $expiresAt = time() + 60; // expires after 60 seconds

    $cookieValue = json_encode(['expires' => $expiresAt]);

    setcookie('RegisterTimeout', $cookieValue, [
        'expires' => $expiresAt,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);

    return $this->response->setStatusCode(200)->setJSON([
        'error' => null,
        'data' => $expiresAt,
        'attempts' => $data
    ]);
    }

    
}