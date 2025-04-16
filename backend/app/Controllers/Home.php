<?php

namespace App\Controllers;
use App\Models\AccountManager;
use App\Models\Authentication;
class Home extends BaseController
{
    protected $Authentication, $AccountManager;
    public function __construct(){

        $this->Authentication = new Authentication();
        $this->AccountManager = new AccountManager();
    }
    public function index(): string
    {
        return view('welcome_message');
    }

    public function deleteAccount(): object
    {
        $data = $this->request->getJSON();
        $password = filter_var($data->password, FILTER_SANITIZE_STRING);
    
        $request = service('request');
        $key = $request->getCookie('profile_key');
    
        if ($this->AccountManager->deleteAccount($key, $password)) {
            // Delete the cookies
            $this->response->deleteCookie('profile_key');
    
            return $this->response
                ->setStatusCode(200)
                ->setJSON([
                    'msg' => "Your Account Deletion Success!"
                ]);
        }
    
        return $this->response
            ->setStatusCode(400)
            ->setJSON([
                'error' => "Database Error"
            ]);
    }
    
   
    public function logout(): object
    {

        if ($this->request->getMethod() === 'options') {
            return $this->response->setStatusCode(200);
        }

        $response = service('response');
        if($response->deleteCookie('profile_key') && $response->deleteCookie('email')) 
        return $this->response->setStatusCode(200)->
        setJSON(['msg' => 'Logout Successfully.']);

        return $this->response->setStatusCode(400)->
        setJSON(['error' => 'No cookie find']);
        
    }
}
