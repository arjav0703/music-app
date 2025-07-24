package dev.musik.app;

import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.util.Log;

import androidx.documentfile.provider.DocumentFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import java.util.ArrayList;
import java.util.List;

/**
 * Helper class for working with Android content URIs
 * Used by the Rust backend to access files through the Android Storage Access Framework
 */
public class ContentUriHelper {
    private static final String TAG = "ContentUriHelper";
    private static final String[] AUDIO_EXTENSIONS = {".mp3", ".flac", ".wav", ".ogg", ".m4a"};

    /**
     * List all audio files in the directory specified by the content URI
     * @param uriString The content URI as a string
     * @return An array of content URIs for audio files
     */
    public static String[] listAudioFiles(String uriString) {
        try {
            Context context = MainActivity.Companion.getAppContext();
            Uri uri = Uri.parse(uriString);
            List<String> fileUris = new ArrayList<>();

            // Get a document file for the URI
            DocumentFile documentFile = DocumentFile.fromTreeUri(context, uri);
            if (documentFile == null || !documentFile.exists() || !documentFile.isDirectory()) {
                Log.e(TAG, "Invalid directory URI: " + uriString);
                return new String[0];
            }

            // List all files in the directory
            DocumentFile[] files = documentFile.listFiles();
            for (DocumentFile file : files) {
                if (!file.isFile()) {
                    continue;
                }

                String name = file.getName();
                if (name == null) {
                    continue;
                }
                
                // Check if it's an audio file by extension
                boolean isAudioFile = false;
                String lowerName = name.toLowerCase();
                for (String ext : AUDIO_EXTENSIONS) {
                    if (lowerName.endsWith(ext)) {
                        isAudioFile = true;
                        break;
                    }
                }

                if (isAudioFile) {
                    fileUris.add(file.getUri().toString());
                }
            }

            // Convert list to array
            return fileUris.toArray(new String[0]);
        } catch (Exception e) {
            Log.e(TAG, "Error listing audio files", e);
            return new String[0];
        }
    }

    /**
     * Persist permissions for a content URI
     * @param uriString The content URI as a string
     * @return true if permissions were successfully persisted, false otherwise
     */
    public static boolean persistPermissions(String uriString) {
        try {
            Context context = MainActivity.Companion.getAppContext();
            Uri uri = Uri.parse(uriString);
            
            // Take persistent permissions
            int flags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
            context.getContentResolver().takePersistableUriPermission(uri, flags);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error persisting permissions", e);
            return false;
        }
    }

    /**
     * Get metadata for an audio file specified by a content URI
     * @param uriString The content URI as a string
     * @return A string array containing metadata [title, artist, album]
     */
    public static String[] getAudioMetadata(String uriString) {
        try {
            Context context = MainActivity.Companion.getAppContext();
            Uri uri = Uri.parse(uriString);
            String[] metadata = new String[3]; // title, artist, album

            // Query the content provider for metadata
            String[] projection = {
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM
            };

            try (Cursor cursor = context.getContentResolver().query(uri, projection, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    metadata[0] = cursor.getString(0); // title
                    metadata[1] = cursor.getString(1); // artist
                    metadata[2] = cursor.getString(2); // album
                }
            }

            return metadata;
        } catch (Exception e) {
            Log.e(TAG, "Error getting audio metadata", e);
            return new String[]{"", "", ""};
        }
    }
    
    /**
     * Read file content from a content URI
     * @param uriString The content URI as a string
     * @return The file content as a byte array, or an empty array if an error occurs
     */
    public static byte[] readContentUri(String uriString) {
        try {
            Context context = MainActivity.Companion.getAppContext();
            Uri uri = Uri.parse(uriString);
            
            try (InputStream inputStream = context.getContentResolver().openInputStream(uri);
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                
                if (inputStream == null) {
                    Log.e(TAG, "Failed to open input stream for URI: " + uriString);
                    return new byte[0];
                }
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                
                return outputStream.toByteArray();
            }
        } catch (IOException e) {
            Log.e(TAG, "Error reading content URI: " + uriString, e);
            return new byte[0];
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error reading content URI: " + uriString, e);
            return new byte[0];
        }
    }
}