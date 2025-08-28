import React, { useEffect } from 'react';

interface GoogleSignInProps {
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleSignIn({ onSuccess, onFailure }: GoogleSignInProps) {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error('Google Client ID is not configured');
        onFailure(new Error('Google Client ID is not configured'));
        return;
      }

      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render the sign-in button
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: 250,
            }
          );
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          onFailure(error);
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      onFailure(new Error('Failed to load Google Identity Services script'));
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onSuccess, onFailure]);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userResponse = {
        profileObj: {
          googleId: payload.sub,
          name: payload.name,
          email: payload.email,
          imageUrl: payload.picture,
        },
        tokenId: response.credential,
      };
      onSuccess(userResponse);
    } catch (error) {
      console.error('Error processing credential response:', error);
      onFailure(error);
    }
  };

  return (
    <div className="flex justify-center">
      <div id="google-signin-button"></div>
    </div>
  );
}