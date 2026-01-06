import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
  const apps = getApps();
  if (!apps.length) {
    // Check if all required environment variables are present for service account
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log("Firebase environment variables:", {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey && privateKey.length > 10 ? "present" : "missing/invalid"
    }); // Debug log

    try {
      // Check if we have the required service account credentials
      if (projectId && clientEmail && privateKey) {
        // Handle private key formatting - replace both escaped newlines and ensure proper PEM format
        if (privateKey) {
          // Replace escaped newlines with actual newlines
          privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

          // Check if it looks like a proper PEM format
          if (privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----')) {
            console.log("Initializing Firebase with service account credentials"); // Debug log
            initializeApp({
              credential: cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey,
              }),
            });
          } else {
            console.warn("Private key doesn't appear to be in proper PEM format. Using application default credentials with project ID.");
            initializeApp({
              credential: applicationDefault(),
              projectId: projectId,
            });
          }
        } else {
          console.log("Initializing Firebase with application default credentials and project ID"); // Debug log
          initializeApp({
            credential: applicationDefault(),
            projectId: projectId,
          });
        }
      } else {
        console.warn("Firebase service account environment variables are not fully set. Using application default credentials.");
        // Use application default credentials as fallback
        initializeApp({
          credential: applicationDefault(),
          projectId: projectId || undefined, // Use project ID if available, even if other credentials are missing
        });
      }
    } catch (error) {
      console.error("Error initializing Firebase app with service account:", error);
      console.warn("Falling back to application default credentials...");

      try {
        // Fallback to application default credentials
        initializeApp({
          credential: applicationDefault(),
          projectId: projectId || undefined,
        });
      } catch (fallbackError) {
        console.error("Error initializing Firebase with default credentials:", fallbackError);
        throw new Error("Unable to initialize Firebase. Check your configuration.");
      }
    }
  } else {
    console.log("Firebase app already initialized"); // Debug log
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

const firebaseServices = initFirebaseAdmin();
export const {auth, db} = firebaseServices;