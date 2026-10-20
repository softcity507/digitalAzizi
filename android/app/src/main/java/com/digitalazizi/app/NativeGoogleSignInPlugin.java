package com.digitalazizi.app;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
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
    // Keep the bridge method name aligned with the JS call.
    @PluginMethod
    public void getIdToken(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.trim().isEmpty()) {
            call.reject("Google server client ID is required.");
            return;
        }
        String nonce = call.getString("nonce");
        if (nonce == null || nonce.trim().isEmpty()) {
            call.reject("A sign-in nonce is required.");
            return;
        }

        GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
                .setServerClientId(serverClientId)
                .setNonce(nonce)
                .setFilterByAuthorizedAccounts(false)
                .build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build();

        CredentialManager credentialManager = CredentialManager.create(getContext());
        call.save();
        credentialManager.getCredentialAsync(
                getActivity(),
                request,
                null,
                ContextCompat.getMainExecutor(getContext()),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse response) {
                        try {
                            Credential credential = response.getCredential();
                            if (!(credential instanceof CustomCredential)
                                    || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                call.reject("Google returned an unsupported sign-in credential.");
                                return;
                            }

                            GoogleIdTokenCredential googleCredential = GoogleIdTokenCredential
                                    .createFrom(((CustomCredential) credential).getData());
                            JSObject result = new JSObject();
                            result.put("idToken", googleCredential.getIdToken());
                            call.resolve(result);
                        } catch (Exception exception) {
                            call.reject("Could not read the Google sign-in credential.", exception);
                        }
                    }

                    @Override
                    public void onError(GetCredentialException exception) {
                        call.reject("Google sign-in failed: " + exception.getMessage(), exception);
                    }
                }
        );
    }
}
