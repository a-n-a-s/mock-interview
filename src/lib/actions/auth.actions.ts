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
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User not found.Create an account",
      };
    }
    await setSessionCookie(idToken);
    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (e: any) {
    console.error("Error in creating a user", e);

    return {
      success: false,
      message: "Failed to create account",
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

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.user_id)
      .get();

    if (!userRecord.exists) {
      return null;
    }

    const userData = userRecord.data();

    return {
      ...userData,
      id: userRecord.id,
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

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .get();
  const interviewData = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return interviewData as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("userId", "!=", userId)
    .where("finalized", "==", true)
    .limit(limit)
    .get();

  const interviewData = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return interviewData as Interview[];
}
