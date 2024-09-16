// \event-badger\android\app\src\main\java\com\anonymous\eventbadger\ServerModule.java
package com.anonymous.eventbadger;

import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.IOException;

public class ServerModule extends ReactContextBaseJavaModule {

    ServerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ServerModule";
    }

    @ReactMethod
    public void startPythonServer(String ipAddress) {
        try {
            String pythonServerPath = getReactApplicationContext().getFilesDir().getAbsolutePath() + "/backend/python_server/app.py";
            Process process = Runtime.getRuntime().exec("python3 " + pythonServerPath + " " + ipAddress);
            Log.d("ServerModule", "Python server started with IP: " + ipAddress);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void startNodeServer(String ipAddress) {
        try {
            String nodeServerPath = getReactApplicationContext().getFilesDir().getAbsolutePath() + "/backend/node_server/server.js";
            Process process = Runtime.getRuntime().exec("node " + nodeServerPath + " " + ipAddress);
            Log.d("ServerModule", "Node server started with IP: " + ipAddress);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
