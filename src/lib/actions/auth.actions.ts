"use server";

import { cookies } from "next/headers";
import { db, auth } from "../../../firebase/admin";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, email, name } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead",
      };
    }

    await db.collection("users").doc(uid).set({
      email,
      name,
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (e: any) {
    console.error("Error in creating a user", e);

    if (e.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  try {
    // Verify the ID token to get user information
    const decodedToken = await auth.verifyIdToken(idToken);

    // Check if user exists in our database using the UID from the token
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "User not found. Create an account",
      };
    }

    await setSessionCookie(idToken);
    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (e: any) {
    console.error("Error in signing in user", e);

    return {
      success: false,
      message: e.code?.includes('auth/id-token-expired') || e.code?.includes('auth/invalid-id-token')
        ? "Session expired. Please sign in again."
        : "Failed to sign in",
    };
  }
}
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getCurentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const session = (await cookieStore).get("session")?.value;

  if (!session) {
    console.log("No session cookie found");
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);

    if (!decodedClaims.uid) {
      console.log("No UID in decoded claims");
      return null;
    }

    console.log("Decoded claims UID:", decodedClaims.uid); // Debug log

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid) // Changed from user_id to uid
      .get();

    if (!userRecord.exists) {
      console.log("User record does not exist for UID:", decodedClaims.uid);
      return null;
    }

    const userData = userRecord.data();
    console.log("User data retrieved:", userData); // Debug log

    return {
      ...userData,
      id: decodedClaims.uid, // Use the UID from decoded claims as the ID
    } as User;
  } catch (e) {
    console.error("Error in getCurrentUser:", e);
    return null;
  }
}

export async function isAuthenticated() {
  try {
    const user = await getCurentUser();

    return !!user;
  } catch (error) {
    console.error("Authentication check error:", error);
    return false;
  }
}
