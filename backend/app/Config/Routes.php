<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->post('/login', to: 'AuthenticationController::login');
$routes->post('/register','AuthenticationController::register');
$routes->post('/create-otp', 'AuthenticationController::createotp');
$routes->post('/verify-otp', 'AuthenticationController::verifyotp');
$routes->post('/change-password-via-otp', 'AuthenticationController::changePasswordViaOTP');

$routes->post('/admin-first-auth', to: 'AdminAuthenticationController::checkUserEmail');
$routes->post('/admin-second-auth', to: 'AdminAuthenticationController::verifyOtp');
$routes->post('/admin-last-auth', to: 'AdminAuthenticationController::checkUserKeyAndPassword');



$routes->get('/profile-key','AuthenticationController::retrieveSession');
$routes->get('/login-timeout','AuthenticationController::loginTimeout');
$routes->get('/register-timeout','AuthenticationController::registerTimeout');
$routes->get('/forgot-password-timeout','AuthenticationController::forgotPasswordTimeout');





$routes->post('/delete-account', 'Home::deleteAccount');
$routes->get('/logout','Home::logout');



