// components/GoogleLoginButton.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onLogin }) {
  return (
    <div className="flex justify-center mt-10">
      <GoogleLogin
        onSuccess={credentialResponse => {
          onLogin(credentialResponse.credential);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
}
