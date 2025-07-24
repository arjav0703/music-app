package dev.musik.app

import android.app.Application
import android.content.Context
import android.os.Bundle
import app.tauri.plugin.TauriActivity

class MainActivity : TauriActivity() {
    companion object {
        private lateinit var appContext: Context

        fun getAppContext(): Context {
            return appContext
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appContext = applicationContext
    }
}