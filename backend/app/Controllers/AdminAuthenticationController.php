<?php

namespace App\Controllers;
use App\Models\AdminAuthentication;
class AdminAuthenticationController extends BaseController{

    protected $Auth;
    public function __construct() {
        $this->Auth = new AdminAuthentication();
    }
    public function checkUserEmail():object
    {
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        if(!$this->Auth->checkUserEmail($email)) return $this->response->setStatusCode(400)->setJSON(['error' => 'User not found. Please try again.']);

        return $this->response->setStatusCode(200)->setJSON(['message' => 'Success']);
    }

    public function verifyOtp():object
    {
        $data = $this->request->getJSON();
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $otp = filter_var($data->oneTimePassword, FILTER_SANITIZE_STRING);

        $auth = $this->Auth->verifyUserEmailandOtp($email, $otp);

        if($auth) return $this->response->setStatusCode(200)->setJSON(['message' => 'Success']);

        return $this->response->setStatusCode(400)->setJSON(['error' => 'Database Error']);
    }

    public function checkUserKeyAndPassword(): object
    {
        $data = $this->request->getJSON();
    
        if (!$data || !isset($data->email, $data->oneTimePassword, $data->password)) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Invalid request payload.'
            ]);
        }
    
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $otp = filter_var($data->oneTimePassword, FILTER_SANITIZE_STRING);
        $password = filter_var($data->password, FILTER_SANITIZE_STRING);
        $cookie = filter_var($this->request->getCookie('temp_profile_key'), FILTER_SANITIZE_EMAIL);
    
        if (!$cookie) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Missing temporary profile key.'
            ]);
        }
    
        $auth = $this->Auth->finalVerificationForAdminLogin($email, $password, $otp, $cookie);
    
        if ($auth) {

            $this->response->deleteCookie('temp_profile_key');

            setcookie('profile_key', $cookie, [
                'expires' => time() + 3600,
                'path' => '/',
                'secure' => true,        // required because SameSite=None
                'httponly' => true,       // protect from JavaScript
                'samesite' => 'None',     // allow cross-origin
            ]);

            return $this->response->setStatusCode(200)->setJSON([
                'message' => 'success',
                'data' => $data
            ]);
        }
    
        return $this->response->setStatusCode(code: 400)->setJSON([
            'error' => 'Authentication failed. Please check your credentials and try again.',
            'cookie' => $cookie,
            $data
        ]);
    }
    
    

}