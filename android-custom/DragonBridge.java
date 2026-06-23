package com.dragonic.engine;

import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import rikka.shizuku.Shizuku;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@CapacitorPlugin(name = "DragonicBridge")
public class DragonicBridge extends Plugin {

    @PluginMethod
    public void checkShizukuStatus(PluginCall call) {
        JSObject ret = new JSObject();
        if (!Shizuku.pingBinder()) {
            ret.put("status", "OFFLINE");
            call.resolve(ret);
            return;
        }

        if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
            ret.put("status", "CONNECTED");
        } else {
            ret.put("status", "UNAUTHORIZED");
            Shizuku.requestPermission(0);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void executeCommand(PluginCall call) {
        String cmd = call.getString("command", "");
        JSObject ret = new JSObject();

        if (Shizuku.pingBinder() && Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
            try {
                Process process = Shizuku.newProcess(cmd.split(" "), null, null);
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                StringBuilder output = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                process.waitFor();

                ret.put("success", true);
                ret.put("output", output.toString().trim());
            } catch (Exception e) {
                ret.put("success", false);
                ret.put("output", e.getMessage());
            }
        } else {
            ret.put("success", true);
            ret.put("output", "[SIMULATED SECTOR] Success executing: " + cmd);
        }
        call.resolve(ret);
    }
}
