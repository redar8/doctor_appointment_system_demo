import { useEffect } from "react";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  serverTimestamp,
  onValue,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db as firestore } from "../firebase"; // Your Firebase initialization

export const usePresence = (setOnlineStatus) => {
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    let heartbeatInterval;
    let presenceListener;

    const setupPresence = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Verify admin status
        const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
        if (!adminDoc.exists()) return;

        const { role } = adminDoc.data();
        if (!["Admin", "Super Admin"].includes(role)) return;

        // Presence setup
        const presenceRef = ref(db, `presence/${user.uid}`);
        const statusRef = ref(db, `presence/${user.uid}/status`);

        // Initial presence state
        await set(presenceRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
          role: role,
          uid: user.uid,
        });

        // Disconnect handler
        onDisconnect(presenceRef).update({
          isOnline: false,
          lastSeen: serverTimestamp(),
        });

        // Heartbeat
        heartbeatInterval = setInterval(() => {
          set(statusRef, {
            isOnline: true,
            lastSeen: serverTimestamp(),
          });
        }, 3000);

        // Presence listener
        presenceListener = onValue(ref(db, "presence"), (snapshot) => {
          const presenceData = snapshot.val() || {};
          const now = Date.now();

          const statuses = Object.entries(presenceData).reduce(
            (acc, [uid, data]) => ({
              ...acc,
              [uid]: {
                isOnline: data.isOnline && now - data.lastSeen < 45000,
                role: data.role,
              },
            }),
            {}
          );

          setOnlineStatus(statuses);
        });
      } catch (error) {
        console.error("Presence error:", error);
      }
    };

    setupPresence();

    return () => {
      clearInterval(heartbeatInterval);
      if (presenceListener) presenceListener();
      const user = auth.currentUser;
      if (user) {
        set(ref(db, `presence/${user.uid}/isOnline`), false);
      }
    };
  }, [auth, db, setOnlineStatus]);
};
