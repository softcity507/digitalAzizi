package com.digitalazizi.app;

import android.util.Log;

import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(NativeGoogleSignInPlugin.class);
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null
                && WebViewFeature.isFeatureSupported(WebViewFeature.WEB_AUTHENTICATION)) {
            WebSettingsCompat.setWebAuthenticationSupport(
                    getBridge().getWebView().getSettings(),
                    WebSettingsCompat.WEB_AUTHENTICATION_SUPPORT_FOR_APP);
            Log.i("DigitalAzizi", "WebAuthn support enabled for the app WebView");
        } else {
            Log.w("DigitalAzizi", "This Android System WebView does not support WebAuthn");
        }
    }
}
