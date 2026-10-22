package com.digitalazizi.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(NativeGoogleSignInPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
