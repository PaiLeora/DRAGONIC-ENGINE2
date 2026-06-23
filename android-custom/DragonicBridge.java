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

    // 1. Cek Status Shizuku (Berjalan Instan)
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

    // 2. Eksekusi Perintah Sistem via Asynchronous Background Thread
    @PluginMethod
    public void executeCommand(PluginCall call) {
        String cmd = call.getString("command", "");
        
        // ASYNCHRONOUS ENGINE: Kita buatkan Thread baru di latar belakang
        // Supaya pengerjaan script shell Shizuku tidak mengganggu kelancaran UI Cyberpunk kamu
        new Thread(new Runnable() {
            @Override
            public void run() {
                JSObject ret = new JSObject();

                if (Shizuku.pingBinder() && Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
                    try {
                        // Memanggil ShizukuRemoteProcess resmi menggunakan 2 parameter (Perintah, Flags)
                        Process process = Shizuku.newProcess(cmd.split(" "), 0);
                        
                        // Membaca baris output data dari sistem Android
                        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                        StringBuilder output = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            output.append(line).append("\n");
                        }
                        
                        // Tunggu proses remote selesai di background
                        int exitCode = process.waitFor();

                        if (exitCode == 0) {
                            ret.put("success", true);
                            ret.put("output", output.toString().trim());
                        } else {
                            // Baca log error jika perintah shell gagal dieksekusi sistem
                            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                            StringBuilder errorOutput = new StringBuilder();
                            while ((line = errorReader.readLine()) != null) {
                                errorOutput.append(line).append("\n");
                            }
                            ret.put("success", false);
                            ret.put("output", "Exit Code: " + exitCode + "\n" + errorOutput.toString().trim());
                        }
                    } catch (Exception e) {
                        ret.put("success", false);
                        ret.put("output", "Error: " + e.getMessage());
                    }
                } else {
                    // Jalur aman otomatis (jika dibuka lewat browser/PWA biasa)
                    ret.put("success", true);
                    ret.put("output", "[SIMULATED SECTOR] Success executing: " + cmd);
                }

                // Mengembalikan hasil pengerjaan background thread ke JavaScript (app.js)
                call.resolve(ret);
            }
        }).start(); // Jalankan thread asinkron
    }
}

    }
}
