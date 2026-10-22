package com.digitalazizi.app;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "NativeGoogleSignIn")
public class NativeGoogleSignInPlugin extends Plugin {
    @PluginMethod
    public void getIdToken(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        String nonce = call.getString("nonce");
        if (serverClientId == null || serverClientId.trim().isEmpty()) {
            call.reject("serverClientId is required.");
            return;
        }
        if (nonce == null || nonce.trim().isEmpty()) {
            call.reject("nonce is required.");
            return;
        }

        GetGoogleIdOption googleOption = new GetGoogleIdOption.Builder()
                .setServerClientId(serverClientId)
                .setNonce(nonce)
                .setFilterByAuthorizedAccounts(false)
                .build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(googleOption)
                .build();

        CredentialManager credentialManager = CredentialManager.create(getContext());
        call.save();
        credentialManager.getCredentialAsync(
                getActivity(),
                request,
                null,
                ContextCompat.getMainExecutor(getContext()),
                new androidx.credentials.CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse response) {
                        try {
                            Credential credential = response.getCredential();
                            if (!(credential instanceof CustomCredential)
                                    || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                call.reject("Google did not return an ID token credential.");
                                return;
                            }
                            GoogleIdTokenCredential googleCredential = GoogleIdTokenCredential.createFrom(
                                    ((CustomCredential) credential).getData());
                            JSObject result = new JSObject();
                            result.put("idToken", googleCredential.getIdToken());
                            call.resolve(result);
                        } catch (Exception exception) {
                            call.reject("Could not read the Google ID token.", exception);
                        }
                    }

                    @Override
                    public void onError(GetCredentialException exception) {
                        String message = exception.getMessage();
                        call.reject(message == null || message.isEmpty()
                                ? "Google sign-in was cancelled or could not be completed."
                                : message, exception);
                    }
                });
    }
}
